"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
exports.insertPrices = exports.setProductProperty = exports.insertProducts = exports.getProductDocs = exports.getProductDoc = exports.setPortfolioProperty = exports.setPortfolioHoldings = exports.getPortfolios = exports.getPortfolioDocs = exports.getPortfolioDoc = exports.getLatestPrices = exports.deletePortfolioHolding = exports.deletePortfolio = exports.addPortfolio = exports.addPortfolioHoldings = exports.Price = exports.Product = exports.Portfolio = void 0;
// imports
const common_1 = require("common");
const _ = __importStar(require("lodash"));
const mongoose_1 = __importDefault(require("mongoose"));
const portfolioSchema_1 = require("./models/portfolioSchema");
const priceSchema_1 = require("./models/priceSchema");
const productSchema_1 = require("./models/productSchema");
const utils_1 = require("../utils");
// =======
// globals
// =======
// get mongo client
const url = 'mongodb://localhost:27017/tcgPortfolio';
// mongoose models
exports.Portfolio = mongoose_1.default.model('Portfolio', portfolioSchema_1.portfolioSchema);
exports.Product = mongoose_1.default.model('Product', productSchema_1.productSchema);
exports.Price = mongoose_1.default.model('Price', priceSchema_1.priceSchema);
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
            // check if portfolio exists
            const portfolioDoc = yield getPortfolioDoc(portfolio);
            if (portfolioDoc instanceof exports.Portfolio === false) {
                console.log(`${portfolioName} does not exist for userId: ${userId}`);
                return false;
            }
            (0, common_1.assert)(portfolioDoc instanceof exports.Portfolio);
            // validate holdingsToAdd
            const validHoldings = yield (0, utils_1.areValidHoldings)(holdingsToAdd);
            if (!validHoldings) {
                console.log('Holdings failed validation in addPortfolioHoldings()');
                return false;
            }
            // check if any holding already exists
            const tcgplayerIds = holdingsToAdd.map((holding) => {
                return holding.tcgplayerId;
            });
            const portfolioTcgplayerIds = portfolioDoc.getHoldings().map((holding) => { return holding.tcgplayerId; });
            const existingHoldings = _.intersection(portfolioTcgplayerIds, tcgplayerIds);
            if (existingHoldings.length > 0) {
                console.log(`Portfolio holdings already exist for tcgplayerIds: ${existingHoldings}`);
                return false;
            }
            // get IMHolding[]
            const holdings = yield (0, utils_1.getIMHoldingsFromIHoldings)(holdingsToAdd);
            portfolioDoc.addHoldings(holdings);
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
  description?: A description of the portfolio
RETURN
  TRUE if the Portfolio was successfully created, FALSE otherwise
