// imports
const mongoose = require('mongoose');
const { productSchema } = require('./models/productSchema');
const utils = require('../utils');

// get mongo client
const url = 'mongodb://localhost:27017/tcgPortfolio';


// =========
// functions
// =========

/*
DESC
    Retrieves one document from the input named collection by the input ID 
    following the path to the ID
INPUT
    collectionName: The name of the collection
    path: The path from the root of the doc to the ID
    id: The ID on which to match
RETURN
    The first document that is found, else null
*/
async function getDocById(collectionName, path, id) {

    let doc = null;

    // connect to db
    await mongoose.connect(url);

    const db = client.db(dbName);
    const collection = db.collection(collectionName);    

    try {

        const query = {[path]: id};
        doc = await collection.findOne(query);

    } catch(err) {

        console.log(`An error occurred in getDocById(): ${err}`);

    } finally {
        await client.close();
    }
    
    return doc;
}

/*
DESC
    Returns the product ids for all known products
RETURN
    Array of product objects containing
        _id: mongo ObjectID
        tcgplayer_id: the TCGPlayer product ID
*/
async function getProductIds() {
    const collectionName = 'products';

    // connect to db
    await mongoose.connect(url);
    // console.log('Connected to server')

    // retrieve tcgplayer_id from all known products
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    try {

        const docs = await collection.find({}).toArray();
        const ids = docs.map(
            doc => {
                return {
                    'id': doc._id,
                    'tcgplayer_id': doc.tcgplayer_id
                }
            }
        );

    } catch(err) {

        console.log(`An error occurred in getProductIds(): ${err}`);

    } finally {
        client.close();
    }

    return ids;
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
        // console.log(res);
        
    } catch(err) {
    
        console.log(`An error occurred in insertDocs(): ${err}`);
    }

    return 0;
}


module.exports = { getDocById, getProductIds, insertDocs };