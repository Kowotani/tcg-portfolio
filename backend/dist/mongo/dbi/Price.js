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
exports.updateHistoricalPrices = exports.resetPrices = exports.insertPrices = exports.insertMissingReleaseDatePrices = exports.getPriceSeries = exports.getPricesAsDatedValues = exports.getPriceMapOfSeries = exports.getPriceMapOfDatedValues = exports.getLatestPrices = void 0;
const common_1 = require("common");
const Product_1 = require("./Product");
const mongoose_1 = __importDefault(require("mongoose"));
const historicalPriceSchema_1 = require("../models/historicalPriceSchema");
const priceSchema_1 = require("../models/priceSchema");
const productSchema_1 = require("../models/productSchema");
const danfo_1 = require("../../utils/danfo");
const Price_1 = require("../../utils/Price");
const Product_2 = require("../../utils/Product");
// =======
// globals
// =======
const url = 'mongodb://localhost:27017/tcgPortfolio';
// =======
// getters
// =======
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
            if (startDate && endDate) {
                filter['date'] = { $gte: startDate, $lte: endDate };
            }
            else if (startDate) {
                filter['date'] = { $gte: startDate };
            }
            else if (endDate) {
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
            const series = (0, danfo_1.getSeriesFromDatedValues)(value);
            seriesMap.set(key, series);
        });
        return seriesMap;
    });
}
exports.getPriceMapOfSeries = getPriceMapOfSeries;
/*
DESC
  Retrieves the Prices for the input tcgplayerId as dated values. The data can
  be sliced by the optional startDate and endDate, otherwise it  will return all
  data found
INPUT
  tcgplayerId: The tcgplayerId
  startDate?: The starting date for the Price series
  endDate?: The ending date for the Price series
RETURN
  A TDatedValue[]
*/
function getPricesAsDatedValues(tcgplayerId, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        // get dated value map
        const datedValueMap = yield getPriceMapOfDatedValues([tcgplayerId], startDate, endDate);
        return datedValueMap.get(tcgplayerId);
    });
}
exports.getPricesAsDatedValues = getPricesAsDatedValues;
/*
DESC
  Retrieves the Prices for the input tcgplayerId as a danfo Series. The data can
  be sliced by the optional startDate and endDate, otherwise it  will return all
  data found
INPUT
  tcgplayerId: The tcgplayerId
  startDate?: The starting date for the Price series
  endDate?: The ending date for the Price series
RETURN
  A danfo Series
*/
function getPriceSeries(tcgplayerId, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        // get dated values
        const datedValues = yield getPricesAsDatedValues(tcgplayerId, startDate, endDate);
        return (0, danfo_1.getSeriesFromDatedValues)(datedValues);
    });
}
exports.getPriceSeries = getPriceSeries;
// =======
// setters
// =======
/*
DESC
  Inserts a Price document corresponding to the Product MSRP, if there is no
  Price doc on release date
RETURN
  TRUE if the insertion was sucessful
*/
function insertMissingReleaseDatePrices() {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const pipeline = [
                // filter to Products with MSRP
                {
                    $match: {
                        msrp: {
                            $ne: null
                        }
                    }
                },
                // join to Prices
                {
                    $lookup: {
                        from: 'prices',
                        localField: 'tcgplayerId',
                        foreignField: 'tcgplayerId',
                        as: 'priceDocs'
                    }
                },
                // add fields required in a Price document
                // and also a field to find missing prices on releaseDate
                {
                    $addFields: {
                        releaseDatePrices: {
                            $filter: {
                                input: '$priceDocs',
                                cond: {
                                    $eq: [
                                        '$$this.priceDate',
                                        '$releaseDate'
                                    ]
                                }
                            }
                        },
                        priceDate: '$releaseDate',
                        prices: { marketPrice: '$msrp' },
                        product: '$_id',
                        granularity: 'hours'
                    }
                },
                // filter to documents without a Price doc on releaseDate
                {
                    $match: {
                        $expr: {
                            $eq: [{ $size: '$releaseDatePrices' }, 0]
                        }
                    }
                },
                // create the Price document
                {
                    $project: {
                        _id: false,
                        tcgplayerId: true,
                        priceDate: true,
                        prices: true,
                        product: true,
                        granularity: true
                    }
                }
            ];
            // query Product documents
            const prices = yield productSchema_1.Product.aggregate(pipeline).exec();
            // insert into Prices
            const res = yield insertPrices(prices);
            return res;
        }
        catch (err) {
            const errMsg = `An error occurred in insertMissingReleaseDatePrices(): ${err}`;
            throw new Error(errMsg);
        }
    });
}
exports.insertMissingReleaseDatePrices = insertMissingReleaseDatePrices;
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
            const productDocs = yield (0, Product_1.getProductDocs)();
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
                if ((0, Product_2.isProductDoc)(productDoc) && productDoc.msrp) {
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
        // const tcgplayerId = 493975
        // const startDate = new Date(Date.parse('2023-06-01'))
        // const endDate = new Date(Date.parse('2023-07-01'))
        // res = await getPricesAsDatedValues(tcgplayerId, startDate, endDate)
        // console.log(res)
        // res = await getLatestPrices()
        // if (res) {
        //   logObject(res)
        // } else {
        //   console.log('Could not retrieve latest prices')
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
        // res = await insertMissingReleaseDatePrices()
        return 0;
    });
}
main()
    .then(console.log)
    .catch(console.error);
