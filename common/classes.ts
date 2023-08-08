import * as _ from 'lodash'
import { assert, DAYS_PER_YEAR, IHolding, IHoldingMethods, IPortfolio, 
  IPortfolioMethods, ITransaction, MILLISECONDS_PER_SECOND, SECONDS_PER_DAY, 
  TransactionType 
} from './utils'


// =======
// Holding
// =======

export class Holding implements IHolding, IHoldingMethods {


  // -------
  // members
  // -------

  tcgplayerId: number
  transactions: ITransaction[]

  // constructor
  constructor(tcgplayerId: number, transactions: ITransaction[]) {
    this.tcgplayerId = tcgplayerId
    this.transactions = transactions
  }


  // -------
  // methods
  // -------

  // add transactions
  addTransactions(txnInput: ITransaction | ITransaction[]): void {
    Array.isArray(txnInput)
      ? this.transactions = this.transactions.concat(txnInput)
      : this.transactions.push(txnInput)
  }

  // delete transaction
  deleteTransaction(
    type: TransactionType,
    date: Date,
    price: number,
    quantity: number
  ): void {
    const ix = this.transactions.findIndex((txn: ITransaction) => {
      return txn.type === type 
        && txn.date === date
        && txn.price === price
        && txn.quantity === quantity
    })
    if (ix >= 0) {this.transactions.splice(ix, 1)}
  }

  // delete transactions
  deleteTransactions(): void {
    this.transactions = []
  }

  // get annualized return
  getAnnualizedReturn(price: number): number | undefined {

    if (!this.hasPurchases()) { return undefined }

    const elapsedDays = (new Date().getTime() 
      - this.getFirstPurchaseDate().getTime()) 
      / SECONDS_PER_DAY / MILLISECONDS_PER_SECOND

    return Math.pow(1 + this.getPercentageReturn(price), 
      DAYS_PER_YEAR / elapsedDays) - 1
  }

  // get average cost
  getAverageCost(): number | undefined {
  return this.hasPurchases()
    ? this.getTotalCost() / this.getPurchases().length
    : undefined
  } 

  // get average cost
  getAverageRevenue(): number | undefined {
    return this.hasSales()
      ? this.getTotalRevenue() / this.getSaleQuantity()
      : undefined
    } 

  // get dollar return
  // TODO: account for profit
  getDollarReturn(price: number): number | undefined {
    return this.hasPurchases()
      ? this.getMarketValue(price) - this.getTotalCost()
      : undefined
  }

  // get first purchase date
  getFirstPurchaseDate(): Date | undefined {
    return this.hasPurchases()
      ? _.minBy(this.getPurchases(), (txn: ITransaction) => {
          return txn.date
        })?.date
      : undefined
  }

  // get last purchase date
  getLastPurchaseDate(): Date | undefined {
    return this.hasPurchases()
      ? _.maxBy(this.getPurchases(), (txn: ITransaction) => {
        return txn.date
      })?.date
      : undefined
  }

  // get market value
  getMarketValue(price: number): number | undefined {
    return this.hasPurchases()
      ? _.sumBy(this.getPurchases(), (txn: ITransaction) => {
          return txn.quantity * price
        })
      : undefined
  }

  // get percentage return
  // TODO: account for profit
  getPercentageReturn(price: number): number | undefined {
    return this.hasPurchases()
      ? this.getMarketValue(price) / this.getTotalCost() - 1
      : undefined
  }

  // get profit
  getProfit(): number | undefined {
    return this.hasSales()
      ? this.getQuantity() * this.getAverageRevenue() - this.getAverageCost()
      : undefined
  }

  // get purchases
  getPurchases(): ITransaction[] {
    return this.transactions.filter((txn: ITransaction) => {
      return txn.type === TransactionType.Purchase
    })
  }

  // get purchase quantity
  getPurchaseQuantity(): number {
    const value = _.sumBy(this.getPurchases(), (txn: ITransaction) => {
      return txn.quantity
    })
    assert(value >= 0, 'getPurchaseQuantity() is not at least 0')
    return value
  }

  // get quantity
  getQuantity(): number {
    const value = this.getPurchaseQuantity() - this.getSaleQuantity()
    assert(value >= 0, 'getQuantity() is not at least 0')
    return value
  }

  // get sales
  getSales(): ITransaction[] {
    return this.transactions.filter((txn: ITransaction) => {
      return txn.type === TransactionType.Sale
  })}

