import { Schema } from 'mongoose'
import { IHistoricalPrice } from '../../utils'


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