// imports
import { Schema } from 'mongoose';
import { IProduct, productSchema } from './productSchema';

// ==========
// interfaces
// ==========

// export interface IPriceProduct {
//     id: Schema.Types.ObjectId;
//     tcgplayerId: Number;
// }

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