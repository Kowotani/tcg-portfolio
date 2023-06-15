// imports
const { MongoClient } = require('mongodb')

// get mongo client
const url = 'mongodb://localhost:27017'
const client = new MongoClient(url)

// db
const dbName = 'tcgPortfolio'
const productCollName = 'products'

/*
DESC: Returns the tcgplayer_id of all known products in mongodb
RETURN: Array of tcgplayer_ids
*/
async function getProductIds() {
    // connect to db
    await client.connect()
    // console.log('Connected to server')

    // retrieve tcgplayer_id from all known products
    const db = client.db(dbName)
    const collection = db.collection(productCollName)
    const docs = await collection.find({}).toArray();
    const ids = docs.map(doc => doc.tcgplayer_id)

    client.close()

    return ids
}

module.exports = { getProductIds }