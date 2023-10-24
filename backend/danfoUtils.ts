
import { 
  IHolding, IPopulatedHolding, IPopulatedPortfolio, IPortfolio, ITransaction, 
  TDatedValue,

  getHoldingAggregatedPurchases, getHoldingAggregatedSales, getHoldingPurchases, 
  getHoldingSales, getHoldingTcgplayerId, getPortfolioHoldings,

  assert, genDateRange, getDaysBetween, isDateAfter, isDateBefore
} from 'common'
import * as df from 'danfojs-node'
import * as _ from 'lodash'


// =======
// generic
// =======

/*
DESC
  Converts the input danfo Seeries into a TDatedValue[]
INPUT
  series: A danfo Series
  startDate: The starting date
  endDate: The ending date
  fillMode: The method by which to fill missing values
    locf: Last observed carry forward
    value: Use the input fillValue
  fillValue?: The static value to use with fillMode=value
  initalValue?: The initial value to use if startDate is earlier than the 
    first danfo Series date
RETURN
  A danfo Series
*/
export function densifyAndFillSeries(
  series: df.Series,
  startDate: Date,
  endDate: Date,
  fillMode: 'locf' | 'value',
  fillValue?: number,
  initialValue?: number
): df.Series {

  // get Series index
  const index = genDateRange(startDate, endDate).map((date: Date) => {
    return date.toISOString()
  })

  // populate values for Series
  let values: number[] = []
  index.forEach((date: string, ix: number) => {

    // get value from series, if available
    const seriesValue = series.at(date)

    // matched
    if (seriesValue !== undefined) {
      values.push(Number(seriesValue))
    
    // unmatched, initial value
    } else if (ix === 0 && initialValue) {
      values.push(initialValue)

    // unmatched, fill value
    } else if (fillMode === 'value' && fillValue) {
      values.push(fillValue)

    // unmatched, locf
    } else if (fillMode === 'locf' && ix > 0) {
      values.push(values[ix - 1])
    
    // default to 0
    } else {
      values.push(0)
    }
  })

  return new df.Series(values, {index})
}

/*
DESC
  Converts the input danfo Seeries into a TDatedValue[]
INPUT
  series: A danfo Series
RETURN
  A TDatedValue[]
*/
export function getDatedValuesFromSeries(
  series: df.Series
): TDatedValue[] {

  const datedValues = series.index.map((index: string | number) => {
    
    const date = _.isNumber(index)
      ? new Date(index)
      : new Date(Date.parse(index))

    const value = _.isNumber(index)
      ? Number(series.iat(index))
      : Number(series.at(index))

    return {
      date: date,
      value: value
    }
  })

  return datedValues
}

/*
DESC
  Converts the input TDatedValue[] into a danfo Seeries
INPUT
  datedValues: A TDatedValue[]
RETURN
  A danfo Series
*/
export function getSeriesFromDatedValues(
  datedValues: TDatedValue[]
): df.Series {

  const index = datedValues.map((dv: TDatedValue) => {
    return dv.date.toISOString()
  })

  const values = datedValues.map((dv: TDatedValue) => {
    return dv.value
  })

  return new df.Series(values, {index})
}

/*
DESC
  Returns the input Series sorted by the index
INPUT
  series: A danfo Series
RETURN
  A danfo Series
*/
export function sortSeriesByIndex(
  series: df.Series
): df.Series {

  const index = _.sortBy(series.index, el => el)

  const values = index.map((ix: string | number) => {

    return typeof ix === 'string'
      ? series.at(ix)
      : series.iat(ix)
  })
  
  return new df.Series(values, {index})
}


// =======
// holding
// =======

