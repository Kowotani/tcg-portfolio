// imports
import { 
  IDatedPriceData, IPopulatedHolding, IPopulatedPortfolio, IPortfolio, 
  IPortfolioMethods, IPrice, IProduct, TDatedValue, TimeseriesGranularity,

  assert, isIPopulatedHolding
} from 'common'
import * as _ from 'lodash'
import mongoose from 'mongoose'
import { HydratedDocument} from 'mongoose'
import { IMHistoricalPrice } from './models/historicalPriceSchema'
import { IMPortfolio } from './models/portfolioSchema'
import { IMProduct } from './models/productSchema'
import { 
  HistoricalPrice, Portfolio, Product, Price,

  getIMHoldingsFromIHoldings, getIMPricesFromIPrices,
  
  genPortfolioAlreadyExistsError, genPortfolioNotFoundError, 
  genProductNotFoundError,

  areValidHoldings, isPortfolioDoc, isProductDoc
} from '../utils'


// =======
// globals
// =======

// get mongo client
const url = 'mongodb://localhost:27017/tcgPortfolio'


// =========
// functions
// =========

// ---------
// Portfolio
// ---------

/*
DESC
  Adds a Portfolio based on the given inputs
INPUT
  portfolio: An IPortfolio
RETURN
  TRUE if the Portfolio was successfully created, FALSE otherwise
*/
export async function addPortfolio(portfolio: IPortfolio): Promise<boolean> {

  // connect to db
  await mongoose.connect(url)

  const userId = portfolio.userId
  const portfolioName = portfolio.portfolioName
  const description = portfolio.description

  try {

    // check if portfolioName exists for this userId
    const portfolioDoc = await getPortfolioDoc(portfolio)
    if (isPortfolioDoc(portfolioDoc)) {
      throw genPortfolioAlreadyExistsError(userId, portfolioName, 
        'addPortfolio()')
    } 

    // get IMHolding[]
    const holdings = await getIMHoldingsFromIHoldings(portfolio.holdings)

    // create IPortfolio
    let newPortfolio: IPortfolio = {
      userId: userId,
      portfolioName: portfolioName,
      holdings: holdings
    }
    if (description) {
      newPortfolio['description'] = portfolio.description
    }

    // create the portfolio  
    await Portfolio.create(newPortfolio)

    return true

  } catch(err) {

    const errMsg = `An error occurred in addPortfolio(): ${err}`
    throw new Error(errMsg)
  }
}

/*
DESC
  Deletes the Portfolio document by userId and portfolioName
INPUT
  userId: The associated userId
  portfolioName: The portfolio's name
RETURN
  TRUE if the Portfolio was successfully created, FALSE otherwise
*/
export async function deletePortfolio(portfolio: IPortfolio): Promise<boolean> {

  // connect to db
  await mongoose.connect(url)

  const userId = portfolio.userId
  const portfolioName = portfolio.portfolioName

  try {

    // check if portfolioName exists for this userId
    const portfolioDoc = await getPortfolioDoc(portfolio)
    if (!isPortfolioDoc(portfolioDoc)) {
      throw genPortfolioNotFoundError(userId, portfolioName, 
        'deletePortfolio()')
    }

    // delete the portfolio  
    const res = await Portfolio.deleteOne({
      'userId': userId,
      'portfolioName': portfolioName,
    })
    return res.deletedCount === 1

  } catch(err) {

    const errMsg = `An error occurred in deletePortfolio(): ${err}`
    throw new Error(errMsg)
  }
}

/*
DESC
  Retrieves the Portfolio document by userId and portfolioName
INPUT
  userId: The associated userId
  portfolioName: The portfolio's name
RETURN
  The document if found, else null
*/
export async function getPortfolioDoc(
  portfolio: IPortfolio
): Promise<HydratedDocument<IMPortfolio, IPortfolioMethods> | null> {

  // connect to db
  await mongoose.connect(url)

  try {

    const portfolioDoc = await Portfolio.findOne({
      'userId': portfolio.userId,
      'portfolioName': portfolio.portfolioName,
    })
    return portfolioDoc

  } catch(err) {

    const errMsg = `An error occurred in getPortfolioDoc(): ${err}`
    throw new Error(errMsg)
  } 
}

