import * as _ from 'lodash'
import { ITransaction, TransactionType } from './dataModels'
import { assert } from './utils'

/*
DESC
  Returns the average purchase cost from the input ITransaction[]. This value
  should never be negative
INPUT
  transactions: An ITransaction[]
RETURN
  The average purchase cost from the input ITransaction[], or undefined
  if purchaseQuantity === 0
*/
export function getAverageCost(
  transactions: ITransaction[]
): number | undefined {
  const quantity = getPurchaseQuantity(transactions)
  return quantity === 0 
    ? undefined
    : getTotalCost(transactions) / quantity
}

/*
DESC
  Returns the average sale revemue from the input ITransaction[]. This value
  should never be negative
INPUT
  transactions: An ITransaction[]
RETURN
  The average sale revenue from the input ITransaction[], or undefined
  if saleQuantity === 0
*/
export function getAverageRevenue(
  transactions: ITransaction[]
): number | undefined {
  const quantity = getSaleQuantity(transactions)
  return quantity === 0 
    ? undefined
    : getTotalRevenue(transactions) / quantity
}

/*
DESC
  Returns the total pnl percent from the input ITransaction[] and price relative
  to the total cost
INPUT
  transactions: An ITransaction[]
  price: The market price
RETURN
  The total pnl as a percentage return relative to the total cost
*/
export function getPercentPnl(
  transactions: ITransaction[],
  price: number
): number | undefined {
  const totalCost = getTotalCost(transactions)
  return totalCost === 0
    ? undefined 
    : getTotalPnl(transactions, price) / totalCost
}

/*
DESC
  Returns the purchases from the input ITransaction[]
INPUT
  transactions: An ITransaction[]
RETURN
  An array of purchases from the ITransaction[]
*/
export function getPurchases(transactions: ITransaction[]): ITransaction[] {
  return transactions.filter((txn: ITransaction) => {
    return txn.type === TransactionType.Purchase
})}

/*
DESC
  Returns the purchase quantity from the input ITransaction. This value
  should never be negative
INPUT
  transactions: An ITransaction[]
RETURN
  The purchase quantity from the input ITransaction
*/
export function getPurchaseQuantity(transactions: ITransaction[]): number {
  const value = _.sumBy(getPurchases(transactions), (txn: ITransaction) => {
    return txn.quantity
  })
  assert(value >= 0, 'getPurchaseQuantity() is not at least 0')
  return value
}

/*
DESC
  Returns the total cost of items 
INPUT
  transactions: An ITransaction[]
RETURN
  The item quantity available from the input ITransaction
*/
export function getQuantity(transactions: ITransaction[]): number {
  const value = getPurchaseQuantity(transactions) - getSaleQuantity(transactions)
  assert(value >= 0, 'getQuantity() is not at least 0')
  return value
}

/*
DESC
  Returns the realized pnl determined as:
    pnl = salesQuantity * (avgRev - avgCost)
INPUT
  transactions: An ITransaction[]
RETURN
  The realized pnl based on sales and avg cost vs avg revenue from the 
  ITransaction[], or undefined if saleQuantity === 0
*/
export function getRealizedPnl(transactions: ITransaction[]): number | undefined {
  const saleQuantity = getSaleQuantity(transactions)
  return saleQuantity === 0 
    ? undefined
    : (getAverageRevenue(transactions) - getAverageCost(transactions))
      * saleQuantity
}

/*
DESC
  Returns the sales from the input ITransaction[]
INPUT
  transactions: An ITransaction[]
RETURN
  An array of sales from the ITransaction[]
*/
export function getSales(transactions: ITransaction[]): ITransaction[] {
  return transactions.filter((txn: ITransaction) => {
    return txn.type === TransactionType.Sale
})}

/*
DESC
  Returns the sale quantity from the input ITransaction[]. This value
  should never be negative
INPUT
  transactions: An ITransaction[]
RETURN
  The sale quantity from the input ITransaction
*/
export function getSaleQuantity(transactions: ITransaction[]): number {
  const value = _.sumBy(getSales(transactions), (txn: ITransaction) => {
    return txn.quantity
  })
  assert(value >= 0, 'getSaleQuantity() is not at least 0')
  return value
}

/*
DESC
  Returns the total purchase cost from the input ITransaction[]. This value
  should never be negative
INPUT
  transactions: An ITransaction[]
RETURN
  The total purchase cost from the input ITransaction
*/
export function getTotalCost(transactions: ITransaction[]): number {
  const value = _.sumBy(getPurchases(transactions), (txn: ITransaction) => {
    return txn.quantity * txn.price
  })
  assert(value >= 0, 'getTotalCost() is not at least 0')
  return value
}

/*
DESC
  Returns the total pnl from the input ITransaction[] and price
INPUT
  transactions: An ITransaction[]
  price: The market price
RETURN
  The total pnl based on the market price and avg cost vs avg rev from the
  ITransaction[]
*/
export function getTotalPnl(
  transactions: ITransaction[],
  price: number
): number {
  return getRealizedPnl(transactions) 
    + getUnrealizedPnl(transactions, price) ?? 0
}

/*
DESC
  Returns the total sale revenue from the input ITransaction[]. This value
  should never be negative
INPUT
  transactions: An ITransaction[]
RETURN
  The total sale revenue from the input ITransaction
*/
export function getTotalRevenue(transactions: ITransaction[]): number {
  const value = _.sumBy(getSales(transactions), (txn: ITransaction) => {
    return txn.quantity * txn.price
  })
  assert(value >= 0, 'getTotalRev() is not at least 0')
  return value
}

/*
DESC
  Returns the unrealized pnl determined as:
    pnl = quantity * (price - avgCost)
INPUT
  transactions: An ITransaction[]
  price: The market price
RETURN
  The unrealized pnl based on market price and avg cost from the 
  ITransaction[], or undefined if quantity === 0
*/
export function getUnrealizedPnl(
  transactions: ITransaction[],
  price: number
): number | undefined {
  const quantity = getQuantity(transactions)
  return quantity === 0 
    ? undefined
    : (price - getAverageCost(transactions)) * quantity
}