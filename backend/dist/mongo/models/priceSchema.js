"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.priceSchema = void 0;
const mongoose_1 = require("mongoose");
const productSchema_1 = require("./productSchema");
// =======
// schemas
// =======
// export const priceProductSchema = new Schema<IPriceProduct>({
//     id: {
//         type: Schema.Types.ObjectId,
//         required: true
//     },
//     tcgplayerId: {
//         type: Number,
//         required: true
//     },
// })
exports.priceSchema = new mongoose_1.Schema({
    priceDate: {
        type: Date,
        required: true
    },
    product: {
        type: productSchema_1.productSchema,
        ref: 'Product',
        required: true
    },
    granularity: {
        type: String,
        required: true
    },
    marketPrice: {
        type: Number,
        required: true
    },
    buylistMarketPrice: { type: Number },
    listedMedianPrice: { type: Number }
});
