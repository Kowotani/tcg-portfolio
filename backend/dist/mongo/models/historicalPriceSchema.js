"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.historicalPriceSchema = void 0;
const mongoose_1 = require("mongoose");
// ==========
// properties
// ==========
exports.historicalPriceSchema = new mongoose_1.Schema({
    tcgplayerId: {
        type: Number,
        min: 1,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    marketPrice: {
        type: Number,
        min: 0,
        required: true
    },
    isInterpolated: {
        type: Boolean,
        require: true
    },
});
