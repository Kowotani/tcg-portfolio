// imports
import { Schema } from 'mongoose';
import { ProductLanguage, ProductSubType, ProductType, TCG } from '../../utils';

interface IProduct {
    tcgplayer_id: Number;
    tcg: TCG;
    release_date: Date;
    name: String;
    type: ProductType;
    language: ProductLanguage;
    subtype?: ProductSubType;
    set_code?: String;
}

export const productSchema = new Schema<IProduct>({
    tcgplayer_id: {
        type: Number,
        min: 1,
        unique: true,
        required: true
    },
    tcg: {
        type: String,
        enum: TCG,
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
        enum: ProductType,
        required: true
    },
    language: {
        type: String,
        enum: ProductLanguage,
        required: true
    },
    subtype: {
        type: String,
        enum: ProductSubType
    },
    set_code: String,
});