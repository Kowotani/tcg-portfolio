import { Model, Schema } from 'mongoose';
import { productSchema } from './productSchema';
import { transactionSchema } from './transactionSchema';
import { IHolding, IHoldingMethods, ITransaction, sortFnDateAsc, sortFnDateDesc, 
    TransactionType } from 'common';
import { textChangeRangeIsUnchanged } from 'typescript';

// https://mongoosejs.com/docs/typescript/statics-and-methods.html

type THoldingModel = Model<IHolding, {}, IHoldingMethods>

// ==========
// properties
// ==========

export const holdingSchema = new Schema<IHolding, THoldingModel, IHoldingMethods>({
    product: {
        type: productSchema,
        ref: 'Product',
        required: true
    },
    transactions: {
        type: [transactionSchema],
        ref: 'Transaction',
        required: true
    },
});

// =======
// methods
// =======

// -- transactions

// add transaction
holdingSchema.method('addTransaction', 
    function addTransaction(txn: ITransaction): void {
        this.transactions.push(txn)
});

// TODO: fix the txn type in the filter
// delete transaction
holdingSchema.method('deleteTransaction',
    function deleteTransaction(id: string): void {
        this.transactions.filter((txn: any) => {
            return txn.id !== id
        })
});

// -- getters

// get purchases
holdingSchema.method('getPurchases', 
    function getPurchases(): ITransaction[] {
        return this.transactions.filter((txn: ITransaction) => {
            return txn.type === TransactionType.Purchase
        })
});

// get first purchase date
holdingSchema.method('getFirstPurchaseDate', 
    function getFirstPurchaseDate(): Date | undefined {
        return this.getPurchases().length > 0 
            ? this.getPurchases().sort(
                (a: ITransaction, b: ITransaction) => {
                    return sortFnDateAsc(a.date, b.date)
                })[0]
            : undefined
});

// get last purchase date
holdingSchema.method('getLastPurchaseDate', 
    function getLastPurchaseDate(): Date | undefined {
        return this.getPurchases().length > 0
            ? this.getPurchases().sort(
                (a: ITransaction, b: ITransaction) => {
                    return sortFnDateDesc(a.date, b.date)
                })[0]
            : undefined
});

// -- return inputs

// get total cost
holdingSchema.method('getTotalCost', 
    function getTotalCost(): number | undefined {
        return this.getPurchases().length > 0
            ? this.getPurchases().reduce( 
                (accumulator: number, txn: ITransaction) => {
                    accumulator + txn.price * txn.quantity
                })
            : undefined
});

// get average cost
holdingSchema.method('getAvgCost', 
    function getAvgCost(): number | undefined {
        return this.getPurchases().length > 0
            ? this.getTotalCost() / this.getPurchases().length
            : undefined
});

// get market value
holdingSchema.method('getMarketValue', 
    function getMarketValue(price: number): number | undefined {
        return this.getPurchases().length > 0
            ? this.getPurchases().reduce(
                (accumulator: number, txn: ITransaction) => {
                    accumulator + txn.quantity * price
                })
            : undefined
});

// -- returns

// get dollar return
holdingSchema.method('getDollarReturn', 
    function getDollarReturn(price: number): number | undefined {
        return this.getPurchases().length > 0
            ? this.getMarketValue() - this.getTotalCost()
            : undefined
});

// get percentage return
holdingSchema.method('getPercentageReturn', 
    function getPercentageReturn(price: number): number | undefined {
        return this.getPurchases().length > 0
            ? this.getMarketValue() / this.getTotalCost() - 1
            : undefined
});

// get annualized return
holdingSchema.method('getAnnualizedReturn', 
    function getAnnualizedReturn(price: number): number | undefined {

        if (this.getPurchases().legnth === 0) {
            return undefined
        }

        const elapsedDays = (new Date().getTime() 
            - this.getFirstPurchaseDate().getTime()) / 86400 / 1000

        return Math.pow(1 + this.getTimeWeightedReturn(price), 365 / elapsedDays) - 1
});