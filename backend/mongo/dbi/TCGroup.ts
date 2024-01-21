import { ITCGroup } from 'common'
import mongoose, { HydratedDocument} from 'mongoose'
import { IMTCGroup, TCGroup } from '../models/tcgroupSchema'



// =======
// globals
// =======

const url = 'mongodb://localhost:27017/tcgPortfolio'


// =======
// getters
// =======

/*
DESC
  Retrieves a TCGroup document by TCGCSV groupId (and optionally categoryId)
INPUT
  groupId: The TCGCSV groupId
  categoryId?: The TCGCSV categoryId
RETURN
  The document if found, else null
*/
export async function getTCGroupDoc(
  groupId: number,
  categoryId?: number
): Promise<HydratedDocument<IMTCGroup> | null> {

  // connect to db
  await mongoose.connect(url)

  try {
    const tcgroupDoc = categoryId 
      ? await TCGroup.findOne({ 'categoryId': categoryId, 'groupId': groupId })
      : await TCGroup.findOne({ 'groupId': groupId })
    return tcgroupDoc

  } catch(err) {

    const errMsg = `An error occurred in getTCGroupDoc(): ${err}`
    throw new Error(errMsg)
  } 
}

/*
DESC
  Returns all TCGroups (optionally for an input categoryId)
INPUT
  categoryId?: The TCGCSV categoryId
RETURN
  An ITCGroup[]
*/
export async function getTCGroupDocs(
  categoryId?: number
): Promise<HydratedDocument<IMTCGroup>[]> {

  // connect to db
  await mongoose.connect(url);

  try {

    const docs = categoryId
      ? await TCGroup.find({ 'categoryId': categoryId })
      : await TCGroup.find({})
    return docs

  } catch(err) {

    const errMsg = `An error occurred in getTCGroupDocs(): ${err}`
    throw new Error(errMsg)
  }
}


// =======
// setters
// =======

/*
DESC
  Inserts the input ITCGroup-shaped docs
INPUT 
  docs: An ITCGroup[]
RETURN
  The number of documents inserted
*/
export async function insertTCGroups(docs: ITCGroup[]): Promise<number> {

  // connect to db
  await mongoose.connect(url)

  try {

    const res = await TCGroup.insertMany(docs)
    return res.length
    
  } catch(err) {
  
    const errMsg = `An error occurred in insertTCGroups(): ${err}`
    throw new Error(errMsg)
  }
}