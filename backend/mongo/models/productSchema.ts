import { 
  IProduct, ProductLanguage, ProductSubtype, ProductType, TCG 
} from 'common'
import mongoose, { Schema } from 'mongoose'


// ==========
// interfaces
// ==========

export interface IMProduct extends IProduct, Document {}


// ==========
// properties
// ==========

export const productSchema = new Schema<IMProduct>({
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
  msrp: {
    type: Number,
    min: 1,
    required: true
  },
  subtype: {
    type: String,
    enum: ProductSubtype
  },
  setCode: String,
})


// ==============
// mongoose model
// ==============

export const Product = mongoose.model('Product', productSchema)