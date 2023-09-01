import { 
  IHolding, IPrice,  

  assert, getHoldingQuantity
} from 'common'
import * as _ from 'lodash'
import mongoose from 'mongoose'
import { IMHolding } from './mongo/models/holdingSchema'
import { IMPortfolio, portfolioSchema } from './mongo/models/portfolioSchema'
import { IMPrice, priceSchema } from './mongo/models/priceSchema'
import { IMProduct, productSchema } from './mongo/models/productSchema'
import { getProductDocs } from './mongo/mongoManager'



// models
const Portfolio = mongoose.model('Portfolio', portfolioSchema)
const Price = mongoose.model('Price', priceSchema)
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
      isProductDoc(productDoc),
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
      return product.tcgplayerId === Number(price.tcgplayerId)
    })
    assert(
      isProductDoc(productDoc), 
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


// ===========
// type guards
// ===========

/*
DESC
  Returns whether or not the input is a Portfolio doc
INPUT
  arg: An object that might be a Portfolio doc
RETURN
  TRUE if the input is a Portfolio doc, FALSE otherwise
*/
export function isPortfolioDoc(arg: any): arg is IMPortfolio {
  return arg
    && arg instanceof Portfolio
}

/*
DESC
  Returns whether or not the input is a Price doc
INPUT
  arg: An object that might be a Price doc
RETURN
  TRUE if the input is a Price doc, FALSE otherwise
*/
export function isPriceDoc(arg: any): arg is IMPrice {
  return arg
    && arg instanceof Price
}

/*
DESC
  Returns whether or not the input is a Product doc
INPUT
  arg: An object that might be a Product doc
RETURN
  TRUE if the input is a Product doc, FALSE otherwise
*/
export function isProductDoc(arg: any): arg is IMProduct {
  return arg
    && arg instanceof Product
}