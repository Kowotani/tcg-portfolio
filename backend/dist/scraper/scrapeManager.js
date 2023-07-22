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
// imports
const mongoManager_1 = require("../mongo/mongoManager");
const scraper_1 = require("./scraper");
const common_1 = require("common");
// ==============
// main functions
// ==============
/*
DESC
  Loads price data for all known products
RETURN
  The number of Price documents inserted
*/
function loadPrices() {
    return __awaiter(this, void 0, void 0, function* () {
        // get all Products
        const productDocs = yield (0, mongoManager_1.getProducts)();
        console.log(`Retrieved prods: ${JSON.stringify(productDocs, null, 4)}`);
        // scrape price data
        const tcgplayerIds = productDocs.map(doc => doc.tcgplayerId);
        const scrapedPrices = yield (0, scraper_1.scrape)(tcgplayerIds);
        // insert price data
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
                // construct IPrice object
            }
            else {
                let prices = {
                    marketPrice: priceData.marketPrice
                };
                if (priceData.buylistMarketPrice !== null) {
                    prices.buylistMarketPrice = priceData.buylistMarketPrice;
                }
                if (priceData.listedMedianPrice !== null) {
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
        // console.log(JSON.stringify(priceDocs, null, 4));
        const numInserted = yield (0, mongoManager_1.insertPrices)(priceDocs);
        return numInserted;
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const numInserted = yield loadPrices();
        console.log(`Inserted ${numInserted} docs`);
    });
}
main()
    .then(console.log)
    .catch(console.error);
