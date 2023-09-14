"use strict";
exports.__esModule = true;
exports.isTProductPostResBody = exports.isTDataResBody = exports.isTResBody = exports.isITransactionArray = exports.isITransaction = exports.isIProduct = exports.isIPriceDataArray = exports.isIPriceData = exports.isIPriceArray = exports.isIPrice = exports.isIPortfolioArray = exports.isIPortfolio = exports.isIPopulatedPortfolioArray = exports.isIPopulatedPortfolio = exports.isIPopulatedHolding = exports.isIHoldingArray = exports.isIHolding = exports.isIDatedPriceData = exports.isDate = exports.sortFnDateDesc = exports.sortFnDateAsc = exports.sleep = exports.logObject = exports.isTCGPriceTypeValue = exports.isPriceString = exports.isNumeric = exports.isASCII = exports.getProductSubtypes = exports.getPriceFromString = exports.assert = exports.genDateRange = exports.getISOStringFromDate = exports.SECONDS_PER_DAY = exports.MILLISECONDS_PER_SECOND = exports.DAYS_PER_YEAR = void 0;
var dataModels_1 = require("./dataModels");
var _ = require("lodash");
var util_1 = require("util");
// =========
// constants
// =========
exports.DAYS_PER_YEAR = 365;
exports.MILLISECONDS_PER_SECOND = 1000;
exports.SECONDS_PER_DAY = 86400;
// =========
// functions
// =========
// ----------
// converters
// ----------
/*
  DESC
    Returns the input Date as an ISODate (YYYY-MM-DD)
  INPUT
    date: A Date
  RETURN
    A YYYY-MM-DD formatted version of the input date
*/
function getISOStringFromDate(date) {
    var newDate = new Date(date);
    var year = newDate.getUTCFullYear().toString();
    var month = (newDate.getUTCMonth() + 1).toString().padStart(2, '0');
    var day = (newDate.getUTCDate()).toString().padStart(2, '0');
    return "".concat(year, "-").concat(month, "-").concat(day);
}
exports.getISOStringFromDate = getISOStringFromDate;
/*
DESC
  Returns a typed array of properties from the input object
INPUT
  obj: An object
RETURN
  An array of [key, value] items corresponding to typed properties of the input
REF
  https://stackoverflow.com/questions/69019873/how-can-i-get-typed-object-entries-and-object-fromentries-in-typescript
*/
// export function getTypeSafeObjectEntries<
//   const T extends Record<PropertyKey, unknown>
// >(
//   obj: Tfunction
// ): { [K in keyof T]: [K, T[K]] }[keyof T][]  {
//   return Object.entries(obj) as { [K in keyof T]: [K, T[K]] }[keyof T][]
// }
/*
DESC
  Returns an object with typed properties from the input entries
INPUT
  entries: An iterable
RETURN
  An object whose typed properties correspond to the input iterable entries
REF
  https://stackoverflow.com/questions/69019873/how-can-i-get-typed-object-entries-and-object-fromentries-in-typescript
*/
// export function getTypeSafeObjectFromEntries<
//   const T extends ReadonlyArray<readonly [PropertyKey, unknown]>
// > (
//   entries: T
// ): { [K in T[number] as K[0]]: K[1] } {
//   return Object.fromEntries(entries) as { [K in T[number] as K[0]]: K[1] }
// }
// ----------
// generators
// ----------
/*
DESC
  Generates an array of dates between the input startDate and endDate inclusive
INPUT
  startDate: The starting date
  endDate: The ending date
RETURN
  A Date[]
*/
function genDateRange(startDate, endDate) {
    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(0, 0, 0, 0);
    var date = new Date(startDate.getTime());
    var dates = [];
    while (date <= endDate) {
        dates.push(new Date(date));
        date.setUTCDate(date.getUTCDate() + 1);
    }
    return dates;
}
exports.genDateRange = genDateRange;
// -------
// generic
// -------
/*
DESC
  Basic assertion function
INPUT
  condition: A condition to assert is true
  msg: An optional message to display
*/
function assert(condition, msg) {
    if (!condition) {
        throw new Error('Assertion Error: ' + msg);
    }
}
exports.assert = assert;
/*
DESC
  Converts a price string (determined by isPriceString()) to a number
INPUT
  A string to convert
RETURN
  The extracted price as a number from the string (eg. '$1,234.56' => 1234.56)
  Will return NaN if the input is not a price string
*/
function getPriceFromString(value) {
    return isPriceString(value)
        ? parseFloat(value.replace(',', '').substring(1))
        : NaN;
}
exports.getPriceFromString = getPriceFromString;
/*
DESC
  Returns an array of valid ProductSubtypes for the given TCG and ProductType
INPUT
  tcg: A TCG enum
  productType: A ProductType enum
RETURN
  An array of ProductSubtypes for the given TCG and ProductType
*/
function getProductSubtypes(tcg, productType) {
    var tcgArray = dataModels_1.TCGToProductSubtype[tcg];
    var productTypeArray = dataModels_1.ProductTypeToProductSubtype[productType];
    return _.intersection(tcgArray, productTypeArray);
}
exports.getProductSubtypes = getProductSubtypes;
/*
DESC
  Returns whether the input string contains only ASCII characters
INPUT
  A string to check
RETURN
  TRUE if the input contains only ASCII characters, FALSE otherwise
*/
function isASCII(value) {
    return /^[\x00-\x7F]*$/.test(value);
    ;
}
exports.isASCII = isASCII;
/*
DESC
  Returns whether the input is a number
INPUT
  A value to check
RETURN
  TRUE if the input is a number, FALSE otherwise
*/
function isNumeric(value) {
    return !isNaN(value);
}
exports.isNumeric = isNumeric;
/*
DESC
  Returns whether the input is a valid price string
  The expected unescaped regex format is:
    ^\$\d+\.\d{2}$
INPUT
  A string to check
RETURN
  TRUE if the input follows the following regex (which roughtly corresponds
    to numbers like $123.45), FALSE otherwise
*/
function isPriceString(value) {
    var regexp = new RegExp('^\\$\\d+(,?\\d+)*\\.\\d{2}$');
    return regexp.test(value);
}
exports.isPriceString = isPriceString;
/*
DESC
  Returns whether the input string matches a TCGPriceType value
INPUT
  A string to check
RETURN
  TRUE if the input matches a TCGPriceType value
*/
function isTCGPriceTypeValue(value) {
    var arr = Object.values(dataModels_1.TCGPriceType).map(function (v) { return v.toString(); });
    return arr.includes(value);
}
exports.isTCGPriceTypeValue = isTCGPriceTypeValue;
/*
DESC
  Console.logs the input Object with full details
INPUT
  arg: An Object
*/
function logObject(arg) {
    console.log((0, util_1.inspect)(arg, false, null, true));
}
exports.logObject = logObject;
/*
DESC
  Pauses execution for the input ms
INPUT
  ms: The milliseconds to sleep
*/
function sleep(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
exports.sleep = sleep;
// -------
// sorting
// -------
/*
DESC
  Function used for sorting dates in ascending order
INPUT
  a: The first Date
  b: The second Date
RETURN
  A negative number if a < b, otherwise a positive number if a > b
*/
function sortFnDateAsc(a, b) {
    return a.getTime() - b.getTime();
}
exports.sortFnDateAsc = sortFnDateAsc;
/*
DESC
  Function used for sorting dates in descending order
INPUT
  a: The first Date
  b: The second Date
RETURN
  A negative number if a > b, otherwise a positive number if a < b
*/
function sortFnDateDesc(a, b) {
    return b.getTime() - a.getTime();
}
exports.sortFnDateDesc = sortFnDateDesc;
// ===========
// type guards
// ===========
/*
DESC
  Returns whether or not the input is a Date
INPUT
  arg: An object that might be a Date
RETURN
  TRUE if the input is a Date, FALSE otherwise
*/
function isDate(arg) {
    return arg
        && !Number.isNaN(Date.parse(arg));
}
exports.isDate = isDate;
/*
DESC
  Returns whether or not the input is an IDatedPriceData
INPUT
  arg: An object that might be an IDatedPriceData
RETURN
  TRUE if the input is an IDatedPriceData, FALSE otherwise
*/
function isIDatedPriceData(arg) {
    return arg
        && arg.priceDate && isDate(arg.priceDate)
        && arg.prices && isIPriceData(arg.prices);
}
exports.isIDatedPriceData = isIDatedPriceData;
/*
DESC
  Returns whether or not the input is an IHolding
INPUT
  arg: An object that might be an IHolding
RETURN
  TRUE if the input is an IHolding, FALSE otherwise
*/
function isIHolding(arg) {
    return arg
        && arg.tcgplayerId && typeof (arg.tcgplayerId) === 'number'
        && arg.transactions && Array.isArray(arg.transactions)
        && _.every(arg.transactions.map(function (el) {
            return isITransaction(el);
        }));
}
exports.isIHolding = isIHolding;
/*
DESC
  Returns whether or not the input is an IHolding[]
INPUT
  arg: An object that might be an IHolding[]
RETURN
  TRUE if the input is an IHolding[], FALSE otherwise
*/
function isIHoldingArray(arg) {
    return arg
        && Array.isArray(arg)
        && _.every(arg.map(function (el) {
            return isIHolding(el);
        }));
}
exports.isIHoldingArray = isIHoldingArray;
/*
DESC
  Returns whether or not the input is an IPopulatedHolding
INPUT
  arg: An object that might be an IPopulatedHolding
RETURN
  TRUE if the input is an IPopulatedHolding, FALSE otherwise
*/
function isIPopulatedHolding(arg) {
    return arg
        && arg.product && isIProduct(arg.product)
        && arg.transactions && Array.isArray(arg.transactions)
        && _.every(arg.transactions.map(function (el) {
            return isITransaction(el);
        }));
}
exports.isIPopulatedHolding = isIPopulatedHolding;
/*
DESC
  Returns whether or not the input is an IPopulatedPortfolio
INPUT
  arg: An object that might be an IPopulatedPortfolio
RETURN
  TRUE if the input is an IPopulatedPortfolio, FALSE otherwise
*/
function isIPopulatedPortfolio(arg) {
    return arg
        && arg.userId && typeof (arg.userId) === 'number'
        && arg.portfolioName && typeof (arg.portfolioName) === 'string'
        && arg.populatedHoldings && Array.isArray(arg.populatedHoldings)
        && _.every(arg.populatedHoldings.map(function (el) {
            return isIPopulatedHolding(el);
        }));
}
exports.isIPopulatedPortfolio = isIPopulatedPortfolio;
/*
DESC
  Returns whether or not the input is an IPopulatedPortfolio[]
INPUT
  arg: An object that might be an IPopulatedPortfolio[]
RETURN
  TRUE if the input is an IPopulatedPortfolio[], FALSE otherwise
*/
function isIPopulatedPortfolioArray(arg) {
    return arg
        && Array.isArray(arg)
        && _.every(arg.map(function (el) {
            return isIPopulatedPortfolio(el);
        }));
}
exports.isIPopulatedPortfolioArray = isIPopulatedPortfolioArray;
/*
DESC
  Returns whether or not the input is an IPortfolio
INPUT
  arg: An object that might be an IPortfolio
RETURN
  TRUE if the input is an IPortfolio, FALSE otherwise
*/
function isIPortfolio(arg) {
    return arg
        && arg.userId && typeof (arg.userId) === 'number'
        && arg.portfolioName && typeof (arg.portfolioName) === 'string'
        && arg.holdings && Array.isArray(arg.holdings)
        && _.every(arg.holdings.map(function (el) {
            return isIHolding(el);
        }));
}
exports.isIPortfolio = isIPortfolio;
/*
DESC
  Returns whether or not the input is an IPortfolio[]
INPUT
  arg: An object that might be an IPortfolio[]
RETURN
  TRUE if the input is an IPortfolio[], FALSE otherwise
*/
function isIPortfolioArray(arg) {
    return arg
        && Array.isArray(arg)
        && _.every(arg.map(function (el) {
            return isIPortfolio(el);
        }));
}
exports.isIPortfolioArray = isIPortfolioArray;
/*
DESC
  Returns whether or not the input is an IPrice
INPUT
  arg: An object that might be an IPrice
RETURN
  TRUE if the input is an IPrice, FALSE otherwise
*/
function isIPrice(arg) {
    return arg
        && arg.priceDate && isDate(arg.priceData)
        && arg.tcgplayerId && typeof (arg.tcgplayerId) === 'number'
        && arg.granularity && typeof (arg.granularity) === 'string'
        && arg.prices && isIPriceData(arg.prices);
}
exports.isIPrice = isIPrice;
/*
DESC
  Returns whether or not the input is an IPrice[]
INPUT
  arg: An object that might be an IPrice[]
RETURN
  TRUE if the input is an IPrice[], FALSE otherwise
*/
function isIPriceArray(arg) {
    return arg
        && Array.isArray(arg)
        && _.every(arg.map(function (el) {
            return isIPrice(el);
        }));
}
exports.isIPriceArray = isIPriceArray;
/*
DESC
  Returns whether or not the input is an IPriceData
INPUT
  arg: An object that might be an IPriceData
RETURN
  TRUE if the input is an IPriceData, FALSE otherwise
*/
function isIPriceData(arg) {
    return arg
        // required
        && arg.marketPrice && typeof (arg.marketPrice) === 'number'
        // optional
        && arg.buylistMarketPrice
        ? typeof (arg.buylistMarketPrice) === 'number'
        : true
            && arg.listedMedianPrice
            ? typeof (arg.listedMedianPrice) === 'number'
            : true;
}
exports.isIPriceData = isIPriceData;
/*
DESC
  Returns whether or not the input is an IPriceData[]
INPUT
  arg: An object that might be an IPriceData[]
RETURN
  TRUE if the input is an IPriceData[], FALSE otherwise
*/
function isIPriceDataArray(arg) {
    return arg
        && Array.isArray(arg)
        && _.every(arg.map(function (el) {
            return isIPriceData(el);
        }));
}
exports.isIPriceDataArray = isIPriceDataArray;
/*
DESC
  Returns whether or not the input is an IProduct
INPUT
  arg: An object that might be an IProduct
RETURN
  TRUE if the input is an IProduct, FALSE otherwise
*/
function isIProduct(arg) {
    return arg
        // require
        && arg.tcgplayerId && typeof (arg.tcgplayerId) === 'number'
        && arg.tcg && _.values(dataModels_1.TCG).includes(arg.tcg)
        && arg.releaseDate && isDate(arg.releaseDate)
        && arg.name && typeof (arg.name) === 'string'
        && arg.type && _.values(dataModels_1.ProductType).includes(arg.type)
        && arg.language && _.values(dataModels_1.ProductLanguage).includes(arg.language)
        // optional
        && arg.msrp ? typeof (arg.msrp) === 'number' : true
        && arg.subtype ? _.values(dataModels_1.ProductSubtype).includes(arg.subtype) : true
        && arg.setCode ? typeof (arg.setCode) === 'string' : true;
}
exports.isIProduct = isIProduct;
/*
DESC
  Returns whether or not the input is an ITransaction
INPUT
  arg: An object that might be an ITransaction
RETURN
  TRUE if the input is an ITransaction, FALSE otherwise
*/
function isITransaction(arg) {
    return arg
        && arg.type && _.values(dataModels_1.TransactionType).includes(arg.type)
        && arg.date && isDate(arg.date)
        && arg.price && typeof (arg.price) === 'number'
        && arg.quantity && typeof (arg.quantity) === 'number';
}
exports.isITransaction = isITransaction;
/*
DESC
  Returns whether or not the input is an ITransaction[]
INPUT
  arg: An object that might be an ITransaction[]
RETURN
  TRUE if the input is an ITransaction[], FALSE otherwise
*/
function isITransactionArray(arg) {
    return arg
        && Array.isArray(arg)
        && _.every(arg.map(function (el) {
            return isITransaction(el);
        }));
}
exports.isITransactionArray = isITransactionArray;
// -- HTTP responses
/*
DESC
  Returns whether or not the input is a TResBody
INPUT
  arg: An object that might be an TResBody
RETURN
  TRUE if the input is an TResBody, FALSE otherwise
*/
function isTResBody(arg) {
    return arg
        && arg.message && typeof (arg.message) === 'string';
}
exports.isTResBody = isTResBody;
/*
DESC
  Returns whether or not the input is a TDataResBody
INPUT
  arg: An object that might be an TDataResBody
RETURN
  TRUE if the input is an TDataResBody, FALSE otherwise
*/
function isTDataResBody(arg) {
    return arg
        // TODO: implement the type check
        && arg.data
        && isTResBody(arg);
}
exports.isTDataResBody = isTDataResBody;
/*
DESC
  Returns whether or not the input is a TProductPostResBody
INPUT
  arg: An object that might be an TProductPostResBody
RETURN
  TRUE if the input is an TProductPostResBody, FALSE otherwise
*/
function isTProductPostResBody(arg) {
    return arg
        && arg.tcgplayerId && typeof (arg.tcgplayerId) === 'number'
        && isTDataResBody(arg);
}
exports.isTProductPostResBody = isTProductPostResBody;
