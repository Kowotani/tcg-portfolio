import { IHolding, IHoldingMethods } from 'common'
import * as _ from 'lodash'
import mongoose, { Model, Schema } from 'mongoose'
import { transactionSchema } from './transactionSchema'
  
// https://mongoosejs.com/docs/typescript/statics-and-methods.html


// ==========
// interfaces
// ==========

export interface IMHolding extends IHolding, Document {
  product: mongoose.Types.ObjectId
}

export type THoldingModel = Model<IHolding, {}, IHoldingMethods>


// ==========
// properties
// ==========

export const holdingSchema = new Schema<IMHolding, THoldingModel, IHoldingMethods>({
  tcgplayerId: {
    type: Number,
    required: true
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  transactions: {
    type: [transactionSchema],
    required: true
  },
})