/*
DESC
  Returns a series of daily market values for the input IHolding between the
  input startDate and endDate using the input priceSeries
INPUT
  holding: An IHolding
  priceSeries: A danfo Series of prices
  startDate: The start date of the Series
  endDate: The end date of the Series
RETURN
  A danfo Series
*/
export function getHoldingMarketValueSeries(
  holding: IHolding | IPopulatedHolding,
  priceSeries: df.Series,
  startDate: Date,
  endDate: Date
): df.Series {

  // align price series
  const prices = densifyAndFillSeries(
    priceSeries,
    startDate,
    endDate,
    'locf',
    undefined,
    0
  )

  // -- get holding value series
  const transactionSeries = getHoldingTransactionQuantitySeries(holding)
  const cumTransactionSeries = transactionSeries.cumSum() as df.Series
  const quantitySeries = densifyAndFillSeries(
    cumTransactionSeries,
    startDate,
    endDate,
    'locf',
    undefined,
    0
  )
  const pricesIx = prices.index.map((ix: string | number) => {
    return String(ix) >= startDate.toISOString()
      && String(ix) <= endDate.toISOString()
  })
  const holdingValueSeries = quantitySeries.mul(prices.loc(pricesIx))

  // -- get revenue series
  const dailyRevenueSeries 
    = getHoldingRevenueSeries(holding, startDate, endDate)
  const cumRevenueSeries = dailyRevenueSeries.cumSum() as df.Series
  const revenueSeries = densifyAndFillSeries(
    cumRevenueSeries,
    startDate,
    endDate,
    'locf',
    undefined,
    0
  )

  // -- get market value series
  return holdingValueSeries.add(revenueSeries) as df.Series
}

/*
DESC
  Returns a series of cost of goods sold for the input IHolding. The index of
  the returned Series will correspond to each date with a Sale
INPUT
  holding: An IHolding
RETURN
  A danfo Series
*/
export function getHoldingCostOfGoodsSoldSeries(
  holding: IHolding | IPopulatedHolding
): df.Series {

  // get Purchase and Sales
  const purchases = getHoldingAggregatedPurchases(holding)
  const sales = getHoldingAggregatedSales(holding)

  // sort Purchases and Sales
  let sortedPurchases = _.sortBy(purchases, [(txn: ITransaction) => txn.date])
  const sortedSales = _.sortBy(sales, [(txn: ITransaction) => txn.date])

  // store datedValues of COGS
  let cogs: TDatedValue[] = []

  // create datedValues of cost of goods sold for each Sale transaction date
  sortedSales.map((sale: ITransaction) => {

    // accumulate price and quantity of COGS
    let price = 0
    let quantity = 0

    // calculate COGS
    while (quantity < sale.quantity && sortedPurchases.length) {

      // get first remaining Purchase
      const purchase = sortedPurchases.shift()
      assert(purchase, 
        'sortedPurchases is empty')
      assert(isDateBefore(purchase.date, sale.date, true),
        'Insufficient Purchases to calculate COGS')

      // calculate the portion of the Purchase used (eg. sold)
      const usedQuantity = Math.min(sale.quantity - quantity, purchase.quantity)

      // update COGS
      price = (price * quantity + purchase.price * usedQuantity) 
        / (quantity + usedQuantity)
      quantity = quantity + usedQuantity
      
      // add back unused portion of the Purchase
      if (usedQuantity < purchase.quantity) {
        sortedPurchases.unshift({
          date: purchase.date,
          price: purchase.price,
          quantity: purchase.quantity - usedQuantity,
          type: purchase.type
        } as ITransaction)
      }
    }

    // set the COGS
    cogs.push({
      date: sale.date,
      value: price * quantity
    } as TDatedValue)
  })

  // return COGS as Danfo Series
  return sortSeriesByIndex(getSeriesFromDatedValues(cogs))
}

/*
DESC
  Returns a series of purchase costs for the input IHolding between the
  input startDate and endDate
INPUT
  holding: An IHolding
  startDate: The start date of the Series
  endDate: The end date of the Series
RETURN
  A danfo Series
*/
export function getHoldingPurchaseCostSeries(
  holding: IHolding | IPopulatedHolding,
  startDate: Date,
  endDate: Date
): df.Series {

  // get dated values of daily purchase costs
  const allPurchases = getHoldingPurchases(holding)
  const purchases = allPurchases.filter((txn: ITransaction) => {
    return isDateAfter(txn.date, startDate, true) 
      && isDateBefore(txn.date, endDate, true)
  })
  const datedValues: TDatedValue[] = purchases.map((txn: ITransaction) => {
    return {
      date: txn.date,
      value: txn.price * txn.quantity
    }
  })

  return sortSeriesByIndex(getSeriesFromDatedValues(datedValues))
}

