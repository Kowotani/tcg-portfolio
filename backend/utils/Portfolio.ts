import { 
  IHolding, IPopulatedHolding, IPopulatedPortfolio, IPortfolio, TDatedValue,

  getHoldingTcgplayerId, getPortfolioFirstTransactionDate, getPortfolioHoldings,

  assert, dateSub
} from 'common'
import { densifyAndFillSeries, getDatedValuesFromSeries } from './danfo'
import * as df from 'danfojs-node'
import { 
  getHoldingMarketValueSeries, getHoldingPnLSeries, getHoldingTotalCostSeries
} from './Holding'
import * as _ from 'lodash'
import { getPortfolioTcgplayerIds } from '../mongo/dbi/Portfolio'
import { getPriceMapOfSeries } from '../mongo/dbi/Price'
import { IMPortfolio, Portfolio } from '../mongo/models/portfolioSchema'


// ======
// errors
// ======

/*
DESC
  Returns an Error with standardized error message when a Portfolio already 
  exists for a userId / portfolioName combination
INPUT
  userId: The userId associated with the Portfolio
  portfolioName: The portfolioName associated with the Portfolio
  fnName: The name of the function generating the error
RETURN
  An error
*/
export function genPortfolioAlreadyExistsError(
  userId: number, 
  portfolioName: string,
  fnName: string
): Error {
  const errMsg = `Portfolio ${portfolioName} already exists for userId: ${userId} in ${fnName}`
  return new Error(errMsg)
}

/*
DESC
  Returns an Error with standardized error message when a Portfolio is not found
  for a userId / portfolioName combination
INPUT
  userId: The userId associated with the Portfolio
  portfolioName: The portfolioName associated with the Portfolio
  fnName: The name of the function generating the error
RETURN
  An error
*/
export function genPortfolioNotFoundError(
  userId: number, 
  portfolioName: string,
  fnName: string
): Error {
  const errMsg = userId && portfolioName
    ? `Portfolio not found for [${userId}, ${portfolioName}] in ${fnName}`
    : `Portfolio not found in ${fnName}`
  return new Error(errMsg)
}


// =======
// getters
// =======

/*
DESC
  Returns the market value of the input Portfolio between the startDate and
  endDate
INPUT
  portfolio: An IPortfolio
  startDate?: The start date for market value calculation
  endDate?: The end date for market value calculation
RETURN
  A TDatedValue[]
*/
export async function getPortfolioMarketValueAsDatedValues(
  portfolio: IPortfolio,
  startDate?: Date,
  endDate?: Date
): Promise<TDatedValue[]> {

  // get price map
  const tcgplayerIds = await getPortfolioTcgplayerIds(portfolio)
  const priceMap = await getPriceMapOfSeries(tcgplayerIds, startDate, endDate)

  // get market value
  const marketValueSeries = 
    await getPortfolioMarketValueSeries(portfolio, priceMap, startDate, endDate)

  return getDatedValuesFromSeries(marketValueSeries, 2)
}

/*
DESC
  Returns a series of daily market values for the input IPortfolio between the
  input startDate and endDate using prices in the input priceSeriesMap
INPUT
  portfolio: An IPortfolio
  priceSeriesMap: A Map of tcgplayerId => danfo Series of Prices
  startDate?: The start date of the Series (default: first transaction date)
  endDate?: The end date of the Series (date: T-1)
RETURN
  A danfo Series
*/
export async function getPortfolioMarketValueSeries(
  portfolio: IPortfolio | IPopulatedPortfolio,
  priceSeriesMap: Map<number, df.Series>,
  startDate?: Date,
  endDate?: Date
): Promise<df.Series> {

  // get start and end dates
  const [startDt, endDt] = getStartAndEndDates(portfolio, startDate, endDate)

  const holdings = getPortfolioHoldings(portfolio)

  // get market value series of Holdings
  let marketValues: df.Series[] = []
  for (const holding of holdings) {

    const tcgplayerId = getHoldingTcgplayerId(holding)
    const priceSeries = priceSeriesMap.get(tcgplayerId)

    // verify that prices exist for this tcgplayerId
    assert(
      priceSeries instanceof df.Series,
      `Could not find prices for tcgplayerId: ${tcgplayerId}`)

    const marketValueSeries = 
      await getHoldingMarketValueSeries(holding, priceSeries, startDt, endDt)

    marketValues.push(marketValueSeries)
  }

  // create empty Series used for summation
  const emptySeries = densifyAndFillSeries(
    new df.Series([0], {index: [startDt.toISOString()]}),
    startDt,
    endDt,
    'value',
    0,
    0
  )

  // get market value series of Portfolio
  return marketValues.reduce((acc: df.Series, cur: df.Series) => {
    return acc = acc.add(cur) as df.Series
  }, emptySeries)
}

/*
DESC
  Returns the cumulative pnl of the input Portfolio between the startDate and
  endDate
INPUT
  portfolio: An IPortfolio
  startDate?: The start date for market value calculation
  endDate?: The end date for market value calculation
RETURN
  A TDatedValue[]
*/
export async function getPortfolioPnLAsDatedValues(
  portfolio: IPortfolio,
  startDate?: Date,
  endDate?: Date
): Promise<TDatedValue[]> {

  // get price map
  const tcgplayerIds = await getPortfolioTcgplayerIds(portfolio)
  const priceMap = await getPriceMapOfSeries(tcgplayerIds, startDate, endDate)

  // get pnl series
  const pnlSeries = 
    await getPortfolioPnLSeries(portfolio, priceMap, startDate, endDate)

  return getDatedValuesFromSeries(pnlSeries, 2)
}

