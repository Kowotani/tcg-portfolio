"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
exports.portfolioSchema = void 0;
const mongoose_1 = require("mongoose");
const holdingSchema_1 = require("./holdingSchema");
const _ = __importStar(require("lodash"));
// ==========
// properties
// ==========
exports.portfolioSchema = new mongoose_1.Schema({
    userId: {
        type: Number,
        required: true
    },
    portfolioName: {
        type: String,
        required: true
    },
    holdings: {
        type: [holdingSchema_1.holdingSchema],
        required: true
    },
});
// =======
// methods
// =======
// -- holdings
// add holdings
exports.portfolioSchema.method('addHoldings', function addHoldings(holdingInput) {
    Array.isArray(holdingInput)
        ? this.holdings = this.holdings.concat(holdingInput)
        : this.holdings.push(holdingInput);
    this.save();
});
// delete holding
exports.portfolioSchema.method('deleteHolding', function deleteHolding(tcgplayerId) {
    this.holdings = this.holdings.filter((holding) => {
        return holding.tcgplayerId !== tcgplayerId;
    });
    this.save();
});
// delete holding
exports.portfolioSchema.method('deleteHoldings', function deleteHoldings() {
    this.holdings = [];
    this.save();
});
// -- getters
// get holdings
exports.portfolioSchema.method('getHoldings', function getHoldings() {
    return this.holdings;
});
// get first purchase date
exports.portfolioSchema.method('getFirstPurchaseDate', function getFirstPurchaseDate() {
    return this.getHoldings().length > 0
        ? _.min(this.getHoldings().map((holding) => {
            return holding.methods.getFirstPurchaseDate();
        }))
        : undefined;
});
// get last purchase date
exports.portfolioSchema.method('getLastPurchaseDate', function getLastPurchaseDate() {
    return this.getHoldings().length > 0
        ? _.max(this.getHoldings().map((holding) => {
            return holding.methods.getLastPurchaseDate();
        }))
        : undefined;
});
// -- checkers
// holding exists
exports.portfolioSchema.method('hasHolding', function hasHolding(tcgplayerId) {
    return this.holdings.filter((holding) => {
        return holding.tcgplayerId === tcgplayerId;
    }).length > 0;
});
// -- return inputs
// get total cost
exports.portfolioSchema.method('getTotalCost', function getTotalCost() {
    return this.getHoldings().length > 0
        ? _.sum(this.getHoldings().map((holding) => {
            return holding.methods.getTotalCost();
        }))
        : undefined;
});
// get market value
exports.portfolioSchema.method('getMarketValue', function getMarketValue(prices) {
    return this.getHoldings().length > 0
        ? _.sum(this.getHoldings().map((holding) => {
            var _a;
            const price = (_a = prices.get(holding.methods.getProduct().tcgplayerId)) !== null && _a !== void 0 ? _a : 0;
            return holding.methods.getMarketValue(price);
        }))
        : undefined;
});
// -- returns
// get dollar return
exports.portfolioSchema.method('getDollarReturn', function getDollarReturn(prices) {
    return this.getPurchases().length > 0
        ? this.getMarketValue(prices) - this.getTotalCost()
        : undefined;
});
// get percentage return
exports.portfolioSchema.method('getPercentageReturn', function getPercentageReturn(prices) {
    return this.getPurchases().length > 0
        ? this.getMarketValue(prices) / this.getTotalCost() - 1
        : undefined;
});
// get annualized return
exports.portfolioSchema.method('getAnnualizedReturn', function getAnnualizedReturn(prices) {
    if (this.getPurchases().legnth === 0) {
        return undefined;
    }
    const elapsedDays = (new Date().getTime()
        - this.getFirstPurchaseDate().getTime()) / 86400 / 1000;
    return Math.pow(1 + this.getPercentageReturn(prices), 365 / elapsedDays) - 1;
});
