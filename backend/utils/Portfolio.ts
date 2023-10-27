import { 
  IHolding, IPopulatedHolding, IPopulatedPortfolio, IPortfolio,

  getHoldingTcgplayerId, getPortfolioHoldings,

  assert
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
  startDate: The start date of the Series
  endDate: The end date of the Series
RETURN
  A danfo Series
*/
export function getPortfolioTotalCostSeries(
  portfolio: IPortfolio | IPopulatedPortfolio,
  startDate: Date,
  endDate: Date
): df.Series {

  const holdings = getPortfolioHoldings(portfolio)

  // get total cost series of Holdings
  const totalCosts = holdings.map((holding: IHolding | IPopulatedHolding) => {

    const tcgplayerId = getHoldingTcgplayerId(holding)

    return getHoldingTotalCostSeries(
      holding,
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

  // get total cost series of Portfolio
  return totalCosts.reduce((acc: df.Series, cur: df.Series) => {
    return acc = acc.add(cur) as df.Series
  }, emptySeries)

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