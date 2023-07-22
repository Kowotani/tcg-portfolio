// imports
import { ProductPostStatus, TProductPostBody } from 'common';
import express from 'express';
import { insertProducts, getProduct } from './mongo/mongoManager';
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
DESC: handle request to add a product
INPUT: request body in multipart/form-data containing
  tcgplayerId - the TCGplayer product id
  releaseDate - product release date in YYYY-MM-DD format
  name - product name
  type - ProductType enum
  language - ProductLanguage enum
  subtype [OPTIONAL] - ProductSubType enum
  setCode [OPTIONAL] - product set code
  
*/
app.post('/product', upload.none(), async (req: any, res: any) => {

  // variables
  const body: TProductPostBody = req.body
  const data = body.formData
  const tcgPlayerId = data.tcgplayerId as number

  // check if product already exists (via tcgplayerId)
  const query = await getProduct({tcgplayerId: tcgPlayerId}); 
  if (query !== null) { 
    res.status(202)
    const body = {
      tcgplayerId: data.tcgplayerId,
      message: ProductPostStatus.AlreadyExists,
    }
    res.send(body)

  } else {
  
    // add product
    const numInserted = await insertProducts([data]);

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
        message: 'Error creating Product doc',
      }        
      res.send(body)
    }
  }
});


app.listen(port, () => {
  console.log(`Started server at http://localhost:${port}`)
})