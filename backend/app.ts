// imports

import express from 'express';
import { insertProducts, getProduct } from './mongo/mongoManager';
import multer from 'multer';

const upload = multer();
const app = express();

// app.use(upload);    // parse multipart/form-data

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

        const data = req.body;

        // check if product already exists (via tcgplayerId)
        const query = await getProduct({tcgplayerId: Number(data.tcgplayerId)}); 
        if (query !== null) { 
            res.status(400)
            res.send(`tcgplayerId already exists: ${data.tcgplayerId}`)

        } else {
        
            // add product
            const numInserted = await insertProducts([data]);

            // success
            if (numInserted > 0) {
                res.status(201)
                res.send(JSON.stringify(data))

            // error
            } else {
                res.status(500)
                res.send('Error inserting Product docs')
            }
        }
    });


app.listen(port, () => {
    console.log(`Started server at http://localhost:${port}`)
})