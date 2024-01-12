import { 
  ITCProduct, ParsingStatus, ProductLanguage, ProductSubtype, ProductType, TCG 
} from 'common'
import mongoose, { Schema } from 'mongoose'


// ==========
// interfaces
// ==========

export interface IMTCProduct extends ITCProduct, Document {}


// ==========
// properties
// ==========

export const tcproductSchema = new Schema<IMTCProduct>({
  tcgplayerId: {
    type: Number,
    min: 1,
    unique: true,
    required: true
  },
  groupId: {
    type: Number,
    min: 1,
    unique: true,
    required: true
  },
  categoryId: {
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
  status: {
    type: String,
    enum: ParsingStatus,
    required: true
  },
  msrp: {
    type: Number,
    min: 1
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

export const TCProduct = mongoose.model('TCProduct', tcproductSchema)