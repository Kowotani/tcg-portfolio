import { ITCCategory, TCG } from 'common'
import mongoose, { Schema } from 'mongoose'


// ==========
// interfaces
// ==========

export interface IMTCCategory extends ITCCategory, Document {}


// ==========
// properties
// ==========

export const tccategorySchema = new Schema<IMTCCategory>({
  categoryId: {
    type: Number,
    min: 1,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  tcg: {
    type: String,
    enum: TCG,
    required: true
  }
},
{
  collection: 'tccategories'    // mongoose will default to 'tccategorys'
})


// ==============
// mongoose model
// ==============

export const TCCategory = mongoose.model('TCCategory', tccategorySchema)