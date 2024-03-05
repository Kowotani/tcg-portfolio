import { 
  IDatedPriceData, IPrice, TCG, TDatedValue, TimeseriesGranularity, assert
} from 'common'
import * as df from 'danfojs-node'
import { getProductDocs } from './Product'
import mongoose from 'mongoose'
import { 
  HistoricalPrice, IMHistoricalPrice 
} from '../models/historicalPriceSchema'
import { Price } from '../models/priceSchema'
import { IMProduct, Product } from '../models/productSchema'
import { getSeriesFromDatedValues } from '../../utils/danfo'
import { getIMPricesFromIPrices } from '../../utils/Price'
import { isProductDoc } from '../../utils/Product'


// =======
// globals
// =======

const url = 'mongodb://localhost:27017/tcgPortfolio'


// =======
// getters
// =======

/*
DESC
  Retrieves the latest market Prices for all Products
RETURN
  A Map<number, IDatedPriceData> where the key is a tcgplayerId
*/
export async function getLatestPrices(): Promise<Map<number, IDatedPriceData>> {

  // connect to db
  await mongoose.connect(url)

  try {

    // get list of Price data with the following shape
    /*
      {
        tcgplayerId: number,
        priceDate: Date,
        marketPrice: number
      }
    */
    const priceData = await HistoricalPrice.aggregate()
      .group({
        _id: {
          tcgplayerId: '$tcgplayerId',
          priceDate: '$date'
        },
        marketPrice: {
          $avg: '$marketPrice'
        }
      })
      .group({
        _id: {
          tcgplayerId: '$_id.tcgplayerId'
        },
        data: {
          '$topN': {
            output: {
              priceDate: '$_id.priceDate', 
              marketPrice: '$marketPrice'
            }, 
            sortBy: {
              '_id.priceDate': -1
            }, 
            n: 1
        }}
      })
      .addFields({
        element: {
          '$first': '$data'
        }
      })
      .project({
        _id: false,
    		tcgplayerId: '$_id.tcgplayerId',
    		priceDate: '$element.priceDate',
    		marketPrice: '$element.marketPrice'
      })
      .exec()
    
    // create the TTcgplayerIdPrices
    let prices = new Map<number, IDatedPriceData>()
    priceData.forEach((el: any) => {
      prices.set(
        el.tcgplayerId, 
        {
          priceDate: el.priceDate,
          prices: {
            marketPrice: el.marketPrice
          }
        } as IDatedPriceData
    )})

    return prices

  } catch(err) {

    const errMsg = `An error occurred in getLatestPrices(): ${err}`
    throw new Error(errMsg)
  } 
}

/*
DESC
  Retrieves the Prices for the input tcgplayerIds as a map of 
  tcpglayerId => TDatedValue[]. The data can be sliced by the optional 
  startDate and endDate, otherwise it  will return all data found
INPUT
  tcgplayerId[]: The tcgplayerIds
  startDate?: The starting date for the Price series
  endDate?: The ending date for the Price series
RETURN
  A map of tcpglayerId => TDatedValue[]
*/
export async function getPriceMapOfDatedValues(
  tcgplayerIds: number[],
  startDate?: Date,
  endDate?: Date
): Promise<Map<number, TDatedValue[]>> {

  // if dates input, verify that startDate <= endDate
  if (startDate && endDate) {
    assert(
      startDate.getTime() <= endDate.getTime(),
      'startDate must be less than or equal to endDate'
    )
  }

  // connect to db
  await mongoose.connect(url)

  try {

    // create filter
    let filter: any = {tcgplayerId: {$in: tcgplayerIds}}
    if (startDate && endDate) {
      filter['date'] = {$gte: startDate, $lte: endDate}
    } else if (startDate) {
      filter['date'] = {$gte: startDate}
    } else if (endDate) {
      filter['date'] = {$lte: endDate}
    }

    // query data
    const priceDocs = await HistoricalPrice.find(filter)
      .sort({'tcgplayerId': 1, 'date': 1})

    // created dated value map
    const datedValueMap = new Map<number, TDatedValue[]>()
    priceDocs.forEach((price: IMHistoricalPrice) => {

      // update map
      const tcgplayerId = price.tcgplayerId
      const datedValue: TDatedValue = {
        date: price.date,
        value: price.marketPrice
      }
      const values = datedValueMap.get(tcgplayerId)

      // key exists
      if (values) {
        values.push(datedValue)

      // key does not exist
      } else {
        datedValueMap.set(tcgplayerId, [datedValue])
      }
    })
    return datedValueMap
    
  } catch(err) {
  
    const errMsg = `An error occurred in getPriceMap(): ${err}`
    throw new Error(errMsg)
  }
}

