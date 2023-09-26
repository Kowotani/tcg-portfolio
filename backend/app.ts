import { loadImageToS3 } from './aws/s3Manager'
import { 
  IDatedPriceData, IPopulatedPortfolio, IPortfolio, 
  IPrice, IPriceData, IProduct, TPortfolioPerformanceData,
  
  PerformanceMetric, TimeseriesGranularity,

  DeletePortfolioStatus, GetPortfolioPerformanceStatus, GetPortfoliosStatus, 
  GetPricesStatus, GetProductsStatus, PostLatestPriceStatus, PostPortfolioStatus, 
  PostPriceStatus, PostProductStatus, PutPortfolioStatus,
  
  TDataResBody, TDeletePortfolioReqBody, TGetPortfolioPerformanceResBody, 
  TPostLatestPriceReqBody, TPostPortfolioReqBody, TPostPriceReqBody, 
  TPutPortfolioReqBody, TPostProductReqBody, TProductPostResBody, TResBody, 

  LATEST_PRICES_URL, PORTFOLIO_URL, PORTFOLIO_PERFORMANCE_URL, PORTFOLIOS_URL, 
  PRICE_URL, PRODUCT_URL, PRODUCTS_URL, TDatedValue, 

  assert
} from 'common'
import express from 'express'
import { 
  addPortfolio, deletePortfolio, getLatestPrices, 
  getPortfolioMarketValueAsDatedValues, getPortfolioDoc, getPortfolios, 
  getProductDoc, getProductDocs, insertPrices, insertProducts, setPortfolio
} from './mongo/mongoManager'
import multer from 'multer'
import { loadCurrentPrice } from './scraper/scrapeManager'
import { isPortfolioDoc, isProductDoc } from './utils'

const upload = multer()
const app = express()

const port = 3030


// =========
// portfolio
// =========

/*
DESC
  Handle DELETE request to delete a Portfolio
INPUT
  Request body in multipart/form-data containing a TDeletePortfolioReqBody
RETURN
  TResBody response with status codes

  Status Code
    200: The Portfolio was successfully deleted
    204: The Portfolio does not exist
    500: An error occurred
*/
app.delete(PORTFOLIO_URL, upload.none(), async (req: any, res: any) => {

  // variables
  const body: TDeletePortfolioReqBody = req.body
  const portfolio: IPortfolio = {
    userId: body.userId,
    portfolioName: body.portfolioName,
    holdings: []
  }
  
  try {

    // check if Portfolio exists
    const portfolioDoc = await getPortfolioDoc(portfolio)
    if (!isPortfolioDoc(portfolioDoc)) {
      res.status(204)
      const body: TResBody = {
        message: DeletePortfolioStatus.DoesNotExist
      }
      res.send(body)

    } else {

      // delete portfolio
      const isDeleted = await deletePortfolio(portfolio)

      // success
      if (isDeleted) {
        res.status(200)
        const body: TResBody = {
          message: DeletePortfolioStatus.Success
        }
        res.send(body)
      
      // error
      } else {
        res.status(500)
        const body: TResBody = {
          message: DeletePortfolioStatus.Error
        }        
        res.send(body)
      }
    }

  // error
  } catch (err) {
    res.status(500)
    const body: TResBody = {
      message: `${DeletePortfolioStatus.Error}: ${err}`
    }        
    res.send(body)
  }
})

/*
DESC
  Handle POST request to add a Portfolio
INPUT
  Request body in multipart/form-data containing a TPostPortfolioReqBody
RETURN
  TResBody response with status codes

  Status Code
    200: The Portfolio was successfully created
    500: An error occurred
*/
app.post(PORTFOLIO_URL, upload.none(), async (req: any, res: any) => {

  // variables
  const body: TPostPortfolioReqBody = req.body
  const portfolio = body.portfolio
  
  try {

    // create Portfolio
    const isCreated = await addPortfolio(portfolio)

    // success
    if (isCreated) {
      res.status(200)
      const body: TResBody = {
        message: PostPortfolioStatus.Success
      }
      res.send(body)
    
    // error
    } else {
      res.status(500)
      const body: TResBody = {
        message: PostPortfolioStatus.Error
      }        
      res.send(body)
    }

  // error
  } catch (err) {
    res.status(500)
    const body: TResBody = {
      message: `${PostPortfolioStatus.Error}: ${err}`
    }        
    res.send(body)
  }
})

