"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertPrices = exports.setProductProperty = exports.insertProducts = exports.getProducts = exports.getProduct = exports.getPortfolio = exports.deletePortfolioHolding = exports.deletePortfolio = exports.addPortfolio = exports.addPortfolioHoldings = void 0;
// imports
const common_1 = require("common");
const _ = __importStar(require("lodash"));
const mongoose_1 = __importDefault(require("mongoose"));
const holdingSchema_1 = require("./models/holdingSchema");
const portfolioSchema_1 = require("./models/portfolioSchema");
const priceSchema_1 = require("./models/priceSchema");
const productSchema_1 = require("./models/productSchema");
const transactionSchema_1 = require("./models/transactionSchema");
// import { TCG, ProductType, ProductSubtype, ProductLanguage, TransactionType } from 'common';
// get mongo client
const url = 'mongodb://localhost:27017/tcgPortfolio';
// mongoose models
const Holding = mongoose_1.default.model('Holding', holdingSchema_1.holdingSchema);
const Portfolio = mongoose_1.default.model('Portfolio', portfolioSchema_1.portfolioSchema);
const Product = mongoose_1.default.model('Product', productSchema_1.productSchema);
const Price = mongoose_1.default.model('Price', priceSchema_1.priceSchema);
const Transaction = mongoose_1.default.model('Transaction', transactionSchema_1.transactionSchema);
// =========
// functions
// =========
// ---------
// Portfolio
// ---------
/*
DESC
    Adds a Holding (or array of Holdings) to a Portfolio. Will only add all
    Holdings or none (ie. if one Holding already exists)
INPUT
    portfolio: The Portfolio to contain the holding
    holding: The Holding to add
RETURN
    TRUE if all Holdings were successfully added to the Portfolio, FALSE otherwise
*/
function addPortfolioHoldings(portfolio, holdingInput) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        const holdingsToAdd = Array.isArray(holdingInput)
            ? holdingInput
            : [holdingInput];
        const userId = portfolio.userId;
        const portfolioName = portfolio.portfolioName;
        try {
            // check if empty holdings array was passed
            if (holdingsToAdd.length === 0) {
                console.log(`No holdings found to add`);
                return false;
            }
            // check if all holdings have unique tcgplayerId
            const holdingTcgplayerIds = holdingsToAdd.map((holding) => {
                return holding.tcgplayerId;
            });
            if (holdingTcgplayerIds.length > _.uniq(holdingTcgplayerIds).length) {
                console.log(`Duplicate tcgplayerIds detected in: ${holdingsToAdd}`);
                return false;
            }
            // check if portfolio exists
            const portfolioDoc = yield getPortfolio(portfolio);
            if (portfolioDoc instanceof Portfolio === false) {
                console.log(`${portfolioName} does not exist for userId: ${userId}`);
                return false;
            }
            (0, common_1.assert)(portfolioDoc instanceof Portfolio);
            // check if all products exist
            const productDocs = yield getProducts();
            const productTcgplayerIds = productDocs.map((doc) => {
                return doc.tcgplayerId;
            });
            const unknownTcgplayerIds = _.difference(holdingTcgplayerIds, productTcgplayerIds);
            if (unknownTcgplayerIds.length > 0) {
                console.log(`Product not found for tcgplayerIds: ${unknownTcgplayerIds}`);
                return false;
            }
            // check if any holding already exists
            const portfolioTcgplayerIds = portfolioDoc.getHoldings().map((holding) => { return holding.tcgplayerId; });
            const existingHoldings = _.intersection(portfolioTcgplayerIds, holdingTcgplayerIds);
            if (existingHoldings.length > 0) {
                console.log(`Portoflio holdings exist for tcgplayerIds: ${existingHoldings}`);
                return false;
            }
            // add holdings
            holdingsToAdd.forEach((holding) => {
                const productDoc = productDocs.find((doc) => {
                    return doc.tcgplayerId === holding.tcgplayerId;
                });
                (0, common_1.assert)(productDoc instanceof Product);
                portfolioDoc.addHolding({
                    product: productDoc._id,
                    tcgplayerId: holding.tcgplayerId,
                    transactions: holding.transactions
                });
            });
            return true;
        }
        catch (err) {
            console.log(`An error occurred in addPortfolioHolding(): ${err}`);
            return false;
        }
    });
}
exports.addPortfolioHoldings = addPortfolioHoldings;
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
function addPortfolio(portfolio) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        const userId = portfolio.userId;
        const portfolioName = portfolio.portfolioName;
        const holdings = portfolio.holdings;
        try {
            // check if portfolioName exists for this userId
            const doc = yield getPortfolio(portfolio);
            if (doc instanceof Portfolio) {
                console.log(`${portfolioName} already exists for userId: ${userId}`);
                return false;
            }
            // create the portfolio    
            yield Portfolio.create({
                userId,
                portfolioName,
                holdings,
            });
            return true;
        }
        catch (err) {
            console.log(`An error occurred in addPortfolio(): ${err}`);
            return false;
        }
    });
}
exports.addPortfolio = addPortfolio;
/*
DESC
    Deletes the Portfolio document by userId and portfolioName
INPUT
    userId: The associated userId
    portfolioName: The portfolio's name
RETURN
    TRUE if the Portfolio was successfully created, FALSE otherwise
*/
function deletePortfolio(portfolio) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        const userId = portfolio.userId;
        const portfolioName = portfolio.portfolioName;
        try {
            // check if portfolioName exists for this userId
            const doc = yield getPortfolio(portfolio);
            if (doc instanceof Portfolio === false) {
                console.log(`${portfolioName} does not exist for userId: ${userId}`);
                return false;
            }
            // delete the portfolio    
            const res = yield Portfolio.deleteOne({
                'userId': userId,
                'portfolioName': portfolioName,
            });
            return res.deletedCount === 1;
        }
        catch (err) {
            console.log(`An error occurred in deletePortfolio(): ${err}`);
            return false;
        }
    });
}
exports.deletePortfolio = deletePortfolio;
/*
DESC
    Deletes the Holding for the input tcgplayerId from the input Portfolio
INPUT
    portfolio: The Portfolio to contain the holding
    tcgplayerId: The tcgplayerId of the Holding to delete
RETURN
    TRUE if the Holding was successfully deleted from the Portfolio, FALSE otherwise
*/
function deletePortfolioHolding(portfolio, tcgplayerId) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        const userId = portfolio.userId;
        const portfolioName = portfolio.portfolioName;
        try {
            // check if portfolio exists
            const portfolioDoc = yield getPortfolio(portfolio);
            if (portfolioDoc instanceof Portfolio === false) {
                console.log(`${portfolio.portfolioName} does not exist for userId: ${userId}`);
                return false;
            }
            (0, common_1.assert)(portfolioDoc instanceof Portfolio);
            // check if holding exists
            if (!portfolioDoc.hasHolding(tcgplayerId)) {
                console.log(`tcgplayerId: ${tcgplayerId} does not exist in portfolio: (${userId}, ${portfolioName})`);
                return false;
            }
            // remove the holding
            portfolioDoc.deleteHolding(tcgplayerId);
            return true;
        }
        catch (err) {
            console.log(`An error occurred in deletePortfolioHolding(): ${err}`);
            return false;
        }
    });
}
exports.deletePortfolioHolding = deletePortfolioHolding;
/*
DESC
    Retrieves the Portfolio document by userId and portfolioName
INPUT
    userId: The associated userId
    portfolioName: The portfolio's name
RETURN
    The document if found, else null
*/
function getPortfolio(portfolio) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const doc = yield Portfolio.findOne({
                'userId': portfolio.userId,
                'portfolioName': portfolio.portfolioName,
            });
            return doc;
        }
        catch (err) {
            console.log(`An error occurred in getPortfolio(): ${err}`);
            return null;
        }
        return null;
    });
}
exports.getPortfolio = getPortfolio;
function getProduct({ tcgplayerId, hexStringId } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        // check that tcgplayer_id or id is provided
        if (tcgplayerId === undefined && hexStringId === undefined) {
            console.log('No tcgplayerId or hexStringId provided to getProduct()');
            return null;
        }
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const doc = Number.isInteger(tcgplayerId)
                ? yield Product.findOne({ 'tcgplayerId': tcgplayerId })
                : yield Product.findById(hexStringId);
            return doc;
        }
        catch (err) {
            console.log(`An error occurred in getProduct(): ${err}`);
            return null;
        }
    });
}
exports.getProduct = getProduct;
/*
DESC
    Returns all Products
RETURN
    Array of Product docs
*/
function getProducts() {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const docs = yield Product.find({});
            return docs;
        }
        catch (err) {
            console.log(`An error occurred in getProducts(): ${err}`);
            return [];
        }
    });
}
exports.getProducts = getProducts;
/*
DESC
    Constructs Price documents from the input data and inserts them
INPUT
    An array of IProducts
RETURN
    The number of documents inserted
*/
function insertProducts(docs) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const res = yield Product.insertMany(docs);
            return res.length;
        }
        catch (err) {
            console.log(`An error occurred in insertProducts(): ${err}`);
            return -1;
        }
    });
}
exports.insertProducts = insertProducts;
/*
DESC
    Sets a property on a Product document to the input value using the
    tcgplayerId to find the Product
INPUT
    tcgplayerId: TCGPlayerId identifying the product
    key: The property name to set
    value: The property value to set
RETURN
    The number of documents inserted
*/
function setProductProperty(tcgplayerId, key, value) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            // get Product
            const product = yield getProduct({ tcgplayerId: tcgplayerId });
            // check if Product exists
            if (product instanceof Product === false) {
                console.log(`Product not found for tcgplayerId: ${tcgplayerId}`);
            }
            (0, common_1.assert)(product instanceof Product);
            // update Product
            product.set(key, value);
            yield product.save();
            return true;
        }
        catch (err) {
            console.log(`An error occurred in setProductProperty(): ${err}`);
            return false;
        }
    });
}
exports.setProductProperty = setProductProperty;
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
function insertPrices(docs) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            // create map of Product tcgplayerId -> ObjectId
            const productDocs = yield getProducts();
            let idMap = new Map();
            productDocs.forEach(doc => {
                idMap.set(doc.tcgplayerId, doc._id);
            });
            // convert IPrice[] into IMPrice[]
            const priceDocs = docs.map(doc => {
                return Object.assign({ product: idMap.get(doc.tcgplayerId) }, doc);
            });
            const res = yield Price.insertMany(priceDocs);
            return res.length;
        }
        catch (err) {
            console.log(`An error occurred in insertPrices(): ${err}`);
            return -1;
        }
    });
}
exports.insertPrices = insertPrices;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
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
        // let holdings = [] as IHolding[]
        // let tcgplayerId = 233232
        // let res
        // // // -- Set Product
        // const key = 'msrp'
        // const value = 225
        // res = await setProductProperty(tcgplayerId, key, value)
        // if (res) {
        //     console.log(`Product (${tcgplayerId}) updated {${key}: ${value}}`)
        // } else {
        //     console.log('Product not updated')
        // }
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
        // holdings = [
        //     holding,
        //     {
        //         tcgplayerId: 233232,
        //         transactions: [{
        //             type: TransactionType.Purchase,
        //             date: new Date(),
        //             price: 4.99,
        //             quantity: 100
        //         }]
        //     }        
        // ]
        // res = await addPortfolioHoldings(
        //     {
        //         userId: userId,
        //         portfolioName: portfolioName,
        //         holdings: holdings,
        //     },
        //     holdings
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
        return 0;
    });
}
main()
    .then(console.log)
    .catch(console.error);
