// imports
import { assert, IHolding, IPortfolio, IPortfolioMethods, IPrice, 
  IProduct } from 'common';
import * as _ from 'lodash';
import mongoose from 'mongoose';
import { HydratedDocument} from 'mongoose';
import { IMHolding } from './models/holdingSchema';
import { IMPortfolio, portfolioSchema } from './models/portfolioSchema';
import { IMPrice, priceSchema } from './models/priceSchema';
import { IMProduct, productSchema } from './models/productSchema';
// import { TCG, ProductType, ProductSubtype, ProductLanguage, TransactionType } from 'common';

// get mongo client
const url = 'mongodb://localhost:27017/tcgPortfolio';

// mongoose models
const Portfolio = mongoose.model('Portfolio', portfolioSchema);
const Product = mongoose.model('Product', productSchema);
const Price = mongoose.model('Price', priceSchema);


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

    // check if all holdings have unique tcgplayerId
    const holdingTcgplayerIds = holdingsToAdd.map((holding: IHolding) => {
      return holding.tcgplayerId
    })
    if (holdingTcgplayerIds.length > _.uniq(holdingTcgplayerIds).length) {
      console.log(`Duplicate tcgplayerIds detected in: ${holdingsToAdd}`)
      return false
    }

    // check if portfolio exists
    const portfolioDoc = await getPortfolio(portfolio)
    if (portfolioDoc instanceof Portfolio === false) {
      console.log(`${portfolioName} does not exist for userId: ${userId}`)
      return false
    }
    assert(portfolioDoc instanceof Portfolio)
 
    // check if all products exist
    const productDocs = await getProducts()
    const productTcgplayerIds = productDocs.map((doc: IMProduct) => {
      return doc.tcgplayerId
    })
    const unknownTcgplayerIds = _.difference(
      holdingTcgplayerIds, productTcgplayerIds)

    if (unknownTcgplayerIds.length > 0) {
      console.log(`Product not found for tcgplayerIds: ${unknownTcgplayerIds}`)
      return false
    }

    // check if any holding already exists
    const portfolioTcgplayerIds = portfolioDoc.getHoldings().map(
      (holding: IHolding) =>{ return holding.tcgplayerId })
    const existingHoldings = _.intersection(
      portfolioTcgplayerIds, holdingTcgplayerIds)

    if (existingHoldings.length > 0) {
      console.log(`Portoflio holdings exist for tcgplayerIds: ${existingHoldings}`)
      return false
    }

    // add holdings
    const holdings = holdingsToAdd.map((holding: IHolding) => {

      // get product doc
      const productDoc = productDocs.find((doc: IMProduct) => {
        return doc.tcgplayerId === holding.tcgplayerId
      })
      assert(productDoc instanceof Product)      

      return {
        product: productDoc._id,
        tcgplayerId: holding.tcgplayerId,
        transactions: holding.transactions
      } as IMHolding
    })
    console.log(holdings)

    portfolioDoc.addHoldings(holdings)
    return true
    
  } catch(err) {
    
    console.log(`An error occurred in addPortfolioHolding(): ${err}`)
    return false
  }
}

