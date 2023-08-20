"use strict";
exports.__esModule = true;
exports.isTProductPostResBody = exports.isTDataResBody = exports.isTResBody = exports.isITransaction = exports.isIProduct = exports.isIPriceData = exports.isIPrice = exports.isIPortfolio = exports.isIPopulatedPortfolio = exports.isIPopulatedHolding = exports.isIHolding = exports.sortFnDateDesc = exports.sortFnDateAsc = exports.isTCGPriceTypeValue = exports.isPriceString = exports.isNumeric = exports.isASCII = exports.getProductSubtypes = exports.getPriceFromString = exports.assert = exports.SECONDS_PER_DAY = exports.MILLISECONDS_PER_SECOND = exports.DAYS_PER_YEAR = void 0;
var dataModels_1 = require("./dataModels");
var _ = require("lodash");
// =========
// constants
// =========
exports.DAYS_PER_YEAR = 365;
exports.MILLISECONDS_PER_SECOND = 1000;
exports.SECONDS_PER_DAY = 86400;
// =========
// functions
// =========
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
  The extracted price as a number from the string (eg. '$123.45' => 123.45)
  Will return NaN if the input is not a price string
*/
function getPriceFromString(value) {
    return isPriceString(value)
        ? parseFloat(value.substring(1))
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
INPUT
  A string to check
RETURN
  TRUE if the input follows the following regex (which roughtly corresponds
    to numbers like $123.45), FALSE otherwise
  regex = ^\$\d+\.\d{2}$
*/
function isPriceString(value) {
    var regexp = new RegExp('^\\$\\d+\\.\\d{2}$');
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
        && _.every(arg.populatedHoldings.forEach(function (el) {
            return isIPopulatedHolding(el);
        }));
}
exports.isIPopulatedPortfolio = isIPopulatedPortfolio;
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
        && _.every(arg.holdings.forEach(function (el) {
            return isIHolding(el);
        }));
}
exports.isIPortfolio = isIPortfolio;
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
        && arg.priceDate && arg.priceData instanceof Date
        && arg.tcgplayerId && typeof (arg.tcgplayerId) === 'number'
        && arg.granularity && typeof (arg.granularity) === 'string'
        && arg.prices && isIPriceData(arg.prices);
}
exports.isIPrice = isIPrice;
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
        && arg.releaseDate && arg.releaseDate instanceof Date
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
        && arg.date && arg.date instanceof Date
        && arg.price && typeof (arg.price) === 'number'
        && arg.quantity && typeof (arg.quantity) === 'number';
}
exports.isITransaction = isITransaction;
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
