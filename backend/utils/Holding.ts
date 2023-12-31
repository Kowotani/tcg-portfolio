import { 
  // data models
  IHolding, IPopulatedHolding, ITransaction, TDatedValue, TransactionType,

  // getters
  getHoldingAggregatedPurchases, getHoldingAggregatedSales, getHoldingQuantity, 
  getHoldingPurchases, getHoldingSales, getHoldingTcgplayerId,

  // others
  assert, dateSub, getDaysBetween, getHoldingFirstTransactionDate,
  isDateAfter, isDateBefore, isIHolding, isITransaction
} from 'common'
import { 
  accumulateAndDensifySeries, defaultTrimOrExtendSeries, 
  getDatedValuesFromSeries, getSeriesFromDatedValues, sortSeriesByIndex 
} from './danfo'
import * as df from 'danfojs-node'
import * as _ from 'lodash'
import { IMHolding } from '../mongo/models/holdingSchema'
import { IMProduct } from '../mongo/models/productSchema'
import { getProductDoc, getProductDocs } from '../mongo/dbi/Product'
import { getPriceSeries } from '../mongo/dbi/Price'
import { isProductDoc, genProductNotFoundError } from './Product'


// ==========
// converters
// ==========

/*
DESC
  Converts an IHolding[] to an IMHolding[], which entails:
    - adding the product field with Product ObjectId
INPUT
  holdings: An IHolding[]
RETURN
  An IMHolding[]
*/
export async function getIMHoldingsFromIHoldings(
  holdings: IHolding[]
): Promise<IMHolding[]> {

  const productDocs = await getProductDocs()
  const newHoldings = holdings.map((holding: IHolding) => {

    // find Product
    const productDoc = productDocs.find((product: IMProduct) => {
      return product.tcgplayerId === Number(holding.tcgplayerId)
    })
    assert(
      isProductDoc(productDoc),
      genProductNotFoundError('getIMHoldingsFromIHoldings()').toString()
    )

    // create IMHolding
    return ({
      ...holding,
      product: productDoc._id
    } as IMHolding)
  })
  
  return newHoldings
}


// ==========
// generators
// ==========

/*
DESC
  Returns an IHolding corresponding to a purchase of 1 unit of of the input 
  tcgplayerId on the Product's release date at MSRP
INPUT
  tcgplayerId: The tcgplayerId of the Product
RETURN
  An IHolding corresponding to the description
*/
export async function genReleaseDateProductHolding(
  tcgplayerId: number
): Promise<IHolding> {

  // get Product doc
  const product = await getProductDoc({tcgplayerId: tcgplayerId})
  assert(isProductDoc(product), 'Product not found')

  // create Transaction
  const txn: ITransaction = {
    date: product.releaseDate,
    price: product.msrp,
    type: TransactionType.Purchase,
    quantity: 1
  }

  // return Holding
  return {
    tcgplayerId: product.tcgplayerId,
    transactions: [txn]
  } as IHolding
}


// =======
// getters
// =======

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
  Returns the market value of the input Holding between the startDate and
  endDate
INPUT
  holding: A IHolding
  startDate?: The start date for market value calculation
  endDate?: The end date for market value calculation
*/
export async function getHoldingMarketValueAsDatedValues(
  holding: IHolding | IPopulatedHolding,
  startDate?: Date,
  endDate?: Date
): Promise<TDatedValue[]> {

  // get market value
  const marketValueSeries = 
    await getHoldingMarketValueSeries(holding, undefined, startDate, endDate)

  return getDatedValuesFromSeries(marketValueSeries, 2)
}

/*
DESC
  Returns a series of daily market values for the input IHolding between the
  input startDate and endDate using the input priceSeries
INPUT
  holding: An IHolding
  priceSeries?: A danfo Series of prices
  startDate?: The start date of the Series (default: first transaction date)
  endDate?: The end date of the Series (default: T-1)
RETURN
  A danfo Series
*/
export async function getHoldingMarketValueSeries(
  holding: IHolding | IPopulatedHolding,
  priceSeries?: df.Series,
  startDate?: Date,
  endDate?: Date
): Promise<df.Series> {

  // get output series start and end dates
  const [startDt, endDt] = getStartAndEndDates(holding, startDate, endDate)

  // get prices if necessary
  const thePriceSeries = priceSeries
    ? priceSeries
    : await getPriceSeries(getHoldingTcgplayerId(holding), startDate, endDate)

  // -- get holding value series
  const transactionSeries = getHoldingTransactionQuantitySeries(holding)
  const dailyCumHoldingQuantitySeries = 
    accumulateAndDensifySeries(transactionSeries, startDt, endDt)
  const prices = defaultTrimOrExtendSeries(thePriceSeries, startDt, endDt)
  const holdingValueSeries = dailyCumHoldingQuantitySeries.mul(prices)

  // -- get revenue series
  const revenueSeries = 
    getHoldingRevenueSeries(holding, startDate, endDate)
  const dailyCumRevenueSeries = 
    accumulateAndDensifySeries(revenueSeries, startDt, endDt)

  // -- get market value series
  return holdingValueSeries.add(dailyCumRevenueSeries) as df.Series
}

