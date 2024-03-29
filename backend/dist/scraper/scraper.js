"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
exports.scrapeHistorical = exports.scrapeCurrent = void 0;
// imports
const common_1 = require("common");
const _ = __importStar(require("lodash"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const Chart_1 = require("../utils/Chart");
// =========
// constants
// =========
const URL_BASE = 'https://www.tcgplayer.com/product/';
const PRICE_CHART_RENDER_DELAY = 3000;
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
  Returns a new Page from the input Puppeteer Browser, or a new Browser
INPUT
  browser?: An existing Puppeteer Browser
RETURN
  A Puppeteer Page
*/
function getPage(browser) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // get browser
            const browserObj = browser !== null && browser !== void 0 ? browser : yield getBrowser();
            // success
            if (browserObj) {
                return yield browserObj.newPage();
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
// --------------
// main functions
// --------------
/*
DESC
  Scrapes current price data for the input tcgplayerIds
INPUT
  Array of tcgplayerIds
RETURN
  A Map of tcgplayerId -> IPriceData
*/
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
                const selector = "//section[@class='price-points price-guide__points']";
                yield page.waitForXPath(selector);
                // set path for Current Price Points table
                const headerPath = '.price-guide__points table tr:not(.price-points__header)';
                // scrape text from divs
                const scrapedTexts = yield page.$$eval(headerPath, rows => {
                    let scrapedText = [];
                    rows.forEach((row) => {
                        var _a, _b, _c, _d;
                        const divText = (_b = (_a = row.querySelector('.text')) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim();
                        const divPrice = (_d = (_c = row.querySelector('.price')) === null || _c === void 0 ? void 0 : _c.textContent) === null || _d === void 0 ? void 0 : _d.trim();
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
/*
DESC
  Scrapes historical price data for the input tcgplayerIds
INPUT
  Array of tcgplayerIds
RETURN
  A Map of tcgplayerId -> IDatedPriceData[]
*/
function scrapeHistorical(tcgplayerIds, dateRange) {
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
                // wait for price chart to render
                const priceChartPath = "//div[@class='martech-charts-bottom-controls']//div[@class='charts-time-frame']";
                yield page.waitForXPath(priceChartPath);
                // change the chart date range, if necessary
                if (dateRange != Chart_1.TcgPlayerChartDateRange.ThreeMonths) {
                    const buttonLabel = Chart_1.TcgPlayerChartDataRangeToDateRangeButton[dateRange];
                    const chartLabel = Chart_1.TcgPlayerChartDataRangeToDateRangeChart[dateRange];
                    const buttonPath = `//button[@class='charts-item' and contains(., '${buttonLabel}')]`;
                    const [button] = yield page.$x(buttonPath);
                    if (button) {
                        yield button.click();
                    }
                    else {
                        const msg = `Could not find button path: ${buttonPath}`;
                        throw new Error(msg);
                    }
                    // wait for chart to update
                    yield (0, common_1.sleep)(PRICE_CHART_RENDER_DELAY);
                    const pastYearPath = `//div[@class='charts-timeframe' and contains(., '${chartLabel}')]`;
                    yield page.waitForXPath(pastYearPath);
                }
                // set path for Price History table
                const chartPath = '.chart-container table tbody tr';
                // scrape text from divs
                const scrapedTexts = yield page.$$eval(chartPath, rows => {
                    let scrapedText = [];
                    rows.forEach((row) => {
                        var _a, _b;
                        if (row.cells.length === 2) {
                            const divText = (_a = row.cells[0].textContent) === null || _a === void 0 ? void 0 : _a.trim();
                            const divPrice = (_b = row.cells[1].textContent) === null || _b === void 0 ? void 0 : _b.trim();
                            if (divText && divPrice) {
                                scrapedText.push({
                                    text: divText,
                                    price: divPrice
                                });
                            }
                        }
                    });
                    return scrapedText;
                });
                // parse scraped text
                let priceData = [];
                const today = new Date();
                const [curMonth, curDay] = [today.getMonth() + 1, today.getDate()];
                scrapedTexts.forEach((st) => {
                    var _a;
                    if ((0, Chart_1.isTCGPlayerDateRange)(st.text) && (0, common_1.isPriceString)(st.price)
                        && (0, common_1.getPriceFromString)(st.price) > 0) {
                        // get the end date
                        const monthDay = st.text.split(' ')[2].trim();
                        const [strMonth, strDay] = monthDay.split('/')
                            .map(el => el.padStart(2, '0'));
                        const [month, day] = [Number(strMonth), Number(strDay)];
                        const year = (month > curMonth) || (month === curMonth && day > curDay)
                            ? today.getFullYear() - 1
                            : today.getFullYear();
                        // create IDatedPriceData
                        const datedPriceData = {
                            priceDate: new Date(Date.parse(`${year}-${strMonth}-${strDay}`)),
                            prices: {
                                marketPrice: (0, common_1.getPriceFromString)(st.price)
                            }
                        };
                        // append if not a duplicate
                        if (((_a = _.last(priceData)) === null || _a === void 0 ? void 0 : _a.priceDate.getTime())
                            !== datedPriceData.priceDate.getTime()) {
                            priceData.push(datedPriceData);
                        }
                    }
                });
                if (priceData.length > 0) {
                    scrapeData.set(tcgplayerId, priceData);
                }
                else {
                    console.log(`Could not scrape prices for tcgplayerId: ${tcgplayerId}`);
                }
            }
        }
        catch (err) {
            const msg = `Error in scrapeHistorical(): ${err}`;
            throw new Error(msg);
        }
        return scrapeData;
    });
}
exports.scrapeHistorical = scrapeHistorical;
