import { loadImageToS3 } from './aws/s3Manager'
import { 
  IDatedPriceData, IPrice, IPriceData, IProduct, TimeseriesGranularity,

  GetPortfoliosStatus, GetPricesStatus, GetProductsStatus, 
  PostLatestPriceStatus, PostPriceStatus, PostProductStatus, 
  PutPortfoliosStatus,
  
  
  TDataResBody, TPostLatestPriceReqBody, 
  TPostPriceReqBody, TPutPortfolioReqBody, TPostProductReqBody, 
  TProductPostResBody, TResBody, 

  ADD_LATEST_PRICE_URL, ADD_PRICE_URL, CRUD_PORTFOLIO_URL, CRUD_PRODUCT_URL,
  GET_LATEST_PRICES_URL, GET_PORTFOLIOS_URL, GET_PRODUCTS_URL, 
} from 'common'
import express from 'express'
import { 
  getLatestPrices, getPortfolios, getProductDoc, getProductDocs, insertPrices, 
  insertProducts, setPortfolio
} from './mongo/mongoManager'
import multer from 'multer'
import { loadPrice } from './scraper/scrapeManager'
import { isProductDoc } from './utils'

const upload = multer()
const app = express()

const port = 3030


// =========
// portfolio
// =========

/*
DESC
  Handle GET request for all IPopulatedPortfolios for the input userId
INPUT
  userId: The userId who owns the Portfolios
RETURN
  Response body with status codes and messages

  Status Code
    200: The Portfolio documents were returned successfully
    500: An error occurred
*/
app.get(GET_PORTFOLIOS_URL, async (req: any, res: any) => {

  try {

    // query Portfolios
    const userId = req.query.userId
    const data = await getPortfolios(userId)

    // return Portfolios
    res.status(200)
    // TODO: Add a type inference for this
    const body = {
      data: data,
      message: GetPortfoliosStatus.Success
    }
    res.send(body)

  // error
  } catch (err) {
    res.status(500)
    const body: TResBody = {
      message: `${GetPortfoliosStatus.Error}: ${err}`
    }
    res.send(body)
  }
})

/*
DESC
  Handle PUT request to update a Portfolio
INPUT
  Request body in multipart/form-data containing the following structure
  for both existingPortfolio and newPortfolio objects:
    userId: The Portfolio userId
    portfolioName: The Portfolio name
    holdings: An IHolding[]
    description?: The Portfolio description
RETURN
  TResBody response with status codes

  Status Code
    200: The Portfolio was successfully updated
    500: An error occurred
*/
app.put(CRUD_PORTFOLIO_URL, upload.none(), async (req: any, res: any) => {

  // variables
  const body: TPutPortfolioReqBody = req.body
  
  try {

    // update Portfolio
    const isUpdated 
      = await setPortfolio(body.existingPortfolio, body.newPortfolio)

    // success
    if (isUpdated) {
      res.status(200)
      const body: TResBody = {
        message: PutPortfoliosStatus.Success
      }
      res.send(body)
    
    // error
    } else {
      res.status(500)
      const body: TResBody = {
        message: PutPortfoliosStatus.Error
      }        
      res.send(body)
    }

  // error
  } catch (err) {
    res.status(500)
    const body: TResBody = {
      message: `${PutPortfoliosStatus.Error}: ${err}`
    }        
    res.send(body)
  }
  
})


// ======
// prices
// ======

/*
DESC
  Handle POST request to load the latest Price for a tcgplayerId
RETURN
  Response body with status codes and messages

  Status Code
    201: The Price was loaded successfully
    500: An error occurred
*/
app.post(ADD_LATEST_PRICE_URL, upload.none(), async (req: any, res: any) => {

  try {

    // get tcgplayerId
    const body: TPostLatestPriceReqBody = req.body
    const tcgplayerId = body.tcgplayerId

    // check if Product exists
    const productDoc = await getProductDoc({tcgplayerId: tcgplayerId})
    if (!isProductDoc(productDoc)) {
      const errMsg = `Product not found for tcgplayerId: ${tcgplayerId}`
      throw new Error(errMsg)
    }

    // load latest Price
    const isLoaded = await loadPrice(tcgplayerId)
    if (isLoaded) {
      res.status(201)
      const body: TResBody = {
        message: PostLatestPriceStatus.Success
      }
      res.send(body)

    // error
    } else {
      res.status(500)
      const body: TResBody = {
        message: PostLatestPriceStatus.Error
      }
      res.send(body)
    }


  // error
  } catch (err) {
    res.status(500)
    const body: TResBody = {
      message: `${PostPriceStatus.Error}: ${err}`
    }
    res.send(body)
  }

})

