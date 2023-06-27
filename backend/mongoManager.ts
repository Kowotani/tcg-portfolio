// imports
import { Schema } from 'mongoose';
import mongoose from 'mongoose';
import { productSchema } from './models/productSchema';

// get mongo client
const url = 'mongodb://localhost:27017/tcgPortfolio';

// mongoose models
const Product = mongoose.model('product', productSchema);


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
    tcgplayer_id?: Number;
    id?: String;
}
export async function getProduct({ tcgplayer_id, id }: IGetProductParameters = {}): Promise<any> {

    // check that tcgplayer_id or id is provided
    if (tcgplayer_id === undefined && id === undefined) { 
        return null; 
    }

    let docs: any;

    // connect to db
    await mongoose.connect(url);  

    try {

        docs = tcgplayer_id !== undefined
            ? await Product.find({ 'tcgplayer_id': tcgplayer_id })
            : await Product.findById(id);

    } catch(err) {

        console.log(`An error occurred in getProduct(): ${err}`);
    } 
    
    return docs.length > 0 ? docs[0] : null;
}

/*
DESC
    Returns the product ids for all known products
RETURN
    Array of IProductIds
*/
interface IProductIds {
    id: mongoose.Types.ObjectId,
    tcgplayerId: Number
}
export async function getProductIds(): Promise<IProductIds[]> {

    // connect to db
    await mongoose.connect(url);

    try {

        const docs = await Product.find({});
        const ids: IProductIds[] = docs.map(
            doc => {
                return {
                    id: doc._id,
                    tcgplayerId: doc.tcgplayer_id
                }
            }
        );

        return ids;

    } catch(err) {

        console.log(`An error occurred in getProductIds(): ${err}`);
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

// async function main() {
//     let ids = await getProductIds();
//     console.log(ids);
// }

// main()
//     .then(console.log)
//     .catch(console.error);