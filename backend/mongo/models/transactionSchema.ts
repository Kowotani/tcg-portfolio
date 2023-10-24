import { ITransaction, TransactionType } from 'common'
import { Schema } from 'mongoose'


// ==========
// interfaces
// ==========

export interface IMTransaction extends ITransaction, Document {}


// ==========
// properties
// ==========

export const transactionSchema = new Schema<IMTransaction>({
  type: {
    type: String,
    enum: TransactionType,
    required: true
  },
  date: {
    type: Date,
    required: true
  }, 
  price: {
    type: Number,
    min: 0.01,
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
    required: true
  },
})