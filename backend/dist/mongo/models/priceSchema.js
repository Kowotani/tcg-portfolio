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
exports.Price = exports.priceSchema = exports.priceDataSchema = void 0;
const common_1 = require("common");
const mongoose_1 = __importStar(require("mongoose"));
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
}, {
    timeseries: {
        timeField: 'priceDate',
        metaField: 'tcgplayerId',
        granularity: common_1.TimeseriesGranularity.Hours
    }
});
// ==============
// mongoose model
// ==============
exports.Price = mongoose_1.default.model('Price', exports.priceSchema);
