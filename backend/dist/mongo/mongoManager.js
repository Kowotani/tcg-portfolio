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
exports.updateHistoricalPrices = exports.setProductProperty = exports.insertProducts = exports.getProductDocs = exports.getProductDoc = exports.resetPrices = exports.insertPrices = exports.getPriceMapOfSeries = exports.getPriceMapOfDatedValues = exports.getLatestPrices = exports.setPortfolio = exports.getPortfolios = exports.getPortfolioTotalCostAsDatedValues = exports.getPortfolioMarketValueAsDatedValues = exports.getPortfolioDocs = exports.getPortfolioDoc = exports.deletePortfolio = exports.addPortfolio = void 0;
// imports
const common_1 = require("common");
const Holding_1 = require("../utils/Holding");
const mongoose_1 = __importDefault(require("mongoose"));
const historicalPriceSchema_1 = require("./models/historicalPriceSchema");
const portfolioSchema_1 = require("./models/portfolioSchema");
const priceSchema_1 = require("./models/priceSchema");
const productSchema_1 = require("./models/productSchema");
const dfu = __importStar(require("../utils/danfo"));
const Portfolio_1 = require("../utils/Portfolio");
const Price_1 = require("../utils/Price");
const Product_1 = require("../utils/Product");
// =======
// globals
// =======
// get mongo client
const url = 'mongodb://localhost:27017/tcgPortfolio';
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
  portfolio: An IPortfolio
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
            if ((0, Portfolio_1.isPortfolioDoc)(portfolioDoc)) {
                throw (0, Portfolio_1.genPortfolioAlreadyExistsError)(userId, portfolioName, 'addPortfolio()');
            }
            // get IMHolding[]
            const holdings = yield (0, Holding_1.getIMHoldingsFromIHoldings)(portfolio.holdings);
            // create IPortfolio
            let newPortfolio = {
                userId: userId,
                portfolioName: portfolioName,
                holdings: holdings
            };
            if (description) {
                newPortfolio['description'] = portfolio.description;
            }
            // create the portfolio  
            yield portfolioSchema_1.Portfolio.create(newPortfolio);
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
            if (!(0, Portfolio_1.isPortfolioDoc)(portfolioDoc)) {
                throw (0, Portfolio_1.genPortfolioNotFoundError)(userId, portfolioName, 'deletePortfolio()');
            }
            // delete the portfolio  
            const res = yield portfolioSchema_1.Portfolio.deleteOne({
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
            const portfolioDoc = yield portfolioSchema_1.Portfolio.findOne({
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
            const docs = yield portfolioSchema_1.Portfolio.find({ 'userId': userId });
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
  Returns the market value of the input Portfolio between the startDate and
  endDate
INPUT
  portfolio: An IPortfolio
  startDate: The start date for market value calculation
  endDate: The end date for market value calculation
*/
function getPortfolioMarketValueAsDatedValues(portfolio, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        // get price map
        const holdings = (0, common_1.getPortfolioHoldings)(portfolio);
        const tcgplayerIds = holdings.map((holding) => {
            return (0, common_1.getHoldingTcgplayerId)(holding);
        });
        const priceMap = yield getPriceMapOfSeries(tcgplayerIds, startDate, endDate);
        // get market value
        const marketValueSeries = (0, Portfolio_1.getPortfolioMarketValueSeries)(portfolio, priceMap, startDate, endDate);
        return dfu.getDatedValuesFromSeries(marketValueSeries);
    });
}
exports.getPortfolioMarketValueAsDatedValues = getPortfolioMarketValueAsDatedValues;
/*
DESC
  Returns the total cost of the input Portfolio between the startDate and
  endDate
INPUT
  portfolio: An IPortfolio
  startDate: The start date for market value calculation
  endDate: The end date for market value calculation
*/
function getPortfolioTotalCostAsDatedValues(portfolio, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        // get total cost
        const totalCostSeries = (0, Portfolio_1.getPortfolioTotalCostSeries)(portfolio, startDate, endDate);
        return dfu.getDatedValuesFromSeries(totalCostSeries);
    });
}
exports.getPortfolioTotalCostAsDatedValues = getPortfolioTotalCostAsDatedValues;
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
            const docs = yield portfolioSchema_1.Portfolio
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
            const hasValidHoldings = yield (0, Holding_1.areValidHoldings)(newPortfolio.holdings);
            if (!hasValidHoldings) {
                const errMsg = 'New portfolio has invalid holdings';
                throw new Error(errMsg);
            }
            // check if Portfolio exists
            const portfolioDoc = yield getPortfolioDoc(existingPortfolio);
            if (!(0, Portfolio_1.isPortfolioDoc)(portfolioDoc)) {
                const errMsg = `Portfolio not found (${existingPortfolio.userId}, ${existingPortfolio.portfolioName})`;
                throw new Error(errMsg);
            }
            (0, common_1.assert)((0, Portfolio_1.isPortfolioDoc)(portfolioDoc), (0, Portfolio_1.genPortfolioNotFoundError)(existingPortfolio.userId, existingPortfolio.portfolioName, 'setPortfolio()').toString());
            // create IMPortfolio for new Portfolio
            const newIMPortfolio = Object.assign(Object.assign({}, newPortfolio), { holdings: yield (0, Holding_1.getIMHoldingsFromIHoldings)(newPortfolio.holdings) });
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
                tcgplayerId: number,
                priceDate: Date,
                marketPrice: number
              }
            */
            const priceData = yield historicalPriceSchema_1.HistoricalPrice.aggregate()
                .group({
                _id: {
                    tcgplayerId: '$tcgplayerId',
                    priceDate: '$date'
                },
                marketPrice: {
                    $avg: '$marketPrice'
                }
            })
                .group({
                _id: {
                    tcgplayerId: '$_id.tcgplayerId'
                },
                data: {
                    '$topN': {
                        output: {
                            priceDate: '$_id.priceDate',
                            marketPrice: '$marketPrice'
                        },
                        sortBy: {
                            '_id.priceDate': -1
                        },
                        n: 1
                    }
                }
            })
                .addFields({
                element: {
                    '$first': '$data'
                }
            })
                .project({
                _id: false,
                tcgplayerId: '$_id.tcgplayerId',
                priceDate: '$element.priceDate',
                marketPrice: '$element.marketPrice'
            })
                .exec();
            // create the TTcgplayerIdPrices
            let prices = new Map();
            priceData.forEach((el) => {
                prices.set(el.tcgplayerId, {
                    priceDate: el.priceDate,
                    prices: {
                        marketPrice: el.marketPrice
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
  Retrieves the Prices for the input tcgplayerIds as a map of
  tcpglayerId => TDatedValue[]. The data can be sliced by the optional
  startDate and endDate, otherwise it  will return all data found
INPUT
  tcgplayerId[]: The tcgplayerIds
  startDate?: The starting date for the Price series
  endDate?: The ending date for the Price series
RETURN
  A map of tcpglayerId => TDatedValue[]
*/
function getPriceMapOfDatedValues(tcgplayerIds, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        // if dates input, verify that startDate <= endDate
        if (startDate && endDate) {
            (0, common_1.assert)(startDate.getTime() <= endDate.getTime(), 'startDate must be less than or equal to endDate');
        }
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            // create filter
            let filter = { tcgplayerId: { $in: tcgplayerIds } };
            if (startDate) {
                filter['date'] = { $gte: startDate };
            }
            if (endDate) {
                filter['date'] = { $lte: endDate };
            }
            // query data
            const priceDocs = yield historicalPriceSchema_1.HistoricalPrice.find(filter)
                .sort({ 'tcgplayerId': 1, 'date': 1 });
            // created dated value map
            const datedValueMap = new Map();
            priceDocs.forEach((price) => {
                // update map
                const tcgplayerId = price.tcgplayerId;
                const datedValue = {
                    date: price.date,
                    value: price.marketPrice
                };
                const values = datedValueMap.get(tcgplayerId);
                // key exists
                if (values) {
                    values.push(datedValue);
                    // key does not exist
                }
                else {
                    datedValueMap.set(tcgplayerId, [datedValue]);
                }
            });
            return datedValueMap;
        }
        catch (err) {
            const errMsg = `An error occurred in getPriceMap(): ${err}`;
            throw new Error(errMsg);
        }
    });
}
exports.getPriceMapOfDatedValues = getPriceMapOfDatedValues;
/*
DESC
  Retrieves the Prices for the input tcgplayerIds as a map of
  tcpglayerId => Series. The data can be sliced by the optional
  startDate and endDate, otherwise it  will return all data found
INPUT
  tcgplayerId[]: The tcgplayerIds
  startDate?: The starting date for the Price series
  endDate?: The ending date for the Price series
RETURN
  A map of tcpglayerId => Series
*/
function getPriceMapOfSeries(tcgplayerIds, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        // get dated value map
        const datedValueMap = yield getPriceMapOfDatedValues(tcgplayerIds, startDate, endDate);
        // convert TDatedValue[] to Series
        const seriesMap = new Map();
        datedValueMap.forEach((value, key) => {
            const series = dfu.getSeriesFromDatedValues(value);
            seriesMap.set(key, series);
        });
        return seriesMap;
    });
}
exports.getPriceMapOfSeries = getPriceMapOfSeries;
/*
DESC
  Constructs Price documents from the input data and inserts them
INPUT
  docs: An IPrice[]
RETURN
  The number of documents inserted
*/
function insertPrices(docs) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            // create IMPrice[]
            const priceDocs = yield (0, Price_1.getIMPricesFromIPrices)(docs);
            const res = yield priceSchema_1.Price.insertMany(priceDocs);
            return res.length;
        }
        catch (err) {
            const errMsg = `An error occurred in insertPrices(): ${err}`;
            throw new Error(errMsg);
        }
    });
}
exports.insertPrices = insertPrices;
function resetPrices(tcgplayerIds) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        // return value
        let returnValues = {
            deleted: 0,
            inserted: 0
        };
        try {
            // get Products
            const productDocs = yield getProductDocs();
            // MSRP prices to load
            let prices = [];
            for (const tcgplayerId of tcgplayerIds) {
                // delete Price documents
                yield priceSchema_1.Price.deleteMany({ tcgplayerId: tcgplayerId });
                returnValues.deleted += 1;
                // get Product
                const productDoc = productDocs.find((product) => {
                    return product.tcgplayerId === tcgplayerId;
                });
                // insert MSRP Price document, if MSRP exists
                if ((0, Product_1.isProductDoc)(productDoc) && productDoc.msrp) {
                    const price = {
                        priceDate: productDoc.releaseDate,
                        tcgplayerId: tcgplayerId,
                        granularity: common_1.TimeseriesGranularity.Hours,
                        prices: {
                            marketPrice: productDoc.msrp
                        }
                    };
                    prices.push(price);
                }
            }
            // insert Prices
            const priceDocs = yield (0, Price_1.getIMPricesFromIPrices)(prices);
            const res = yield priceSchema_1.Price.insertMany(priceDocs);
            returnValues.inserted = res.length;
            return returnValues;
        }
        catch (err) {
            const errMsg = `An error occurred in resetPrices(): ${err}`;
            throw new Error(errMsg);
        }
    });
}
exports.resetPrices = resetPrices;
function getProductDoc({ tcgplayerId, hexStringId } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        // check that tcgplayer_id or id is provided
        if (tcgplayerId === undefined && hexStringId === undefined) {
            const errMsg = 'No tcgplayerId or hexStringId provided to getProductDoc()';
            throw new Error(errMsg);
        }
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const productDoc = tcgplayerId
                ? yield productSchema_1.Product.findOne({ 'tcgplayerId': tcgplayerId })
                : yield productSchema_1.Product.findById(hexStringId);
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
            const docs = yield productSchema_1.Product.find({});
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
            const res = yield productSchema_1.Product.insertMany(docs);
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
            if (!(0, Product_1.isProductDoc)(productDoc)) {
                throw (0, Product_1.genProductNotFoundError)('setProductProperty()', tcgplayerId);
            }
            (0, common_1.assert)((0, Product_1.isProductDoc)(productDoc), (0, Product_1.genProductNotFoundError)('setProductProperty()', tcgplayerId).toString());
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
  historicalPrices collection of IHistoricalPrice documents
*/
function updateHistoricalPrices() {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const res = yield priceSchema_1.Price.aggregate([
                // join to Product
                {
                    $lookup: {
                        from: 'products',
                        localField: 'product',
                        foreignField: '_id',
                        as: 'productDoc'
                    }
                },
                {
                    $unwind: '$productDoc'
                },
                // keep prices on or after the release date
                {
                    $match: {
                        $expr: {
                            $gte: [
                                '$priceDate',
                                '$productDoc.releaseDate'
                            ]
                        }
                    }
                },
                // aggregate existing prices for the same priceDate
                {
                    $group: {
                        _id: {
                            tcgplayerId: '$tcgplayerId',
                            date: {
                                $dateTrunc: {
                                    date: '$priceDate',
                                    unit: 'day'
                                }
                            }
                        },
                        marketPrice: {
                            $avg: '$prices.marketPrice'
                        }
                    }
                },
                // surface nested fields, append isInterpolated
                {
                    $project: {
                        _id: false,
                        tcgplayerId: '$_id.tcgplayerId',
                        date: '$_id.date',
                        marketPrice: true,
                        isInterpolated: { $toBool: 0 }
                    }
                },
                // create timeseries of priceDate
                {
                    $densify: {
                        field: 'date',
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
                        sortBy: { 'date': 1 },
                        output: {
                            'tcgplayerId': { method: 'locf' },
                            'marketPrice': { method: 'linear' },
                            'isInterpolated': { value: true }
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
                        into: 'historicalprices',
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
exports.updateHistoricalPrices = updateHistoricalPrices;
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
        // // -- Set Product
        // const tcgplayerId= 121527
        // const key = 'msrp'
        // const value = 80
        // res = await setProductProperty(tcgplayerId, key, value)
        // if (res) {
        //   console.log(`Product (${tcgplayerId}) updated {${key}: ${value}}`)
        // } else {
        //   console.log('Product not updated')
        // }
        // const p233232 = await getProductDoc({'tcgplayerId': 233232})
        // const p449558 = await getProductDoc({'tcgplayerId': 449558})
        // const userId = 1234
        // const portfolioName = 'Beta Investments'
        // const tcgplayerId = 493975
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
        // // -- Set Portfolio
        // const portfolio: IPortfolio = {
        //   userId: userId, 
        //   portfolioName: portfolioName,
        //   holdings: [],
        // }
        // const portfolioDoc = await getPortfolioDoc(portfolio) as IPortfolio
        // const holding = getPortfolioHolding(portoflioDoc, tcgplayerId) as IHolding
        // const startDate = new Date(Date.parse('2023-06-01'))
        // const endDate = new Date(Date.parse('2023-10-01'))
        // const series = getPortfolioTotalCostAsDatedValues(portfolioDoc, startDate, endDate)
        // console.log(series)
        // const priceMap = await getPriceMapOfSeries([tcgplayerId])
        // const priceSeries = priceMap.get(tcgplayerId) as df.Series
        // const twr = dfu.getHoldingTimeWeightedReturn(holding, priceSeries, startDate, endDate)
        // console.log(twr)
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
        // const holdingA: IHolding = {
        //   tcgplayerId: 233232,
        //   transactions: [
        //     {
        //       type: TransactionType.Purchase,
        //       date: new Date('2023-09-01'),
        //       price: 240,
        //       quantity: 2
        //     },
        //     {
        //       type: TransactionType.Sale,
        //       date: new Date('2023-09-02'),
        //       price: 245,
        //       quantity: 1
        //     },
        //     {
        //       type: TransactionType.Purchase,
        //       date: new Date('2023-09-04'),
        //       price: 250,
        //       quantity: 1
        //     },
        //     {
        //       type: TransactionType.Purchase,
        //       date: new Date('2023-09-05'),
        //       price: 250,
        //       quantity: 1
        //     },
        //     {
        //       type: TransactionType.Sale,
        //       date: new Date('2023-09-06'),
        //       price: 255,
        //       quantity: 3
        //     }
        //   ]
        // } 
        // const holdingB: IHolding = {
        //   tcgplayerId: 121527,
        //   transactions: [
        //     {
        //       type: TransactionType.Purchase,
        //       date: new Date('2023-09-07'),
        //       price: 330,
        //       quantity: 5
        //     },
        //     {
        //       type: TransactionType.Sale,
        //       date: new Date('2023-09-08'),
        //       price: 325,
        //       quantity: 1
        //     },
        //     {
        //       type: TransactionType.Sale,
        //       date: new Date('2023-09-10'),
        //       price: 320,
        //       quantity: 4
        //     },
        //   ]
        // } 
        // const portfolio = {
        //   userId: 123,
        //   portfolioName: 'foo',
        //   holdings: [holdingA, holdingB]
        // }
        // const startDate = new Date('2023-09-01')
        // const endDate = new Date('2023-09-12')
        // const series = await getPortfolioMarketValueAsDatedValues(
        //   portfolio, 
        //   startDate,
        //   endDate
        // )
        // console.log(dfu.getSeriesFromDatedValues(series))
        // const series = getHoldingMarketValueSeries(
        //   holding,
        //   prices,
        //   startDate,
        //   endDate
        //   )
        // console.log('-- market value series')  
        // console.log(series.print())
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
        // // -- Reset Prices
        // const tcgplayerIds = [496041]
        // res = await resetPrices(tcgplayerIds)
        // if (res) {
        //   console.log(`${res.deleted} tcgplayerIds were reset, ${res.inserted} were initialized`)
        // } else {
        //   console.log('Prices not reset')
        // }
        // // -- Get Price DatedValues
        // const tcgplayerId = 121527
        // const priceSeries = await getPriceSeries(tcgplayerId, 
        //   new Date(Date.parse('2023-09-01'))
        // )
        // // console.log('-- price series')
        // // console.log(priceSeries)
        // // console.log('-- danfo series')
        // const series = getSeriesFromDatedValues(priceSeries)
        // res = densifyAndFillSeries(
        //   series, 
        //   new Date('2023-08-31'), 
        //   new Date('2023-09-14'),
        //   'locf',
        //   undefined,
        //   123
        // )
        // console.log(res)
        // console.log('-- dated values')
        // console.log(getDatedValuesFromSeries(series))
        return 0;
    });
}
main()
    .then(console.log)
    .catch(console.error);
