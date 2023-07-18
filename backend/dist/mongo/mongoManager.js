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
exports.insertPrices = exports.insertProducts = exports.getProducts = exports.getProduct = exports.getPortfolio = exports.deletePortfolio = exports.addPortfolio = exports.addPortfolioHolding = void 0;
// imports
const common_1 = require("common");
const mongoose_1 = __importDefault(require("mongoose"));
const holdingSchema_1 = require("./models/holdingSchema");
const portfolioSchema_1 = require("./models/portfolioSchema");
const priceSchema_1 = require("./models/priceSchema");
const productSchema_1 = require("./models/productSchema");
const transactionSchema_1 = require("./models/transactionSchema");
const common_2 = require("common");
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
        try {
            // check if portfolio exists
            const portfolioDoc = yield getPortfolio(portfolio.userId, portfolio.portfolioName);
            if (portfolioDoc === null) {
                console.log(`${portfolio.portfolioName} does not exist for userId: ${portfolio.userId}`);
                return false;
            }
            else {
                const existingHoldings = portfolioDoc.holdings.map((holding) => {
                    return holding.product.tcgplayerId;
                });
                // check if holding already exists
                if (existingHoldings.includes(holding.product.tcgplayerId)) {
                    console.log(`tcgplayerId: ${holding.product.tcgplayerId} already exists in portfolio: (${portfolio.userId}, ${portfolio.portfolioName} )`);
                    return false;
                }
                else {
                    // add holding
                    portfolioDoc.addHolding(holding);
                    return true;
                }
            }
        }
        catch (err) {
            console.log(`An error occurred in addPortfolioHolding(): ${err}`);
        }
        return false;
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
function addPortfolio(userId, portfolioName, holdings) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            // check if portfolioName exists for this userId
            const doc = yield getPortfolio(userId, portfolioName);
            if (doc !== null) {
                console.log(`${portfolioName} already exists for userId: ${userId}`);
                // create the portfolio
            }
            else {
                yield Portfolio.create({
                    userId,
                    portfolioName,
                    holdings,
                });
                return true;
            }
        }
        catch (err) {
            console.log(`An error occurred in addPortfolio(): ${err}`);
        }
        return false;
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
function deletePortfolio(userId, portfolioName) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            // check if portfolioName exists for this userId
            const doc = yield getPortfolio(userId, portfolioName);
            if (doc === null) {
                console.log(`${portfolioName} does not exist for userId: ${userId}`);
                // delete the portfolio
            }
            else {
                const res = yield Portfolio.deleteOne({
                    'userId': userId,
                    'portfolioName': portfolioName,
                });
                return res.deletedCount === 1;
            }
        }
        catch (err) {
            console.log(`An error occurred in deletePortfolio(): ${err}`);
        }
        return false;
    });
}
exports.deletePortfolio = deletePortfolio;
/*
DESC
    Retrieves the Portfolio document by userId and portfolioName
INPUT
    userId: The associated userId
    portfolioName: The portfolio's name
RETURN
    The document if found, else null
*/
function getPortfolio(userId, portfolioName) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const doc = yield Portfolio.findOne({
                'userId': userId,
                'portfolioName': portfolioName,
            });
            if (doc !== null) {
                return doc;
            }
        }
        catch (err) {
            console.log(`An error occurred in getProduct(): ${err}`);
        }
        return null;
    });
}
exports.getPortfolio = getPortfolio;
function getProduct({ tcgplayerId, hexStringId } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        // check that tcgplayer_id or id is provided
        if (tcgplayerId === undefined && hexStringId === undefined) {
            return null;
        }
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const doc = tcgplayerId !== undefined
                ? yield Product.findOne({ 'tcgplayerId': tcgplayerId })
                : yield Product.findById(hexStringId);
            if (doc !== null) {
                return doc;
            }
        }
        catch (err) {
            console.log(`An error occurred in getProduct(): ${err}`);
        }
        return null;
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
        }
        return [];
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
            const res = yield Price.insertMany(docs);
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
        const product = {
            tcgplayerId: 123,
            tcg: common_2.TCG.MagicTheGathering,
            releaseDate: new Date(),
            name: 'Foo',
            type: common_2.ProductType.BoosterBox,
            language: common_2.ProductLanguage.Japanese,
        };
        // const res = await insertProducts([product])
        // console.log(res)
        const userId = 123;
        const portfolioName = 'Cardboard';
        const holdings = [];
        let res = yield addPortfolio(userId, portfolioName, holdings);
        if (res) {
            console.log('Portfolio successfully created');
        }
        else {
            console.log('Portfolio not created');
        }
        // res = await deletePortfolio(userId, portfolioName)
        // if (res) {
        //     console.log('Portfolio successfully deleted')
        // } else {
        //     console.log('Portfolio not deleted')
        // }
        const holding = {
            product: product,
            transactions: [{
                    type: common_1.TransactionType.Purchase,
                    date: new Date(),
                    price: 4.56,
                    quantity: 999
                }]
        };
        res = yield addPortfolioHolding({
            userId: userId,
            portfolioName: portfolioName,
            holdings: holdings,
        }, holding);
        if (res) {
            console.log('Holding successfully added');
        }
        else {
            console.log('Holding not added');
        }
        return 0;
    });
}
main()
    .then(console.log)
    .catch(console.error);
