import * as _ from 'lodash'
import { 
  IHolding, IPopulatedHolding, ITransaction, TransactionType 
} from './dataModels'
import { assert } from './utils'

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
  assert(value >= 0, 'getHoldingPurchaseQuantity() is not at least 0')
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
  assert(value >= 0, 'getHoldingQuantity() is not at least 0')
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
  assert(value >= 0, 'getHoldingSaleQuantity() is not at least 0')
  return value
}

/*
DESC
  Returns the total purchase cost from the input IHolding. This value
  should never be negative
INPUT
  holding: An IHolding
RETURN
  The total purchase cost from the input ITransaction
*/
export function getHoldingTotalCost(
  holding: IHolding | IPopulatedHolding
): number {
  const value = _.sumBy(getHoldingPurchases(holding), (txn: ITransaction) => {
    return txn.quantity * txn.price
  })
  assert(value >= 0, 'getHoldingTotalCost() is not at least 0')
  return value
}

/*
DESC
  Returns the total pnl from the input IHolding and price
INPUT
  holding: An IHolding
  price: The market price
RETURN
  The total pnl based on the market price and avg cost vs avg rev from the
  IHolding, or undefined if realizedPnl and unrealizedPnl are both undefined
*/
export function getHoldingTotalPnl(
  holding: IHolding | IPopulatedHolding,
  price: number
): number | undefined {
  const realizedPnl = getHoldingRealizedPnl(holding) 
  const unrealizedPnl = getHoldingUnrealizedPnl(holding, price)
  return (realizedPnl === undefined && unrealizedPnl === undefined)  
    ? undefined
    : (realizedPnl ?? 0) + (unrealizedPnl ?? 0)
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
  assert(value >= 0, 'getHoldingTotalRev() is not at least 0')
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