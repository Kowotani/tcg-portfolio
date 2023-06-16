// imports
const { MongoClient } = require('mongodb');

// get mongo client
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// db
const dbName = 'tcgPortfolio';

/*
DESC: Returns the tcgplayer_id of all known products in mongodb
RETURN: Array of tcgplayer_ids
*/
async function getProductIds() {
    const collectionName = 'products';

    // connect to db
    await client.connect();
    // console.log('Connected to server')

    // retrieve tcgplayer_id from all known products
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const docs = await collection.find({}).toArray();
    const ids = docs.map(doc => doc.tcgplayer_id);

    client.close();

    return ids;
}

/*
DESC: Inserts documents into the specified collection
INPUT: 
    collectionName: The name of the collection
    docs: An array of documents 
RETURN: The number of documents inserted
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
        
        console.log(results);
        numInserted = numDocs === 1 ? 1 : results.insertedCount;
        console.log(`Inserted: ${numInserted} document(s) into [${collectionName}]`);
        
    } catch(err) {
    
        numInserted = err.result.insertedCount;
        console.log(`An error occurred while inserting into [${collectionName}]: ${err}`);
        console.log(`There were ${numInserted} documents inserted`);
    }

    client.close();

    return numInserted;
}

module.exports = { getProductIds, insertDocs }