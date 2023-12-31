import { formatAsISO } from './dateUtils'
import { 
  IHolding, IPopulatedHolding, ITransaction, TransactionType 
} from './dataModels'
import * as _ from 'lodash'
import { isIHolding } from './typeguards'
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
      const date = _.isDate(txn.date)
        ? txn.date
        : new Date(txn.date)
      return date.getTime()
    })
    return _.isDate(firstTxn.date)
      ? firstTxn.date
      : new Date(firstTxn.date)
  }
}

/*
DESC
  Returns the tcgplayerId for the input IHolding | IPopulatedHolding
INPUT
  holding: An IHolding | IPopulatedHolding
RETURN
  The Holding's tcgplayerId
*/
export function getHoldingTcgplayerId(
  holding: IHolding | IPopulatedHolding
): number {
  return isIHolding(holding)
  ? holding.tcgplayerId
  : holding.product.tcgplayerId
}


// ==================
// metric calculators
// ==================

/*
DESC
  Returns the Purchases of the input Holding aggregated by transaction date
INPUT
  holding: An IHolding
RETURN
  An ITransaction[] with Puchases aggregated by transaction date
*/
export function getHoldingAggregatedPurchases(
  holding: IHolding | IPopulatedHolding
): ITransaction[] {

  // get Holding Purchases
  const purchases = getHoldingPurchases(holding)

  // create Map of [Date as string] => [ITransaction]
  const purchaseMap = new Map<string, ITransaction>()

  // aggregate each Purchase into the Map
  purchases.forEach((txn: ITransaction) => {
    const existingTxn = purchaseMap.get(formatAsISO(txn.date))
    purchaseMap.set(
      formatAsISO(txn.date),
      existingTxn 
        ? {
          date: txn.date,
          price: (existingTxn.price * existingTxn.quantity 
            + txn.price * txn.quantity) / (existingTxn.quantity + txn.quantity),
          quantity: existingTxn.quantity + txn.quantity,
          type: txn.type
        } as ITransaction
        : txn
    )
  })

  return Array.from(purchaseMap.values())
}

/*
DESC
  Returns the Sales of the input Holding aggregated by transaction date
INPUT
  holding: An IHolding
RETURN
  An ITransaction[] with Sales aggregated by transaction date
*/
export function getHoldingAggregatedSales(
  holding: IHolding | IPopulatedHolding
): ITransaction[] {

  // get Holding Sales
  const sales = getHoldingSales(holding)

  // create Map of [Date as string] => [ITransaction]
  const purchaseMap = new Map<string, ITransaction>()

  // aggregate each Sale into the Map
  sales.forEach((txn: ITransaction) => {
    const existingTxn = purchaseMap.get(formatAsISO(txn.date))
    purchaseMap.set(
      formatAsISO(txn.date),
      existingTxn 
        ? {
          date: txn.date,
          price: (existingTxn.price * existingTxn.quantity 
            + txn.price * txn.quantity) / (existingTxn.quantity + txn.quantity),
          quantity: existingTxn.quantity + txn.quantity,
          type: txn.type
        } as ITransaction
        : txn
    )
  })

  return Array.from(purchaseMap.values())
}

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
  const value = _.sum(getHoldingPurchases(holding).map((txn: ITransaction) => {
    return Number(txn.quantity)
  }))
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
  const value = _.sum(getHoldingSales(holding).map((txn: ITransaction) => {
    return Number(txn.quantity)
  }))
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