/*
DESC
  Retrieves the Prices for the input tcgplayerIds as a map of 
  tcpglayerId => Series. The data can be sliced by the optional 
  startDate and endDate, otherwise it  will return all data found
INPUT
  tcgplayerId[]: The tcgplayerIds
  startDate?: The starting date for the Price series
  endDate?: The ending date for the Price series
RETURN
  A map of tcpglayerId => Series
*/
export async function getPriceMapOfSeries(
  tcgplayerIds: number[],
  startDate?: Date,
  endDate?: Date
): Promise<Map<number, df.Series>> {

  // get dated value map
  const datedValueMap
    = await getPriceMapOfDatedValues(tcgplayerIds, startDate, endDate)

  // convert TDatedValue[] to Series
  const seriesMap = new Map<number, df.Series>()
    datedValueMap.forEach((value, key) => {
      const series = getSeriesFromDatedValues(value)
      seriesMap.set(key, series)
    })

  return seriesMap
}

/*
DESC
  Retrieves the Prices for the input tcgplayerId as dated values. The data can  
  be sliced by the optional startDate and endDate, otherwise it  will return all 
  data found
INPUT
  tcgplayerId: The tcgplayerId
  startDate?: The starting date for the Price series
  endDate?: The ending date for the Price series
RETURN
  A TDatedValue[]
*/
export async function getPricesAsDatedValues(
  tcgplayerId: number,
  startDate?: Date,
  endDate?: Date
): Promise<TDatedValue[]> {

  // get dated value map
  const datedValueMap
    = await getPriceMapOfDatedValues([tcgplayerId], startDate, endDate)

  return datedValueMap.get(tcgplayerId) as TDatedValue[]
}

/*
DESC
  Retrieves the Prices for the input tcgplayerId as a danfo Series. The data can  
  be sliced by the optional startDate and endDate, otherwise it  will return all 
  data found
INPUT
  tcgplayerId: The tcgplayerId
  startDate?: The starting date for the Price series
  endDate?: The ending date for the Price series
RETURN
  A danfo Series
*/
export async function getPriceSeries(
  tcgplayerId: number,
  startDate?: Date,
  endDate?: Date
): Promise<df.Series> {

  // get prices
  const priceMap = await getPriceMapOfSeries([tcgplayerId], startDate, endDate)

  return priceMap.get(tcgplayerId) as df.Series
}


// =======
// setters
// =======

