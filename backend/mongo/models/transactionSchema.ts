import { Schema } from 'mongoose';
import { ITransaction, TransactionType } from 'common';

export const transactionSchema = new Schema<ITransaction>({
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
});