/*
DESC
  Returns the time-weighted return for the input IHolding between the input 
  startDate and endDate using the input priceSeries, annualized if input
INPUT
  holding: An IHolding
  priceSeries: A danfo Series of prices\
  startDate: The start date of the Series
  endDate: The end date of the Series
  annualized?: TRUE if the return should be annualized, FALSE otherwise
RETURN
  The time-weighted return
*/
export function getHoldingTimeWeightedReturn(
  holding: IHolding | IPopulatedHolding,
  priceSeries: df.Series,
  startDate: Date,
  endDate: Date,
  annualized?: boolean
): number {

  // get market value series
  const marketValueSeries 
    = getHoldingMarketValueSeries(holding, priceSeries, startDate, endDate)

  // get daily purchase cost series
  const dailyPurchaseSeries 
    = getHoldingPurchaseCostSeries(holding, startDate, endDate)

  // get daily revenue series
  const dailyRevenueSeries 
    = getHoldingRevenueSeries(holding, startDate, endDate)

  // get cost of goods sold series
  const costOfGoodsSoldSeries = getHoldingCostOfGoodsSoldSeries(holding)

  // create index for return calculations
  const index = _.uniq(
    _.concat(
      dailyPurchaseSeries.index as string[], 
      costOfGoodsSoldSeries.index as string[],
      [endDate.toISOString()]
  )).sort()

  // create numerator array
  // since returns are defined as t / (t-1), ignore the first element
  const numerators = _.slice(index, 1).map((date: string) => {
    const marketValue = marketValueSeries.at(date)
    const purchaseCost = dailyPurchaseSeries.index.includes(date)
      ? dailyPurchaseSeries.at(date)
      : 0
    const revenue = dailyRevenueSeries.index.includes(date)
      ? dailyRevenueSeries.at(date)
      : 0
    const cogs = costOfGoodsSoldSeries.index.includes(date)
      ? costOfGoodsSoldSeries.at(date)
      : 0
    
    assert(_.isNumber(marketValue), 'Numerator market value is not a number')
    assert(_.isNumber(purchaseCost), 'Numerator purchase cost is not a number')
    assert(_.isNumber(revenue), 'Numerator revenue cost is not a number')
    assert(_.isNumber(cogs), 'Numerator cogs cost is not a number')

    return marketValue - purchaseCost + revenue - cogs
  })

  // create denominator array
  // since returns are defined as t / (t-1), ignore the last element
  const denominators = _.slice(index, 0, index.length - 1)
    .map((date: string, ix: number) => {
      const value = ix === 0
        ? dailyPurchaseSeries.at(date)
        : marketValueSeries.at(date)
      assert(_.isNumber(value), 'Denominator market value is not a number')
      return value
  })

  // create return series
  assert(numerators.length === denominators.length, 
    'Numerator and denominator arrays are not the same length')
  const returns = numerators.map((numerator: number, ix: number) => {
    const denominator = denominators[ix]
    return numerator / denominator - 1
  })

  // calculate time-weighted return for the period
  const timeWeightedReturn = returns.reduce((acc, cur) => {
    return acc = acc * (1 + cur)
  }, 1) - 1

  // annualize if necessary
  return annualized
    ? Math.pow(
        (1 + timeWeightedReturn), 
        365 / getDaysBetween(startDate, endDate)
      ) - 1
    : timeWeightedReturn
}

/*
DESC
  Returns a series of total cost for the input IHolding between the input 
  startDate and endDate
INPUT
  holding: An IHolding
  startDate: The start date of the Series
  endDate: The end date of the Series
RETURN
  A danfo Series
*/
export function getHoldingTotalCostSeries(
  holding: IHolding | IPopulatedHolding,
  startDate: Date,
  endDate: Date
): df.Series {

  // get dated values of daily purchase costs
  const purchases = getHoldingPurchases(holding)
  const datedValues: TDatedValue[] = purchases.map((txn: ITransaction) => {
    return {
      date: txn.date,
      value: txn.price * txn.quantity
    }
  })

  // align daily purchase costs to date index
  const dailyPurchaseSeries 
    = sortSeriesByIndex(getSeriesFromDatedValues(datedValues))
  const purchaseSeries = densifyAndFillSeries(
    dailyPurchaseSeries, 
    startDate,
    endDate,
    'value',
    0
  )

  return purchaseSeries.cumSum() as df.Series
}

