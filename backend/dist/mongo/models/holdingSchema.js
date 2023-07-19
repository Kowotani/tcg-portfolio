"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.holdingSchema = void 0;
const mongoose_1 = require("mongoose");
const _ = __importStar(require("lodash"));
const transactionSchema_1 = require("./transactionSchema");
const common_1 = require("common");
// ==========
// properties
// ==========
exports.holdingSchema = new mongoose_1.Schema({
    tcgplayerId: {
        type: Number,
        required: true
    },
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    transactions: {
        type: [transactionSchema_1.transactionSchema],
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
    this.parent.save();
});
// delete transaction
exports.holdingSchema.method('deleteTransaction', function deleteTransaction(type, date, price, quantity) {
    const ix = this.transactions.findIndex((txn) => {
        return txn.type === type
            && txn.date === date
            && txn.price === price
            && txn.quantity === quantity;
    });
    if (ix >= 0) {
        this.transactions = this.transactions.splice(ix, 1);
        this.parent.save();
    }
});
// -- getters
// get purchases
exports.holdingSchema.method('getPurchases', function getPurchases() {
    return this.transactions.filter({ 'type': common_1.TransactionType.Purchase });
});
// get first purchase date
exports.holdingSchema.method('getFirstPurchaseDate', function getFirstPurchaseDate() {
    var _a;
    return this.getPurchases().length > 0
        ? (_a = _.minBy(this.getPurchases(), (txn) => {
            return txn.date;
        })) === null || _a === void 0 ? void 0 : _a.date
        : undefined;
});
// get last purchase date
exports.holdingSchema.method('getLastPurchaseDate', function getLastPurchaseDate() {
    var _a;
    return this.getPurchases().length > 0
        ? (_a = _.maxBy(this.getPurchases(), (txn) => {
            return txn.date;
        })) === null || _a === void 0 ? void 0 : _a.date
        : undefined;
});
// -- return inputs
// get total cost
exports.holdingSchema.method('getTotalCost', function getTotalCost() {
    return this.getPurchases().length > 0
        ? _.sumBy(this.getPurchases(), (txn) => {
            return txn.quantity * txn.price;
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
        ? _.sumBy(this.getPurchases(), (txn) => {
            return txn.quantity * price;
        })
        : undefined;
});
// -- returns
// get dollar return
exports.holdingSchema.method('getDollarReturn', function getDollarReturn(price) {
    return this.getPurchases().length > 0
        ? this.getMarketValue(price) - this.getTotalCost()
        : undefined;
});
// get percentage return
exports.holdingSchema.method('getPercentageReturn', function getPercentageReturn(price) {
    return this.getPurchases().length > 0
        ? this.getMarketValue(price) / this.getTotalCost() - 1
        : undefined;
});
// get annualized return
exports.holdingSchema.method('getAnnualizedReturn', function getAnnualizedReturn(price) {
    if (this.getPurchases().legnth === 0) {
        return undefined;
    }
    const elapsedDays = (new Date().getTime()
        - this.getFirstPurchaseDate().getTime()) / 86400 / 1000;
    return Math.pow(1 + this.getPercentageReturn(price), 365 / elapsedDays) - 1;
});
