// imports

import express from 'express';
import { insertDocs, getProduct } from './backend/mongoManager';
import multer from 'multer';
// const utils = require('./utils');

const upload = multer();
const app = express();

// app.use(upload);    // parse multipart/form-data

// app.use(express.static('public'));  // serve static files from public
const port = 3000;

app.get('/', (req: any, res: any) => {
    res.send('Hello World!');
});


// =======
// product
// =======

/*
DESC: handle request to add a product
INPUT: request body in multipart/form-data containing
    tcgplayer_id - the TCGplayer product id
    release_date - product release date in YYYY-MM-DD format
    name - product name
    type - ProductType enum
    language - ProductLanguage enum
    subtype [OPTIONAL] - ProductSubType enum
    set_code [OPTIONAL] - product set code
    
*/
app.post('/product', upload.none(), async (req: any, res: any) => {

        const data = req.body;

        // check if product already exists (via tcgplayer_id)
        const query = await getProduct(
            {tcgplayer_id: Number(data.tcgplayer_id)});
        console.log(query);    
        if (query === null) { 

            res.send('Product already exists'); 

        } else {
        
            // add product
            await insertDocs('product', [data]);
            res.send('Product added: ' + JSON.stringify(data));
        }
    });


app.listen(port, () => {
    console.log(`Started server at http://localhost:${port}`)
})