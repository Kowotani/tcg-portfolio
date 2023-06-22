"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productSchema = void 0;
// imports
const mongoose_1 = require("mongoose");
const utils_1 = require("../../utils");
exports.productSchema = new mongoose_1.Schema({
    tcgplayer_id: {
        type: Number,
        min: 1,
        unique: true,
        required: true
    },
    tcg: {
        type: String,
        enum: utils_1.TCG,
        required: true
    },
    release_date: {
        type: Date,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: utils_1.ProductType,
        required: true
    },
    language: {
        type: String,
        enum: utils_1.ProductLanguage,
        required: true
    },
    subtype: {
        type: String,
        enum: utils_1.ProductSubType
    },
    set_code: String,
});
