// imports

const express = require('express');
const mongoDB = require('./backend/mongoManager');
const multer = require('multer');
const utils = require('./utils');

const upload = multer();
const app = express();

app.use(upload.array());    // parse multipart/form-data

// app.use(express.static('public'));  // serve static files from public
const port = 3000;

app.get('/', (req, res) => {
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
app.post('/product', async (req, res) => {
        const data = req.body;

        // // check if product already exists (via tcgplayer_id)
        // const query = await mongoDB.getDocById(
        //     'products', 'tcgplayer_id', Number(data.tcgplayer_id));
        // // TODO: change this to signal an error
        // if (query) { res.send('Product already exists'); }

        // validate data
        const isValid = utils.isValidProductData(data);
        
        // add product
        await mongoDB.insertDocs('product', [data]);
        res.send('Product added: ' + JSON.stringify(data));

    });


app.listen(port, () => {
    console.log(`Started server at http://localhost:${port}`)
})