/*
DESC
  Inserts a Price document corresponding to the Product MSRP, if there is no
  Price doc on release date
RETURN
  TRUE if the insertion was sucessful
*/
export async function insertMissingReleaseDatePrices(): Promise<number> {
 
  // connect to db
  await mongoose.connect(url)  

  try {

    const pipeline = [
      
        // filter to Products with MSRP
        {
          $match: {
            msrp: {
              $ne: null
            }
          }
        },

        // join to Prices
        {
          $lookup: {
            from: 'prices',
            localField: 'tcgplayerId',
            foreignField: 'tcgplayerId',
            as: 'priceDocs'
          }
        },

        // add fields required in a Price document
        // and also a field to find missing prices on releaseDate
        {
          $addFields: {
            releaseDatePrices: {
              $filter: {
                input: '$priceDocs',
                cond: {
                  $eq: [
                    '$$this.priceDate',
                    '$releaseDate'
                  ]
                }
              }
            },
            priceDate: '$releaseDate',
            prices: { marketPrice: '$msrp' },
            product: '$_id',
            granularity: 'hours'
          }
        },

        // filter to documents without a Price doc on releaseDate
        {
          $match: {
            $expr: {
              $eq: [ { $size: '$releaseDatePrices' }, 0]
            }
          }
        },

        // create the Price document
        {
          $project: {
            _id: false,
            tcgplayerId: true,
            priceDate: true,
            prices: true,
            product: true,
            granularity: true
          }
        } 
    ]

    // query Product documents
    const prices = await Product.aggregate(pipeline).exec() as IPrice[]
    
    // insert into Prices
    const res = await insertPrices(prices)
    return res

  } catch(err) {
    
    const errMsg = `An error occurred in insertMissingReleaseDatePrices(): ${err}`
    throw new Error(errMsg)
  }
  
}

/*
DESC
  Constructs Price documents from the input data and inserts them
INPUT 
  docs: An IPrice[]
RETURN
  The number of documents inserted
*/
export async function insertPrices(docs: IPrice[]): Promise<number> {

  // connect to db
  await mongoose.connect(url)

  try {

    // create IMPrice[]
    const priceDocs = await getIMPricesFromIPrices(docs)

    const res = await Price.insertMany(priceDocs);
    return res.length
    
  } catch(err) {
  
    const errMsg = `An error occurred in insertPrices(): ${err}`
    throw new Error(errMsg)
  }
}

/*
DESC
  Removes all Price documents for the input tcgplayerIds, then inserts a Price 
  document for MSRP if it exists
INPUT 
  tcgplayerIds: An array of tcgplayerIds
RETURN
  The number of tcgplayerIds with reset Prices
*/
type TDeletedPricesRes = {
  deleted: number,
  inserted: number
}
export async function resetPrices(
  tcgplayerIds: number[]
): Promise<TDeletedPricesRes> {

  // connect to db
  await mongoose.connect(url)

  // return value
  let returnValues: TDeletedPricesRes = {
    deleted: 0,
    inserted: 0
  }

  try {

    // get Products
    const productDocs = await getProductDocs()

    // MSRP prices to load
    let prices: IPrice[] = []

    for (const tcgplayerId of tcgplayerIds) {

      // delete Price documents
      await Price.deleteMany({tcgplayerId: tcgplayerId})
      returnValues.deleted += 1

      // get Product
      const productDoc = productDocs.find((product: IMProduct) => {
        return product.tcgplayerId === tcgplayerId
      })

      // insert MSRP Price document, if MSRP exists
      if (isProductDoc(productDoc) && productDoc.msrp) {
        const price: IPrice = {
          priceDate: productDoc.releaseDate,
          tcgplayerId: tcgplayerId,
          granularity: TimeseriesGranularity.Hours,
          prices: {
            marketPrice: productDoc.msrp
          }
        }
        prices.push(price)
      }
    }

    // insert Prices
    const priceDocs = await getIMPricesFromIPrices(prices)
    const res = await Price.insertMany(priceDocs)
    returnValues.inserted = res.length
    return returnValues
    
  } catch(err) {
  
    const errMsg = `An error occurred in resetPrices(): ${err}`
    throw new Error(errMsg)
  }
}


// =====
// views
// =====

