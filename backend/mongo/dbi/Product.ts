import { 
  IProduct, 
  
  getDateOneYearAgo, getDateSixMonthsAgo, getDateThreeMonthsAgo,

  assert,
} from 'common'
import * as _ from 'lodash'
import mongoose, { HydratedDocument} from 'mongoose'
import { IMProduct, Product } from '../models/productSchema'
import { TcgPlayerChartDateRange } from '../../utils/Chart'
import { genProductNotFoundError, isProductDoc } from '../../utils/Product'


// =======
// globals
// =======

const url = 'mongodb://localhost:27017/tcgPortfolio'


// =======
// getters
// =======

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
  Returns the TcgplayerIds that should be scraped for historical prices based
  on the input date range. A TcgplayerId should be scraped if it:
    - was released in the past
    - has no price data in the earliest month of the requested date range
      (eg. for a date range of 1Y, scrape if there is no data 12M ago)
INPUT 
  dateRange: A TcgPlayerChartDateRange
RETURN
  An array of TcgplayerIds that should be scraped for historical prices based
  on the input date range
*/
export async function getTcgplayerIdsForHistoricalScrape(
  dateRange: TcgPlayerChartDateRange
): Promise<number[]> {

  // connect to db
  await mongoose.connect(url)

  // get priceDate lower bound
  let priceDateLowerBound: Date

  // 3M
  if (dateRange === TcgPlayerChartDateRange.ThreeMonths) {
    priceDateLowerBound = getDateThreeMonthsAgo()

  // 6M
  } else if (dateRange === TcgPlayerChartDateRange.SixMonths) {
    priceDateLowerBound = getDateSixMonthsAgo()

  // 1Y
  } else if (dateRange === TcgPlayerChartDateRange.OneYear) {
    priceDateLowerBound = getDateOneYearAgo()

  // default to 1Y
  } else {
    priceDateLowerBound = getDateOneYearAgo()
  }

  // pipeline
  const pipeline = [

    // include only released products
    {
      $match: {
        $expr: {
          $lte: [
            '$releaseDate',
            new Date()
          ],
        }			
      }
    },

    // join to Price documents
    {
      $lookup: {
        from: 'prices',
        localField: 'tcgplayerId',
        foreignField: 'tcgplayerId',
        as: 'priceDocs'
      }
    },

    // only consider Price documents within the scraping date range 
    {
      $addFields: {
        filteredPriceDocs: {
          $filter: {
            input: '$priceDocs',
            cond: {
              $gte: [ '$$this.priceDate', priceDateLowerBound ]
            }
          }
        }
      }
    }, 

    // create array of priceDate month
    {
      $addFields: {
        priceMonths: {
          $reduce: {
            input: '$filteredPriceDocs',
            initialValue: [],
            in: {
              $concatArrays: [
                '$$value',
                [{
                  $month: '$$this.priceDate'
                }]
              ]
            }
          }
        }
      }
    },

    // determine unique price months and expected price months
    {
      $addFields: {
        uniquePriceMonths: {
          $setUnion: [ '$priceMonths', [] ]
        },
        expectedPriceMonths: {
          $toInt: {
            $dateDiff: {
              startDate: {
                $max: [ priceDateLowerBound, '$releaseDate' ]
              },
              endDate: new Date(),
              unit: 'month'
            }
          }
        }
      }
    },

    // group by tcgplayerId
    {
      $group: {
        _id: '$tcgplayerId',
        tcgplayerId: { $max: '$tcgplayerId' },
        numPriceMonths: { $max: { $size: '$uniquePriceMonths' } },
        expectedPriceMonths: { $max: '$expectedPriceMonths' }
      }
    },

    // filter to documents with fewer price months than expected
    {
      $match: {
        $expr: {
          $lt: [ '$numPriceMonths', '$expectedPriceMonths']
        }
      }
    },

    // return tcgplayerIds
    {
      $project: {
        _id: 0,
        tcgplayerId: 1
      }
    }
  ]
  
  // execute pipeline
  const res = await Product.aggregate(pipeline).exec()
  return res.length 
    ? res.map((doc: any) => {
      assert('tcgplayerId' in doc, 'tcgplayerId not found in document')
      return doc.tcgplayerId
    }).sort()
    : []
}



// =======
// setters
// =======

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

  // res = await getTcgplayerIdsForHistoricalScrape(TcgPlayerChartDateRange.OneYear)
  console.log(res)

  return 0
}

main()
  .then(console.log)
  .catch(console.error)