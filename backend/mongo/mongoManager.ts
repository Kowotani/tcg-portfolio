// imports
import { 
  IDatedPriceData, IHolding, IPopulatedHolding, IPopulatedPortfolio, IPortfolio, 
  IPortfolioMethods, IPrice, IPriceData, IProduct,

  assert, isIHoldingArray, isIPopulatedHolding, isIPortfolio
} from 'common'
import * as _ from 'lodash'
import mongoose from 'mongoose'
import { HydratedDocument} from 'mongoose'
import { IMPortfolio, portfolioSchema } from './models/portfolioSchema'
import { priceSchema } from './models/priceSchema'
import { IMProduct, productSchema } from './models/productSchema'
import { 
  areValidHoldings, getIMHoldingsFromIHoldings, getIMPricesFromIPrices 
} from '../utils'


// =======
// globals
// =======

// get mongo client
const url = 'mongodb://localhost:27017/tcgPortfolio';

// mongoose models
export const Portfolio = mongoose.model('Portfolio', portfolioSchema)
export const Product = mongoose.model('Product', productSchema)
export const Price = mongoose.model('Price', priceSchema)


// =========
// functions
// =========

// ---------
// Portfolio
// ---------

/*
DESC
  Adds a Holding (or array of Holdings) to a Portfolio. Will only add all
  Holdings or none (ie. if one Holding already exists)
INPUT
  portfolio: The Portfolio to contain the holding
  holding: The Holding to add
RETURN
  TRUE if all Holdings were successfully added to the Portfolio, FALSE otherwise
*/
export async function addPortfolioHoldings(
  portfolio: IPortfolio, 
  holdingInput: IHolding | IHolding[],
): Promise<boolean> {

  // connect to db
  await mongoose.connect(url)

  const holdingsToAdd = Array.isArray(holdingInput)
    ? holdingInput
    : [holdingInput]

  const userId = portfolio.userId
  const portfolioName = portfolio.portfolioName

  try {

    // check if empty holdings array was passed
    if (holdingsToAdd.length === 0) {
      console.log(`No holdings found to add`)
      return false
    }

    // check if portfolio exists
    const portfolioDoc = await getPortfolioDoc(portfolio)
    if (portfolioDoc instanceof Portfolio === false) {
      console.log(`${portfolioName} does not exist for userId: ${userId}`)
      return false
    }
    assert(portfolioDoc instanceof Portfolio)
 
    // validate holdingsToAdd
    const validHoldings = await areValidHoldings(holdingsToAdd)
    if (!validHoldings) {
      console.log('Holdings failed validation in addPortfolioHoldings()')
      return false
    }

    // check if any holding already exists
    const tcgplayerIds = holdingsToAdd.map((holding: IHolding) => {
      return holding.tcgplayerId
    })
    const portfolioTcgplayerIds = portfolioDoc.getHoldings().map(
      (holding: IHolding) => { return holding.tcgplayerId })
    const existingHoldings = _.intersection(
      portfolioTcgplayerIds, tcgplayerIds)

    if (existingHoldings.length > 0) {
      console.log(`Portfolio holdings already exist for tcgplayerIds: ${existingHoldings}`)
      return false
    }

    // get IMHolding[]
    const holdings = await getIMHoldingsFromIHoldings(holdingsToAdd)

    portfolioDoc.addHoldings(holdings)
    return true
    
  } catch(err) {
    
    const errMsg = `An error occurred in addPortfolioHolding(): ${err}`
    throw new Error(errMsg)
  }
}

/*
DESC
  Adds a Portfolio based on the given inputs
INPUT
  userId: The associated userId
  portfolioName: The portfolio's name
  holdings: An array of Holdings
  description?: A description of the portfolio
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
    const doc = await getPortfolioDoc(portfolio)
    if (doc instanceof Portfolio) {
      console.log(`${portfolioName} already exists for userId: ${userId}`)
      return false
    } 

    // get IMHolding[]
    const holdings = await getIMHoldingsFromIHoldings(portfolio.holdings)

    // create IPortfolio
    let newPortfolio: any = {
      userId: userId,
      portfolioName: portfolioName,
      holdings: holdings
    }
    if (description) {
      newPortfolio['description'] = portfolio.description
    }
    assert(
      isIPortfolio(newPortfolio),
      'newPortfolio object is not an IPortfolio in addPortfolio()')

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
    const doc = await getPortfolioDoc(portfolio)
    if (doc instanceof Portfolio === false) {
      console.log(`${portfolioName} does not exist for userId: ${userId}`)
      return false
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
  Deletes the Holding for the input tcgplayerId from the input Portfolio
INPUT
  portfolio: The Portfolio to contain the holding
  tcgplayerId: The tcgplayerId of the Holding to delete
RETURN
  TRUE if the Holding was successfully deleted from the Portfolio, FALSE otherwise
*/
export async function deletePortfolioHolding(
  portfolio: IPortfolio, 
  tcgplayerId: number,
): Promise<boolean> {

  // connect to db
  await mongoose.connect(url)

  const userId = portfolio.userId
  const portfolioName = portfolio.portfolioName

  try {  

    // check if portfolio exists
    const portfolioDoc = await getPortfolioDoc(portfolio)
    if (portfolioDoc instanceof Portfolio === false) {
      console.log(`${portfolio.portfolioName} does not exist for userId: ${userId}`)
      return false

    }
    assert(portfolioDoc instanceof Portfolio)
    
    // check if holding exists
    if (!portfolioDoc.hasHolding(tcgplayerId)) {
      console.log(`tcgplayerId: ${tcgplayerId} does not exist in portfolio: (${userId}, ${portfolioName})`)
      return false
    } 

    // remove the holding
    portfolioDoc.deleteHolding(tcgplayerId)
    return true
    
  } catch(err) {

    const errMsg = `An error occurred in deletePortfolioHolding(): ${err}`
    throw new Error(errMsg)
  }
}

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

    const doc = await Portfolio.findOne({
      'userId': portfolio.userId,
      'portfolioName': portfolio.portfolioName,
    })
    return doc

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
  Sets a Portfolio's holdings to the provided input
