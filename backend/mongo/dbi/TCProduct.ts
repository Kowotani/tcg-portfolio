import { 
  // data models
  ITCProduct, ParsingStatus,
  
  // generic
  assert, isITCProduct 
} from 'common'
import mongoose, { HydratedDocument} from 'mongoose'
import { IMTCProduct, TCProduct } from '../models/tcproductSchema'
import { genProductNotFoundError } from '../../utils/Product'


// =======
// globals
// =======

const url = 'mongodb://localhost:27017/tcgPortfolio'


// =======
// getters
// =======

/*
DESC
  Retrieves a TCProduct document by tcgplayerId
INPUT
  tcgplayerId: The tcgplayerId
RETURN
  The document if found, else null
*/
export async function getTCProductDoc(
  tcgplayerId: number
): Promise<HydratedDocument<IMTCProduct> | null> {

  // connect to db
  await mongoose.connect(url)

  try {
    const tcProductDoc = await TCProduct.findOne({ 'tcgplayerId': tcgplayerId })
    return tcProductDoc

  } catch(err) {

    const errMsg = `An error occurred in getTCProductDoc(): ${err}`
    throw new Error(errMsg)
  } 
}

/*
DESC
  Returns all TCProducts, optionally for an input categoryId or groupId or by
  parsing status or by tcgplayerId
INPUT
  categoryId?: The TCGCSV categoryId
  groupId?: The TCGCSV groupId
  status?: The ParsingStatus enum
  tcgplayerIds?: The tcgplayerIds
RETURN
  An ITCProduct[]
*/
type IGetTCProductDocsProps = {
  categoryId?: number,
  groupId?: number,
  status?: ParsingStatus,
  tcgplayerIds?: number[]  
}
export async function getTCProductDocs({
  categoryId, groupId, status, tcgplayerIds
}: IGetTCProductDocsProps = {}
): Promise<HydratedDocument<IMTCProduct>[]> {

  // connect to db
  await mongoose.connect(url)

  try {

    let filter = {} as any
    if (categoryId)
      filter['categoryId'] = categoryId
    if (groupId)
      filter['groupId'] = groupId
    if (status)
      filter['status'] = status
    if (tcgplayerIds)
      filter['tcgplayerId'] = { '$in': tcgplayerIds }
    
    const docs = await TCProduct.find(filter)
    return docs

  } catch(err) {

    const errMsg = `An error occurred in getTCProductDocs(): ${err}`
    throw new Error(errMsg)
  }
}


// =======
// setters
// =======

/*
DESC
  Inserts the input ITCProduct-shaped docs
INPUT 
  docs: An ITCProduct[]
RETURN
  The number of documents inserted
*/
export async function insertTCProducts(docs: ITCProduct[]): Promise<number> {

  // connect to db
  await mongoose.connect(url)

  try {

    const res = await TCProduct.insertMany(docs)
    return res.length
    
  } catch(err) {
  
    const errMsg = `An error occurred in insertTCProducts(): ${err}`
    throw new Error(errMsg)
  }
}

/*
DESC
  Sets an existing TCProduct to be equal to a new TCProduct
INPUT 
  existingTCProduct: The TCProduct to update
  newTCProduct: The new state of the TCProduct
RETURN
  TRUE if the TCProduct was successfully set, FALSE otherwise
*/
export async function setTCProduct(
  existingTCProduct: ITCProduct,
  newTCProduct: ITCProduct
): Promise<boolean> {
  
  // connect to db
  await mongoose.connect(url)

  try {

    // check if TCProduct exists
    const productDoc = await getTCProductDoc(existingTCProduct.tcgplayerId)
    assert(
      isITCProduct(productDoc),
      genProductNotFoundError('setTCProduct()', 
        existingTCProduct.tcgplayerId).toString()
    )

    // overwrite TCProduct
    productDoc.overwrite(newTCProduct)
    await productDoc.save()
    return true

  } catch(err) {

    const errMsg = `An error occurred in setTCProduct(): ${err}`
    throw new Error(errMsg)
  }
}

/*
DESC
  Sets a property on a TCProduct document to the input value using the
  tcgplayerId to find the TCProduct
INPUT 
  tcgplayerId: TCGPlayerId identifying the ITCproduct
  key: The property name to set
  value: The property value to set
RETURN
  TRUE if the property was successfully set, FALSE otherwise
*/
export async function setTCProductProperty(
  tcgplayerId: number,
  key: string,
  value: any
): Promise<boolean> {
  
  // connect to db
  await mongoose.connect(url)

  try {

    // check if TCProduct exists
    const productDoc = await getTCProductDoc(tcgplayerId)
    assert(
      isITCProduct(productDoc),
      genProductNotFoundError('setTCProductProperty()', tcgplayerId).toString()
    )

    // update TCProduct
    productDoc.set(key, value)
    await productDoc.save()

    return true

  } catch(err) {

    const errMsg = `An error occurred in setTCProductProperty(): ${err}`
    throw new Error(errMsg)
  }
}