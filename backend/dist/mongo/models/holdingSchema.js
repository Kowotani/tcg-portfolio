"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.holdingSchema = void 0;
const mongoose_1 = require("mongoose");
const transactionSchema_1 = require("./transactionSchema");
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
