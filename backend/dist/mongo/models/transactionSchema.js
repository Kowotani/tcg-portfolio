"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionSchema = void 0;
const mongoose_1 = require("mongoose");
const common_1 = require("common");
exports.transactionSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: common_1.TransactionType,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    price: {
        type: Number,
        min: 0.01,
        required: true
    },
    quantity: {
        type: Number,
        default: 1,
        min: 1,
        required: true
    },
});
