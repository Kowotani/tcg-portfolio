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
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadHistoricalPrices = exports.loadCurrentPrices = exports.loadCurrentPrice = void 0;
const common_1 = require("common");
const mongoManager_1 = require("../mongo/mongoManager");
const scraper_1 = require("./scraper");
const utils_1 = require("../utils");
// =========
// functions
// =========
/*
DESC
  Loads current price data for the Product specified by the input tcgplayerId
INPUT
  tcgplayerId: The tcgplayerId of the Product
RETURN
  TRUE if the price data was successfully loaded, FALSE otherwise
*/
function loadCurrentPrice(tcgplayerId) {
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
        const numInserted = yield (0, mongoManager_1.insertPrices)([price]);
        return numInserted === 1;
    });
}
exports.loadCurrentPrice = loadCurrentPrice;
/*
DESC
  Loads current price data for all known products
RETURN
  The number of Price documents inserted
*/
function loadCurrentPrices() {
    return __awaiter(this, void 0, void 0, function* () {
        // get all Products
        const allProductDocs = yield (0, mongoManager_1.getProductDocs)();
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
        const numInserted = yield (0, mongoManager_1.insertPrices)(priceDocs);
        return numInserted;
    });
}
exports.loadCurrentPrices = loadCurrentPrices;
/*
DESC
  Loads historical price data for all known products
RETURN
  The number of Price documents inserted
*/
function loadHistoricalPrices() {
    return __awaiter(this, void 0, void 0, function* () {
        // get all Products
        const allProductDocs = yield (0, mongoManager_1.getProductDocs)();
        // exclude unreleased Products
        const productDocs = allProductDocs.filter((product) => {
            return (0, common_1.formatAsISO)(product.releaseDate) <= (0, common_1.formatAsISO)(new Date());
        });
        // scrape price data
        const tcgplayerIds = productDocs.map((productDoc) => {
            return productDoc.tcgplayerId;
        });
        const scrapedPrices = yield (0, scraper_1.scrapeHistorical)(tcgplayerIds, utils_1.TcgPlayerChartDateRange.ThreeMonths);
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
        const numInserted = yield (0, mongoManager_1.insertPrices)(priceDocs);
        return numInserted;
    });
}
exports.loadHistoricalPrices = loadHistoricalPrices;
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
        // const numInserted = await loadHistoricalPrices()
        // console.log(`Inserted ${numInserted} docs`)
    });
}
main()
    .then(console.log)
    .catch(console.error);
