import { IPortfolio, IPortfolioMethods } from 'common'
import { holdingSchema } from './holdingSchema'
import mongoose, { Document, Model, Schema } from 'mongoose'
// https://mongoosejs.com/docs/typescript/statics-and-methods.html


// ==========
// interfaces
// ==========

export interface IMPortfolio extends IPortfolio, Document {}

export type TPortfolioModel = Model<IMPortfolio, {}, IPortfolioMethods>


// ==========
// properties
// ==========

export const portfolioSchema = new Schema<IMPortfolio, TPortfolioModel, IPortfolioMethods>({
  userId: {
    type: Number,
    required: true
  },
  portfolioName: {
    type: String,
    required: true
  },
  holdings: {
    type: [holdingSchema],
    required: true
  },
  description: {
    type: String,
  }
})


// ==============
// mongoose model
// ==============

export const Portfolio = mongoose.model('Portfolio', portfolioSchema)