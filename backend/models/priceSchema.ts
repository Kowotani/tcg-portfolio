// imports
import { Schema } from 'mongoose';
import { ProductType } from '../../utils';


// ==========
// interfaces
// ==========

interface IPriceProduct {
    id: Schema.Types.ObjectId;
    type: ProductType;
    name: String;
}

interface IPrice {
    price_date: Date;
    product: IPriceProduct;
    granularity: String;
    market_price: Number;
    buylist_median_price?: Number;
    listed_median_price?: Number;
}


// =======
// schemas
// =======

export const priceProductSchema = new Schema<IPriceProduct>({
    id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    type: {
        type: String,
        enum: ProductType,
        required: true
    },
    name: {
        type: String,
        required: true
    }
})

export const priceSchema = new Schema<IPrice>({
    price_date: {
        type: Date,
        required: true
    },
    product: {
        type: priceProductSchema,
        required: true
    },
    market_price: {
        type: Number,
        required: true
    }, 
    buylist_median_price: { type: Number },
    listed_median_price: { type: Number }
});