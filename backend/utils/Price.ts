import { IPrice, assert } from 'common'
import { IMPrice, Price } from '../mongo/models/priceSchema'
import { getProductDocs } from '../mongo/dbi/Product'
import { IMProduct } from '../mongo/models/productSchema'
import { isProductDoc, genProductNotFoundError } from './Product'


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
      genProductNotFoundError('getIMPricesFromIPrices()').toString()
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