/*
DESC
  Returns the cumulative PnL of the input Holding between the startDate and
  endDate
INPUT
  holding: A IHolding
  startDate?: The start date for PnL calculation
  endDate?: The end date for PnL calculation
*/
export async function getHoldingCumPnLAsDatedValues(
  holding: IHolding | IPopulatedHolding,
  startDate?: Date,
  endDate?: Date
): Promise<TDatedValue[]> {

  // get PnL
  const pnlSeries = 
    await getHoldingCumPnLSeries(holding, undefined, startDate, endDate)

  return getDatedValuesFromSeries(pnlSeries, 2)
}

/*
DESC
  Returns a series of cumulative PnL for the input IHolding between the
  input startDate and endDate using the input priceSeries. This can be
  calculated as the Market Value - Total Cost
INPUT
  holding: An IHolding
  priceSeries?: A danfo Series of prices
  startDate?: The start date of the Series (default: first transaction date)
  endDate?: The end date of the Series (default: T-1)
RETURN
  A danfo Series
*/
export async function getHoldingCumPnLSeries(
  holding: IHolding | IPopulatedHolding,
  priceSeries?: df.Series,
  startDate?: Date,
  endDate?: Date
): Promise<df.Series> {

  // get output series start and end dates
  const [startDt, endDt] = getStartAndEndDates(holding, startDate, endDate)

  // get prices if necessary
  const thePriceSeries = priceSeries
    ? priceSeries
    : await getPriceSeries(getHoldingTcgplayerId(holding), startDate, endDate)

  // align price series
  const prices = defaultTrimOrExtendSeries(thePriceSeries, startDt, endDt)

  // get market value series
  const entireMarketValueSeries 
    = await getHoldingMarketValueSeries(holding, prices, startDate, endDate)
  const marketValueSeries 
    = defaultTrimOrExtendSeries(entireMarketValueSeries, startDt, endDt)

  // get total cost series
  const entireTotalCostSeries 
    = getHoldingTotalCostSeries(holding, startDate, endDate)
  const totalCostSeries
    = defaultTrimOrExtendSeries(entireTotalCostSeries, startDt, endDt)

  // return market value - total cost
  return marketValueSeries.sub(totalCostSeries) as df.Series
}