*/
function addPortfolio(portfolio) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        const userId = portfolio.userId;
        const portfolioName = portfolio.portfolioName;
        const description = portfolio.description;
        try {
            // check if portfolioName exists for this userId
            const doc = yield getPortfolioDoc(portfolio);
            if (doc instanceof exports.Portfolio) {
                console.log(`${portfolioName} already exists for userId: ${userId}`);
                return false;
            }
            // get IMHolding[]
            const holdings = yield (0, utils_1.getIMHoldingsFromIHoldings)(portfolio.holdings);
            // create IPortfolio
            let newPortfolio = {
                userId: userId,
                portfolioName: portfolioName,
                holdings: holdings
            };
            if (description) {
                newPortfolio['description'] = portfolio.description;
            }
            (0, common_1.assert)((0, common_1.isIPortfolio)(newPortfolio), 'newPortfolio object is not an IPortfolio in addPortfolio()');
            // create the portfolio  
            yield exports.Portfolio.create(newPortfolio);
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
            const doc = yield getPortfolioDoc(portfolio);
            if (doc instanceof exports.Portfolio === false) {
                console.log(`${portfolioName} does not exist for userId: ${userId}`);
                return false;
            }
            // delete the portfolio  
            const res = yield exports.Portfolio.deleteOne({
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
            const portfolioDoc = yield getPortfolioDoc(portfolio);
            if (portfolioDoc instanceof exports.Portfolio === false) {
                console.log(`${portfolio.portfolioName} does not exist for userId: ${userId}`);
                return false;
            }
            (0, common_1.assert)(portfolioDoc instanceof exports.Portfolio);
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
  Retrieves the latest market Prices for all Products
RETURN
  A TTcgplayerIdPrices object
*/
function getLatestPrices() {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            // get list of Price data with the following shape
            /*
              {
                _id: { tcgplayerId: number},
                data: [[ datestring, number ]]
              }
            */
            const priceData = yield exports.Price.aggregate()
                .group({
                _id: {
                    tcgplayerId: '$tcgplayerId',
                    priceDate: '$priceDate'
                },
                marketPrice: {
                    $avg: '$prices.marketPrice'
                },
            })
                .group({
                _id: {
                    tcgplayerId: '$_id.tcgplayerId'
                },
                data: {
                    '$topN': {
                        output: [
                            '$_id.priceDate',
                            '$marketPrice'
                        ],
                        sortBy: {
                            '_id.priceDate': -1
                        },
                        n: 1
                    }
                }
            })
                .exec();
            // create the TTcgplayerIdPrices
            let prices = {};
            priceData.forEach((el) => {
                prices[el._id.tcgplayerId] = el.data[0][1];
            });
            return prices;
        }
        catch (err) {
            console.log(`An error occurred in getLatestPrices(): ${err}`);
            return null;
        }
    });
}
exports.getLatestPrices = getLatestPrices;
/*
DESC
  Retrieves the Portfolio document by userId and portfolioName
INPUT
  userId: The associated userId
  portfolioName: The portfolio's name
RETURN
  The document if found, else null
*/
function getPortfolioDoc(portfolio) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const doc = yield exports.Portfolio.findOne({
                'userId': portfolio.userId,
                'portfolioName': portfolio.portfolioName,
            });
            return doc;
        }
        catch (err) {
            console.log(`An error occurred in getPortfolioDoc(): ${err}`);
            return null;
        }
    });
}
exports.getPortfolioDoc = getPortfolioDoc;
/*
DESC
  Retrieves all Portfolio documents for the input userId
INPUT
  userId: The associated userId
RETURN
  An array of Portfolio documents
*/
function getPortfolioDocs(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const docs = yield exports.Portfolio.find({ 'userId': userId });
            return docs;
        }
        catch (err) {
            console.log(`An error occurred in getPortfolioDocs(): ${err}`);
            return [];
        }
    });
}
exports.getPortfolioDocs = getPortfolioDocs;
/*
DESC
  Retrieves all IPopulatedPortfolios for the input userId
INPUT
  userId: The associated userId
RETURN
  An array of IPopulatedPortfolios
*/
function getPortfolios(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const docs = yield exports.Portfolio
                .find({ 'userId': userId })
                .populate({
                path: 'holdings',
                populate: { path: 'product' }
            })
                .select('-holdings.tcgplayerId');
            const portfolios = docs.map((portfolio) => {
                // create populatedHoldings
                const populatedHoldings = portfolio.holdings.map((el) => {
                    (0, common_1.assert)((0, common_1.isIPopulatedHolding)(el));
                    return el;
                });
                // create populatedPortfolio
                return {
                    userId: portfolio.userId,
                    portfolioName: portfolio.portfolioName,
                    description: portfolio.description,
                    populatedHoldings: populatedHoldings
                };
            });
            return portfolios;
        }
        catch (err) {
            console.log(`An error occurred in getPortfolios(): ${err}`);
            return [];
        }
    });
}
exports.getPortfolios = getPortfolios;
/*
DESC
  Sets a Portfolio's holdings to the provided input
INPUT
  portfolio: The Portfolio to update
  holdings: An array of IHolding
RETURN
  TRUE if the holdings were successfully set, FALSE otherwise
*/
function setPortfolioHoldings(portfolio, holdingInput) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            // check if Portfolio exists
            const portfolioDoc = yield getPortfolioDoc(portfolio);
            if (portfolioDoc instanceof exports.Portfolio === false) {
                console.log(`Portfolio not found (${portfolio.userId}, ${portfolio.portfolioName})`);
            }
            (0, common_1.assert)(portfolioDoc instanceof exports.Portfolio);
            // convert input to Array, if necessary
            const holdings = Array.isArray(holdingInput) ? holdingInput : [holdingInput];
            // validate Holdings
            const validHoldings = yield (0, utils_1.areValidHoldings)(holdings);
            if (!validHoldings) {
                console.log('Holdings failed validation in setPortfolioHoldings()');
                return false;
            }
            // get IMHolding[]
            const newHoldings = yield (0, utils_1.getIMHoldingsFromIHoldings)(holdings);
            portfolioDoc.holdings = newHoldings;
            yield portfolioDoc.save();
            return true;
        }
        catch (err) {
            console.log(`An error occurred in setPortfolioHoldings(): ${err}`);
            return false;
        }
    });
}
exports.setPortfolioHoldings = setPortfolioHoldings;
/*
DESC
  Sets a property on the specified Portfolio document to the input value.
  NOTE: This _cannot_ set the holdings property, use setPortfolioHoldings()
INPUT
  portfolio: The Portfolio to update
  key: The property name to set
  value: The property value to set
RETURN
  TRUE if the property was successfully set, FALSE otherwise
*/
function setPortfolioProperty(portfolio, key, value) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            // check if Portfolio exists
            const portfolioDoc = yield getPortfolioDoc(portfolio);
            if (portfolioDoc instanceof exports.Portfolio === false) {
                console.log(`Portfolio not found (${portfolio.userId}, ${portfolio.portfolioName})`);
            }
            (0, common_1.assert)(portfolioDoc instanceof exports.Portfolio);
            // call separate setPortfolioHoldings()
            if (key === 'holdings') {
                (0, common_1.assert)((0, common_1.isIHoldingArray)(value));
                const res = yield setPortfolioHoldings(portfolio, value);
                return res;
                // set the key
            }
            else {
                portfolioDoc.set(key, value);
                yield portfolioDoc.save();
                return true;
            }
        }
        catch (err) {
            console.log(`An error occurred in setPortfolioProperty(): ${err}`);
            return false;
        }
    });
}
exports.setPortfolioProperty = setPortfolioProperty;
function getProductDoc({ tcgplayerId, hexStringId } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        // check that tcgplayer_id or id is provided
        if (tcgplayerId === undefined && hexStringId === undefined) {
            console.log('No tcgplayerId or hexStringId provided to getProductDoc()');
            return null;
        }
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const doc = tcgplayerId
                ? yield exports.Product.findOne({ 'tcgplayerId': tcgplayerId })
                : yield exports.Product.findById(hexStringId);
            return doc;
        }
        catch (err) {
            console.log(`An error occurred in getProductDoc(): ${err}`);
            return null;
        }
    });
}
exports.getProductDoc = getProductDoc;
/*
DESC
  Returns all Products
RETURN
  Array of Product docs
*/
function getProductDocs() {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const docs = yield exports.Product.find({});
            return docs;
        }
        catch (err) {
            console.log(`An error occurred in getProductDocs(): ${err}`);
            return [];
        }
    });
}
exports.getProductDocs = getProductDocs;
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
            const res = yield exports.Product.insertMany(docs);
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
  TRUE if the property was successfully set, FALSE otherwise