/*
DESC
  Retrieves all Portfolio documents for the input userId
INPUT
  userId: The associated userId
RETURN
  An array of Portfolio documents
*/
export async function getPortfolioDocs(
  userId: number
): Promise<HydratedDocument<IMPortfolio, IPortfolioMethods>[]> {

  // connect to db
  await mongoose.connect(url)

  try {

    const docs = await Portfolio.find({'userId': userId})
    return docs

  } catch(err) {

    const errMsg = `An error occurred in getPortfolioDocs(): ${err}`
    throw new Error(errMsg)
  } 
}

/*
DESC
  Retrieves all IPopulatedPortfolios for the input userId
INPUT
  userId: The associated userId
RETURN
  An array of IPopulatedPortfolios
*/
export async function getPortfolios(
  userId: number
): Promise<IPopulatedPortfolio[]> {

  // connect to db
  await mongoose.connect(url)

  try {

    const docs = await Portfolio
      .find({'userId': userId})
      .populate({
        path: 'holdings',
        populate: {path: 'product'}
      })
      .select('-holdings.tcgplayerId')
    const portfolios: IPopulatedPortfolio[] = docs.map(
      (portfolio: IMPortfolio) => {

        // create populatedHoldings
        const populatedHoldings: IPopulatedHolding[] = portfolio.holdings.map(
          (el: any) => {
            assert(isIPopulatedHolding(el))
            return el
        })

        // create populatedPortfolio
        return {
          userId: portfolio.userId,
          portfolioName: portfolio.portfolioName,
          description: portfolio.description,
          populatedHoldings: populatedHoldings
        }
    })

    return portfolios

  } catch(err) {

    const errMsg = `An error occurred in getPortfolios(): ${err}`
    throw new Error(errMsg)
  } 
}

/*
DESC
  Sets an existing Portfolio to be equal to a new Portfolio
INPUT 
  existingPortfolio: The Portfolio to update
  newPortfolio: The new state of the Portfolio
RETURN
  TRUE if the Portfolio was successfully set, FALSE otherwise
*/
export async function setPortfolio(
  existingPortfolio: IPortfolio,
  newPortfolio: IPortfolio,
): Promise<boolean> {

  // connect to db
  await mongoose.connect(url)

  try {

    // check that userIds match
    assert(
      existingPortfolio.userId === newPortfolio.userId,
      `Mismatched userIds provided to setPortfolio(${existingPortfolio.userId}, ${newPortfolio.userId})`
    )

    // check that new Portfolio Holdings are valid
    const hasValidHoldings = await areValidHoldings(newPortfolio.holdings)
    if (!hasValidHoldings) {
      const errMsg = 'New portfolio has invalid holdings'
      throw new Error(errMsg)
    }

    // check if Portfolio exists
    const portfolioDoc = await getPortfolioDoc(existingPortfolio)
    if (!isPortfolioDoc(portfolioDoc)) {
      const errMsg = `Portfolio not found (${existingPortfolio.userId}, ${existingPortfolio.portfolioName})`
      throw new Error(errMsg)
    }
    assert(
      isPortfolioDoc(portfolioDoc),
      genPortfolioNotFoundError(existingPortfolio.userId, 
        existingPortfolio.portfolioName, 'setPortfolio()').toString()
    )

    // create IMPortfolio for new Portfolio
    const newIMPortfolio = {
      ...newPortfolio,
      holdings: await getIMHoldingsFromIHoldings(newPortfolio.holdings)
    }

    // overwrite existing Portfolio with new Portfolio
    portfolioDoc.overwrite(newIMPortfolio)
    await portfolioDoc.save()
    return true

  } catch(err) {

    const errMsg = `An error occurred in setPortfolio(): ${err}`
    throw new Error(errMsg)
  }
}

