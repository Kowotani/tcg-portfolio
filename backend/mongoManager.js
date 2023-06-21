// imports
const { MongoClient } = require('mongodb');

// get mongo client
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// db
const dbName = 'tcgPortfolio';

\
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
    await client.connect();

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
    await client.connect();
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
    Inserts documents into the specified collection
INPUT 
    collectionName: The name of the collection
    docs: An array of documents 
RETURN
    The number of documents inserted
*/
async function insertDocs(collectionName, docs) {

    // variables
    const numDocs = docs.length;
    let numInserted = 0;

    // connect to db
    await client.connect();
    // console.log('Connected to server')

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    try {

        const results = numDocs === 1
            ? await collection.insertOne(docs[0])
            : await collection.insertMany(docs);
        
        // console.log(results);
        numInserted = numDocs === 1 ? 1 : results.insertedCount;
        console.log(`Inserted: ${numInserted} document(s) into [${collectionName}]`);
        
    } catch(err) {
    
        numInserted = err.result.insertedCount;
        console.log(`An error occurred in insertDocs(): ${err}`);
        // console.log(`There were ${numInserted} documents inserted`);

    } finally {
        client.close();
    }

    return numInserted;
}

module.exports = { getDocById, getProductIds, insertDocs }