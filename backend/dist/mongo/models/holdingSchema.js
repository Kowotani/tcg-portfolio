"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.holdingSchema = void 0;
const mongoose_1 = require("mongoose");
const productSchema_1 = require("./productSchema");
const transactionSchema_1 = require("./transactionSchema");
const common_1 = require("common");
// ==========
// properties
// ==========
exports.holdingSchema = new mongoose_1.Schema({
    product: {
        type: productSchema_1.productSchema,
        ref: 'Product',
        required: true
    },
    transactions: {
        type: [transactionSchema_1.transactionSchema],
        ref: 'Transaction',
        required: true
    },
});
// =======
// methods
// =======
// -- transactions
// add transaction
exports.holdingSchema.method('addTransaction', function addTransaction(txn) {
    this.transactions.push(txn);
});
// TODO: fix the txn type in the filter
// delete transaction
exports.holdingSchema.method('deleteTransaction', function deleteTransaction(id) {
    this.transactions.filter((txn) => {
        return txn.id !== id;
    });
});
// -- getters
// get purchases
exports.holdingSchema.method('getPurchases', function getPurchases() {
    return this.transactions.filter((txn) => {
        return txn.type === common_1.TransactionType.Purchase;
    });
});
// get first purchase date
exports.holdingSchema.method('getFirstPurchaseDate', function getFirstPurchaseDate() {
    return this.getPurchases().length > 0
        ? this.getPurchases().sort((a, b) => {
            return (0, common_1.sortFnDateAsc)(a.date, b.date);
        })[0]
        : undefined;
});
// get last purchase date
exports.holdingSchema.method('getLastPurchaseDate', function getLastPurchaseDate() {
    return this.getPurchases().length > 0
        ? this.getPurchases().sort((a, b) => {
            return (0, common_1.sortFnDateDesc)(a.date, b.date);
        })[0]
        : undefined;
});
// -- return inputs
// get total cost
exports.holdingSchema.method('getTotalCost', function getTotalCost() {
    return this.getPurchases().length > 0
        ? this.getPurchases().reduce((accumulator, txn) => {
            accumulator + txn.price * txn.quantity;
        })
        : undefined;
});
// get average cost
exports.holdingSchema.method('getAvgCost', function getAvgCost() {
    return this.getPurchases().length > 0
        ? this.getTotalCost() / this.getPurchases().length
        : undefined;
});
// get market value
exports.holdingSchema.method('getMarketValue', function getMarketValue(price) {
    return this.getPurchases().length > 0
        ? this.getPurchases().reduce((accumulator, txn) => {
            accumulator + txn.quantity * price;
        })
        : undefined;
});
// -- returns
// get dollar return
exports.holdingSchema.method('getDollarReturn', function getDollarReturn(price) {
    return this.getPurchases().length > 0
        ? this.getMarketValue() - this.getTotalCost()
        : undefined;
});
// get percentage return
exports.holdingSchema.method('getPercentageReturn', function getPercentageReturn(price) {
    return this.getPurchases().length > 0
        ? this.getMarketValue() / this.getTotalCost() - 1
        : undefined;
});
// get annualized return
exports.holdingSchema.method('getAnnualizedReturn', function getAnnualizedReturn(price) {
    if (this.getPurchases().legnth === 0) {
        return undefined;
    }
    const elapsedDays = (new Date().getTime()
        - this.getFirstPurchaseDate().getTime()) / 86400 / 1000;
    return Math.pow(1 + this.getTimeWeightedReturn(price), 365 / elapsedDays) - 1;
});
