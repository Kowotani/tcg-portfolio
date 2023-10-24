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
exports.HistoricalPrice = exports.historicalPriceSchema = void 0;
const mongoose_1 = __importStar(require("mongoose"));
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
// ==============
// mongoose model
// ==============
exports.HistoricalPrice = mongoose_1.default.model('HistoricalPrice', exports.historicalPriceSchema);
