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
exports.scrapeCurrent = void 0;
// imports
const browser_1 = require("./browser");
const common_1 = require("common");
function scrapeCurrent(ids) {
    return __awaiter(this, void 0, void 0, function* () {
        // create browser instance and page
        const browser = yield (0, browser_1.getBrowser)();
        if (browser === undefined) {
            console.log('Browser not instantiated. Returning empty map');
            return new Map();
        }
        const page = yield browser.newPage();
        // store return data
        let scrapeData = new Map();
        // iterate through ids
        const baseUrl = 'https://www.tcgplayer.com/product/';
        for (const id of ids) {
            const url = baseUrl + id + '/';
            // navigate to the url
            console.log(`Navigating to ${url} ...`);
            try {
                yield page.goto(url);
            }
            catch (err) {
                console.log(`Error navigating to ${url}: ${err}`);
            }
            // wait for price guide to load
            yield page.waitForSelector('.price-guide__points');
            // const validText: string[] = Object.values(TCGPriceType)
            const headerPath = '.price-guide__points > table > tr:not(.price-points__header)';
            // create price object
            try {
                // scrape text from divs
                const scrapedTexts = yield page.$$eval(headerPath, rows => {
                    var _a, _b, _c, _d, _e, _f;
                    let scrapedText = [];
                    for (const row of rows) {
                        const divText = (_c = (_b = (_a = row === null || row === void 0 ? void 0 : row.querySelector('.text')) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : '';
                        const divPrice = (_f = (_e = (_d = row === null || row === void 0 ? void 0 : row.querySelector('.price')) === null || _d === void 0 ? void 0 : _d.textContent) === null || _e === void 0 ? void 0 : _e.trim()) !== null && _f !== void 0 ? _f : '';
                        if (divText.length > 0 && divPrice.length > 0) {
                            scrapedText.push({ text: divText, price: divPrice });
                        }
                    }
                    return scrapedText;
                });
                // parse scraped text
                let data = {};
                scrapedTexts.forEach((st) => {
                    if ((0, common_1.isTCGPriceTypeValue)(st.text) && (0, common_1.isPriceString)(st.price)) {
                        data[st.text] = (0, common_1.getPriceFromString)(st.price);
                    }
                });
                // create IPriceData
                let priceData = {
                    marketPrice: data[common_1.TCGPriceType.MarketPrice]
                };
                if (data[common_1.TCGPriceType.BuylistMarketPrice]) {
                    priceData.buylistMarketPrice = data[common_1.TCGPriceType.BuylistMarketPrice];
                }
                if (data[common_1.TCGPriceType.ListedMedianPrice]) {
                    priceData.listedMedianPrice = data[common_1.TCGPriceType.ListedMedianPrice];
                }
                scrapeData.set(id, priceData);
            }
            catch (err) {
                console.log(`Error scraping from ${url}: ${err}`);
            }
        }
        return scrapeData;
    });
}
exports.scrapeCurrent = scrapeCurrent;
