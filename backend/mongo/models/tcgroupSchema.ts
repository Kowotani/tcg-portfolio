import { ITCGroup } from 'common'
import mongoose, { Schema } from 'mongoose'


// ==========
// interfaces
// ==========

export interface IMTCGroup extends ITCGroup, Document {}


// ==========
// properties
// ==========

export const tcgroupSchema = new Schema<IMTCGroup>({
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
  name: {
    type: String,
    required: true
  },
  abbreviation: String,
  publishedOn: Date
})


// ==============
// mongoose model
// ==============

export const TCGroup = mongoose.model('TCGroup', tcgroupSchema)