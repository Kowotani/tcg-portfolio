import { ITCCategory } from 'common'
import mongoose, { HydratedDocument} from 'mongoose'
import { IMTCCategory, TCCategory } from '../models/tccategorySchema'


// =======
// globals
// =======

const url = 'mongodb://localhost:27017/tcgPortfolio'


// =======
// getters
// =======

/*
DESC
  Retrieves a TCCategory document by TCGCSV categoryId
INPUT
  categoryId: The TCGCSV categoryId
RETURN
  The document if found, else null
*/
export async function getTCCategoryDoc(
  categoryId: number
): Promise<HydratedDocument<IMTCCategory> | null> {

  // connect to db
  await mongoose.connect(url)

  try {
    const tcgcategoryDoc = 
      await TCCategory.findOne({ 'categoryId': categoryId })
    return tcgcategoryDoc

  } catch(err) {

    const errMsg = `An error occurred in getTCCategoryDoc(): ${err}`
    throw new Error(errMsg)
  } 
}

/*
DESC
  Returns all TCCategories
INPUT
  categoryId: The TCGCSV categoryId
RETURN
  An ITCCategory[]
*/
export async function getTCCategoryDocs(
): Promise<HydratedDocument<IMTCCategory>[]> {

  // connect to db
  await mongoose.connect(url);

  try {

    const docs = await TCCategory.find({})
    return docs

  } catch(err) {

    const errMsg = `An error occurred in getTCCategoryDocs(): ${err}`
    throw new Error(errMsg)
  }
}


// =======
// setters
// =======

/*
DESC
  Inserts the input ITCCategory-shaped docs
INPUT 
  docs: An ITCCategory[]
RETURN
  The number of documents inserted
*/
export async function insertTCCategories(docs: ITCCategory[]): Promise<number> {

  // connect to db
  await mongoose.connect(url)

  try {

    const res = await TCCategory.insertMany(docs)
    return res.length
    
  } catch(err) {
  
    const errMsg = `An error occurred in insertTCCategories(): ${err}`
    throw new Error(errMsg)
  }
}