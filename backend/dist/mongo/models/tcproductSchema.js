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
exports.TCProduct = exports.tcproductSchema = void 0;
const common_1 = require("common");
const mongoose_1 = __importStar(require("mongoose"));
// ==========
// properties
// ==========
exports.tcproductSchema = new mongoose_1.Schema({
    tcgplayerId: {
        type: Number,
        min: 1,
        unique: true,
        required: true
    },
    groupId: {
        type: Number,
        min: 1,
        unique: true,
        required: true
    },
    categoryId: {
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
    status: {
        type: String,
        enum: common_1.ParsingStatus,
        required: true
    },
    msrp: {
        type: Number,
        min: 1
    },
    subtype: {
        type: String,
        enum: common_1.ProductSubtype
    },
    setCode: String,
});
// ==============
// mongoose model
// ==============
exports.TCProduct = mongoose_1.default.model('TCProduct', exports.tcproductSchema);