/*
DESC
  Returns a series of purchase costs for the input IHolding between the
  input startDate and endDate
INPUT
  holding: An IHolding
  startDate?: The start date of the  (default: first transaction date)
  endDate?: The end date of the Series (default: T-1)
RETURN
  A danfo Series
*/
export function getHoldingPurchaseCostSeries(
  holding: IHolding | IPopulatedHolding,
  startDate?: Date,
  endDate?: Date
): df.Series {

  // get start and end dates
  const [startDt, endDt] = getStartAndEndDates(holding, startDate, endDate)

  // get dated values of daily purchase costs
  const allPurchases = getHoldingPurchases(holding)
  const purchases = allPurchases.filter((txn: ITransaction) => {
    return isDateAfter(txn.date, startDt, true) 
      && isDateBefore(txn.date, endDt, true)
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
  priceSeries?: A danfo Series of prices
  startDate?: The start date of the Series (default: first transaction date)
  endDate?: The end date of the  (default: T-1)
  annualized?: TRUE if the return should be annualized, FALSE otherwise
RETURN
  The time-weighted return
*/
export async function getHoldingTimeWeightedReturn(
  holding: IHolding | IPopulatedHolding,
  priceSeries?: df.Series,
  startDate?: Date,
  endDate?: Date,
  annualized?: boolean
): Promise<number> {

  // get start and end dates
  const [startDt, endDt] = getStartAndEndDates(holding, startDate, endDate)

  // get market value series
  const entireMarketValueSeries 
    = await getHoldingMarketValueSeries(holding, priceSeries, startDate, endDate)
  const marketValueSeries 
    = defaultTrimOrExtendSeries(entireMarketValueSeries, startDt, endDt)

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
      [endDt.toISOString()]
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
        365 / getDaysBetween(startDt, endDt)
      ) - 1
    : timeWeightedReturn
}

/*
DESC
  Returns a series of daily revenue for the input IHolding between the input
  startDate and endDate
INPUT
  holding: An IHolding
  startDate?: The start date of the Series (default: first transaction date)
  endDate?: The end date of the Series (default: T-1)
RETURN
  A danfo Series
*/
export function getHoldingRevenueSeries(
  holding: IHolding | IPopulatedHolding,
  startDate?: Date,
  endDate?: Date
): df.Series {

  // get start and end dates
  const [startDt, endDt] = getStartAndEndDates(holding, startDate, endDate)

  const allSales = getHoldingSales(holding)
  const sales = allSales.filter((txn: ITransaction) => {
    return isDateAfter(txn.date, startDt, true) 
      && isDateBefore(txn.date, endDt, true)
  })

  const datedValues: TDatedValue[] = sales.map((txn: ITransaction) => {
    return {
      date: txn.date,
      value: txn.price * txn.quantity
    }
  })

  return sortSeriesByIndex(getSeriesFromDatedValues(datedValues))
}

/*
DESC
  Returns the total cost of the input Holding between the startDate and
  endDate
INPUT
  holding: An IHolding
  startDate?: The start date for market value calculation 
  endDate?: The end date for market value calculation
*/
export async function getHoldingTotalCostAsDatedValues(
  holding: IHolding | IPopulatedHolding,
  startDate?: Date,
  endDate?: Date
): Promise<TDatedValue[]> {

  // get total cost
  const totalCostSeries = getHoldingTotalCostSeries(holding, startDate, endDate)

  return getDatedValuesFromSeries(totalCostSeries, 2)
}

/*
DESC
  Returns a series of total cost for the input IHolding between the input 
  startDate and endDate
INPUT
  holding: An IHolding
  startDate?: The start date of the Series (default: first transaction date)
  endDate?: The end date of the Series (default: T-1)
RETURN
  A danfo Series
*/
export function getHoldingTotalCostSeries(
  holding: IHolding | IPopulatedHolding,
  startDate?: Date,
  endDate?: Date
): df.Series {

  // get start and end dates
  const [startDt, endDt] = getStartAndEndDates(holding, startDate, endDate)

  // get dated values of daily purchase costs
  const purchases = getHoldingPurchases(holding)
  const datedValues: TDatedValue[] = purchases.map((txn: ITransaction) => {
    return {
      date: txn.date,
      value: txn.price * txn.quantity
    }
  })

  // align daily purchase costs to date index
  const dailyPurchaseSeries = 
    sortSeriesByIndex(getSeriesFromDatedValues(datedValues))

  return accumulateAndDensifySeries(dailyPurchaseSeries, startDt, endDt)
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
  Returns the default starting and ending dates for the input Holding for use
  in the various getter functions above
INPUT
  holding: An IHolding
  startDate?: The start date for the calculation
  endDate?: The end date for the calculation
RETURN
  An array with two elements
    start: The non-undefined starting date
    end: The non-undefined ending date
*/
function getStartAndEndDates(
  holding: IHolding | IPopulatedHolding, 
  startDate?: Date,
  endDate?: Date
): [Date, Date] {

  // starting date
  const start = startDate ?? getHoldingFirstTransactionDate(holding) as Date

  // ending date
  const end = endDate ?? dateSub(new Date(), {days: 1})
  
  return [start, end]
} 


// ==========
// validators
// ==========

/*
DESC
  Validates whether the input Holdings are valid. The validity checks are:
    - unique tcgplayerId for each Holding
    - the Product exists for each Holding
    - the Transaction quantity >= 0 for each Holding
INPUT
  holdings: An IHolding[]
RETURN
  TRUE if the input is a valid set of IHolding[], FALSE otherwise
*/
export async function areValidHoldings(holdings: IHolding[]): Promise<boolean> {
  
  // unique tcgplayerId
  const tcgplayerIds = holdings.map((holding: IHolding) => {
    return Number(holding.tcgplayerId)
  })
  if (tcgplayerIds.length > _.uniq(tcgplayerIds).length) {
    console.log(`Duplicate tcgplayerIds detected in isValidHoldings()`)
    return false
  }

  // all Products exist
  const productDocs = await getProductDocs()
  const productTcgplayerIds = productDocs.map((doc: IMProduct) => {
    return doc.tcgplayerId
  })
  const unknownTcgplayerIds = _.difference(tcgplayerIds, productTcgplayerIds)
  if (unknownTcgplayerIds.length > 0) {
    console.log(`Products not found for tcgplayerIds in hasValidHoldings(): ${unknownTcgplayerIds}`)
    return false
  }

  // quantity >= 0
  if (!_.every(holdings, (holding: IHolding) => {
    return hasValidTransactions(holding)
  })) {
    return false
  }

  // all checks passed
  return true
}

/*
DESC
  Validates whether the input IHolding has valid Transactions. The validity 
  checks are:
    - the net quantity is greater than or equal to 0
INPUT
  holding: An IHolding[]
RETURN
  TRUE if the input IHolding has valid set of ITransaction[], FALSE otherwise
*/
export function hasValidTransactions(holding: IHolding): boolean {

  // net quantity
  return getHoldingQuantity(holding) >= 0
}