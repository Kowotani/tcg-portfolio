// imports
import { assert, IHolding, IPortfolio, IPortfolioMethods, IPrice, 
    IProduct } from 'common';
import * as _ from 'lodash';
import mongoose from 'mongoose';
import { HydratedDocument} from 'mongoose';
import { IMHolding, holdingSchema } from './models/holdingSchema';
import { IMPortfolio, portfolioSchema } from './models/portfolioSchema';
import { IMPrice, priceSchema } from './models/priceSchema';
import { IMProduct, productSchema } from './models/productSchema';
import { transactionSchema } from './models/transactionSchema';
import { TCG, ProductType, ProductSubtype, ProductLanguage, TransactionType } from 'common';

// get mongo client
const url = 'mongodb://localhost:27017/tcgPortfolio';

// mongoose models
const Holding = mongoose.model('Holding', holdingSchema);
const Portfolio = mongoose.model('Portfolio', portfolioSchema);
const Product = mongoose.model('Product', productSchema);
const Price = mongoose.model('Price', priceSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);


// =========
// functions
// =========

// ---------
// Portfolio
// ---------

/*
DESC
    Adds a Holding to a Portfolio
INPUT
    portfolio: The Portfolio to contain the holding
    holding: The Holding to add
RETURN
    TRUE if the Holding was successfully added to the Portfolio, FALSE otherwise
*/
export async function addPortfolioHolding(
    portfolio: IPortfolio, 
    holding: IHolding,
): Promise<boolean> {

    // connect to db
    await mongoose.connect(url);  

    try {

        // check if portfolio exists
        const portfolioDoc = await getPortfolio(portfolio.userId, portfolio.portfolioName)
        if (portfolioDoc === null) {
            console.log(`${portfolio.portfolioName} does not exist for userId: ${portfolio.userId}`)
            return false
        
        } else {

            const holdingProductDoc = await getProduct({tcgplayerId: holding.tcgplayerId})

            // check if product exists
            if (holdingProductDoc === null) {
                console.log(`Product not found for tcgplayerId: ${holding.tcgplayerId}`)
                return false

            } else {

                // check if holding already exists
                if (portfolioDoc.hasHolding(holding.tcgplayerId)) {
                    console.log(`tcgplayerId: ${holding.tcgplayerId} already exists in portfolio: (${portfolio.userId}, ${portfolio.portfolioName})`)
                    return false

                } else {

                    // add holding
                    portfolioDoc.addHolding({
                        product: holdingProductDoc._id,
                        tcgplayerId: holding.tcgplayerId,
                        transactions: holding.transactions
                    } as IMHolding)

                    return true
                }
            }
        }

    } catch(err) {
        
        console.log(`An error occurred in addPortfolioHolding(): ${err}`);
    }

    return false
}

/*
DESC
    Adds a Portfolio based on the given inputs
INPUT
    userId: The associated userId
    portfolioName: The portfolio's name
    holdings: An array of Holdings
RETURN
    TRUE if the Portfolio was successfully created, FALSE otherwise
*/
export async function addPortfolio(
    userId: number, 
    portfolioName: string, 
    holdings: IHolding[],
): Promise<boolean> {

    // connect to db
    await mongoose.connect(url);  

    try {

        // check if portfolioName exists for this userId
        const doc = await getPortfolio(userId, portfolioName)

        if (doc !== null) {
            console.log(`${portfolioName} already exists for userId: ${userId}`)

        // create the portfolio
        } else {
            
            await Portfolio.create({
                userId,
                portfolioName,
                holdings,
            })
            return true
        }

    } catch(err) {

        console.log(`An error occurred in addPortfolio(): ${err}`);
    }

    return false
}

/*
DESC
    Deletes the Portfolio document by userId and portfolioName
INPUT
    userId: The associated userId
    portfolioName: The portfolio's name
RETURN
    TRUE if the Portfolio was successfully created, FALSE otherwise
*/
export async function deletePortfolio(
    userId: number, 
    portfolioName: string,
): Promise<boolean> {

    // connect to db
    await mongoose.connect(url);  

    try {

        // check if portfolioName exists for this userId
        const doc = await getPortfolio(userId, portfolioName)

        if (doc === null) {
            console.log(`${portfolioName} does not exist for userId: ${userId}`)

        // delete the portfolio
        } else {
            
            const res = await Portfolio.deleteOne({
                'userId': userId,
                'portfolioName': portfolioName,
            })
            return res.deletedCount === 1
        }

    } catch(err) {

        console.log(`An error occurred in deletePortfolio(): ${err}`);
    }

    return false

}

/*
DESC
    Deletes the Holding for the input tcgplayerId from the input Portfolio
INPUT
    portfolio: The Portfolio to contain the holding
    tcgplayerId: The tcgplayerId of the Holding to delete
RETURN
    TRUE if the Holding was successfully deleted from the Portfolio, FALSE otherwise
*/
export async function deletePortfolioHolding(
    portfolio: IPortfolio, 
    tcgplayerId: number,
): Promise<boolean> {

    // connect to db
    await mongoose.connect(url);  

    try {    

        // check if portfolio exists
        const portfolioDoc = await getPortfolio(portfolio.userId, portfolio.portfolioName)

        if (portfolioDoc === null) {
            console.log(`${portfolio.portfolioName} does not exist for userId: ${portfolio.userId}`)
            return false

        } else {
        
            // check if holding exists
            if (!portfolioDoc.hasHolding(tcgplayerId)) {
                console.log(`tcgplayerId: ${tcgplayerId} does not exist in portfolio: (${portfolio.userId}, ${portfolio.portfolioName})`)
                return false

            // remove the holding
            } else {

                portfolioDoc.deleteHolding(tcgplayerId)
                return true
            }
        }

    } catch(err) {

        console.log(`An error occurred in deletePortfolioHolding(): ${err}`);
    }

    return false
}

