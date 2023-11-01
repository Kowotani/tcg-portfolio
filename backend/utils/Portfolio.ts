import { 
  IHolding, IPopulatedHolding, IPopulatedPortfolio, IPortfolio,

  getHoldingTcgplayerId, getPortfolioFirstTransactionDate, getPortfolioHoldings,

  assert, dateSub
} from 'common'
import { densifyAndFillSeries } from './danfo'
import * as df from 'danfojs-node'
import { 
  getHoldingMarketValueSeries, getHoldingTotalCostSeries 
} from './Holding'
import * as _ from 'lodash'
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
export function getPortfolioMarketValueSeries(
  portfolio: IPortfolio | IPopulatedPortfolio,
  priceSeriesMap: Map<number, df.Series>,
  startDate?: Date,
  endDate?: Date
): df.Series {

  // get start and end dates
  const [startDt, endDt] = getStartAndEndDates(portfolio, startDate, endDate)

  const holdings = getPortfolioHoldings(portfolio)

  // get market value series of Holdings
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

  // get market value series of Portfolio
  return marketValues.reduce((acc: df.Series, cur: df.Series) => {
    return acc = acc.add(cur) as df.Series
  }, emptySeries)
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

    const tcgplayerId = getHoldingTcgplayerId(holding)

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