/*
TODO
  Consider changing how this pipeline works when the 500,000 document limit
  is reached at the TCG level
DESC
  This pipeline creates a price summary for all Products that is designed to
  be used when calculating historical returns
INPUT
  tcg: The TCG to update
OUTPUT
  historicalPrices collection of IHistoricalPrice documents
*/
export async function updateHistoricalPrices(tcg: TCG): Promise<boolean> {

  // connect to db
  await mongoose.connect(url)

  try {

    const res = await Price.aggregate([

      // join to Product
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productDoc'
        }
      },
      {
        $unwind: '$productDoc'
      },

      // match to the input TCG
      // keep prices on or after the release date
      {
        $match: {
          'productDoc.tcg': tcg,
          $expr: {
            $gte: [
              '$priceDate', 
              '$productDoc.releaseDate'
            ]
          }
        }
      },

      // aggregate existing prices for the same priceDate
      {
        $group: {
          _id: {
            tcgplayerId: '$tcgplayerId',
            date: {
              $dateTrunc: {
                date: '$priceDate',
                unit: 'day'
              }
            }
          },
          marketPrice: {
            $avg: '$prices.marketPrice'
          }
        }
      },      

      // surface nested fields, append isInterpolated
      {
        $project: {
          _id: false,
          tcgplayerId: '$_id.tcgplayerId',
          date: '$_id.date',
          marketPrice: true,
          isInterpolated: {$toBool: 0}
        }
      },      

      // create timeseries of priceDate
      {
        $densify: {
          field: 'date',
          partitionByFields: ['tcgplayerId'],
          range: {
            step: 1,
            unit: 'day',
            bounds: 'partition'
          }
        }
      },

      // TODO: figure out why sortBy { date: 1 } seemingly causes duplication
      // add unique-ish timestamp field to bypass above
      {
        $addFields: {
          timestamp: {
            $dateAdd: {
              startDate: '$date',
              unit: 'millisecond',
              amount: { 
                $round: {
                  $multiply: [
                    { $rand: {} }, 
                    1000
                  ] 
                }
              }
            }
          }
        }
      },

      // interpolate missing data points
      {
        $fill: {
          partitionByFields: ['tcgplayerId'],
          sortBy: {'timestamp': 1},
          output: {
            'tcgplayerId': {method: 'locf'},
            'marketPrice': {method: 'linear'},
            'isInterpolated': {value: true}
          }
        }
      },

      // write results
      {
        $merge: {
          on: ['tcgplayerId', 'date'], 
          into: 'historicalprices',
          whenMatched: 'replace'
        }
      }
    ])
    .exec()
    return true

  } catch(err) {
    
    const errMsg = `An error occurred in updateHistoricalPrices(): ${err}`
    throw new Error(errMsg)
  }

}

async function main(): Promise<number> {  

  // let res

  // const tcgplayerId = 493975
  // const startDate = new Date(Date.parse('2023-06-01'))
  // const endDate = new Date(Date.parse('2023-07-01'))
  // res = await getPricesAsDatedValues(tcgplayerId, startDate, endDate)
  // console.log(res)

  // res = await getLatestPrices()
  // if (res) {
  //   logObject(res)
  // } else {
  //   console.log('Could not retrieve latest prices')
  // }

  // // -- Create historicalPrices
  // const tcg = TCG.MagicTheGathering
  // res = await updateHistoricalPrices(tcg)
  // if (res) {
  //   console.log(`historicalPrices updated for ${tcg}`)
  // } else {
  //   console.log(`historicalPrices not updated for ${tcg}`)
  // }

  // // -- Reset Prices
  // const tcgplayerIds = [496041]
  // res = await resetPrices(tcgplayerIds)
  // if (res) {
  //   console.log(`${res.deleted} tcgplayerIds were reset, ${res.inserted} were initialized`)
  // } else {
  //   console.log('Prices not reset')
  // }

  // // -- Get Price DatedValues
  // const tcgplayerId = 121527
  // const priceSeries = await getPriceSeries(tcgplayerId, 
  //   new Date(Date.parse('2023-09-01'))
  // )
  // // console.log('-- price series')
  // // console.log(priceSeries)

  // res = await insertMissingReleaseDatePrices()
  return 0
}

main()
  .then(console.log)
  .catch(console.error)