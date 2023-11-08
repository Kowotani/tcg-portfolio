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
exports.getTcgplayerIdsForHistoricalScrape = exports.setProductProperty = exports.insertProducts = exports.getProductDocs = exports.getProductDoc = void 0;
const common_1 = require("common");
const mongoose_1 = __importDefault(require("mongoose"));
const productSchema_1 = require("../models/productSchema");
const Chart_1 = require("../../utils/Chart");
const Product_1 = require("../../utils/Product");
// =======
// globals
// =======
const url = 'mongodb://localhost:27017/tcgPortfolio';
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
/*
DESC
  Returns the TcgplayerIds that should be scraped for historical prices based
  on the input date range. A TcgplayerId should be scraped if it:
    - was released in the past
    - has no price data in the earliest month of the requested date range
      (eg. for a date range of 1Y, scrape if there is no data 12M ago)
INPUT
  dateRange: A TcgPlayerChartDateRange
RETURN
  An array of TcgplayerIds that should be scraped for historical prices based
  on the input date range
*/
function getTcgplayerIdsForHistoricalScrape(dateRange) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        // get priceDate lower bound
        let priceDateLowerBound;
        // 3M
        if (dateRange === Chart_1.TcgPlayerChartDateRange.ThreeMonths) {
            priceDateLowerBound = (0, common_1.getDateThreeMonthsAgo)();
            // 6M
        }
        else if (dateRange === Chart_1.TcgPlayerChartDateRange.SixMonths) {
            priceDateLowerBound = (0, common_1.getDateSixMonthsAgo)();
            // 1Y
        }
        else if (dateRange === Chart_1.TcgPlayerChartDateRange.OneYear) {
            priceDateLowerBound = (0, common_1.getDateOneYearAgo)();
            // default to 1Y
        }
        else {
            priceDateLowerBound = (0, common_1.getDateOneYearAgo)();
        }
        // pipeline
        const pipeline = [
            // include only released products
            {
                $match: {
                    $expr: {
                        $lte: [
                            '$releaseDate',
                            new Date()
                        ],
                    }
                }
            },
            // join to Price documents
            {
                $lookup: {
                    from: 'prices',
                    localField: 'tcgplayerId',
                    foreignField: 'tcgplayerId',
                    as: 'priceDocs'
                }
            },
            // only consider Price documents within the scraping date range 
            {
                $addFields: {
                    filteredPriceDocs: {
                        $filter: {
                            input: '$priceDocs',
                            cond: {
                                $gte: ['$$this.priceDate', priceDateLowerBound]
                            }
                        }
                    }
                }
            },
            // create array of priceDate month
            {
                $addFields: {
                    priceMonths: {
                        $reduce: {
                            input: '$filteredPriceDocs',
                            initialValue: [],
                            in: {
                                $concatArrays: [
                                    '$$value',
                                    [{
                                            $month: '$$this.priceDate'
                                        }]
                                ]
                            }
                        }
                    }
                }
            },
            // determine unique price months and expected price months
            {
                $addFields: {
                    uniquePriceMonths: {
                        $setUnion: ['$priceMonths', []]
                    },
                    expectedPriceMonths: {
                        $toInt: {
                            $dateDiff: {
                                startDate: {
                                    $max: [priceDateLowerBound, '$releaseDate']
                                },
                                endDate: new Date(),
                                unit: 'month'
                            }
                        }
                    }
                }
            },
            // group by tcgplayerId
            {
                $group: {
                    _id: '$tcgplayerId',
                    tcgplayerId: { $max: '$tcgplayerId' },
                    numPriceMonths: { $max: { $size: '$uniquePriceMonths' } },
                    expectedPriceMonths: { $max: '$expectedPriceMonths' }
                }
            },
            // filter to documents with fewer price months than expected
            {
                $match: {
                    $expr: {
                        $lt: ['$numPriceMonths', '$expectedPriceMonths']
                    }
                }
            },
            // return tcgplayerIds
            {
                $project: {
                    _id: 0,
                    tcgplayerId: 1
                }
            }
        ];
        // execute pipeline
        const res = yield productSchema_1.Product.aggregate(pipeline).exec();
        return res.length
            ? res.map((doc) => {
                (0, common_1.assert)('tcgplayerId' in doc, 'tcgplayerId not found in document');
                return doc.tcgplayerId;
            }).sort()
            : [];
    });
}
exports.getTcgplayerIdsForHistoricalScrape = getTcgplayerIdsForHistoricalScrape;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let res;
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
        res = yield getTcgplayerIdsForHistoricalScrape(Chart_1.TcgPlayerChartDateRange.OneYear);
        console.log(res);
        return 0;
    });
}
main()
    .then(console.log)
    .catch(console.error);