/*
DESC
  Handle PUT request to update a Portfolio
INPUT
  Request body in multipart/form-data containing a TPutPortfolioReqBody
RETURN
  TResBody response with status codes

  Status Code
    200: The Portfolio was successfully updated
    500: An error occurred
*/
app.put(PORTFOLIO_URL, upload.none(), async (req: any, res: any) => {

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
        message: PutPortfolioStatus.Success
      }
      res.send(body)
    
    // error
    } else {
      res.status(500)
      const body: TResBody = {
        message: PutPortfolioStatus.Error
      }        
      res.send(body)
    }

  // error
  } catch (err) {
    res.status(500)
    const body: TResBody = {
      message: `${PutPortfolioStatus.Error}: ${err}`
    }        
    res.send(body)
  }
})

/*
DESC
  Handle GET request to retrieve performance data for the input Portfolio and
  date range
INPUT
  Request query parameters:
    userId: The userId who owns the Portfolio
    portfolioName: The name of the Portfolio
    startDate: The start date for performance calculation
    endDate: The end date for performance calculation
    metrics: An array of PerformanceMetrics
RETURN
  TGetPortfolioPerformanceResBody response with status codes

  Status Code
    200: The Portfolio performance data was retrieved successfully
    500: An error occurred
*/
app.get(PORTFOLIO_PERFORMANCE_URL, async (req: any, res: any) => {

  try {

    // get portfolio
    const portfolioDoc = await getPortfolioDoc({
      userId: req.query.userId,
      portfolioName: req.query.portfolioName,
      holdings: []
    })
    assert(isPortfolioDoc(portfolioDoc), 'Could not find Portfolio')
    const startDate = new Date(Date.parse(req.query.startDate))
    const endDate = new Date(Date.parse(req.query.endDate))
    const metrics = req.query.metrics as PerformanceMetric[]

    // create performance data object
    let performanceData: TPortfolioPerformanceData = {}

    for (const metric of metrics) {

      let fn: (a1: IPortfolio, a2: Date, a3: Date) => Promise<TDatedValue[]>

      switch(metric) {
        case PerformanceMetric.MarketValue:
          fn = getPortfolioMarketValueAsDatedValues
          break
        default:
          const err = `Unknown metric: ${metric}`
          throw new Error(err)
      }

      const values = await fn(portfolioDoc, startDate, endDate)
      performanceData[metric] = values
    }    

    // return performance data
    res.status(200)
    
    const body: TGetPortfolioPerformanceResBody = {
      data: performanceData,
      message: GetPortfolioPerformanceStatus.Success
    }
    res.send(body)

  // error
  } catch (err) {
    res.status(500)
    const body: TResBody = {
      message: `${GetPortfolioPerformanceStatus.Error}: ${err}`
    }
    res.send(body)
  }
})

/*
DESC
  Handle GET request for all IPopulatedPortfolios for the input userId
INPUT
  Request query parameters:
    userId: The userId who owns the Portfolios
RETURN
  Response body with status codes and messages

  Status Code
    200: The Portfolio documents were retrieved successfully
    500: An error occurred
*/
app.get(PORTFOLIOS_URL, async (req: any, res: any) => {

  try {

    // query Portfolios
    const userId = req.query.userId as number
    const data = await getPortfolios(userId)

    // return Portfolios
    res.status(200)
    
    const body: TDataResBody<IPopulatedPortfolio[]> = {
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


// ======
// prices
// ======

/*
DESC
  Handle GET request for latest Prices of all Products
RETURN
  Response body with status codes and messages

  Status Code
    200: The Prices were returned successfully
    500: An error occurred
*/
app.get(LATEST_PRICES_URL, async (req: any, res: any) => {

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

/*
DESC
  Handle POST request to load the current Price for a tcgplayerId
INPUT
  Request body in multipart/form-data containing a TPostLatestPriceReqBody
RETURN
  Response body with status codes and messages

  Status Code
    201: The Price was loaded successfully
    500: An error occurred
*/
app.post(LATEST_PRICES_URL, upload.none(), async (req: any, res: any) => {

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
    const isLoaded = await loadCurrentPrice(tcgplayerId)
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
INPUT
  Request body in multipart/form-data containing a TPostPriceReqBody  
RETURN
  Response body with status codes and messages

  Status Code
    201: The Price was added successfully
    500: An error occurred
*/
app.post(PRICE_URL, upload.none(), async (req: any, res: any) => {

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


// =======
// product
// =======

/*
DESC
  Handle POST request to add a Product
INPUT
    Request body in multipart/form-data containing a TPostProductReqBody 
RETURN
  TProductPostResBody response with status codes

  Status Code
    201: The Product was successfully added
    202: The Product already exists
    500: An error occurred
*/
app.post(PRODUCT_URL, upload.none(), async (req: any, res: any) => {

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
app.get(PRODUCTS_URL, async (req: any, res: any) => {

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