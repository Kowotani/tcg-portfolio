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
exports.loadPrices = exports.loadPrice = void 0;
// imports
const mongoManager_1 = require("../mongo/mongoManager");
const scraper_1 = require("./scraper");
const common_1 = require("common");
// =========
// functions
// =========
/*
DESC
  Loads price data for the Product specified by the input tcgplayerId
INPUT
  tcgplayerId: The tcgplayerId of the Product
RETURN
  TRUE if the price data was successfully loaded, FALSE otherwise
*/
function loadPrice(tcgplayerId) {
    return __awaiter(this, void 0, void 0, function* () {
        // scrape price data
        const scrapedPrices = yield (0, scraper_1.scrape)([tcgplayerId]);
        console.log(scrapedPrices);
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
exports.loadPrice = loadPrice;
/*
DESC
  Loads price data for all known products
RETURN
  The number of Price documents inserted
*/
function loadPrices() {
    return __awaiter(this, void 0, void 0, function* () {
        // get all Products
        const productDocs = yield (0, mongoManager_1.getProductDocs)();
        console.log(`Retrieved prods: ${JSON.stringify(productDocs, null, 4)}`);
        // scrape price data
        const tcgplayerIds = productDocs.map(doc => doc.tcgplayerId);
        const scrapedPrices = yield (0, scraper_1.scrape)(tcgplayerIds);
        // set price date
        let priceDate = new Date();
        priceDate.setMinutes(0, 0, 0);
        let priceDocs = [];
        // iterate through each Product
        for (const productDoc of productDocs) {
            const tcgplayerId = productDoc.tcgplayerId;
            // get price data
            const priceData = scrapedPrices.get(tcgplayerId);
            // handle products without price data
            if (priceData === undefined) {
                console.log(`No price data found for tcgplayerId: ${tcgplayerId}`);
                // exclude products with missing marketPrice
            }
            else if (priceData.marketPrice === undefined) {
                console.log(`No marketPrice data found for tcgplayerId: ${tcgplayerId}`);
                // create IPrice
            }
            else {
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
            }
        }
        const numInserted = yield (0, mongoManager_1.insertPrices)(priceDocs);
        return numInserted;
    });
}
exports.loadPrices = loadPrices;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // const tcgplayerId = 224721
        // const inserted = await loadPrice(tcgplayerId)
        // const res = inserted
        //   ? `Inserted price for tcgplayerId: ${tcgplayerId}`
        //   : `Could not insert price for tcgplayerId: ${tcgplayerId}`
        // console.log(res)
        // const numInserted = await loadPrices()
        // console.log(`Inserted ${numInserted} docs`)
    });
}
main()
    .then(console.log)
    .catch(console.error);
