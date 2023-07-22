// imports
import { IPrice, IPriceData } from 'common';
import { Schema } from 'mongoose';
import mongoose from 'mongoose';

// ==========
// interfaces
// ==========

export interface IMPrice extends IPrice, Document {
  product: mongoose.Types.ObjectId
}


// =======
// schemas
// =======

export const priceDataSchema = new Schema<IPriceData>({
  marketPrice: {
    type: Number,
    required: true
  }, 
  buylistMarketPrice: { type: Number },
  listedMedianPrice: { type: Number }
});

export const priceSchema = new Schema<IMPrice>({
  priceDate: {
    type: Date,
    required: true
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  tcgplayerId: {
    type: Number,
    required: true
  },
  granularity: {
    type: String,
    required: true
  },
  prices: {
    type: priceDataSchema,
    required: true
  }
});