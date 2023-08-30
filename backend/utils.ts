import { 
  IHolding, IPrice,  

  assert, getHoldingQuantity
} from 'common'
import * as _ from 'lodash'
import mongoose from 'mongoose'
import { IMHolding } from './mongo/models/holdingSchema'
import { IMPrice } from './mongo/models/priceSchema'
import { IMProduct, productSchema } from './mongo/models/productSchema'
import { getProductDocs } from './mongo/mongoManager'


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
export async function areValidHoldings(holdings: IHolding[]): Promise<boolean> {
  
  // unique tcgplayerId
  const tcgplayerIds = holdings.map((holding: IHolding) => {
    return Number(holding.tcgplayerId)
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
    console.log(`Products not found for tcgplayerIds in hasValidHoldings(): ${unknownTcgplayerIds}`)
    return false
  }

  // quantity >= 0
  if (!_.every(holdings, (holding: IHolding) => {
    return hasValidTransactions(holding)
  })) {
    return false
  }

  // all checks passed
  return true
}

/*
DESC
  Validates whether the input IHolding has valid Transactions. The validity 
  checks are:
    - the net quantity is greater than or equal to 0
INPUT
  holding: An IHolding[]
RETURN
  TRUE if the input IHolding has valid set of ITransaction[], FALSE otherwise
*/
export function hasValidTransactions(holding: IHolding): boolean {

  // net quantity
  return getHoldingQuantity(holding) >= 0
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
export async function getIMHoldingsFromIHoldings(
  holdings: IHolding[]
): Promise<IMHolding[]> {

  const productDocs = await getProductDocs()
  const newHoldings = holdings.map((holding: IHolding) => {

    // find Product
    const productDoc = productDocs.find((product: IMProduct) => {
      return product.tcgplayerId === Number(holding.tcgplayerId)
    })
    assert(
      productDoc instanceof Product, 
      'Product not found in getIMHoldingsFromIHoldings()'
    )

    // create IMHolding
    return ({
      ...holding,
      product: productDoc._id
    } as IMHolding)
  })

  return newHoldings
}

/*
DESC
  Converts an IPrice[] to an IMPrice[], which entails:
    - adding the product field with Product ObjectId
INPUT
  prices: An IPrice[]
RETURN
  An IMPrice[]
*/
export async function getIMPricesFromIPrices(
  prices: IPrice[]
): Promise<IMPrice[]> {

  const productDocs = await getProductDocs()
  const newPrices = prices.map((price: IPrice) => {

    // find Product
    const productDoc = productDocs.find((product: IMProduct) => {
      return product.tcgplayerId === price.tcgplayerId
    })
    assert(
      productDoc instanceof Product, 
      'Product not found in getIMPricesFromIPrices()'
    )

    // create IMPrice
    return ({
      ...price,
      product: productDoc._id
    } as IMPrice)
  })

  return newPrices
}