import * as _ from 'lodash'
import { 
  IHolding, IPopulatedHolding, IPortfolio, IPortfolioBase, IPopulatedPortfolio, 
  IPriceData
} from './dataModels'
import { 
  getHoldingFirstTransactionDate, getHoldingMarketValue,
  getHoldingPurchaseQuantity, getHoldingRealizedPnl, getHoldingSaleQuantity, 
  getHoldingTotalCost, getHoldingTotalRevenue, getHoldingUnrealizedPnl,
  getIHoldingsFromIPopulatedHoldings
} from './holdingUtils'
import { isIHolding, isIPopulatedPortfolio, isIPortfolio } from './typeguards'
import { assert } from './utils'


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
  Returns the date of the first transaction for the input IPortfolio
INPUT
   portfolio: An IPortfolio
RETURN
  The Date of the first transaction in the Portfolio
*/
export function getPortfolioFirstTransactionDate(
  portfolio: IPortfolio | IPopulatedPortfolio
): Date | undefined {

  // get holdings
  const holdings = isIPortfolio(portfolio)
    ? portfolio.holdings
    : portfolio.populatedHoldings

  // first transaction dates for holdings
  const txnDates = holdings.map((holding: IHolding | IPopulatedHolding) => {
    return getHoldingFirstTransactionDate(holding)
  })

  return _.min(txnDates)
}

/*
DESC
  Returns the Holding for the input IPortfolio and tcgplayerId, or null if it
  does not exist
INPUT
  portfolio: An IPortfolio or IPopulatedPortfolio
  tcgplayerId: The tcgplayerId of the Holding
RETURN
  An IHolding or IPopulatedHolding if exists, otherwise null
*/
export function getPortfolioHolding(
  portfolio: IPortfolio | IPopulatedPortfolio,
  tcgplayerId: number
): IHolding | IPopulatedHolding | null {
  
  const isPopulated = isIPopulatedPortfolio(portfolio)

  const holdings = isPopulated
    ? portfolio.populatedHoldings
    : portfolio.holdings

  const filtered = isPopulated
    ? (holdings as IPopulatedHolding[]).filter((h: IPopulatedHolding) => {
        return h.product.tcgplayerId === tcgplayerId
      })
    : (holdings as IHolding[]).filter((h: IHolding) => {
        return h.tcgplayerId === tcgplayerId
      })
  
  return filtered.length ? filtered[0] : null
}

/*
DESC
  Returns the Holdings for the input IPortfolio
INPUT
  portfolio: An IPortfolio or IPopulatedPortfolio
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
  Returns the portfolioNames from an input IPortfolio[]
INPUT
  portfolios: An IPortfolio[]
RETURN
  An array of portfolioNames from the IPortfolio[]
*/
export function getPortfolioNames(
  portfolios: IPortfolio[] | IPopulatedPortfolio[]
) : string[] {
  return portfolios.map((portfolio: IPortfolioBase) => {
    return portfolio.portfolioName
  })
}


// ==================
// metric calculators
// ==================

/*
DESC
  Returns the aggregate market value of the input IPortfolio[] based on the 
  input prices
INPUT
  portfolios: An IPortfolio[]
  prices: A Map<number, IPriceData> where the key is a tcgplayerId
RETURN
  The aggregate market value of the Portfolios
*/
export function getAggPortfolioMarketValue(
  portfolios: IPortfolio[] | IPopulatedPortfolio[],
  prices: Map<number, IPriceData>
): number {
  const marketValues = portfolios.map(
    (portfolio: IPortfolio | IPopulatedPortfolio) => {
      return getPortfolioMarketValue(portfolio, prices)
  })
  return _.sum(marketValues)
}

/*
DESC
  Returns the total purchase cost of the input IPortfolio[]. This value
  should never be negative
INPUT
  portfolios: An IPortfolio[]
RETURN
  The total purchase cost from the input IPortfolio, or undefined if every
  Portfolio as undefined total cost
*/
export function getAggPortfolioTotalCost(
  portfolios: IPortfolio[] | IPopulatedPortfolio[]
): number | undefined {
  const totalCosts = portfolios.map(
    (portfolio: IPortfolio | IPopulatedPortfolio) => {
      return getPortfolioTotalCost(portfolio)
  }) 
  if (_.every(totalCosts, (el: any) => el === undefined)) {
    return undefined
  }
  const value = _.sum(totalCosts)
  assert(value >= 0, 'getAggPortfolioTotalCost() is not at least 0')
  return value
}

/*
DESC
  Returns the market value of the input IPortfolio based on the input prices
INPUT
  portfolio: An IPortfolio
  prices: A Map<number, IPriceData> where the key is a tcgplayerId
RETURN
  The market value of the Portfolio
*/
export function getPortfolioMarketValue(
  portfolio: IPortfolio | IPopulatedPortfolio,
  prices: Map<number, IPriceData>
): number {
  const holdings = getPortfolioHoldings(portfolio)
  const marketValues = holdings.map((holding: IHolding | IPopulatedHolding) => {
    const price = isIHolding(holding)
      ? prices.get(holding.tcgplayerId).marketPrice
      : prices.get(holding.product.tcgplayerId).marketPrice
    return getHoldingMarketValue(holding, price)
  })
  return _.sum(marketValues)
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
): number | undefined {
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