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
const mongoManager_1 = require("../backend/mongoManager");
const scraper_1 = require("./scraper");
const utils_1 = require("../utils");
// ================
// helper functions
// ================
/*
DESC
    Returns the IPriceData associated with a tcgplayerId, if exists
INPUT
    tcgplayerId: The tcgplayerId to search for
    priceData: The array of IProductPriceData to search
RETURN
    The IPriceData associated with the tcgplayerID, null otherwise
*/
function getPriceData(tcgplayerId, priceData) {
    for (const data of priceData) {
        if (data.tcgplayerId === tcgplayerId) {
            return data.priceData;
        }
        break;
    }
    return null;
}
// ==============
// main functions
// ==============
/*
DESC
    Loads price data for all known products
*/
function loadPrices() {
    return __awaiter(this, void 0, void 0, function* () {
        // get all Products
        const productDocs = yield (0, mongoManager_1.getProducts)();
        console.log(`Retrieved prods: ${JSON.stringify(productDocs, null, 4)}`);
        // scrape price data
        const tcgplayerIds = productDocs.map(doc => doc.tcgplayerId);
        const prices = yield (0, scraper_1.scrape)(tcgplayerIds);
        // insert price data
        let priceDate = new Date();
        priceDate.setMinutes(0, 0, 0);
        let priceDocs = [];
        // iterate through each Product
        for (const productDoc of productDocs) {
            const tcgplayerId = productDoc.tcgplayerId;
            // get price data
            const priceData = getPriceData(tcgplayerId, prices);
            // handle products without price data
            if (priceData === null) {
                console.log(`No price data found for tcgplayerId: ${tcgplayerId}`);
                // handle products without 
                // construct IPrice object
            }
            else {
                let price = {
                    priceDate: priceDate,
                    product: productDoc,
                    granularity: utils_1.TimeseriesGranularity.Hours,
                    marketPrice: priceData.marketPrice
                };
                if (priceData.buylistMarketPrice !== null) {
                    price['buylistMarketPrice'] = priceData.buylistMarketPrice;
                }
                if (priceData.listedMedianPrice !== null) {
                    price['listedMedianPrice'] = priceData.listedMedianPrice;
                }
                priceDocs.push(price);
            }
        }
        // console.log(JSON.stringify(priceDocs, null, 4));
        const numInserted = yield (0, mongoManager_1.insertPrices)(priceDocs);
        return numInserted;
    });
}
loadPrices()
    .then(console.log)
    .catch(console.error);
