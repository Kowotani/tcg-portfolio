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
    required: true
  },
  categoryId: {
    type: Number,
    min: 1,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  publishedOn: {
    type: Date,
    required: true 
  },
  abbreviation: String
})

tcgroupSchema.index(
  { groupId: 1, categoryId: 1 },
  { unique: true }
)


// ==============
// mongoose model
// ==============

export const TCGroup = mongoose.model('TCGroup', tcgroupSchema)