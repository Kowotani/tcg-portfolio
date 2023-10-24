import { IHistoricalPrice } from 'common'
import mongoose, { Schema } from 'mongoose'


// ==========
// interfaces
// ==========

export interface IMHistoricalPrice extends IHistoricalPrice, Document {}


// ==========
// properties
// ==========

export const historicalPriceSchema = new Schema<IMHistoricalPrice>({
  tcgplayerId: {
    type: Number,
    min: 1,
    required: true
  },
  date: {
    type: Date,
    required: true
  }, 
  marketPrice: {
    type: Number,
    min: 0,
    required: true
  },
  isInterpolated: {
    type: Boolean,
    require: true
  },
})


// ==============
// mongoose model
// ==============

export const HistoricalPrice 
  = mongoose.model('HistoricalPrice', historicalPriceSchema)