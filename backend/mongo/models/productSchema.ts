// imports
import { Schema } from 'mongoose';
import { ProductLanguage, ProductSubtype, ProductType, TCG } from 'common';

export interface IProduct {
    tcgplayerId: Number;
    tcg: TCG;
    releaseDate: Date;
    name: String;
    type: ProductType;
    language: ProductLanguage;
    subtype?: ProductSubtype;
    setCode?: String;
}

export const productSchema = new Schema<IProduct>({
    tcgplayerId: {
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
        enum: ProductSubtype
    },
    setCode: String,
});