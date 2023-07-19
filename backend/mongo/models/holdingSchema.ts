import { Model, Schema } from 'mongoose';
import mongoose from 'mongoose';
import * as _ from 'lodash';
import { transactionSchema } from './transactionSchema';
import { IHolding, IHoldingMethods, ITransaction, TransactionType } from 'common';
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

// -- transactions

// add transaction
holdingSchema.method('addTransaction', 
    function addTransaction(txn: ITransaction): void {
        this.transactions.push(txn)
        this.parent.save()
});

// delete transaction
holdingSchema.method('deleteTransaction',
    function deleteTransaction(
        type: TransactionType,
        date: Date,
        price: number,
        quantity: number
    ): void {
        this.transactions.findOne({
            'type': type,
            'date': date,
            'price': price,
            'quantity': quantity
        }).deleteOne()
        this.parent.save()        
});

// -- getters

// get purchases
holdingSchema.method('getPurchases', 
    function getPurchases(): ITransaction[] {
        return this.transactions.filter({'type': TransactionType.Purchase})
});

// get first purchase date
holdingSchema.method('getFirstPurchaseDate', 
    function getFirstPurchaseDate(): Date | undefined {
        return this.getPurchases().length > 0 
            ? _.minBy(this.getPurchases(), (txn: ITransaction) => {
                    return txn.date
                })?.date
            : undefined
});

// get last purchase date
holdingSchema.method('getLastPurchaseDate', 
    function getLastPurchaseDate(): Date | undefined {
        return this.getPurchases().length > 0
            ? _.maxBy(this.getPurchases(), (txn: ITransaction) => {
                return txn.date
            })?.date
            : undefined
});

// -- return inputs

// get total cost
holdingSchema.method('getTotalCost', 
    function getTotalCost(): number | undefined {
        return this.getPurchases().length > 0
            ? _.sumBy(this.getPurchases(), (txn: ITransaction) => {
                return txn.quantity * txn.price
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
            ? _.sumBy(this.getPurchases(), (txn: ITransaction) => {
                    return txn.quantity * price
                })
            : undefined
});

// -- returns

// get dollar return
holdingSchema.method('getDollarReturn', 
    function getDollarReturn(price: number): number | undefined {
        return this.getPurchases().length > 0
            ? this.getMarketValue(price) - this.getTotalCost()
            : undefined
});

// get percentage return
holdingSchema.method('getPercentageReturn', 
    function getPercentageReturn(price: number): number | undefined {
        return this.getPurchases().length > 0
            ? this.getMarketValue(price) / this.getTotalCost() - 1
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

        return Math.pow(1 + this.getPercentageReturn(price), 365 / elapsedDays) - 1
});