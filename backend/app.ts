// imports
import { ProductPostStatus, ProductsGetStatus, TProductPostBody } from 'common';
import express from 'express';
import { getProduct, getProducts, insertProducts } from './mongo/mongoManager';
import multer from 'multer';
import { loadImageToS3 } from './aws/s3Manager';

const upload = multer();
const app = express();

const port = 3030;

app.get('/', (req: any, res: any) => {
  res.send('Hello World!');
});


// =======
// product
// =======

/*
DESC
  Handle request for documents of all Products
RETURN
  Response body with status codes and messages

  Status Code
    200: The Product documents were returned successfully
    500: An error occurred
*/
app.get('/products', async (req: any, res: any) => {

  try {

    // query Products
    const data = await getProducts()

    // return Products
    res.status(200)
    const body = {
      data: data,
      message: ProductsGetStatus.Success
    }
    res.send(body)

  // error
  } catch (err) {
    res.status(500)
    const body = {
      message: ProductPostStatus.Error + ': ' + err
    }
    res.send(body)
  }
})

/*
DESC
  Handle request to add a Product
INPUT
  Request body in multipart/form-data containing
    tcgplayerId: The TCGplayer product id
    releaseDate: Product release date in YYYY-MM-DD format
    name: Product name
    type: ProductType enum
    language: ProductLanguage enum
    subtype [OPTIONAL]: ProductSubType enum
    setCode [OPTIONAL]: Product set code
RETURN
  Response body with status codes and messages

  Status Code
    201: The Product was successfully added
    202: The Product already exists
    500: An error occurred
*/
app.post('/product', upload.none(), async (req: any, res: any) => {

  // variables
  const body: TProductPostBody = req.body
  const data = body.formData
  const tcgPlayerId = data.tcgplayerId as number

  // check if product already exists (via tcgplayerId)
  const query = await getProduct({tcgplayerId: tcgPlayerId})
  if (query !== null) { 
    res.status(202)
    const body = {
      tcgplayerId: data.tcgplayerId,
      message: ProductPostStatus.AlreadyExists,
    }
    res.send(body)

  } else {
  
    try {

      // add product
      const numInserted = await insertProducts([data])

      // load image to S3
      const isImageLoaded = body.imageUrl
        ? await loadImageToS3(tcgPlayerId, body.imageUrl)
        : false

      // success
      if (numInserted > 0) {
        res.status(201)
        const body = {
          tcgplayerId: data.tcgplayerId,
          message: isImageLoaded
            ? ProductPostStatus.Added
            : ProductPostStatus.AddedWithoutImage,
          data: data,
        }
        res.send(body)
      
      // error
      } else {
        res.status(500)
        const body = {
          tcgplayerId: data.tcgplayerId,
          message: ProductPostStatus.Error,
        }        
        res.send(body)
      }

    // error
    } catch (err) {
      res.status(500)
      const body = {
        tcgplayerId: data.tcgplayerId,
        message: ProductPostStatus.Error + ': ' + err,
      }        
      res.send(body)
    }
  }
})


app.listen(port, () => {
  console.log(`Started server at http://localhost:${port}`)
})