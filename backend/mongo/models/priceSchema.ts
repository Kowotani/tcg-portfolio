// imports
import { IProduct } from 'common';
import { Schema } from 'mongoose';
import { productSchema } from './productSchema';

// ==========
// interfaces
// ==========

export interface IPrice {
    priceDate: Date;
    product: IProduct;
    granularity: String;
    marketPrice: Number;
    buylistMarketPrice?: Number;
    listedMedianPrice?: Number;
}


// =======
// schemas
// =======

export const priceSchema = new Schema<IPrice>({
    priceDate: {
        type: Date,
        required: true
    },
    product: {
        type: productSchema,
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