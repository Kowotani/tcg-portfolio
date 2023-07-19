"use strict";
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
exports.insertPrices = exports.insertProducts = exports.getProducts = exports.getProduct = exports.getPortfolio = exports.deletePortfolioHolding = exports.deletePortfolio = exports.addPortfolio = exports.addPortfolioHolding = void 0;
// imports
const common_1 = require("common");
const mongoose_1 = __importDefault(require("mongoose"));
const holdingSchema_1 = require("./models/holdingSchema");
const portfolioSchema_1 = require("./models/portfolioSchema");
const priceSchema_1 = require("./models/priceSchema");
const productSchema_1 = require("./models/productSchema");
const transactionSchema_1 = require("./models/transactionSchema");
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
    Adds a Holding to a Portfolio
INPUT
    portfolio: The Portfolio to contain the holding
    holding: The Holding to add
RETURN
    TRUE if the Holding was successfully added to the Portfolio, FALSE otherwise
*/
function addPortfolioHolding(portfolio, holding) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        const userId = portfolio.userId;
        const portfolioName = portfolio.portfolioName;
        const tcgplayerId = holding.tcgplayerId;
        const transactions = holding.transactions;
        try {
            // check if portfolio exists
            const portfolioDoc = yield getPortfolio(portfolio);
            if (portfolioDoc === null) {
                console.log(`${portfolioName} does not exist for userId: ${userId}`);
                return false;
            }
            (0, common_1.assert)(portfolioDoc !== null);
            // check if product exists
            const productDoc = yield getProduct({ tcgplayerId: tcgplayerId });
            if (productDoc === null) {
                console.log(`Product not found for tcgplayerId: ${tcgplayerId}`);
                return false;
            }
            (0, common_1.assert)(productDoc !== null);
            // check if holding already exists
            const holdingExists = portfolioDoc.hasHolding(tcgplayerId);
            if (holdingExists) {
                console.log(`tcgplayerId: ${tcgplayerId} already exists in portfolio: (${userId}, ${portfolioName})`);
                return false;
            }
            // add holding
            portfolioDoc.addHolding({
                product: productDoc._id,
                tcgplayerId: tcgplayerId,
                transactions: transactions
            });
            return true;
        }
        catch (err) {
            console.log(`An error occurred in addPortfolioHolding(): ${err}`);
            return false;
        }
    });
}
exports.addPortfolioHolding = addPortfolioHolding;
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
            if (doc !== null) {
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
            if (doc === null) {
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
            if (portfolioDoc === null) {
                console.log(`${portfolio.portfolioName} does not exist for userId: ${userId}`);
                return false;
            }
            (0, common_1.assert)(portfolioDoc !== null);
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
            const doc = tcgplayerId !== undefined
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
        return 0;
    });
}
main()
    .then(console.log)
    .catch(console.error);