/*
DESC
  Returns a series of cumulative PnL for the input IPortfolio between the
  input startDate and endDate using prices in the input priceSeriesMap
INPUT
  portfolio: An IPortfolio
  priceSeriesMap: A Map of tcgplayerId => danfo Series of Prices
  startDate?: The start date of the Series (default: first transaction date)
  endDate?: The end date of the Series (date: T-1)
RETURN
  A danfo Series
*/
export async function getPortfolioPnLSeries(
  portfolio: IPortfolio | IPopulatedPortfolio,
  priceSeriesMap: Map<number, df.Series>,
  startDate?: Date,
  endDate?: Date
): Promise<df.Series> {

  // get start and end dates
  const [startDt, endDt] = getStartAndEndDates(portfolio, startDate, endDate)

  const holdings = getPortfolioHoldings(portfolio)

  // get pnl series of Holdings
  let pnls: df.Series[] = []
  for (const holding of holdings) {

    const tcgplayerId = getHoldingTcgplayerId(holding)
    const priceSeries = priceSeriesMap.get(tcgplayerId)

    // verify that prices exist for this tcgplayerId
    assert(
      priceSeries instanceof df.Series,
      `Could not find prices for tcgplayerId: ${tcgplayerId}`)

    const pnlSeries = 
      await getHoldingPnLSeries(holding, priceSeries, startDt, endDt)

    pnls.push(pnlSeries)
  }

  // create empty Series used for summation
  const emptySeries = densifyAndFillSeries(
    new df.Series([0], {index: [startDt.toISOString()]}),
    startDt,
    endDt,
    'value',
    0,
    0
  )

  // get pnl series of Portfolio
  return pnls.reduce((acc: df.Series, cur: df.Series) => {
    return acc = acc.add(cur) as df.Series
  }, emptySeries)
}

/*
DESC
  Returns the total cost of the input Portfolio between the startDate and
  endDate
INPUT
  portfolio: An IPortfolio
  startDate?: The start date for market value calculation
  endDate: The end date for market value calculation
RETURN
  A TDatedValue[]
*/
export async function getPortfolioTotalCostAsDatedValues(
  portfolio: IPortfolio,
  startDate?: Date,
  endDate?: Date
): Promise<TDatedValue[]> {

  // get total cost
  const totalCostSeries = getPortfolioTotalCostSeries(
    portfolio, startDate, endDate)

  return getDatedValuesFromSeries(totalCostSeries, 2)
}

/*
DESC
  Returns a series of total costs for the input IPortfolio between the
  input startDate and endDate
INPUT
  portfolio: An IPortfolio
  startDate?: The start date of the Series (default: first transaction date)
  endDate?: The end date of the Series (default: T-1)
RETURN
  A danfo Series
*/
export function getPortfolioTotalCostSeries(
  portfolio: IPortfolio | IPopulatedPortfolio,
  startDate?: Date,
  endDate?: Date
): df.Series {

  // get start and end dates
  const [startDt, endDt] = getStartAndEndDates(portfolio, startDate, endDate)

  const holdings = getPortfolioHoldings(portfolio)

  // get total cost series of Holdings
  const totalCosts = holdings.map((holding: IHolding | IPopulatedHolding) => {
    return getHoldingTotalCostSeries(
      holding,
      startDt,
      endDt
    )
  })

  // create empty Series used for summation
  const emptySeries = densifyAndFillSeries(
    new df.Series([0], {index: [startDt.toISOString()]}),
    startDt,
    endDt,
    'value',
    0,
    0
  )

  // get total cost series of Portfolio
  return totalCosts.reduce((acc: df.Series, cur: df.Series) => {
    return acc = acc.add(cur) as df.Series
  }, emptySeries)

}

/*
DESC
  Returns the default starting and ending dates for the input Portfolio for use
  in the various getter functions above
INPUT
  portfolio: An IPortfolio
  startDate?: The start date for the calculation
  endDate?: The end date for the calculation
RETURN
  An array with two elements
    start: The non-undefined starting date
    end: The non-undefined ending date
*/
function getStartAndEndDates(
  portfolio: IPortfolio | IPopulatedPortfolio, 
  startDate?: Date,
  endDate?: Date
): [Date, Date] {

  // starting date
  const start = startDate ?? getPortfolioFirstTransactionDate(portfolio) as Date

  // ending date
  const end = endDate ?? dateSub(new Date(), {days: 1})
  
  return [start, end]
} 


// ===========
// type guards
// ===========

/*
DESC
  Returns whether or not the input is a Portfolio doc
INPUT
  arg: An object that might be a Portfolio doc
RETURN
  TRUE if the input is a Portfolio doc, FALSE otherwise
*/
export function isPortfolioDoc(arg: any): arg is IMPortfolio {
  return arg
    && arg instanceof Portfolio
}