  // get sale quantity
  getSaleQuantity(): number {
    const value = _.sumBy(this.getSales(), (txn: ITransaction) => {
      return txn.quantity
    })
    assert(value >= 0, 'getSaleQuantity() is not at least 0')
    return value
  }

  // get TCGplayer Id
  getTcgplayerId(): number {
    return this.tcgplayerId
  }

  // get total cost
  getTotalCost(): number | undefined {
    return this.hasPurchases()
      ? _.sumBy(this.getPurchases(), (txn: ITransaction) => {
        return txn.quantity * txn.price
      })
      : undefined
  }

  // get total revenue
  // TODO: account for profit?
  getTotalRevenue(): number {
    const value = _.sumBy(this.getSales(), (txn: ITransaction) => {
      return txn.quantity * txn.price
    })
    assert(value >= 0, 'getTotalRev() is not at least 0')
    return value
  }

  // get transactions
  getTransactions(): ITransaction[] {
    return this.transactions
  }

  // has purchases
  hasPurchases(): boolean {
    return this.getPurchases().length > 0
  }

  // has sales
  hasSales(): boolean {
    return this.getSales().length > 0
  }
}


// =========
// Portfolio
// =========

export class Portfolio implements IPortfolio, IPortfolioMethods {


  // -------
  // members
  // -------

  userId: number
  portfolioName: string
  holdings: Holding[]

  // constructor
  constructor(userId: number, portfolioName: string, holdings: Holding[]) {
    this.userId = userId
    this.portfolioName = portfolioName
    this.holdings = holdings
  }


  // -------
  // methods
  // -------

  // add holdings
  addHoldings(holdingInput: Holding | Holding[]): void {
    Array.isArray(holdingInput)
      ? this.holdings = this.holdings.concat(holdingInput)
      : this.holdings.push(holdingInput)
  }

  // delete holding
  deleteHolding(tcgplayerId: number): void {
    this.holdings = this.holdings.filter((holding: Holding) => {
      return holding.tcgplayerId !== tcgplayerId
    })
  }

  // delete holding
  deleteHoldings(): void {
    this.holdings = []
  }

  // get dollar return
  // TODO: account for profits
  getDollarReturn(prices: Map<number, number>): number | undefined {
    return this.hasPurchases()
      ? this.getMarketValue(prices) - this.getTotalCost()
      : undefined
  }

  // get holdings
  getHoldings(): Holding[] {
    return this.holdings
  }

  // get market value
  getMarketValue(prices: Map<number, number>): number | undefined {
    return this.getHoldings().length > 0
      ? _.sum(this.getHoldings().map(
        (holding: Holding) => {
          const price = prices.get(holding.getTcgplayerId()) ?? 0
          return holding.getMarketValue(price)
        }))
      : undefined
  } 

  // get percentage return
  // TODO: account for profits
  getPercentageReturn(prices: Map<number, number>): number | undefined {
    return this.hasPurchases()
      ? this.getMarketValue(prices) / this.getTotalCost() - 1
      : undefined
  };

  // get profit
  getProfit(): number | undefined {
    return this.hasHoldings()
      ? _.sum(this.getHoldings().map(
        (holding: Holding) => {
          return holding.getProfit()
        }))
      : undefined
  };

  // get portfolio name
  getPortfolioName(): string {
    return this.portfolioName
  }

  // get total cost
  getTotalCost(): number | undefined {
    return this.hasHoldings()
      ? _.sum(this.getHoldings().map(
        (holding: Holding) => {
          return holding.getTotalCost()
        }))
      : undefined
  }

  // get total revenue
  getTotalRevenue(): number | undefined {
    return this.hasHoldings()
      ? _.sum(this.getHoldings().map(
        (holding: Holding) => {
          return holding.getTotalRevenue()
        }))
      : undefined
  }

  // get user ID
  getUserId(): number {
    return this.userId
  }

  // holding exists
  hasHolding(tcgplayerId: number): boolean {
    return this.holdings.filter((holding: Holding) => {
      return holding.tcgplayerId === tcgplayerId
    }).length > 0
  }

  // any holding exists
  hasHoldings(): boolean {
    return this.holdings.length > 0
  }

  // has purchases
  hasPurchases(): boolean {
    this.holdings.forEach((holding: Holding) => {
      if (holding.hasPurchases()) { return true }
    })
    return false
  }

  // has sales
  hasSales(): boolean {
    this.holdings.forEach((holding: Holding) => {
      if (holding.hasSales()) { return true }
    })
    return false
  }
}