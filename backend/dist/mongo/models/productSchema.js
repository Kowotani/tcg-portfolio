"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productSchema = void 0;
// imports
const mongoose_1 = require("mongoose");
const common_1 = require("common");
exports.productSchema = new mongoose_1.Schema({
    tcgplayerId: {
        type: Number,
        min: 1,
        unique: true,
        required: true
    },
    tcg: {
        type: String,
        enum: common_1.TCG,
        required: true
    },
    releaseDate: {
        type: Date,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: common_1.ProductType,
        required: true
    },
    language: {
        type: String,
        enum: common_1.ProductLanguage,
        required: true
    },
    subtype: {
        type: String,
        enum: common_1.ProductSubType
    },
    setCode: String,
});
