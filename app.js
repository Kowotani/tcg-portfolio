// imports

const express = require('express');
const multer = require('multer');
const mongoDB = require('./backend/mongoManager');
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

        // check if product already exists (via tcgplayer_id)
        const query = await mongoDB.getDocById(
            'products', 'tcgplayer_id', Number(data.tcgplayer_id));
        // TODO: change this to signal an error
        if (query) { res.send('Product already exists'); }

        // validate data
        const isValid = utils.isValidProductData(data);

        // construct doc
        doc = {
            tcgplayer_id: Number(data.tcgplayer_id),
            tcg: data.tcg,
            release_date: new Date(data.release_date),
            product: {
                name: data.name,
                type: data.type,
            }
        }
        if ('subtype' in data) { doc.product['subtype'] = data.subtype; }
        if ('set_code' in data) { doc.product['set_code'] = data.set_code; }
        
        // add product
        const insert = await mongoDB.insertDocs('products', [doc]);
        res.send('Product added: ' + JSON.stringify(doc));

    });


app.listen(port, () => {
    console.log(`Started server at http://localhost:${port}`)
})