/*
DESC
    Retrieves the Portfolio document by userId and portfolioName
INPUT
    userId: The associated userId
    portfolioName: The portfolio's name
RETURN
    The document if found, else null
*/
export async function getPortfolio(
    userId: number, 
    portfolioName: string,
): Promise<HydratedDocument<IMPortfolio, IPortfolioMethods> | null> {

    // connect to db
    await mongoose.connect(url);  

    try {

        const doc = await Portfolio.findOne({
            'userId': userId,
            'portfolioName': portfolioName,
        })
        if (doc !== null) { return doc; }

    } catch(err) {

        console.log(`An error occurred in getProduct(): ${err}`);
    } 
    
    return null;
}


// -------
// Product
// -------

/*
DESC
    Retrieves the Product document by tcgplayerId or _id
INPUT
    tcgplayerId: The Product's tcgplayerId (higher priority)
    hexStringId: The Product's document _id
RETURN
    The document if found, else null
*/
interface IGetProductParameters {
    tcgplayerId?: Number;
    hexStringId?: String;    // 24 char hex string
}
export async function getProduct(
    { tcgplayerId, hexStringId }: IGetProductParameters = {}
): Promise<HydratedDocument<IProduct> | null> {

    // check that tcgplayer_id or id is provided
    if (tcgplayerId === undefined && hexStringId === undefined) { 
        return null; 
    }

    // connect to db
    await mongoose.connect(url);  

    try {

        const doc = tcgplayerId !== undefined 
            ? await Product.findOne({ 'tcgplayerId': tcgplayerId })
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
export async function getProducts(): Promise<HydratedDocument<IMProduct>[]> {

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
    Constructs Price documents from the input data and inserts them
INPUT 
    An array of IProducts
RETURN
    The number of documents inserted
*/
export async function insertProducts(docs: IProduct[]): Promise<number> {

    // connect to db
    await mongoose.connect(url);

    try {

        const res = await Product.insertMany(docs);
        return res.length;
        
    } catch(err) {
    
        console.log(`An error occurred in insertProducts(): ${err}`);
        return -1;
    }
}


// -----
// Price
// -----

/*
DESC
    Constructs Price documents from the input data and inserts them
INPUT 
    An array of IPrices
RETURN
    The number of documents inserted
*/
export async function insertPrices(docs: IPrice[]): Promise<number> {

    // connect to db
    await mongoose.connect(url);

    try {

        // create map of Product tcgplayerId -> ObjectId
        const productDocs = await getProducts()
        let idMap = new Map<number, mongoose.Types.ObjectId>()
        productDocs.forEach(doc => {
            idMap.set(doc.tcgplayerId, doc._id)
        })

        // convert IPrice[] into IMPrice[]
        const priceDocs = docs.map(doc => {
            return {
                product: idMap.get(doc.tcgplayerId),
                ...doc
            } as IMPrice
        })

        const res = await Price.insertMany(priceDocs);
        return res.length;
        
    } catch(err) {
    
        console.log(`An error occurred in insertPrices(): ${err}`);
        return -1;
    }
}

async function main(): Promise<number> {

    // const product: IProduct = {
    //     tcgplayerId: 123,
    //     tcg: TCG.MagicTheGathering,
    //     releaseDate: new Date(),
    //     name: 'Foo',
    //     type: ProductType.BoosterBox,
    //     language: ProductLanguage.Japanese,
    // }

    // const res = await insertProducts([product])
    // console.log(res)

    // const userId = 1234
    // const portfolioName = 'Cardboard'
    // const holdings = [] as IMHolding[]
    // const tcgplayerId = 233232
    // let res

    // // -- Add portfolio

    // res = await addPortfolio(userId, portfolioName, holdings)
    // if (res) {
    //     console.log('Portfolio successfully created')
    // } else {
    //     console.log('Portfolio not created')
    // }

    // // -- Delete portfolio

    // res = await deletePortfolio(userId, portfolioName)
    // if (res) {
    //     console.log('Portfolio successfully deleted')
    // } else {
    //     console.log('Portfolio not deleted')
    // }

    // // -- Add portfolio holding

    // const holding: IHolding = {
    //     tcgplayerId: 233232,
    //     transactions: [{
    //         type: TransactionType.Purchase,
    //         date: new Date(),
    //         price: 1.23,
    //         quantity: 1
    //     }]
    // }

    // res = await addPortfolioHolding(
    //     {
    //         userId: userId,
    //         portfolioName: portfolioName,
    //         holdings: [],
    //     },
    //     holding
    // )
    // if (res) {
    //     console.log('Holding successfully added')
    // } else {
    //     console.log('Holding not added')
    // }

    // // -- Delete portfolio holding

    // res = await deletePortfolioHolding(
    //     {
    //         userId: userId,
    //         portfolioName: portfolioName,
    //         holdings: []
    //     },
    //     233232
    // )
    // if (res) {
    //     console.log('Holding successfully deleted')
    // } else {
    //     console.log('Holding not deleted')
    // }

    return 0
}

main()
    .then(console.log)
    .catch(console.error);