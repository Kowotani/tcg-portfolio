// imports
const mongoose = require('mongoose');
const { productSchema } = require('./models/productSchema');

// get mongo client
const url = 'mongodb://localhost:27017/tcgPortfolio';


// =========
// functions
// =========

/*
DESC
    Retrieves the Product document by tcgplayer_id or _id
INPUT
    tcgplayer_id: The Product's tcgplayer_id (higher priority)
    id: The Product's document _id
RETURN
    The document if found, else null
*/
async function getProduct({tcgplayer_id = null, id = null} = {}) {

    // check that tcgplayer_id or id is provided
    if (!(tcgplayer_id || id)) { return null; }

    let doc = null;

    // connect to db
    await mongoose.connect(url);  

    try {
        
        const Product = mongoose.model('product', productSchema);
        doc = tcgplayer_id 
            ? await Product.find({ 'tcgplayer_id': tcgplayer_id })
            : await Product.findById(id);

    } catch(err) {

        console.log(`An error occurred in getProduct(): ${err}`);
    } 
    
    return doc;
}

/*
DESC
    Returns the product ids for all known products
RETURN
    Array of product objects containing
        id: Document ObjectID
        tcgplayer_id: Document tcgplayer_id
*/
async function getProductIds() {

    // connect to db
    await mongoose.connect(url);

    try {

        const Product = mongoose.model('product', productSchema);
        const docs = await Product.find({});
        const ids = docs.map(
            doc => {
                return {
                    'id': doc._id,
                    'tcgplayer_id': doc.tcgplayer_id
                }
            }
        );

        return ids;

    } catch(err) {

        console.log(`An error occurred in getProductIds(): ${err}`);
    }

    return null;
}

/*
DESC
    Inserts documents constructed from the input data for the specified model
INPUT 
    model: The name of the document model (mongoose automatically looks for
        the plural lowercase version of the model as the collection)
    data: An array of object data from which to construct the documents
RETURN
    The number of documents inserted
*/
async function insertDocs(model, data) {

    // get schema
    let schema;
    switch (model) {
        case 'product':
            schema = productSchema;
            break;
        case 'price':
            schema = null;
            break;
    }
    const Model = mongoose.model(model, schema);

    // connect to db
    await mongoose.connect(url);

    try {

        const res = await Model.insertMany(data);
        
    } catch(err) {
    
        console.log(`An error occurred in insertDocs(): ${err}`);
    }

    return 0;
}

// async function main() {
//     let ids = await getProductIds();
//     console.log(ids);
// }

// main()
//     .then(console.log)
//     .catch(console.error);

module.exports = { getProduct, getProductIds, insertDocs };