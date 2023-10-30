import { IProduct, assert } from 'common'
import * as _ from 'lodash'
import mongoose, { HydratedDocument} from 'mongoose'
import { IMProduct, Product } from '../models/productSchema'
import { genProductNotFoundError, isProductDoc } from '../../utils/Product'


// =======
// globals
// =======

const url = 'mongodb://localhost:27017/tcgPortfolio'


// =========
// functions
// =========

/*
DESC
  Retrieves the Product document by tcgplayerId or _id
INPUT
  tcgplayerId: The Product's tcgplayerId (higher priority)
  hexStringId: The Product's document _id
RETURN
  The document if found, else null
*/
interface IGetProductDocParameters {
  tcgplayerId?: number;
  hexStringId?: string;  // 24 char hex string
}
export async function getProductDoc(
  { tcgplayerId, hexStringId }: IGetProductDocParameters = {}
): Promise<HydratedDocument<IProduct> | null> {

  // check that tcgplayer_id or id is provided
  if (tcgplayerId === undefined && hexStringId === undefined) {
    const errMsg = 'No tcgplayerId or hexStringId provided to getProductDoc()'
    throw new Error(errMsg)
  }

  // connect to db
  await mongoose.connect(url)

  try {
    const productDoc = tcgplayerId
      ? await Product.findOne({ 'tcgplayerId': tcgplayerId })
      : await Product.findById(hexStringId)
    return productDoc

  } catch(err) {

    const errMsg = `An error occurred in getProductDoc(): ${err}`
    throw new Error(errMsg)
  } 
}

/*
DESC
  Returns all Products
RETURN
  Array of Product docs
*/
export async function getProductDocs(): Promise<HydratedDocument<IMProduct>[]> {

  // connect to db
  await mongoose.connect(url);

  try {

    const docs = await Product.find({});
    return docs

  } catch(err) {

    const errMsg = `An error occurred in getProductDocs(): ${err}`
    throw new Error(errMsg)
  }
}


/*
DESC
  Constructs Price documents from the input data and inserts them
INPUT 
  An array of IProducts
RETURN
  The number of documents inserted
*/
export async function insertProducts(docs: IProduct[]): Promise<number> {

  // connect to db
  await mongoose.connect(url)

  try {

    const res = await Product.insertMany(docs)
    return res.length
    
  } catch(err) {
  
    const errMsg = `An error occurred in insertProducts(): ${err}`
    throw new Error(errMsg)
  }
}

/*
DESC
  Sets a property on a Product document to the input value using the
  tcgplayerId to find the Product
INPUT 
  tcgplayerId: TCGPlayerId identifying the product
  key: The property name to set
  value: The property value to set
RETURN
  TRUE if the property was successfully set, FALSE otherwise
*/
export async function setProductProperty(
  tcgplayerId: number,
  key: string,
  value: any
): Promise<boolean> {
  
  // connect to db
  await mongoose.connect(url)

  try {

    // check if Product exists
    const productDoc = await getProductDoc({tcgplayerId: tcgplayerId})
    if (!isProductDoc(productDoc)) {
      throw genProductNotFoundError('setProductProperty()', tcgplayerId)
    }
    assert(
      isProductDoc(productDoc),
      genProductNotFoundError('setProductProperty()', tcgplayerId).toString()
    )

    // update Product
    productDoc.set(key, value)
    await productDoc.save()

    return true

  } catch(err) {

    const errMsg = `An error occurred in setProductProperty(): ${err}`
    throw new Error(errMsg)
  }
}

async function main(): Promise<number> {  

  let res

  // const product: IProduct = {
  //   tcgplayerId: 449558,
  //   tcg: TCG.MagicTheGathering,
  //   releaseDate: new Date(),
  //   name: 'Foo',
  //   type: ProductType.BoosterBox,
  //   language: ProductLanguage.Japanese,
  // }

  // const res = await insertProducts([product])
  // console.log(res)

  // // -- Set Product
  // const tcgplayerId= 121527
  // const key = 'msrp'
  // const value = 80

  // res = await setProductProperty(tcgplayerId, key, value)
  // if (res) {
  //   console.log(`Product (${tcgplayerId}) updated {${key}: ${value}}`)
  // } else {
  //   console.log('Product not updated')
  // }

  // const p233232 = await getProductDoc({'tcgplayerId': 233232})
  // const p449558 = await getProductDoc({'tcgplayerId': 449558})

  return 0
}

main()
  .then(console.log)
  .catch(console.error)