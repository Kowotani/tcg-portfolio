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
exports.scrapeCurrent = void 0;
// imports
const common_1 = require("common");
const puppeteer_1 = __importDefault(require("puppeteer"));
// =========
// constants
// =========
const URL_BASE = 'https://www.tcgplayer.com/product/';
// =========
// functions
// =========
// ----------------
// helper functions
// ----------------
function getBrowser() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Opening the browser ...');
        try {
            // initialize browser
            const browser = yield puppeteer_1.default.launch({
                headless: "new",
                args: ["--disable-setuid-sandbox"], 'ignoreHTTPSErrors': true,
            });
            // success
            if (browser) {
                return browser;
                // error
            }
            else {
                const msg = 'Could not create a browser instance';
                throw new Error(msg);
            }
        }
        catch (err) {
            const msg = `Error in getBrowser(): ${err}`;
            throw new Error(msg);
        }
    });
}
/*
DESC
  Returns a new Page from a Puppeteer Browser
RETURN
  A Puppeteer Page
*/
function getPage() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // get browser
            const browser = yield getBrowser();
            // success
            if (browser) {
                return yield browser.newPage();
                // error
            }
            else {
                const msg = 'Could not instatiate Browser';
                throw new Error(msg);
            }
        }
        catch (err) {
            const msg = `Error in getNewPage(): ${err}`;
            throw new Error(msg);
        }
    });
}
/*
DESC
  Returns the input Page after navigating to the input URL
INPUT
  page: The Puppeteer Page
  url: The page URL
RETURN
  THe Puppeteer Page after navigating to the URL
*/
function navigatePage(page, url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // get HTTP response
            console.log(`Navigating to ${url} ...`);
            const res = yield page.goto(url);
            // success
            if (res) {
                return page;
                // error
            }
            else {
                const msg = `Could not navigate to ${url}`;
                throw new Error(msg);
            }
        }
        catch (err) {
            const msg = `Error in getPage(): ${err}`;
            throw new Error(msg);
        }
    });
}
function scrapeCurrent(tcgplayerIds) {
    return __awaiter(this, void 0, void 0, function* () {
        // store return data
        let scrapeData = new Map();
        try {
            // get empty page
            const emptyPage = yield getPage();
            // iterate through ids
            for (const tcgplayerId of tcgplayerIds) {
                // navigate to the url
                const url = URL_BASE + tcgplayerId + '/';
                const page = yield navigatePage(emptyPage, url);
                // wait for price guide to render
                const selector = '.price-guide__points';
                const awaitRender = yield page.waitForSelector(selector);
                if (!awaitRender) {
                    const msg = `Path did not render: ${selector}`;
                    throw new Error(msg);
                }
                // set path for Current Price Points table
                const headerPath = '.price-guide__points > table > tr:not(.price-points__header)';
                // scrape text from divs
                const scrapedTexts = yield page.$$eval(headerPath, rows => {
                    let scrapedText = [];
                    rows.forEach((row) => {
                        var _a, _b, _c, _d;
                        const divText = (_b = (_a = row === null || row === void 0 ? void 0 : row.querySelector('.text')) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim();
                        const divPrice = (_d = (_c = row === null || row === void 0 ? void 0 : row.querySelector('.price')) === null || _c === void 0 ? void 0 : _c.textContent) === null || _d === void 0 ? void 0 : _d.trim();
                        if (divText && divPrice) {
                            scrapedText.push({
                                text: divText,
                                price: divPrice
                            });
                        }
                    });
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
                scrapeData.set(tcgplayerId, priceData);
            }
        }
        catch (err) {
            const msg = `Error in scrapeCurrent(): ${err}`;
            throw new Error(msg);
        }
        return scrapeData;
    });
}
exports.scrapeCurrent = scrapeCurrent;
