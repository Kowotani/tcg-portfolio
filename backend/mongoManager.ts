// imports
import { Document } from 'mongoose';
import mongoose from 'mongoose';
import { IPrice, priceSchema } from './models/priceSchema';
import { IProduct, productSchema } from './models/productSchema';

// get mongo client
const url = 'mongodb://localhost:27017/tcgPortfolio';

// mongoose models
const Product = mongoose.model('product', productSchema);
const Price = mongoose.model('price', priceSchema);


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
interface IGetProductParameters {
    tcgplayerId?: Number;
    hexStringId?: String;    // 24 char hex string
}
export async function getProduct({ tcgplayerId, hexStringId }: IGetProductParameters = {}): Promise<any> {

    // check that tcgplayer_id or id is provided
    if (tcgplayerId === undefined && hexStringId === undefined) { 
        return null; 
    }

    // connect to db
    await mongoose.connect(url);  

    try {

        const doc = tcgplayerId !== undefined
            ? await Product.find({ 'tcgplayerId': tcgplayerId })
            : await Product.findById(hexStringId);
        if (doc !== null) { return doc; }

    } catch(err) {

        console.log(`An error occurred in getProduct(): ${err}`);
    } 
    
    return null;
}

/*
DESC
    Returns all Products
RETURN
    Array of Product docs
*/
// interface IProductIds {
//     /*
//         hex string representation of an ObjectId 
//         see https://masteringjs.io/tutorials/mongoose/objectid
//     */
//     hexStringId: String,     
//     tcgplayerId: Number
// }
export async function getProducts(): Promise<any[]> {

    // connect to db
    await mongoose.connect(url);

    try {

        const docs = await Product.find({});
        return docs;

    } catch(err) {

        console.log(`An error occurred in getProducts(): ${err}`);
    }

    return [];
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
export async function insertDocs(model: string, data: any): Promise<any> {

    // get schema
    let schema: any;
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

/*
DESC
    Constructs Price documents from the input data and inserts them
INPUT 
    An array of IPrice objects
RETURN
    The number of documents inserted
*/
export async function insertPrices(docs: IPrice[]): Promise<Number> {

    // connect to db
    await mongoose.connect(url);

    try {

        const res = await Price.insertMany(docs);
        return res.length;
        
    } catch(err) {
    
        console.log(`An error occurred in insertPrices(): ${err}`);
        return -1;
    }
}

// async function main() {
//     let ids = await getProductIds();
//     console.log(ids);
// }

// main()
//     .then(console.log)
//     .catch(console.error);