/*
DESC
  Adds a Portfolio based on the given inputs
INPUT
  userId: The associated userId
  portfolioName: The portfolio's name
  holdings: An array of Holdings
RETURN
  TRUE if the Portfolio was successfully created, FALSE otherwise
*/
export async function addPortfolio(portfolio: IPortfolio): Promise<boolean> {

  // connect to db
  await mongoose.connect(url)

  const userId = portfolio.userId
  const portfolioName = portfolio.portfolioName
  const holdings = portfolio.holdings

  try {

    // check if portfolioName exists for this userId
    const doc = await getPortfolio(portfolio)
    if (doc instanceof Portfolio) {
      console.log(`${portfolioName} already exists for userId: ${userId}`)
      return false
    } 

    // create the portfolio  
    await Portfolio.create({
      userId,
      portfolioName,
      holdings,
    })

    return true

  } catch(err) {

    console.log(`An error occurred in addPortfolio(): ${err}`)
    return false
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
    const doc = await getPortfolio(portfolio)
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

    console.log(`An error occurred in deletePortfolio(): ${err}`)
    return false
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
    const portfolioDoc = await getPortfolio(portfolio)
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

    console.log(`An error occurred in deletePortfolioHolding(): ${err}`)
    return false
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
export async function getPortfolio(
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

    console.log(`An error occurred in getPortfolio(): ${err}`)
    return null
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
    const portfolioDoc = await getPortfolio(portfolio)
    if (portfolioDoc instanceof Portfolio === false) {
      console.log(`Portfolio not found (${portfolio.userId}, ${portfolio.portfolioName})`)
    }
    assert(portfolioDoc instanceof Portfolio)

    // back up existing holdings
    const existingHoldings = portfolioDoc.holdings

    // remove any existing holdings
    portfolioDoc.holdings = []
    await portfolioDoc.save()

    // check if there are any holdings to add
    if (Array.isArray(holdingInput) && holdingInput.length === 0) {
      return true
    }

    // add all holdings
    const res = await addPortfolioHoldings(portfolio, holdingInput)

    if (!res) {
      console.log('addPortfolioHoldings() failed in setPortfolioHoldings()')
      portfolioDoc.holdings = existingHoldings
      await portfolioDoc.save()
      return false

    } else {
      await portfolioDoc.save()
      return true
    }

  } catch(err) {

    console.log(`An error occurred in setPortfolioHoldings(): ${err}`);
    return false
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

  // check if holdings is trying to be set
  if (key === 'holdings') {
    console.log('setPortfolioProperty() cannot set the holdings property, use setPortfolioHoldings() instead')
    return false
  }

  try {

    // check if Portfolio exists
    const portfolioDoc = await getPortfolio(portfolio)
    if (portfolioDoc instanceof Portfolio === false) {
      console.log(`Portfolio not found (${portfolio.userId}, ${portfolio.portfolioName})`)
    }
    assert(portfolioDoc instanceof Portfolio)

    // update Portfolio
    portfolioDoc.set(key, value)
    await portfolioDoc.save()

    return true

  } catch(err) {

    console.log(`An error occurred in setPortfolioProperty(): ${err}`);
    return false
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
interface IGetProductParameters {
  tcgplayerId?: number;
  hexStringId?: string;  // 24 char hex string
}
export async function getProduct(
  { tcgplayerId, hexStringId }: IGetProductParameters = {}
): Promise<HydratedDocument<IProduct> | null> {

  // check that tcgplayer_id or id is provided
  if (tcgplayerId === undefined && hexStringId === undefined) {
    console.log('No tcgplayerId or hexStringId provided to getProduct()') 
    return null
  }

  // connect to db
  await mongoose.connect(url)

  try {

    const doc = Number.isInteger(tcgplayerId)
      ? await Product.findOne({ 'tcgplayerId': tcgplayerId })
      : await Product.findById(hexStringId);
    return doc

  } catch(err) {

    console.log(`An error occurred in getProduct(): ${err}`)
    return null
  } 
}

/*
DESC
  Returns all Products
RETURN
  Array of Product docs
*/
export async function getProducts(): Promise<HydratedDocument<IMProduct>[]> {

  // connect to db
  await mongoose.connect(url);

  try {

    const docs = await Product.find({});
    return docs

  } catch(err) {

    console.log(`An error occurred in getProducts(): ${err}`)
    return []
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
  
    console.log(`An error occurred in insertProducts(): ${err}`)
    return -1
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
    const productDoc = await getProduct({tcgplayerId: tcgplayerId})
    if (productDoc instanceof Product === false) {
      console.log(`Product not found for tcgplayerId: ${tcgplayerId}`)
    }
    assert(productDoc instanceof Product)

    // update Product
    productDoc.set(key, value)
    await productDoc.save()

    return true

  } catch(err) {

    console.log(`An error occurred in setProductProperty(): ${err}`);
    return false
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

    // create map of Product tcgplayerId -> ObjectId
    const productDocs = await getProducts()
    let idMap = new Map<number, mongoose.Types.ObjectId>()
    productDocs.forEach(doc => {
      idMap.set(doc.tcgplayerId, doc._id)
    })

    // convert IPrice[] into IMPrice[]
    const priceDocs = docs.map(doc => {
      return {
        product: idMap.get(doc.tcgplayerId),
        ...doc
      } as IMPrice
    })

    const res = await Price.insertMany(priceDocs);
    return res.length
    
  } catch(err) {
  
    console.log(`An error occurred in insertPrices(): ${err}`);
    return -1
  }
}

async function main(): Promise<number> {

  let res

  // const product: IProduct = {
  //   tcgplayerId: 123,
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

  // const userId = 1234
  // const portfolioName = 'Alpha Investments'
  // let holdings = [
  //   {
  //     tcgplayerId: 233232,
  //     transactions: [
  //     {
  //       type: TransactionType.Sale,
  //       date: new Date(),
  //       price: 4.56,
  //       quantity: 999,
  //     }
  //     ]
  //   },
  //   {
  //     tcgplayerId: 449558,
  //     transactions: [
  //       {
  //       type: TransactionType.Purchase,
  //       date: new Date(),
  //       price: 789,
  //       quantity: 10,
  //       }
  //     ]
  //     }
  //   ]
  
  // const portfolio: IPortfolio = {
  //   userId: userId, 
  //   portfolioName: portfolioName,
  //   holdings: []
  // }
  
  // let tcgplayerId = 233232
  
  // // // -- Set portfolio holdings

  // res = await addPortfolioHoldings(portfolio, holdings)
  // if (res) {
  //   console.log('Portfolio holdings successfully added')
  // } else {
  //   console.log('Portfolio holdings not added')
  // }

  // // -- Add portfolio

  // res = await addPortfolio(userId, portfolioName, holdings)
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