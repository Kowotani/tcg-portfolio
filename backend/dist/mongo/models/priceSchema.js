"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.priceSchema = exports.priceDataSchema = void 0;
const mongoose_1 = require("mongoose");
// =======
// schemas
// =======
exports.priceDataSchema = new mongoose_1.Schema({
    marketPrice: {
        type: Number,
        required: true
    },
    buylistMarketPrice: { type: Number },
    listedMedianPrice: { type: Number }
});
exports.priceSchema = new mongoose_1.Schema({
    priceDate: {
        type: Date,
        required: true
    },
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    tcgplayerId: {
        type: Number,
        required: true
    },
    granularity: {
        type: String,
        required: true
    },
    prices: {
        type: exports.priceDataSchema,
        required: true
    }
});