INPUT 
  portfolio: The Portfolio to update
  holdings: An array of IHolding
RETURN
  TRUE if the holdings were successfully set, FALSE otherwise
*/
export async function setPortfolioHoldings(
  portfolio: IPortfolio,
  holdingInput: IHolding | IHolding[]
): Promise<boolean> {

  // connect to db
  await mongoose.connect(url)

  try {

    // check if Portfolio exists
    const portfolioDoc = await getPortfolioDoc(portfolio)
    if (portfolioDoc instanceof Portfolio === false) {
      console.log(`Portfolio not found (${portfolio.userId}, ${portfolio.portfolioName})`)
    }
    assert(portfolioDoc instanceof Portfolio)

    // convert input to Array, if necessary
    const holdings = Array.isArray(holdingInput) ? holdingInput : [holdingInput]

    // validate Holdings
    const validHoldings = await areValidHoldings(holdings)
    if (!validHoldings) {
      console.log('Holdings failed validation in setPortfolioHoldings()')
      return false
    }

    // get IMHolding[]
    const newHoldings = await getIMHoldingsFromIHoldings(holdings)
    portfolioDoc.holdings = newHoldings
    await portfolioDoc.save()
    return true

  } catch(err) {

    const errMsg = `An error occurred in setPortfolioHoldings(): ${err}`
    throw new Error(errMsg)
  }  
}

/*
DESC
  Sets a property on the specified Portfolio document to the input value. 
  NOTE: This _cannot_ set the holdings property, use setPortfolioHoldings()
INPUT 
  portfolio: The Portfolio to update
  key: The property name to set
  value: The property value to set
RETURN
  TRUE if the property was successfully set, FALSE otherwise
*/
export async function setPortfolioProperty(
  portfolio: IPortfolio,
  key: string,
  value: any
): Promise<boolean> {

  // connect to db
  await mongoose.connect(url)

  try {

    // check if Portfolio exists
    const portfolioDoc = await getPortfolioDoc(portfolio)
    if (portfolioDoc instanceof Portfolio === false) {
      console.log(`Portfolio not found (${portfolio.userId}, ${portfolio.portfolioName})`)
    }
    assert(portfolioDoc instanceof Portfolio)

    // call separate setPortfolioHoldings()
    if (key === 'holdings') {
      assert(isIHoldingArray(value))
      const res = await setPortfolioHoldings(portfolio, value)

      return res

    // set the key
    } else {
      portfolioDoc.set(key, value)
      await portfolioDoc.save()

      return true
    }

  } catch(err) {

    const errMsg = `An error occurred in setPortfolioProperty(): ${err}`
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
    console.log('No tcgplayerId or hexStringId provided to getProductDoc()') 
    return null
  }

  // connect to db
  await mongoose.connect(url)

  try {
    const doc = tcgplayerId
      ? await Product.findOne({ 'tcgplayerId': tcgplayerId })
      : await Product.findById(hexStringId)
    return doc

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
    if (productDoc instanceof Product === false) {
      console.log(`Product not found for tcgplayerId: ${tcgplayerId}`)
    }
    assert(productDoc instanceof Product)

    // update Product
    productDoc.set(key, value)
    await productDoc.save()

    return true

  } catch(err) {

    const errMsg = `An error occurred in setProductProperty(): ${err}`
    throw new Error(errMsg)
  }
}


// -----
// Price
// -----

/*
DESC
  Constructs Price documents from the input data and inserts them
INPUT 
  An array of IPrices
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

// import { logObject, TCG, ProductType, ProductSubtype, ProductLanguage, TransactionType } from 'common'
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

  // // // -- Set Product
  // const key = 'msrp'
  // const value = 225

  // res = await setProductProperty(tcgplayerId, key, value)
  // if (res) {
  //   console.log(`Product (${tcgplayerId}) updated {${key}: ${value}}`)
  // } else {
  //   console.log('Product not updated')
  // }

  // const p233232 = await getProductDoc({'tcgplayerId': 233232})
  // const p449558 = await getProductDoc({'tcgplayerId': 449558})

  // const userId = 789
  // const portfolioName = 'Omega Investments'
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
  //     ]
  //   },
  // ]

  // const portfolio: IPortfolio = {
  //   userId: userId, 
  //   portfolioName: portfolioName,
  //   holdings: holdings,
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

  // const holding: IHolding = {
  //   tcgplayerId: 233232,
  //   transactions: [{
  //     type: TransactionType.Purchase,
  //     date: new Date(),
  //     price: 1.23,
  //     quantity: 1
  //   }]
  // }

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

  return 0
}

main()
  .then(console.log)
  .catch(console.error)