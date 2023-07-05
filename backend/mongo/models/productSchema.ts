// imports
import { Schema } from 'mongoose';
import { ProductLanguage, ProductSubType, ProductType, TCG 
} from '../../../tcg_portfolio/src/utils';

export interface IProduct {
    tcgplayerId: Number;
    tcg: TCG;
    releaseDate: Date;
    name: String;
    type: ProductType;
    language: ProductLanguage;
    subtype?: ProductSubType;
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
        enum: ProductSubType
    },
    setCode: String,
});