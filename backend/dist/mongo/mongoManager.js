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
exports.setProductProperty = exports.insertProducts = exports.getProductDocs = exports.getProductDoc = exports.insertPrices = exports.getLatestPrices = exports.setPortfolio = exports.getPortfolios = exports.getPortfolioDocs = exports.getPortfolioDoc = exports.deletePortfolio = exports.addPortfolio = exports.Price = exports.Product = exports.Portfolio = void 0;
// imports
const common_1 = require("common");
const mongoose_1 = __importDefault(require("mongoose"));
const portfolioSchema_1 = require("./models/portfolioSchema");
const priceSchema_1 = require("./models/priceSchema");
const productSchema_1 = require("./models/productSchema");
const utils_1 = require("../utils");
// import { logObject, TCG, ProductType, ProductSubtype, ProductLanguage, TransactionType } from 'common'
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
            const portfolioDoc = yield getPortfolioDoc(portfolio);
            if (!(0, utils_1.isPortfolioDoc)(portfolioDoc)) {
                const errMsg = `${portfolioName} already exists for userId: ${userId}`;
                throw new Error(errMsg);
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
            const errMsg = `An error occurred in addPortfolio(): ${err}`;
            throw new Error(errMsg);
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
            const portfolioDoc = yield getPortfolioDoc(portfolio);
            if (!(0, utils_1.isPortfolioDoc)(portfolioDoc)) {
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
            const errMsg = `An error occurred in deletePortfolio(): ${err}`;
            throw new Error(errMsg);
        }
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
function getPortfolioDoc(portfolio) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const portfolioDoc = yield exports.Portfolio.findOne({
                'userId': portfolio.userId,
                'portfolioName': portfolio.portfolioName,
            });
            return portfolioDoc;
        }
        catch (err) {
            const errMsg = `An error occurred in getPortfolioDoc(): ${err}`;
            throw new Error(errMsg);
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
            const errMsg = `An error occurred in getPortfolioDocs(): ${err}`;
            throw new Error(errMsg);
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
            const errMsg = `An error occurred in getPortfolios(): ${err}`;
            throw new Error(errMsg);
        }
    });
}
exports.getPortfolios = getPortfolios;
/*
DESC
  Sets an existing Portfolio to be equal to a new Portfolio
INPUT
  existingPortfolio: The Portfolio to update
  newPortfolio: The new state of the Portfolio
RETURN
  TRUE if the Portfolio was successfully set, FALSE otherwise
*/
function setPortfolio(existingPortfolio, newPortfolio) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            // check that userIds match
            (0, common_1.assert)(existingPortfolio.userId === newPortfolio.userId, `Mismatched userIds provided to setPortfolio(${existingPortfolio.userId}, ${newPortfolio.userId})`);
            // check that new Portfolio Holdings are valid
            const hasValidHoldings = yield (0, utils_1.areValidHoldings)(newPortfolio.holdings);
            if (!hasValidHoldings) {
                const errMsg = 'New portfolio has invalid holdings';
                throw new Error(errMsg);
            }
            // check if Portfolio exists
            const portfolioDoc = yield getPortfolioDoc(existingPortfolio);
            if (!(0, utils_1.isPortfolioDoc)(portfolioDoc)) {
                const errMsg = `Portfolio not found (${existingPortfolio.userId}, ${existingPortfolio.portfolioName})`;
                throw new Error(errMsg);
            }
            (0, common_1.assert)((0, utils_1.isPortfolioDoc)(portfolioDoc), 'Existing portfolio not found in setPortfolio()');
            // create IMPortfolio for new Portfolio
            const newIMPortfolio = Object.assign(Object.assign({}, newPortfolio), { holdings: yield (0, utils_1.getIMHoldingsFromIHoldings)(newPortfolio.holdings) });
            // overwrite existing Portfolio with new Portfolio
            portfolioDoc.overwrite(newIMPortfolio);
            yield portfolioDoc.save();
            return true;
        }
        catch (err) {
            const errMsg = `An error occurred in setPortfolio(): ${err}`;
            throw new Error(errMsg);
        }
    });
}
exports.setPortfolio = setPortfolio;
// -----
// Price
// -----
/*
DESC
  Retrieves the latest market Prices for all Products
RETURN
  A Map<number, IDatedPriceData> where the key is a tcgplayerId
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
                }
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
            let prices = new Map();
            priceData.forEach((el) => {
                prices.set(el._id.tcgplayerId, {
                    priceDate: el.data[0][0],
                    prices: {
                        marketPrice: el.data[0][1]
                    }
                });
            });
            return prices;
        }
        catch (err) {
            const errMsg = `An error occurred in getLatestPrices(): ${err}`;
            throw new Error(errMsg);
        }
    });
}
exports.getLatestPrices = getLatestPrices;
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
            const errMsg = `An error occurred in insertPrices(): ${err}`;
            throw new Error(errMsg);
        }
    });
}
exports.insertPrices = insertPrices;
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
            const productDoc = tcgplayerId
                ? yield exports.Product.findOne({ 'tcgplayerId': tcgplayerId })
                : yield exports.Product.findById(hexStringId);
            return productDoc;
        }
        catch (err) {
            const errMsg = `An error occurred in getProductDoc(): ${err}`;
            throw new Error(errMsg);
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
            const errMsg = `An error occurred in getProductDocs(): ${err}`;
            throw new Error(errMsg);
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
            const errMsg = `An error occurred in insertProducts(): ${err}`;
            throw new Error(errMsg);
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
            if (!(0, utils_1.isProductDoc)(productDoc)) {
                const errMsg = `Product not found for tcgplayerId: ${tcgplayerId}`;
                throw new Error(errMsg);
            }
            (0, common_1.assert)((0, utils_1.isProductDoc)(productDoc), 'Product not found in setProductProperty');
            // update Product
            productDoc.set(key, value);
            yield productDoc.save();
            return true;
        }
        catch (err) {
            const errMsg = `An error occurred in setProductProperty(): ${err}`;
            throw new Error(errMsg);
        }
    });
}
exports.setProductProperty = setProductProperty;
// =====
// views
// =====
/*
DESC
  This pipeline creates a price summary for all Products that is designed to
  be used when calculating historical returns
OUTPUT
  historicalPrices collection with documents of the form
  {
    date: Date,
    tcgplayerId: number,
    marketPrice: number,
    isInterpolated: boolean,
  }
*/
function updateHistoricalPrices() {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const res = yield exports.Price.aggregate([
                // create timeseries of priceDate
                {
                    $densify: {
                        field: 'priceDate',
                        partitionByFields: ['tcgplayerId'],
                        range: {
                            step: 1,
                            unit: 'day',
                            bounds: 'full'
                        }
                    }
                },
                // interpolate missing data points
                {
                    $fill: {
                        partitionByFields: ['tcgplayerId'],
                        sortBy: { 'priceDate': 1 },
                        output: {
                            'tcgplayerId': { method: 'locf' },
                            'prices.marketPrice': { method: 'linear' }
                        }
                    }
                },
                // add isInterpolated and rename priceDate
                {
                    $addFields: {
                        date: {
                            $dateTrunc: {
                                date: '$priceDate',
                                unit: 'day'
                            }
                        },
                        isInterpolated: {
                            $lte: ['$_id', null]
                        }
                    }
                },
                // calculate average marketPrice
                {
                    $group: {
                        _id: {
                            tcgplayerId: '$tcgplayerId',
                            date: '$date'
                        },
                        marketPrice: {
                            $avg: '$prices.marketPrice'
                        },
                        isInterpolated: {
                            $min: '$isInterpolated'
                        }
                    }
                },
                // filter out null marketPrices
                // this is due to the releaseDate of Products being different
                {
                    $match: {
                        marketPrice: {
                            $ne: null
                        }
                    }
                },
                // surface nested fields
                {
                    $project: {
                        _id: false,
                        tcgplayerId: '$_id.tcgplayerId',
                        date: '$_id.date',
                        marketPrice: true,
                        isInterpolated: true
                    }
                },
                // sort results
                {
                    $sort: {
                        tcgplayerId: 1,
                        date: 1
                    }
                },
                // write results
                {
                    $merge: {
                        on: ['tcgplayerId', 'date'],
                        into: 'historicalPrices',
                        whenMatched: 'replace'
                    }
                }
            ])
                .exec();
            return true;
        }
        catch (err) {
            const errMsg = `An error occurred in updateHistoricalPrices(): ${err}`;
            throw new Error(errMsg);
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let res;
        // res = await getLatestPrices()
        // if (res) {
        //   logObject(res)
        // } else {
        //   console.log('Could not retrieve latest prices')
        // }
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
        // const userId = 456
        // const portfolioName = 'Delta Investments'
        // const description = 'Washer dryer mechanic'
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
        //       {
        //         type: TransactionType.Sale,
        //         date: new Date(),
        //         price: 99,
        //         quantity: 2,
        //       },        
        //     ],
        //   },
        // ]
        // // // -- Set Portfolio
        // const portfolio: IPortfolio = {
        //   userId: userId, 
        //   portfolioName: portfolioName,
        //   holdings: holdings,
        // }
        // const newPortfolio: IPortfolio = {
        //   userId: userId, 
        //   portfolioName: portfolioName,
        //   holdings: holdings,
        // }
        // res = await setPortfolio(portfolio, newPortfolio)
        // if (res) {
        //   console.log('Portfolio successfully set')
        // } else {
        //   console.log('Portfolio not set')
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
        // // -- Create historicalPrices
        // res = await updateHistoricalPrices()
        // if (res) {
        //   console.log('historicalPrices updated')
        // } else {
        //   console.log('historicalPrices not updated')
        // }
        return 0;
    });
}
main()
    .then(console.log)
    .catch(console.error);