// -----
// Price
// -----

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
        _id: { tcgplayerId: number},
        data: [[ datestring, number ]]
      }
    */
    const priceData = await Price.aggregate()
      .group({
        _id: {
          tcgplayerId: '$tcgplayerId',
          priceDate: '$priceDate'
        },
        marketPrice: {
          $avg: '$prices.marketPrice'
        }
      })
      .group({
        _id: {
          tcgplayerId: '$_id.tcgplayerId'
        },
        data: {
          '$topN': {
            output: [
              '$_id.priceDate', 
              '$marketPrice'
            ], 
            sortBy: {
              '_id.priceDate': -1
            }, 
            n: 1
        }}
      })
      .exec()
    
    // create the TTcgplayerIdPrices
    let prices = new Map<number, IDatedPriceData>()
    priceData.forEach((el: any) => {
      prices.set(
        el._id.tcgplayerId, 
        {
          priceDate: el.data[0][0],
          prices: {
            marketPrice: el.data[0][1]
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
  Retrieves the Prices for the input tcgplayerId as a TDatedValue[]. The series
  can be sliced by the optional startDate and endDate, otherwise it will return
  all data found
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
    let filter: any = {tcgplayerId: tcgplayerId}
    if (startDate) {
      filter['date'] = {$gte: startDate}
    }
    if (endDate) {
      filter['date'] = {$lte: endDate}
    }

    // query data
    const priceDocs = await HistoricalPrice.find(filter).sort({'date': 1})

    // create TDatedValue[]
    const datedValues = priceDocs.map((price: IMHistoricalPrice) => {
      return {
        date: price.date,
        value: price.marketPrice
      } as TDatedValue
    })

    return datedValues
    
  } catch(err) {
  
    const errMsg = `An error occurred in getPriceSeries(): ${err}`
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

// -------
// Product
// -------

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


// =====
// views
// =====

/*
DESC
  This pipeline creates a price summary for all Products that is designed to
  be used when calculating historical returns
OUTPUT
  historicalPrices collection of IHistoricalPrice documents
*/
export async function updateHistoricalPrices(): Promise<boolean> {

  // connect to db
  await mongoose.connect(url)

  try {

    const res = await Price.aggregate([

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
            bounds: 'full'
          }
        }
      },

      // interpolate missing data points
      {
        $fill: {
          partitionByFields: ['tcgplayerId'],
          sortBy: {'date': 1},
          output: {
            'tcgplayerId': {method: 'locf'},
            'marketPrice': {method: 'linear'},
            'isInterpolated': {value: true}
          }
        }
      },

      // filter out null marketPrices
      // this is due to the releaseDate of Products being different
      {
        $match: {
          marketPrice: {
            $ne: null
          }
        }
      },

      // sort results
      {
        $sort: {
          tcgplayerId: 1,
          date: 1
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

  let res

  // res = await getLatestPrices()
  // if (res) {
  //   logObject(res)
  // } else {
  //   console.log('Could not retrieve latest prices')
  // }

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

  // const userId = 456
  // const portfolioName = 'Gamma Investments'
  // const description = 'Washer dryer mechanic'
  // let holdings: IHolding[] = [
  //   {
  //     tcgplayerId: 233232,
  //     transactions: [
  //       {
  //         type: TransactionType.Purchase,
  //         date: new Date(),
  //         price: 99,
  //         quantity: 1,
  //       },
  //       {
  //         type: TransactionType.Sale,
  //         date: new Date(),
  //         price: 99,
  //         quantity: 2,
  //       },        
  //     ],
  //   },
  // ]

  // // // -- Set Portfolio
  // const portfolio: IPortfolio = {
  //   userId: userId, 
  //   portfolioName: portfolioName,
  //   holdings: [],
  // }
  // const newPortfolio: IPortfolio = {
  //   userId: userId, 
  //   portfolioName: portfolioName,
  //   holdings: holdings,
  // }
  // res = await setPortfolio(portfolio, newPortfolio)
  // if (res) {
  //   console.log('Portfolio successfully set')
  // } else {
  //   console.log('Portfolio not set')
  // }

  // // -- Add portfolio holdings

  // res = await addPortfolioHoldings(portfolio, holdings)
  // if (res) {
  //   console.log('Portfolio holdings successfully added')
  // } else {
  //   console.log('Portfolio holdings not added')
  // }

  // -- Set portfolio holdings

  // res = await setPortfolioProperty(portfolio, 'description', 'Taco Bell')
  // if (res) {
  //   console.log('Portfolio holdings successfully set')
  // } else {
  //   console.log('Portfolio holdings not set')
  // }

  // // -- Get portfolios
  
  // res = await getPortfolioDocs(userId)
  // if (res) {
  //   console.log(res)
  // } else {
  //   console.log('Portfolios not retrieved')
  // }

  // res = await getPortfolios(userId)
  // if (res) {
  //   logObject(res)
  // } else {
  //   console.log('Portfolios not retrieved')
  // }

  // -- Add portfolio

  // res = await addPortfolio(portfolio)
  // if (res) {
  //   console.log('Portfolio successfully created')
  // } else {
  //   console.log('Portfolio not created')
  // }

  // // -- Delete portfolio

  // res = await deletePortfolio(userId, portfolioName)
  // if (res) {
  //   console.log('Portfolio successfully deleted')
  // } else {
  //   console.log('Portfolio not deleted')
  // }

  // // -- Add portfolio holding
  // const tcgplayerId = 233232
  // const holding: IHolding = {
  //   tcgplayerId: tcgplayerId,
  //   transactions: [
  //     {
  //       type: TransactionType.Purchase,
  //       date: new Date('2023-09-01'),
  //       price: 240,
  //       quantity: 2
  //     },
  //     {
  //       type: TransactionType.Sale,
  //       date: new Date('2023-09-02'),
  //       price: 245,
  //       quantity: 1
  //     },
  //     {
  //       type: TransactionType.Purchase,
  //       date: new Date('2023-09-04'),
  //       price: 250,
  //       quantity: 1
  //     },
  //     {
  //       type: TransactionType.Purchase,
  //       date: new Date('2023-09-05'),
  //       price: 250,
  //       quantity: 1
  //     },
  //     {
  //       type: TransactionType.Sale,
  //       date: new Date('2023-09-06'),
  //       price: 255,
  //       quantity: 3
  //     }
  //   ]
  // } 

  // const startDate = new Date('2023-09-01')
  // const endDate = new Date('2023-09-06')
  // const prices = getSeriesFromDatedValues(await getPricesAsDatedValues(tcgplayerId))

  // const series = getHoldingMarketValueSeries(
  //   holding,
  //   prices,
  //   startDate,
  //   endDate
  //   )

  // console.log('-- market value series')  
  // console.log(series.print())

  // holdings = [
  //   holding,
  //   {
  //     tcgplayerId: 233232,
  //     transactions: [{
  //       type: TransactionType.Purchase,
  //       date: new Date(),
  //       price: 4.99,
  //       quantity: 100
  //     }]
  //   }    
  // ]

  // res = await addPortfolioHoldings(
  //   {
  //     userId: userId,
  //     portfolioName: portfolioName,
  //     holdings: holdings,
  //   },
  //   holdings
  // )
  // if (res) {
  //   console.log('Holding successfully added')
  // } else {
  //   console.log('Holding not added')
  // }

  // // -- Delete portfolio holding

  // res = await deletePortfolioHolding(
  //   {
  //     userId: userId,
  //     portfolioName: portfolioName,
  //     holdings: []
  //   },
  //   233232
  // )
  // if (res) {
  //   console.log('Holding successfully deleted')
  // } else {
  //   console.log('Holding not deleted')
  // }

  // // -- Create historicalPrices
  // res = await updateHistoricalPrices()
  // if (res) {
  //   console.log('historicalPrices updated')
  // } else {
  //   console.log('historicalPrices not updated')
  // }

  // // -- Reset Prices
  // const tcgplayerIds = [121527]
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

  // // console.log('-- danfo series')
  // const series = getSeriesFromDatedValues(priceSeries)
  // res = densifyAndFillSeries(
  //   series, 
  //   new Date('2023-08-31'), 
  //   new Date('2023-09-14'),
  //   'locf',
  //   undefined,
  //   123
  // )
  // console.log(res)
  
  // console.log('-- dated values')
  // console.log(getDatedValuesFromSeries(series))

  return 0
}

main()
  .then(console.log)
  .catch(console.error)