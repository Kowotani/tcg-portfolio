import * as _ from 'lodash'
import { 
  IHolding, IPopulatedHolding, ITransaction, TransactionType 
} from './dataModels'
import { assert } from './utils'


// ==========
// converters
// ==========

/*
DESC
  Returns an IHolding[] derived from the input IPopulatedHolding[]
INPUT
  populatedHoldings: An IPopulatedHolding[]
RETURN
  An IHolding[]
*/
export function getIHoldingsFromIPopulatedHoldings(
  populatedHoldings: IPopulatedHolding[]
): IHolding[] {
  const holdings: IHolding[] = populatedHoldings.map(
    (populatedHolding: IPopulatedHolding) => {
      return {
        tcgplayerId: populatedHolding.product.tcgplayerId,
        transactions: populatedHolding.transactions
      }
  })
  return holdings
}


// =======
// getters
// =======

/*
DESC
  Returns the date of the first transaction for the input IHolding
INPUT
  holding: An IHolding
RETURN
  The Date of the first transaction
*/
export function getHoldingFirstTransactionDate(
  holding: IHolding | IPopulatedHolding
): Date | undefined {

  // no transactions
  if (holding.transactions.length === 0) {
    return undefined

  } else {
    const firstTxn = _.minBy(holding.transactions, (txn: ITransaction) => {
      return txn.date.getTime()
    })
    return firstTxn.date
  }
}


// ==================
// metric calculators
// ==================

/*
DESC
  Returns the average purchase cost from the input IHolding. This value
  should never be negative
INPUT
  holding: An IHolding
RETURN
  The average purchase cost from the input IHolding, or undefined
  if purchaseQuantity === 0
*/
export function getHoldingAverageCost(
  holding: IHolding | IPopulatedHolding
): number | undefined {
  const quantity = getHoldingPurchaseQuantity(holding)
  return quantity === 0 
    ? undefined
    : getHoldingTotalCost(holding) / quantity
}

/*
DESC
  Returns the average sale revemue from the input IHolding. This value
  should never be negative
INPUT
  holding: An IHolding
RETURN
  The average sale revenue from the input IHolding, or undefined
  if saleQuantity === 0
*/
export function getHoldingAverageRevenue(
  holding: IHolding | IPopulatedHolding
): number | undefined {
  const saleQuantity = getHoldingSaleQuantity(holding)
  return saleQuantity === 0 
    ? undefined
    : getHoldingTotalRevenue(holding) / saleQuantity
}

/*
DESC
  Returns the market value of the Holding based on the input price
INPUT
  holding: An IHolding
  price: The market price
RETURN
  The market value of the Holding
*/
export function getHoldingMarketValue(
  holding: IHolding | IPopulatedHolding,
  price: number
): number {
  const holdingValue = getHoldingQuantity(holding) * price
  const totalRev = getHoldingTotalRevenue(holding)
  return holdingValue + totalRev
}

/*
DESC
  Returns the total pnl percent from the input IHolding and price relative
  to the total cost
INPUT
  holding: An IHolding
  price: The market price
RETURN
  The total pnl as a percentage return relative to the total cost, or undefined
  if total cost === 0
*/
export function getHoldingPercentPnl(
  holding: IHolding | IPopulatedHolding,
  price: number
): number | undefined {
  const totalCost = getHoldingTotalCost(holding)
  const totalPnl = getHoldingTotalPnl(holding, price)
  return totalCost === 0
    ? undefined 
    : totalPnl / totalCost
}

/*
DESC
  Returns the purchase ITransactions from the input IHolding
INPUT
  holding: An IHolding
RETURN
  An array of purchase ITransactions from the IHolding
*/
export function getHoldingPurchases(
  holding: IHolding | IPopulatedHolding
): ITransaction[] {
  return holding.transactions.filter((txn: ITransaction) => {
    return txn.type === TransactionType.Purchase
})}

/*
DESC
  Returns the purchase quantity from the input ITransaction. This value
  should never be negative
INPUT
  holding: An IHolding
RETURN
  The purchase quantity from the input ITransaction
*/
export function getHoldingPurchaseQuantity(
  holding: IHolding | IPopulatedHolding
): number {
  const value = _.sumBy(getHoldingPurchases(holding), (txn: ITransaction) => {
    return txn.quantity
  })
  assert(
    value >= 0, 
    'getHoldingPurchaseQuantity() value is not at least 0'
  )
  return value
}

