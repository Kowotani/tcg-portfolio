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
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadTCProducts = exports.loadTCPrices = exports.loadTCGroups = exports.loadTcgcsvPrices = exports.loadTcgplayerHistoricalPrices = exports.loadTcgplayerCurrentPrices = exports.loadTcgplayerCurrentPrice = void 0;
const common_1 = require("common");
const _ = __importStar(require("lodash"));
const Price_1 = require("../mongo/dbi/Price");
const Product_1 = require("../mongo/dbi/Product");
const TCGroup_1 = require("../mongo/dbi/TCGroup");
const TCProduct_1 = require("../mongo/dbi/TCProduct");
const scraper_1 = require("./scraper");
const tcgcsv_1 = require("./tcgcsv");
const tcgcsv_2 = require("../utils/tcgcsv");
// ==========
// TCG Player
// ==========
/*
DESC
  Loads current price data for the Product specified by the input tcgplayerId
INPUT
  tcgplayerId: The tcgplayerId of the Product
RETURN
  TRUE if the price data was successfully loaded, FALSE otherwise
*/
function loadTcgplayerCurrentPrice(tcgplayerId) {
    return __awaiter(this, void 0, void 0, function* () {
        // scrape price data
        const scrapedPrices = yield (0, scraper_1.scrapeCurrent)([tcgplayerId]);
        const priceData = scrapedPrices.get(tcgplayerId);
        // check if data was retrieved
        if (priceData === undefined) {
            const errMsg = `Could not scrape price data for tcgplayerId: ${tcgplayerId}`;
            throw new Error(errMsg);
        }
        // set price date
        let priceDate = new Date();
        priceDate.setMinutes(0, 0, 0);
        // create IPrice
        const price = {
            tcgplayerId: tcgplayerId,
            priceDate: priceDate,
            prices: priceData,
            granularity: common_1.TimeseriesGranularity.Hours
        };
        // load price
        const numInserted = yield (0, Price_1.insertPrices)([price]);
        return numInserted === 1;
    });
}
exports.loadTcgplayerCurrentPrice = loadTcgplayerCurrentPrice;
/*
DESC
  Loads current price data for all known products
RETURN
  The number of Price documents inserted
*/
function loadTcgplayerCurrentPrices() {
    return __awaiter(this, void 0, void 0, function* () {
        // get all Products
        const allProductDocs = yield (0, Product_1.getProductDocs)();
        // exclude unreleased Products
        const productDocs = allProductDocs.filter((product) => {
            return (0, common_1.formatAsISO)(product.releaseDate) <= (0, common_1.formatAsISO)(new Date());
        });
        // scrape price data
        const tcgplayerIds = productDocs.map((productDoc) => {
            return productDoc.tcgplayerId;
        });
        const scrapedPrices = yield (0, scraper_1.scrapeCurrent)(tcgplayerIds);
        // set price date
        let priceDate = new Date();
        priceDate.setMinutes(0, 0, 0);
        let priceDocs = [];
        // iterate through each Product
        productDocs.forEach((productDoc) => {
            const tcgplayerId = productDoc.tcgplayerId;
            // get price data
            const priceData = scrapedPrices.get(tcgplayerId);
            // create IPrice
            if (priceData === null || priceData === void 0 ? void 0 : priceData.marketPrice) {
                let prices = {
                    marketPrice: priceData.marketPrice
                };
                if (priceData.buylistMarketPrice) {
                    prices.buylistMarketPrice = priceData.buylistMarketPrice;
                }
                if (priceData.listedMedianPrice) {
                    prices.listedMedianPrice = priceData.listedMedianPrice;
                }
                const price = {
                    priceDate: priceDate,
                    tcgplayerId: tcgplayerId,
                    granularity: common_1.TimeseriesGranularity.Hours,
                    prices: prices
                };
                priceDocs.push(price);
                // exclude products with missing data
            }
            else {
                console.log(`No price data found for tcgplayerId: ${tcgplayerId}`);
            }
        });
        const numInserted = yield (0, Price_1.insertPrices)(priceDocs);
        return numInserted;
    });
}
exports.loadTcgplayerCurrentPrices = loadTcgplayerCurrentPrices;
/*
DESC
  Loads historical price data for all known products
INPUT
  dateRange: A TcgPlayerChartDateRange specifying the date range
RETURN
  The number of Price documents inserted
*/
function loadTcgplayerHistoricalPrices(dateRange) {
    return __awaiter(this, void 0, void 0, function* () {
        // get TcgplayerIds that are missing data
        const tcgplayerIds = yield (0, Product_1.getTcgplayerIdsForHistoricalScrape)(dateRange);
        // get Product docs for relevant TcgplayerIds
        const allProductDocs = yield (0, Product_1.getProductDocs)();
        const productDocs = allProductDocs.filter((productDoc) => {
            return tcgplayerIds.includes(productDoc.tcgplayerId);
        });
        // scrape historical data
        const scrapedPrices = yield (0, scraper_1.scrapeHistorical)(tcgplayerIds, dateRange);
        let priceDocs = [];
        // iterate through each Product
        productDocs.forEach(productDoc => {
            const tcgplayerId = productDoc.tcgplayerId;
            // get price data
            const datedPriceData = scrapedPrices.get(tcgplayerId);
            // create IPrices
            if (datedPriceData) {
                datedPriceData.forEach((priceData) => {
                    const price = {
                        priceDate: priceData.priceDate,
                        tcgplayerId: tcgplayerId,
                        granularity: common_1.TimeseriesGranularity.Hours,
                        prices: priceData.prices
                    };
                    priceDocs.push(price);
                });
                // exclude products with missing data
            }
            else {
                console.log(`No price data found for tcgplayerId: ${tcgplayerId}`);
            }
        });
        const numInserted = yield (0, Price_1.insertPrices)(priceDocs);
        return numInserted;
    });
}
exports.loadTcgplayerHistoricalPrices = loadTcgplayerHistoricalPrices;
// =======
// TCG CSV
// =======
/*
DESC
  Loads Prices from TCGCSV for all Products with a validated TCProduct
INPUT
  categoryId: The TCGCSV categoryId
RETURN
  The number of documents loaded for the input Category
*/
function loadTcgcsvPrices(categoryId) {
    return __awaiter(this, void 0, void 0, function* () {
        // get Products
        const products = yield (0, Product_1.getProductDocs)();
        const tcgplayerIds = (0, common_1.getReleasedProducts)(products)
            .map((product) => {
            return product.tcgplayerId;
        });
        // get validated TCProducts
        const params = {
            categoryId: categoryId,
            status: common_1.ParsingStatus.Validated,
            tcgplayerIds: tcgplayerIds
        };
        const tcProducts = yield (0, TCProduct_1.getTCProductDocs)(params);
        // construct map of groupId -> tcgplayerIds
        let groupIdMap = new Map();
        tcProducts.forEach((product) => {
            var _a;
            // create groupValues
            let groupValues = (_a = groupIdMap.get(product.groupId)) !== null && _a !== void 0 ? _a : [];
            groupValues.push(product.tcgplayerId);
            // update maps
            groupIdMap.set(product.groupId, groupValues);
        });
        // create loadTCPrices promises
        const promises = [...groupIdMap.keys()].map((groupId) => {
            const tcgplayerIds = groupIdMap.get(groupId);
            return loadTCPrices(categoryId, groupId, tcgplayerIds);
        });
        // call loadTCPrices
        const res = yield Promise.all(promises);
        return _.sum(res);
    });
}
exports.loadTcgcsvPrices = loadTcgcsvPrices;
/*
DESC
  Loads TCGCSV Groups for the input TCGCSV categoryId
INPUT
  categoryId: The TCGCSV categoryId
RETURN
  The number of documents loaded for the input Category
*/
function loadTCGroups(categoryId) {
    return __awaiter(this, void 0, void 0, function* () {
        // verify categoryId is recognized
        (0, common_1.assert)(tcgcsv_2.TCCATEGORYID_TO_TCG_MAP.get(categoryId), `CategoryId not found in TCCATEGORYID_TO_TCG: ${categoryId}`);
        // get TCGroup data
        const groups = yield (0, tcgcsv_1.getParsedTCGroups)(categoryId);
        // remove existing Groups
        const existingGroups = yield (0, TCGroup_1.getTCGroupDocs)(categoryId);
        const existingGroupIds = existingGroups.map((group) => {
            return group.groupId;
        });
        const newGroups = groups.filter((group) => {
            return !existingGroupIds.includes(group.groupId);
        });
        // insert new Groups
        if (newGroups)
            return yield (0, TCGroup_1.insertTCGroups)(newGroups);
        return 0;
    });
}
exports.loadTCGroups = loadTCGroups;
/*
DESC
  Loads TCGCSV Prices for the input TCGCSV categoryId and groupId, and
  optionally a list of tcgplayerIds
INPUT
  categoryId: The TCGCSV categoryId
  groupId: The TCGCSV groupId
  tcgplayerIds?: A list of tcgplayerIds for which to load prices
RETURN
  The number of documents loaded for the input Category and Group, and
  optionally a list of tcgplayerIds
*/
function loadTCPrices(categoryId, groupId, tcgplayerIds) {
    return __awaiter(this, void 0, void 0, function* () {
        // get validated TCProducts
        const params = tcgplayerIds
            ? {
                tcgplayerIds: tcgplayerIds
            } : {
            categoryId: categoryId,
            groupId: groupId,
            status: common_1.ParsingStatus.Validated
        };
        const tcproducts = yield (0, TCProduct_1.getTCProductDocs)(params);
        const filteredTcgplayerIds = tcgplayerIds !== null && tcgplayerIds !== void 0 ? tcgplayerIds : tcproducts.map((tcproduct) => {
            return tcproduct.tcgplayerId;
        });
        if (filteredTcgplayerIds.length === 0) {
            console.log(`No tcgplayerIds found for [${categoryId}, ${groupId}]`);
            return 0;
        }
        // get TCPrices for validated TCProducts
        const allTcprices = yield (0, tcgcsv_1.getParsedTCPrices)(categoryId, groupId);
        const tcprices = allTcprices.filter((tcprice) => {
            return filteredTcgplayerIds.includes(tcprice.productId);
        });
        // convert TCPrices to Prices
        const priceDate = (0, common_1.getUTCDateFromLocalDate)(new Date());
        const prices = tcprices.map((tcprice) => {
            return {
                priceDate: priceDate,
                tcgplayerId: tcprice.productId,
                granularity: common_1.TimeseriesGranularity.Hours,
                prices: { marketPrice: tcprice.marketPrice }
            };
        });
        // insert Prices
        if (prices)
            yield (0, Price_1.insertPrices)(prices);
        return 0;
    });
}
exports.loadTCPrices = loadTCPrices;
function loadTCProducts({ categoryId, groupId, startReleaseDate, endReleaseDate } = {
    categoryId: 0
}) {
    return __awaiter(this, void 0, void 0, function* () {
        // verify that groupId or startReleaseDate is provided
        (0, common_1.assert)(groupId || startReleaseDate, 'Either groupId or startReleaseDate must be provided');
        // verify categoryId is recognized
        (0, common_1.assert)(tcgcsv_2.TCCATEGORYID_TO_TCG_MAP.get(categoryId), `CategoryId not found in TCCATEGORYID_TO_TCG: ${categoryId}`);
        // get groupIds released on or after releaseDate
        const groups = yield (0, TCGroup_1.getTCGroupDocs)(categoryId);
        const groupIds = groups
            .filter((group) => {
            return groupId
                ? group.groupId === groupId
                : startReleaseDate
                    && group.publishedOn
                    && (0, common_1.isDateBetween)(group.publishedOn, startReleaseDate, endReleaseDate !== null && endReleaseDate !== void 0 ? endReleaseDate : new Date(), true);
        })
            .map((group) => {
            return group.groupId;
        });
        const promises = groupIds.map((id) => {
            return (0, tcgcsv_1.getParsedTCProducts)(categoryId, id);
        });
        const resolvedPromises = yield Promise.all(promises);
        const products = _.flattenDeep(resolvedPromises);
        // remove existing Products
        const existingTCProducts = yield (0, TCProduct_1.getTCProductDocs)({
            categoryId: categoryId, groupId: groupId
        });
        const existingProducts = yield (0, Product_1.getProductDocs)();
        const existingTcgplayerIds = _.union(existingTCProducts.map((product) => {
            return product.tcgplayerId;
        }), existingProducts.map((product) => {
            return product.tcgplayerId;
        }));
        const newProducts = products.filter((product) => {
            return !existingTcgplayerIds.includes(product.tcgplayerId);
        });
        // insert new Products
        if (newProducts)
            return yield (0, TCProduct_1.insertTCProducts)(newProducts);
        return 0;
    });
}
exports.loadTCProducts = loadTCProducts;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // const tcgplayerId = 224721
        // const inserted = await loadCurrentPrice(tcgplayerId)
        // const res = inserted
        //   ? `Inserted price for tcgplayerId: ${tcgplayerId}`
        //   : `Could not insert price for tcgplayerId: ${tcgplayerId}`
        // console.log(res)
        // const numInserted = await loadCurrentPrices()
        // console.log(`Inserted ${numInserted} docs`)
        // const numInserted = await loadHistoricalPrices(TcgPlayerChartDateRange.OneYear)
        // console.log(`Inserted ${numInserted} docs`)
        // const categoryId = 62
        // const groupId = 23303
        // const startReleaseDate = new Date(Date.parse('2016-01-01'))
        // const endReleaseDate = new Date(Date.parse('2017-01-01'))
        // const params = {
        //   categoryId: categoryId,
        //   startReleaseDate: startReleaseDate,
        //   endReleaseDate: endReleaseDate,
        // }
        // const date = new Date(Date.parse('2023-02-01'))
        // console.log(isDateBetween(date, startReleaseDate, endReleaseDate, true))
        // const tcgplayerId = 521581
        // const res = await setTCProductProperty(tcgplayerId, 'status', ParsingStatus.ToBeValidated)
        // const res = await loadTCProducts(params)
        // console.log(`Inserted ${res} docs for: ${TCCATEGORYID_TO_TCG_MAP.get(categoryId)}`)
        // const tcprices = await getParsedTCPrices(71, 22937)
        // const res = await loadTCPrices(categoryId, groupId)
        // console.log(`Inserted ${res} docs for: ${TCCATEGORYID_TO_TCG_MAP.get(categoryId)}`)
        // const res = await loadTcgcsvPrices(categoryId)
        // console.log(`Loaded ${res} Price documents for categoryId ${categoryId}`)
        process.exit(0);
    });
}
main()
    .then(console.log)
    .catch(console.error);
