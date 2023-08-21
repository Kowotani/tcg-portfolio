import { 
  IHolding, ITransaction,  

  assert, getQuantity
} from 'common'
import * as _ from 'lodash'
import mongoose from 'mongoose'
import { IMHolding } from './models/holdingSchema'
import { IMProduct, productSchema } from './models/productSchema'
import { getProductDocs } from './mongoManager'


// models
const Product = mongoose.model('Product', productSchema)


// ==========
// validators
// ==========

/*
DESC
  Validates whether the input Holdings are valid. The validity checks are:
    - unique tcgplayerId for each Holding
    - the Product exists for each Holding
    - the Transaction quantity >= 0 for each Holding
INPUT
  holdings: An IHolding[]
RETURN
  TRUE if the input is a valid set of IHolding[], FALSE otherwise
*/
export async function isValidHoldings(holdings: IHolding[]): Promise<boolean> {
  
  // unique tcgplayerId
  const tcgplayerIds = holdings.map((holding: IHolding) => {
    return holding.tcgplayerId
  })
  if (tcgplayerIds.length > _.uniq(tcgplayerIds).length) {
    console.log(`Duplicate tcgplayerIds detected in isValidHoldings()`)
    return false
  }

  // all Products exist
  const productDocs = await getProductDocs()
  const productTcgplayerIds = productDocs.map((doc: IMProduct) => {
    return doc.tcgplayerId
  })
  const unknownTcgplayerIds = _.difference(tcgplayerIds, productTcgplayerIds)
  if (unknownTcgplayerIds.length > 0) {
    console.log(`Products not found for tcgplayerIds in isValidHoldings(): ${unknownTcgplayerIds}`)
    return false
  }

  // quantity >= 0
  if (!_.every(holdings, (holding: IHolding) => {
    return isValidTransactions(holding.transactions)
  })) {
    return false
  }

  // all checks passed
  return true
}

/*
DESC
  Validates whether the input Transactions are valid. The validity checks are:
    - the net quantity is greater than or equal to 0
INPUT
  transactions: An ITransaction[]
RETURN
  TRUE if the input is a valid set of ITransaction[], FALSE otherwise
*/
export function isValidTransactions(transactions: ITransaction[]): boolean {

  // net quantity
  return getQuantity(transactions) >= 0
}


// ==========
// converters
// ==========

/*
DESC
  Converts an IHolding[] to an IMHolding[], which entails:
    - adding the product field with Product ObjectId
INPUT
  holdings: An IHolding[]
RETURN
  An IMHolding[]
*/
export async function convertIHoldingsToIMHoldings(
  holdings: IHolding[]
): Promise<IMHolding[]> {

  const productDocs = await getProductDocs()
  const newHoldings = holdings.map((holding: IHolding) => {

    // find Product
    const productDoc = productDocs.find((product: IMProduct) => {
      return product.tcgplayerId === holding.tcgplayerId
    })
    assert(
      productDoc instanceof Product, 
      'Product not found in convertIHoldingsToIMHoldings()')

    // create IMHolding
    return ({
      ...holding,
      product: productDoc._id
    } as IMHolding)
  })

  return newHoldings
}