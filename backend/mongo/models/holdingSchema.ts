import { Model, Schema } from 'mongoose';
import mongoose from 'mongoose';
import * as _ from 'lodash';
import { transactionSchema } from './transactionSchema';
import { DAYS_PER_YEAR, IHolding, IHoldingMethods, ITransaction, 
  MILLISECONDS_PER_SECOND, SECONDS_PER_DAY, TransactionType } from 'common';
// https://mongoosejs.com/docs/typescript/statics-and-methods.html


// ==========
// interfaces
// ==========

export interface IMHolding extends IHolding, Document {
  product: mongoose.Types.ObjectId
}

export type THoldingModel = Model<IHolding, {}, IHoldingMethods>


// ==========
// properties
// ==========

export const holdingSchema = new Schema<IMHolding, THoldingModel, IHoldingMethods>({
  tcgplayerId: {
    type: Number,
    required: true
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  transactions: {
    type: [transactionSchema],
    required: true
  },
});


// =======
// methods
// =======

// // -- transactions

// // add transactions
// holdingSchema.method('addTransactions', 
//   function addTransactions(txnInput: ITransaction | ITransaction[]): void {
//     Array.isArray(txnInput)
//       ? this.transactions = this.transactions.concat(txnInput)
//       : this.transactions.push(txnInput)
//     this.parent.save()
// });

// // delete transaction
// holdingSchema.method('deleteTransaction',
//   function deleteTransaction(txn: ITransaction): void {
//     const ix = this.transactions.findIndex((t: ITransaction) => {
//       return txn.type === t.type 
//         && txn.date === t.date
//         && txn.price === t.price
//         && txn.quantity === t.quantity
//     })
//     if (ix >= 0) {
//       this.transactions.splice(ix, 1)
//       this.parent.save()    
//     }
// });

// // delete transactions
// holdingSchema.method('deleteTransactions',
//   function deleteTransactions(): void {
//     this.transactions = []
//     this.parent.save()
// });

// // -- getters

// /* 
//   TODO:
//   getPurchaseQuantity
//   getSales
//   getSaleQuantity
//   getAverageRevenue
//   getTotalRevenue
//   getProfit

//   account for profit in returns
// */ 

// // get TCGPlayerId
// holdingSchema.method('getTcgplayerId', 
//   function getTcgplayerId(): ITransaction[] {
//     return this.tcgplayerId
// });

// // get transactions
// holdingSchema.method('getTransactions', 
//   function getPurchases(): ITransaction[] {
//     return this.transactions
// });

// // get purchases
// holdingSchema.method('getPurchases', 
//   function getPurchases(): ITransaction[] {
//     return this.transactions.filter({'type': TransactionType.Purchase})
// });

// // get first purchase date
// holdingSchema.method('getFirstPurchaseDate', 
//   function getFirstPurchaseDate(): Date | undefined {
//     return this.getPurchases().length > 0 
//       ? _.minBy(this.getPurchases(), (txn: ITransaction) => {
//           return txn.date
//         })?.date
//       : undefined
// });

// // get last purchase date
// holdingSchema.method('getLastPurchaseDate', 
//   function getLastPurchaseDate(): Date | undefined {
//     return this.getPurchases().length > 0
//       ? _.maxBy(this.getPurchases(), (txn: ITransaction) => {
//         return txn.date
//       })?.date
//       : undefined
// });

// // -- return inputs

// // get total cost
// holdingSchema.method('getTotalCost', 
//   function getTotalCost(): number | undefined {
//     return this.getPurchases().length > 0
//       ? _.sumBy(this.getPurchases(), (txn: ITransaction) => {
//         return txn.quantity * txn.price
//       })
//       : undefined
// });

// // get average cost
// holdingSchema.method('getAverageCost', 
//   function getAverageCost(): number | undefined {
//     return this.getPurchases().length > 0
//       ? this.getTotalCost() / this.getPurchases().length
//       : undefined
// });

// // get market value
// holdingSchema.method('getMarketValue', 
//   function getMarketValue(price: number): number | undefined {
//     return this.getPurchases().length > 0
//       ? _.sumBy(this.getPurchases(), (txn: ITransaction) => {
//           return txn.quantity * price
//         })
//       : undefined
// });

// // -- returns

// // get dollar return
// holdingSchema.method('getDollarReturn', 
//   function getDollarReturn(price: number): number | undefined {
//     return this.getPurchases().length > 0
//       ? this.getMarketValue(price) - this.getTotalCost()
//       : undefined
// });

// // get percentage return
// holdingSchema.method('getPercentageReturn', 
//   function getPercentageReturn(price: number): number | undefined {
//     return this.getPurchases().length > 0
//       ? this.getMarketValue(price) / this.getTotalCost() - 1
//       : undefined
// });

// // get annualized return
// holdingSchema.method('getAnnualizedReturn', 
//   function getAnnualizedReturn(price: number): number | undefined {

//     if (this.getPurchases().length === 0) {
//       return undefined
//     }

//     const elapsedDays = (new Date().getTime() 
//       - this.getFirstPurchaseDate().getTime()) 
//       / SECONDS_PER_DAY / MILLISECONDS_PER_SECOND

//     return Math.pow(1 + this.getPercentageReturn(price), 
//       DAYS_PER_YEAR / elapsedDays) - 1
// });