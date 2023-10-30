// imports
import { 
  IHolding, IPopulatedHolding, TDatedValue, getHoldingTcgplayerId
} from 'common'
import * as df from 'danfojs-node'
import { getPriceMapOfSeries } from './Price'
import * as _ from 'lodash'
import * as dfu from '../../utils/danfo'
import { 
  getHoldingMarketValueSeries, getHoldingTotalCostSeries 
} from '../../utils/Holding'


// =========
// functions
// =========

/*
DESC
  Returns the market value of the input Portfolio between the startDate and
  endDate
INPUT
  holding: A IHolding
  startDate: The start date for market value calculation
  endDate: The end date for market value calculation
*/
export async function getHoldingMarketValueAsDatedValues(
  holding: IHolding | IPopulatedHolding,
  startDate: Date,
  endDate: Date
): Promise<TDatedValue[]> {

  // get price map
  const tcgplayerId = getHoldingTcgplayerId(holding)
  const priceMap = await getPriceMapOfSeries([tcgplayerId], startDate, endDate)
  const priceSeries = priceMap.get(tcgplayerId) as df.Series

  // get market value
  const marketValueSeries = getHoldingMarketValueSeries(
    holding, priceSeries, startDate, endDate)

  return dfu.getDatedValuesFromSeries(marketValueSeries)
}

/*
DESC
  Returns the total cost of the input Holding between the startDate and
  endDate
INPUT
  holding: An IHolding
  startDate: The start date for market value calculation
  endDate: The end date for market value calculation
*/
export async function getHoldingTotalCostAsDatedValues(
  holding: IHolding | IPopulatedHolding,
  startDate: Date,
  endDate: Date
): Promise<TDatedValue[]> {

  // get total cost
  const totalCostSeries = getHoldingTotalCostSeries(
    holding, startDate, endDate)

  return dfu.getDatedValuesFromSeries(totalCostSeries)
}


async function main(): Promise<number> {  

  let res

  // const userId = 1234
  // const portfolioName = 'Delta'
  // const tcgplayerId = 121527
  // const description = 'Washer dryer mechanic'
  // let holdings: IHolding[] = [
  //   {
  //     tcgplayerId: 233232,
  //     transactions: [
  //       {
  //         type: TransactionType.Purchase,
  //         date: new Date(),
  //         price: 99,
  //         quantity: 1,
  //       },
  //       {
  //         type: TransactionType.Sale,
  //         date: new Date(),
  //         price: 99,
  //         quantity: 2,
  //       },        
  //     ],
  //   },
  // ]

  // const portfolio: IPortfolio = {
  //   userId: userId, 
  //   portfolioName: portfolioName,
  //   holdings: [],
  // }
  // const portfolioDoc = await getPortfolioDoc(portfolio) as IPortfolio
  // const holding = getPortfolioHolding(portfolioDoc, tcgplayerId) as IHolding
  // const startDate = new Date(Date.parse('2023-09-01'))
  // const endDate = new Date(Date.parse('2023-09-14'))
  // const priceMap = await getPriceMapOfSeries([tcgplayerId])
  // const priceSeries = priceMap.get(tcgplayerId) as df.Series
  // const series = await getHoldingTotalCostAsDatedValues(holding, startDate, endDate)
  // console.log(series)
  // const twr = dfu.getHoldingTimeWeightedReturn(holding, priceSeries, startDate, endDate)
  // console.log(twr)

  // const newPortfolio: IPortfolio = {
  //   userId: userId, 
  //   portfolioName: portfolioName,
  //   holdings: holdings,
  // }
  // res = await setPortfolio(portfolio, newPortfolio)
  // if (res) {
  //   console.log('Portfolio successfully set')
  // } else {
  //   console.log('Portfolio not set')
  // }

  return 0
}

main()
  .then(console.log)
  .catch(console.error)