/*
DESC
  Handle POST request to add a Price
RETURN
  Response body with status codes and messages

  Status Code
    201: The Price was added successfully
    500: An error occurred
*/
app.post(ADD_PRICE_URL, upload.none(), async (req: any, res: any) => {

  try {

    // create IPrice
    const body: TPostPriceReqBody = req.body
    let priceData: IPriceData = {
      marketPrice: body.marketPrice
    }
    if (body.buylistMarketPrice) {
      priceData['buylistMarketPrice'] = body.buylistMarketPrice
    }
    if (body.listedMedianPrice) {
      priceData['listedMedianPrice'] = body.listedMedianPrice
    }
    const price: IPrice = {
      tcgplayerId: body.tcgplayerId,
      priceDate: body.priceDate,
      prices: priceData,
      granularity: TimeseriesGranularity.Hours
    }

    // check if Product exists
    const productDoc = await getProductDoc({tcgplayerId: price.tcgplayerId})
    if (!isProductDoc(productDoc)) {
      const errMsg = `Product not found for tcgplayerId: ${price.tcgplayerId}`
      throw new Error(errMsg)
    }

    // add Price
    const numInserted = await insertPrices([price])

    // success
    if (numInserted === 1) {
      res.status(201)
      const body: TDataResBody<IPrice> = {
        data: price,
        message: PostPriceStatus.Success
      }
      res.send(body)

    // error
    } else {
      res.status(500)
      const body: TResBody = {
        message: PostPriceStatus.Error
      }
      res.send(body)
    }

  // error
  } catch (err) {
    res.status(500)
    const body: TResBody = {
      message: `${PostPriceStatus.Error}: ${err}`
    }
    res.send(body)
  }
})

/*
DESC
  Handle GET request for latest Prices of all Products
RETURN
  Response body with status codes and messages

  Status Code
    200: The Prices were returned successfully
    500: An error occurred
*/
app.get(GET_LATEST_PRICES_URL, async (req: any, res: any) => {

  try {

    // query Prices
    const latestPrices = await getLatestPrices()

    // return Prices
    res.status(200)
    const body: TDataResBody<{[tcgplayerId: number]: IDatedPriceData}> = {
      data: Object.fromEntries(latestPrices),
      message: GetPricesStatus.Success
    }
    res.send(body)

  // error
  } catch (err) {
    res.status(500)
    const body: TResBody = {
      message: `${GetPricesStatus.Error}: ${err}`
    }
    res.send(body)
  }
})


// =======
// product
// =======

/*
DESC
  Handle POST request to add a Product
INPUT
  Request body in multipart/form-data containing
    tcgplayerId: The TCGplayer product id
    releaseDate: Product release date in YYYY-MM-DD format
    name: Product name
    type: ProductType enum
    language: ProductLanguage enum
    subtype?: ProductSubType enum
    setCode?: Product set code
RETURN
  TProductPostResBody response with status codes

  Status Code
    201: The Product was successfully added
    202: The Product already exists
    500: An error occurred
*/
app.post(CRUD_PRODUCT_URL, upload.none(), async (req: any, res: any) => {

  // variables
  const body: TPostProductReqBody = req.body
  const data = body.formData
  const tcgplayerId = data.tcgplayerId

  // check if product already exists (via tcgplayerId)
  const productDoc = await getProductDoc({tcgplayerId: tcgplayerId})
  if (isProductDoc(productDoc)) { 
    res.status(202)
    const body: TProductPostResBody<undefined> = {
      tcgplayerId: data.tcgplayerId,
      message: PostProductStatus.AlreadyExists,
      data: undefined,
    }
    res.send(body)

  } else {
  
    try {
      // add product
      const numInserted = await insertProducts([data])

      // load image to S3
      const isImageLoaded = body.imageUrl
        ? await loadImageToS3(tcgplayerId, body.imageUrl)
        : false

      // success
      if (numInserted > 0) {
        res.status(201)
        const body: TProductPostResBody<IProduct> = {
          tcgplayerId: data.tcgplayerId,
          message: isImageLoaded
            ? PostProductStatus.Added
            : PostProductStatus.AddedWithoutImage,
          data: data,
        }
        res.send(body)
      
      // error
      } else {
        res.status(500)
        const body: TProductPostResBody<undefined> = {
          tcgplayerId: data.tcgplayerId,
          message: PostProductStatus.Error,
          data: undefined,
        }        
        res.send(body)
      }

    // error
    } catch (err) {
      res.status(500)
      const body: TProductPostResBody<undefined> = {
        tcgplayerId: data.tcgplayerId,
        message: `${PostProductStatus.Error}: ${err}`,
        data: undefined,
      }        
      res.send(body)
    }
  }
  
})

/*
DESC
  Handle GET request for all Product documents
RETURN
  Response body with status codes and messages

  Status Code
    200: The Product documents were returned successfully
    500: An error occurred
*/
app.get(GET_PRODUCTS_URL, async (req: any, res: any) => {

  try {

    // query Products
    const data = await getProductDocs()

    // return Products
    res.status(200)
    const body: TDataResBody<IProduct[]> = {
      data: data,
      message: GetProductsStatus.Success
    }
    res.send(body)

  // error
  } catch (err) {
    res.status(500)
    const body: TResBody = {
      message: `${GetProductsStatus.Error}: ${err}`
    }
    res.send(body)
  }
})


app.listen(port, () => {
  console.log(`Started server at http://localhost:${port}`)
})