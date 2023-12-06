"use strict";
exports.__esModule = true;
exports.isTProductPostResBody = exports.isTDataResBody = exports.isTResBody = exports.isITransactionArray = exports.isITransaction = exports.isIProduct = exports.isIPriceDataArray = exports.isIPriceData = exports.isIPriceArray = exports.isIPrice = exports.isIPortfolioArray = exports.isIPortfolio = exports.isIPopulatedPortfolioArray = exports.isIPopulatedPortfolio = exports.isIPopulatedHolding = exports.isIHoldingArray = exports.isIHolding = exports.isIDatedPriceData = exports.hasIPortfolioKeys = exports.hasITransactionKeys = exports.hasIProductKeys = exports.hasIPortfolioBaseKeys = exports.hasIPopulatedPortfolioKeys = exports.hasIPopulatedHoldingKeys = exports.hasIHoldingKeys = exports.hasIHoldingBaseKeys = exports.hasIDatedPriceDataKeys = exports.sortFnDateDesc = exports.sortFnDateAsc = exports.sleep = exports.logObject = exports.isTCGPriceTypeValue = exports.isPriceString = exports.isASCII = exports.getProductSubtypes = exports.getPriceFromString = exports.assert = exports.SECONDS_PER_DAY = exports.MILLISECONDS_PER_SECOND = exports.DAYS_PER_YEAR = void 0;
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
// ------------------
// has interface keys
// ------------------
/*
DESC
  Returns whether or not the input has all IDatedPriceData keys
INPUT
  arg: An object that might be an IDatedPriceData
RETURN
  TRUE if the input has all IDatedPriceData keys, FALSE otherwise
*/
function hasIDatedPriceDataKeys(arg) {
    return arg
        && arg.priceDate
        && arg.prices;
}
exports.hasIDatedPriceDataKeys = hasIDatedPriceDataKeys;
/*
DESC
  Returns whether or not the input has all IHoldingBase keys
INPUT
  arg: An object that might be an IHoldingBase
RETURN
  TRUE if the input has all IHoldingBase keys, FALSE otherwise
*/
function hasIHoldingBaseKeys(arg) {
    return arg
        && arg.transactions;
}
exports.hasIHoldingBaseKeys = hasIHoldingBaseKeys;
/*
DESC
  Returns whether or not the input has all IHolding keys
INPUT
  arg: An object that might be an IHolding
RETURN
  TRUE if the input has all IHolding keys, FALSE otherwise
*/
function hasIHoldingKeys(arg) {
    return arg
        && hasIHoldingBaseKeys(arg)
        && arg.tcgplayerId;
}
exports.hasIHoldingKeys = hasIHoldingKeys;
/*
DESC
  Returns whether or not the input has all IPopulatedHolding keys
INPUT
  arg: An object that might be an IPopulatedHolding
RETURN
  TRUE if the input has all IPopulatedHolding keys, FALSE otherwise
*/
function hasIPopulatedHoldingKeys(arg) {
    return arg
        && hasIHoldingBaseKeys(arg)
        && arg.product;
}
exports.hasIPopulatedHoldingKeys = hasIPopulatedHoldingKeys;
/*
DESC
  Returns whether or not the input has all IPopulatedPortfolio keys
INPUT
  arg: An object that might be an IPopulatedPortfolio
RETURN
  TRUE if the input has all IPopulatedPortfolio keys, FALSE otherwise
*/
function hasIPopulatedPortfolioKeys(arg) {
    return arg
        && hasIPortfolioBaseKeys(arg)
        && arg.populatedHoldings;
}
exports.hasIPopulatedPortfolioKeys = hasIPopulatedPortfolioKeys;
/*
DESC
  Returns whether or not the input has all IPortfolioBase keys
INPUT
  arg: An object that might be an IPortfolioBase
RETURN
  TRUE if the input has all IPortfolioBase keys, FALSE otherwise
*/
function hasIPortfolioBaseKeys(arg) {
    return arg
        && arg.userId
        && arg.portfolioName;
}
exports.hasIPortfolioBaseKeys = hasIPortfolioBaseKeys;
/*
DESC
  Returns whether or not the input has all IProduct keys
INPUT
  arg: An object that might be an IProduct
RETURN
  TRUE if the input has all IProduct keys, FALSE otherwise
*/
function hasIProductKeys(arg) {
    return arg
        && arg.tcgplayerId
        && arg.tcg
        && arg.releaseDate
        && arg.name
        && arg.type
        && arg.language;
}
exports.hasIProductKeys = hasIProductKeys;
/*
DESC
  Returns whether or not the input has all ITransaction keys
INPUT
  arg: An object that might be an ITransaction
RETURN
  TRUE if the input has all ITransaction keys, FALSE otherwise
*/
function hasITransactionKeys(arg) {
    return arg
        && arg.type
        && arg.date
        && arg.price
        && arg.quantity;
}
exports.hasITransactionKeys = hasITransactionKeys;
/*
DESC
  Returns whether or not the input has all IPortfolio keys
INPUT
  arg: An object that might be an IPortfolio
RETURN
  TRUE if the input has all IPortfolio keys, FALSE otherwise
*/
function hasIPortfolioKeys(arg) {
    return arg
        && hasIPortfolioBaseKeys(arg)
        && arg.holdings;
}
exports.hasIPortfolioKeys = hasIPortfolioKeys;
// ---------
// is object
// ---------
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
        && hasIDatedPriceDataKeys(arg)
        && _.isDate(arg.priceDate)
        && isIPriceData(arg.prices);
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
        && hasIHoldingKeys(arg)
        && typeof (arg.tcgplayerId) === 'number'
        && Array.isArray(arg.transactions)
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
        && hasIPopulatedHoldingKeys(arg)
        && isIProduct(arg.product)
        && Array.isArray(arg.transactions)
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
        && hasIPopulatedPortfolioKeys(arg)
        && typeof (arg.userId) === 'number'
        && typeof (arg.portfolioName) === 'string'
        && Array.isArray(arg.populatedHoldings)
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
        && hasIPortfolioKeys(arg)
        && typeof (arg.userId) === 'number'
        && typeof (arg.portfolioName) === 'string'
        && Array.isArray(arg.holdings)
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
        && arg.priceDate && _.isDate(arg.priceData)
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
        // required
        && hasIProductKeys(arg)
        && typeof (arg.tcgplayerId) === 'number'
        && _.values(dataModels_1.TCG).includes(arg.tcg)
        && _.isDate(arg.releaseDate)
        && typeof (arg.name) === 'string'
        && _.values(dataModels_1.ProductType).includes(arg.type)
        && _.values(dataModels_1.ProductLanguage).includes(arg.language)
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
        && hasITransactionKeys(arg)
        && _.values(dataModels_1.TransactionType).includes(arg.type)
        && _.isDate(arg.date)
        && typeof (arg.price) === 'number'
        && typeof (arg.quantity) === 'number';
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
