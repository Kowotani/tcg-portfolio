import * as _ from 'lodash'
import { 
  IHolding, IPopulatedHolding, IPortfolio, IPopulatedPortfolio, IPriceData
} from './dataModels'
import { assert, isIHolding, isIPortfolio } from './utils'
import { 
  getHoldingPurchaseQuantity, getHoldingRealizedPnl, getHoldingSaleQuantity, 
  getHoldingTotalCost, getHoldingTotalRevenue, getHoldingUnrealizedPnl
} from './holdingUtils'


/*
DESC
  Returns the Holdings for the input IPortfolio
INPUT
  portfolio: An IPortfolio
RETURN
  An IHolding[] or IPopulatedHolding[]
*/
export function getPortfolioHoldings(
  portfolio: IPortfolio | IPopulatedPortfolio
): IHolding[] | IPopulatedHolding[] {
  return isIPortfolio(portfolio)
    ? portfolio.holdings
    : portfolio.populatedHoldings
}

/*
DESC
  Returns the total pnl percent from the input IHolding and price relative
  to the total cost
INPUT
  portfolio: An IPortfolio
  prices: A Map<number, IPriceData> where the key is a tcgplayerId
RETURN
  The total pnl as a percentage return relative to the total cost, or undefined
  if total cost === 0
*/
export function getPortfolioPercentPnl(
  portfolio: IPortfolio | IPopulatedPortfolio,
  prices: Map<number, IPriceData>
): number | undefined {
  const totalCost = getPortfolioTotalCost(portfolio)
  const totalPnl = getPortfolioTotalPnl(portfolio, prices)
  return totalCost === 0
    ? undefined 
    : totalPnl / totalCost
}

/*
DESC
  Returns the purchase quantity from the input IPortfolio. This value
  should never be negative
INPUT
  portfolio: An IPortfolio
RETURN
  The purchase quantity from the input IPortfolio
*/
export function getPortfolioPurchaseQuantity(
  portfolio: IPortfolio | IPopulatedPortfolio
): number {
  const holdings = getPortfolioHoldings(portfolio) 

  const value = _.sum(holdings.map((holding: IHolding | IPopulatedHolding) => {
    return getHoldingPurchaseQuantity(holding)
  }))
  assert(value >= 0, 'getPortfolioPurchaseQuantity() is not at least 0')
  return value
}

/*
DESC
  Returns the realized pnl determined as the summed IHolding realized pnl
INPUT
  portfolio: An IPortfolio
RETURN
  The summed realized pnl from IHoldings, or undefined if saleQuantity === 0
*/
export function getPortfolioRealizedPnl(
  portfolio: IPortfolio | IPopulatedPortfolio
): number | undefined {
  const holdings = getPortfolioHoldings(portfolio)
  return getPortfolioSaleQuantity(portfolio) === 0
    ? undefined
    : _.sum(holdings.map((holding: IHolding | IPopulatedHolding) => {
      return getHoldingRealizedPnl(holding)
    }))
}

/*
DESC
  Returns the sale quantity from the input IPortfolio. This value
  should never be negative
INPUT
  portfolio: An IPortfolio
RETURN
  The sale quantity from the input IPortfolio
*/
export function getPortfolioSaleQuantity(
  portfolio: IPortfolio | IPopulatedPortfolio
): number {
  const holdings = getPortfolioHoldings(portfolio) 

  const value = _.sum(holdings.map((holding: IHolding | IPopulatedHolding) => {
    return getHoldingSaleQuantity(holding)
  }))
  assert(value >= 0, 'getPortfolioSaleQuantity() is not at least 0')
  return value
}

/*
DESC
  Returns the total purchase cost from the input IPortfolio. This value
  should never be negative
INPUT
  portfolio: An IPortfolio
RETURN
  The total purchase cost from the input IPortfolio
*/
export function getPortfolioTotalCost(
  portfolio: IPortfolio | IPopulatedPortfolio
): number {
  const holdings = getPortfolioHoldings(portfolio) 
  const value = _.sum(holdings.map((holding: IHolding | IPopulatedHolding) => {
    return getHoldingTotalCost(holding)
  }))
  assert(value >= 0, 'getPortfolioTotalCost() is not at least 0')
  return value
}

/*
DESC
  Returns the total pnl from the input IHolding and price
INPUT
  portfolio: An IPortfolio
  prices: A Map<number, IPriceData> where the key is a tcgplayerId
RETURN
  The total pnl based on the market price and avg cost vs avg rev from the
  IHolding, or undefined if both realizedPnl and unrealizedPnl are undefined
*/
export function getPortfolioTotalPnl(
  portfolio: IPortfolio | IPopulatedPortfolio,
  prices: Map<number, IPriceData>
): number | undefined {
  const realizedPnl = getPortfolioRealizedPnl(portfolio)
  const unrealizedPnl = getPortfolioUnrealizedPnl(portfolio, prices)
  return (realizedPnl === undefined && unrealizedPnl === undefined)
    ? undefined
    : (realizedPnl ?? 0) + (unrealizedPnl ?? 0)
}

/*
DESC
  Returns the total sale revenue from the input IPortfolio. This value
  should never be negative
INPUT
  portfolio: An IPortfolio
RETURN
  The total sale revenue from the input ITransaction
*/
export function getPortfolioTotalRevenue(
  portfolio: IPortfolio | IPopulatedPortfolio
): number {
  const holdings = getPortfolioHoldings(portfolio)
  const value = _.sum(holdings.map((holding: IHolding | IPopulatedHolding) => {
    return getHoldingTotalRevenue(holding)
  }))
  assert(value >= 0, 'getPortfolioTotalCost() is not at least 0')
  return value
}

/*
DESC
  Returns the unrealized pnl determined as the summed IHolding unrealized pnl
INPUT
  portfolio: An IPortfolio
  prices: A Map<number, IPriceData> where the key is a tcgplayerId
RETURN
  The unrealized pnl based on the IHoldings, or undefined if quantity === 0
*/
export function getPortfolioUnrealizedPnl(
  portfolio: IPortfolio | IPopulatedPortfolio,
  prices: Map<number, IPriceData>
): number | undefined {
  const holdings = getPortfolioHoldings(portfolio)
  const quantity = getPortfolioPurchaseQuantity(portfolio) 
    - getPortfolioSaleQuantity(portfolio)
  return quantity === 0
    ? undefined
    : _.sum(holdings.map((holding: IHolding | IPopulatedHolding) => {
      const price = isIHolding(holding) 
        ? prices.get(holding.tcgplayerId).marketPrice
        : prices.get(holding.product.tcgplayerId).marketPrice
      return getHoldingUnrealizedPnl(holding, price)
    }))
}