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
exports.insertPrices = exports.insertProducts = exports.getProducts = exports.getProduct = exports.addPortfolio = exports.getPortfolio = exports.deletePortfolio = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const holdingSchema_1 = require("./models/holdingSchema");
const portfolioSchema_1 = require("./models/portfolioSchema");
const priceSchema_1 = require("./models/priceSchema");
const productSchema_1 = require("./models/productSchema");
// get mongo client
const url = 'mongodb://localhost:27017/tcgPortfolio';
// mongoose models
const Holding = mongoose_1.default.model('holding', holdingSchema_1.holdingSchema);
const Portfolio = mongoose_1.default.model('portfolio', portfolioSchema_1.portfolioSchema);
const Product = mongoose_1.default.model('product', productSchema_1.productSchema);
const Price = mongoose_1.default.model('price', priceSchema_1.priceSchema);
// =========
// functions
// =========
// ---------
// portfolio
// ---------
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
                const res = yield Portfolio.create({
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
    An array of IPrice objects
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
// price
// -----
/*
DESC
    Constructs Price documents from the input data and inserts them
INPUT
    An array of IPrice objects
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
// async function main(): Promise<number> {
//     const userId = 123
//     const portfolioName = 'Cardboard'
//     const holdings = [] as IHolding[]
//     let res = await addPortfolio(userId, portfolioName, holdings)
//     if (res) {
//         console.log('Portfolio successfully created')
//     } else {
//         console.log('Portfolio not created')
//     }
//     res = await deletePortfolio(userId, portfolioName)
//     if (res) {
//         console.log('Portfolio successfully deleted')
//     } else {
//         console.log('Portfolio not deleted')
//     }
//     return 0
// }
// main()
//     .then(console.log)
//     .catch(console.error);