/*
DESC
  Returns a series of daily transaction quantities for the input IHolding
INPUT
  holding: An IHolding
RETURN
  A danfo Series
*/
export function getHoldingTransactionQuantitySeries(
  holding: IHolding | IPopulatedHolding
): df.Series {

  // get purchase and sales
  const purchases = getHoldingPurchases(holding)
  const sales = getHoldingSales(holding)

  // summarize transaction quantities in a map
  const quantityMap: Map<string, number> = new Map<string, number>()
  purchases.forEach((txn: ITransaction) => {
    quantityMap.set(
      txn.date.toISOString(), 
      (quantityMap.get(txn.date.toISOString()) ?? 0) + txn.quantity
    )
  })
  sales.forEach((txn: ITransaction) => {
    quantityMap.set(
      txn.date.toISOString(), 
      (quantityMap.get(txn.date.toISOString()) ?? 0) - txn.quantity
    )
  })

  const datedValues: TDatedValue[] = []
  quantityMap.forEach((value: number, key: string) => {
    if (value !== 0) {
      datedValues.push({
        date: new Date(Date.parse(key)),
        value: value
      })
    }
  })

  return sortSeriesByIndex(getSeriesFromDatedValues(datedValues))
}

/*
DESC
  Returns a series of daily revenue for the input IHolding between the input
  startDate and endDate
INPUT
  holding: An IHolding
  startDate: The start date of the Series
  endDate: The end date of the Series
RETURN
  A danfo Series
*/
export function getHoldingRevenueSeries(
  holding: IHolding | IPopulatedHolding,
  startDate: Date,
  endDate: Date
): df.Series {

  const allSales = getHoldingSales(holding)
  const sales = allSales.filter((txn: ITransaction) => {
    return isDateAfter(txn.date, startDate, true) 
      && isDateBefore(txn.date, endDate, true)
  })

  const datedValues: TDatedValue[] = sales.map((txn: ITransaction) => {
    return {
      date: txn.date,
      value: txn.price * txn.quantity
    }
  })

  return sortSeriesByIndex(getSeriesFromDatedValues(datedValues))
}


// =========
// portfolio
// =========

/*
DESC
  Returns a series of daily market values for the input IPortfolio between the
  input startDate and endDate using prices in the input priceSeriesMap
INPUT
  portfolio: An IPortfolio
  priceSeriesMap: A Map of tcgplayerId => danfo Series of Prices
  startDate: The start date of the Series
  endDate: The end date of the Series
RETURN
  A danfo Series
*/
export function getPortfolioMarketValueSeries(
  portfolio: IPortfolio | IPopulatedPortfolio,
  priceSeriesMap: Map<number, df.Series>,
  startDate: Date,
  endDate: Date
): df.Series {

  const holdings = getPortfolioHoldings(portfolio)

  // get market value series of holdings
  const marketValues = holdings.map((holding: IHolding | IPopulatedHolding) => {

    const tcgplayerId = getHoldingTcgplayerId(holding)
    const priceSeries = priceSeriesMap.get(tcgplayerId)

    // verify that prices exist for this tcgplayerId
    assert(
      priceSeries instanceof df.Series,
      `Could not find prices for tcgplayerId: ${tcgplayerId}`)

    return getHoldingMarketValueSeries(
      holding,
      priceSeries,
      startDate,
      endDate
    )
  })

  // create empty Series used for summation
  const emptySeries = densifyAndFillSeries(
    new df.Series([0], {index: [startDate.toISOString()]}),
    startDate,
    endDate,
    'value',
    0,
    0
  )

  // get market value series of portfolio
  return marketValues.reduce((acc: df.Series, cur: df.Series) => {
    return acc = acc.add(cur) as df.Series
  }, emptySeries)
}