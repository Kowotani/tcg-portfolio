"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.priceSchema = exports.priceProductSchema = void 0;
// imports
const mongoose_1 = require("mongoose");
const utils_1 = require("../../utils");
// =======
// schemas
// =======
exports.priceProductSchema = new mongoose_1.Schema({
    id: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
    },
    type: {
        type: String,
        enum: utils_1.ProductType,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});
exports.priceSchema = new mongoose_1.Schema({
    price_date: {
        type: Date,
        required: true
    },
    product: {
        type: exports.priceProductSchema,
        required: true
    },
    market_price: {
        type: Number,
        required: true
    },
    buylist_median_price: { type: Number },
    listed_median_price: { type: Number }
});
