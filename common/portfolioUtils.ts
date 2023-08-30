import * as _ from 'lodash'
import { 
  IHolding, IPopulatedHolding, IPortfolio, IPopulatedPortfolio, IPriceData
} from './dataModels'
import { assert, isIHolding, isIPortfolio } from './utils'
import { 
  getHoldingPurchaseQuantity, getHoldingRealizedPnl, getHoldingSaleQuantity, 
  getHoldingTotalCost, getHoldingTotalRevenue, getHoldingUnrealizedPnl,
  getIHoldingsFromIPopulatedHoldings
} from './holdingUtils'


// ==========
// converters
// ==========

/*
DESC
  Returns an IPortfolio[] derived from the input IPopulatedPortfolio[]
INPUT
  populatedPortfolios: An IPopulatedPortfolio[]
RETURN
  An IPortfolio[]
*/
export function getIPortfoliosFromIPopulatedPortfolios(
  populatedPortfolios: IPopulatedPortfolio[]
): IPortfolio[] {
  const portfolios: IPortfolio[] = populatedPortfolios.map(
    (populatedPortfolio: IPopulatedPortfolio) => {
      
      let portfolio = {
        userId: populatedPortfolio.userId,
        portfolioName: populatedPortfolio.portfolioName,
        holdings: getIHoldingsFromIPopulatedHoldings(
          populatedPortfolio.populatedHoldings)
      }
      if (populatedPortfolio.description) {
        portfolio['description'] = populatedPortfolio.description
      } 
      return portfolio
  })

  return portfolios
}

// =======
// getters
// =======

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


// ==================
// metric calculators
// ==================

/*
DESC
  Returns the market value of the input IPortfolio based on the input price
INPUT
  portfolio: An IPortfolio
  prices: A Map<number, IPriceData> where the key is a tcgplayerId
RETURN
  The market value of the Portfolio, or undefined if both getPortfolioRealizedPnl() 
  and getPortfolioUnrealizedPnl() are undefined
*/
export function getPortfolioMarketValue(
  portfolio: IPortfolio | IPopulatedPortfolio,
  prices: Map<number, IPriceData>
): number | undefined {
  const realizedPnl = getPortfolioRealizedPnl(portfolio) 
  const unrealizedPnl = getPortfolioUnrealizedPnl(portfolio, prices) 
  return (realizedPnl || unrealizedPnl)
    ? (realizedPnl ?? 0) + (unrealizedPnl ?? 0)
    : undefined
}

/*
DESC
  Returns the total pnl percent for the input IPortfolio and price relative
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
  The total purchase cost from the input IPortfolio, or undefined if every
  Holding as undefined total cost
*/
export function getPortfolioTotalCost(
  portfolio: IPortfolio | IPopulatedPortfolio
): number {
  const holdings = getPortfolioHoldings(portfolio)
  const totalCosts = holdings.map((holding: IHolding | IPopulatedHolding) => {
    return getHoldingTotalCost(holding)
  }) 
  if (_.every(totalCosts, (el: any) => el === undefined)) {
    return undefined
  }
  const value = _.sum(totalCosts)
  assert(value >= 0, 'getPortfolioTotalCost() is not at least 0')
  return value
}

/*
DESC
  Returns the total pnl from the input IPortfolio and prices, defined as:
    totalPnl = marketValue - totalCost
INPUT
  portfolio: An IPortfolio
  prices: A Map<number, IPriceData> where the key is a tcgplayerId
RETURN
  The total pnl defined as marketValue - totalCost, or undefined if totalCost 
  and marketValue are both undefined
*/
export function getPortfolioTotalPnl(
  portfolio: IPortfolio | IPopulatedPortfolio,
  prices: Map<number, IPriceData>
): number | undefined {
  const totalCost = getPortfolioTotalCost(portfolio)
  const marketValue = getPortfolioMarketValue(portfolio, prices)
  return (totalCost && marketValue)
    ? marketValue - totalCost
    : undefined
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