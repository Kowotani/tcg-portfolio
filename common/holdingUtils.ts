import * as _ from 'lodash'
import { assert, ITransaction, TransactionType } from './utils'

/*
DESC
  Returns the average purchase cost from the input ITransaction. This value
  should never be negative
INPUT
  transactions: An ITransaction array
RETURN
  The average purchase cost from the input ITransaction, or undefined
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
  Returns the average sale revemue from the input ITransaction. This value
  should never be negative
INPUT
  transactions: An ITransaction array
RETURN
  The average sale revenue from the input ITransaction, or undefined
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
  Returns the realized profit (or loss) determined as
    profit = salesQuantity * (avgRev - avgCost)
INPUT
  transactions: An ITransaction array
RETURN
  The realized profit based on sales and avg cost vs avg revenue from the 
  ITransaction array, or undefined if saleQuantity === 0
*/
export function getProfit(transactions: ITransaction[]): number | undefined {
  const quantity = getSaleQuantity(transactions)
  return quantity === 0 
    ? undefined
    : quantity * getAverageRevenue(transactions) - getAverageCost(transactions)
}

/*
DESC
  Returns the purchases from the input ITransaction array
INPUT
  transactions: An ITransaction array
RETURN
  An array of purchases from the ITransaction array
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
  transactions: An ITransaction array
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
  transactions: An ITransaction array
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
  Returns the sales from the input ITransaction array
INPUT
  transactions: An ITransaction array
RETURN
  An array of sales from the ITransaction array
*/
export function getSales(transactions: ITransaction[]): ITransaction[] {
  return transactions.filter((txn: ITransaction) => {
    return txn.type === TransactionType.Sale
})}

/*
DESC
  Returns the sale quantity from the input ITransaction. This value
  should never be negative
INPUT
  transactions: An ITransaction array
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
  Returns the total purchase cost from the input ITransaction. This value
  should never be negative
INPUT
  transactions: An ITransaction array
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
  Returns the total sale revenue from the input ITransaction. This value
  should never be negative
INPUT
  transactions: An ITransaction array
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