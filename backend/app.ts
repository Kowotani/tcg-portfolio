// imports
import { 
  IDatedPriceData, IProduct,

  GetPortfoliosStatus, GetPricesStatus, GetProductsStatus, PostProductStatus,
  
  TDataResBody, TProductPostReqBody, TProductPostResBody, TResBody, 

  ADD_PRODUCT_URL, GET_LATEST_PRICES_URL, GET_PORTFOLIOS_URL, GET_PRODUCTS_URL
} from 'common'
import express from 'express'
import { 
  getLatestPrices, getPortfolios, getProductDoc, getProductDocs, insertProducts,

  Product
} from './mongo/mongoManager'
import multer from 'multer'
import { loadImageToS3 } from './aws/s3Manager'

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
      message: GetPortfoliosStatus.Error + ': ' + err
    }
    res.send(body)
  }
})


// =======
// prices
// =======

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
    const data = await getLatestPrices()

    // return Prices
    res.status(200)
    const body: TDataResBody<{[tcgplayerId: number]: IDatedPriceData}> = {
      data: Object.fromEntries(data),
      message: GetPricesStatus.Success
    }
    res.send(body)

  // error
  } catch (err) {
    res.status(500)
    const body: TResBody = {
      message: GetPricesStatus.Error + ': ' + err
    }
    res.send(body)
  }
})


// =======
// product
// =======

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
      message: PostProductStatus.Error + ': ' + err
    }
    res.send(body)
  }
})

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
app.post(ADD_PRODUCT_URL, upload.none(), async (req: any, res: any) => {

  // variables
  const body: TProductPostReqBody = req.body
  const data = body.formData
  const tcgplayerId = data.tcgplayerId

  // check if product already exists (via tcgplayerId)
  const query = await getProductDoc({tcgplayerId: tcgplayerId})
  if (query instanceof Product) { 
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
        message: PostProductStatus.Error + ': ' + err,
        data: undefined,
      }        
      res.send(body)
    }
  }
  
})


app.listen(port, () => {
  console.log(`Started server at http://localhost:${port}`)
})