/*
DESC
  Returns the total cost of items 
INPUT
  holding: An IHolding
RETURN
  The item quantity available from the input IHolding
*/
export function getHoldingQuantity(
  holding: IHolding | IPopulatedHolding
): number {
  const value = getHoldingPurchaseQuantity(holding) 
    - getHoldingSaleQuantity(holding)
  assert(
    value >= 0, 
    'getHoldingQuantity() value is not at least 0'
  )
  return value
}

/*
DESC
  Returns the realized pnl determined as:
    pnl = salesQuantity * (avgRev - avgCost)
INPUT
  holding: An IHolding
RETURN
  The realized pnl based on sales and avg cost vs avg revenue from the 
  IHolding, or undefined if saleQuantity === 0
*/
export function getHoldingRealizedPnl(
  holding: IHolding | IPopulatedHolding
): number | undefined {
  const saleQuantity = getHoldingSaleQuantity(holding)
  return saleQuantity === 0 
    ? undefined
    : (getHoldingAverageRevenue(holding) - getHoldingAverageCost(holding))
      * saleQuantity
}

/*
DESC
  Returns the sale ITransactions from the input IHolding
INPUT
  holding: An IHolding
RETURN
  An array of sale ITransactions from the IHolding
*/
export function getHoldingSales(
  holding: IHolding | IPopulatedHolding
): ITransaction[] {
  return holding.transactions.filter((txn: ITransaction) => {
    return txn.type === TransactionType.Sale
})}

/*
DESC
  Returns the sale quantity from the input IHolding. This value
  should never be negative
INPUT
  holding: An IHolding
RETURN
  The sale quantity from the input IHolding
*/
export function getHoldingSaleQuantity(
  holding: IHolding | IPopulatedHolding
): number {
  const value = _.sumBy(getHoldingSales(holding), (txn: ITransaction) => {
    return txn.quantity
  })
  assert(
    value >= 0, 
    'getHoldingSaleQuantity() value is not at least 0'
  )
  return value
}

/*
DESC
  Returns the total purchase cost from the input IHolding. This value
  should never be negative
INPUT
  holding: An IHolding
RETURN
  The total purchase cost from the input ITransaction, or undefined if there
  are no purchases
*/
export function getHoldingTotalCost(
  holding: IHolding | IPopulatedHolding
): number | undefined {
  const purchases = getHoldingPurchases(holding)
  if (purchases.length === 0) {
    return undefined
  }
  const value = _.sumBy(purchases, (txn: ITransaction) => {
    return txn.quantity * txn.price
  })
  assert(
    value >= 0, 
    'getHoldingTotalCost() is not at least 0'
  )
  return value
}

/*
DESC
  Returns the total pnl from the input IHolding and price, defined as:
    totalPnl = marketValue - totalCost
INPUT
  holding: An IHolding
  price: The market price
RETURN
  The total pnl defined as marketValue - totalCost, or undefined if totalCost 
  and marketValue are both undefined
*/
export function getHoldingTotalPnl(
  holding: IHolding | IPopulatedHolding,
  price: number
): number | undefined {
  const totalCost = getHoldingTotalCost(holding) 
  const marketValue = getHoldingMarketValue(holding, price)
  return (totalCost && marketValue)  
    ? marketValue - totalCost
    : undefined
}

/*
DESC
  Returns the total sale revenue from the input IHolding. This value
  should never be negative
INPUT
  holding: An IHolding
RETURN
  The total sale revenue from the input IHolding
*/
export function getHoldingTotalRevenue(
  holding: IHolding | IPopulatedHolding
): number {
  const value = _.sumBy(getHoldingSales(holding), (txn: ITransaction) => {
    return txn.quantity * txn.price
  })
  assert(
    value >= 0, 
    'getHoldingTotalRev() is not at least 0'
  )
  return value
}

/*
DESC
  Returns the unrealized pnl determined as:
    pnl = quantity * (price - avgCost)
INPUT
  holding: An IHolding
  price: The market price
RETURN
  The unrealized pnl based on market price and avg cost from the 
  IHolding, or undefined if quantity === 0
*/
export function getHoldingUnrealizedPnl(
  holding: IHolding | IPopulatedHolding,
  price: number
): number | undefined {
  const quantity = getHoldingQuantity(holding)
  return quantity === 0 
    ? undefined
    : (price - getHoldingAverageCost(holding)) * quantity
}