*/
function setProductProperty(tcgplayerId, key, value) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            // check if Product exists
            const productDoc = yield getProductDoc({ tcgplayerId: tcgplayerId });
            if (productDoc instanceof exports.Product === false) {
                console.log(`Product not found for tcgplayerId: ${tcgplayerId}`);
            }
            (0, common_1.assert)(productDoc instanceof exports.Product);
            // update Product
            productDoc.set(key, value);
            yield productDoc.save();
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
            // create IMPrice[]
            const priceDocs = yield (0, utils_1.getIMPricesFromIPrices)(docs);
            const res = yield exports.Price.insertMany(priceDocs);
            return res.length;
        }
        catch (err) {
            console.log(`An error occurred in insertPrices(): ${err}`);
            return -1;
        }
    });
}
exports.insertPrices = insertPrices;
// import { logObject, TCG, ProductType, ProductSubtype, ProductLanguage, TransactionType } from 'common'
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let res;
        res = yield getLatestPrices();
        if (res) {
            (0, common_1.logObject)(res);
        }
        else {
            console.log('Could not retrieve latest prices');
        }
        // const product: IProduct = {
        //   tcgplayerId: 449558,
        //   tcg: TCG.MagicTheGathering,
        //   releaseDate: new Date(),
        //   name: 'Foo',
        //   type: ProductType.BoosterBox,
        //   language: ProductLanguage.Japanese,
        // }
        // const res = await insertProducts([product])
        // console.log(res)
        // // // -- Set Product
        // const key = 'msrp'
        // const value = 225
        // res = await setProductProperty(tcgplayerId, key, value)
        // if (res) {
        //   console.log(`Product (${tcgplayerId}) updated {${key}: ${value}}`)
        // } else {
        //   console.log('Product not updated')
        // }
        // const p233232 = await getProductDoc({'tcgplayerId': 233232})
        // const p449558 = await getProductDoc({'tcgplayerId': 449558})
        // const userId = 789
        // const portfolioName = 'Omega Investments'
        // let holdings: IHolding[] = [
        //   {
        //     tcgplayerId: 233232,
        //     transactions: [
        //       {
        //         type: TransactionType.Purchase,
        //         date: new Date(),
        //         price: 99,
        //         quantity: 1,
        //       },
        //     ]
        //   },
        // ]
        // const portfolio: IPortfolio = {
        //   userId: userId, 
        //   portfolioName: portfolioName,
        //   holdings: holdings,
        // }
        // // -- Add portfolio holdings
        // res = await addPortfolioHoldings(portfolio, holdings)
        // if (res) {
        //   console.log('Portfolio holdings successfully added')
        // } else {
        //   console.log('Portfolio holdings not added')
        // }
        // -- Set portfolio holdings
        // res = await setPortfolioProperty(portfolio, 'description', 'Taco Bell')
        // if (res) {
        //   console.log('Portfolio holdings successfully set')
        // } else {
        //   console.log('Portfolio holdings not set')
        // }
        // // -- Get portfolios
        // res = await getPortfolioDocs(userId)
        // if (res) {
        //   console.log(res)
        // } else {
        //   console.log('Portfolios not retrieved')
        // }
        // res = await getPortfolios(userId)
        // if (res) {
        //   logObject(res)
        // } else {
        //   console.log('Portfolios not retrieved')
        // }
        // -- Add portfolio
        // res = await addPortfolio(portfolio)
        // if (res) {
        //   console.log('Portfolio successfully created')
        // } else {
        //   console.log('Portfolio not created')
        // }
        // // -- Delete portfolio
        // res = await deletePortfolio(userId, portfolioName)
        // if (res) {
        //   console.log('Portfolio successfully deleted')
        // } else {
        //   console.log('Portfolio not deleted')
        // }
        // // -- Add portfolio holding
        // const holding: IHolding = {
        //   tcgplayerId: 233232,
        //   transactions: [{
        //     type: TransactionType.Purchase,
        //     date: new Date(),
        //     price: 1.23,
        //     quantity: 1
        //   }]
        // }
        // holdings = [
        //   holding,
        //   {
        //     tcgplayerId: 233232,
        //     transactions: [{
        //       type: TransactionType.Purchase,
        //       date: new Date(),
        //       price: 4.99,
        //       quantity: 100
        //     }]
        //   }    
        // ]
        // res = await addPortfolioHoldings(
        //   {
        //     userId: userId,
        //     portfolioName: portfolioName,
        //     holdings: holdings,
        //   },
        //   holdings
        // )
        // if (res) {
        //   console.log('Holding successfully added')
        // } else {
        //   console.log('Holding not added')
        // }
        // // -- Delete portfolio holding
        // res = await deletePortfolioHolding(
        //   {
        //     userId: userId,
        //     portfolioName: portfolioName,
        //     holdings: []
        //   },
        //   233232
        // )
        // if (res) {
        //   console.log('Holding successfully deleted')
        // } else {
        //   console.log('Holding not deleted')
        // }
        return 0;
    });
}
main()
    .then(console.log)
    .catch(console.error);
