"use strict";
exports.__esModule = true;
exports.sortFnDateDesc = exports.sortFnDateAsc = exports.sleep = exports.logObject = exports.isTCGPriceTypeValue = exports.isPriceString = exports.isASCII = exports.getProductSubtypes = exports.getPriceFromString = exports.assert = exports.SECONDS_PER_DAY = exports.MILLISECONDS_PER_SECOND = exports.DAYS_PER_YEAR = void 0;
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
