"use strict";
exports.__esModule = true;
exports.sortFnDatedValueDesc = exports.sortFnDatedValueAsc = exports.sortFnDateDesc = exports.sortFnDateAsc = exports.sortDatedValues = exports.sleep = exports.logObject = exports.isTCGPriceTypeValue = exports.isPriceString = exports.isASCII = exports.getValueAtDate = exports.getProductSubtypes = exports.getPriceFromString = exports.genSequentialArray = exports.assert = exports.SECONDS_PER_DAY = exports.MILLISECONDS_PER_SECOND = exports.DAYS_PER_YEAR = void 0;
var dataModels_1 = require("./dataModels");
var dateUtils_1 = require("./dateUtils");
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
  Returns an array of sequential numbers between the input start and end
INPUT
  start: The starting number
  end: The ending number
RETURN
  An array of sequential numbers [start, ..., end]
*/
function genSequentialArray(start, end) {
    assert(end >= start, 'end is not >= start');
    return Array(end - start + 1).fill(0).map(function (num, ix) {
        return num + ix + start;
    });
}
exports.genSequentialArray = genSequentialArray;
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
  Returns the value from the input TDatedValue[] at the input Date (optionally
    return the closest value found)
INPUT
  datedValues: A TDatedValue[]
  date: The Date to find
  closest?: Whether to return the closest value if an exact date match is not
    found (default: FALSE)
  useEarlier?: In the event of a tie for closest, whether to use the value
    corresponding to the earlier date (default: TRUE)
RETURN
  The value corresponding to the (closest) date, or potentially undefined if
  there is no match
*/
function getValueAtDate(datedValues, date, closest, useEarlier) {
    // sort datedValues
    var sortedValues = sortDatedValues(datedValues);
    // look for exact match
    var exactValues = sortedValues.filter(function (dv) {
        return (0, dateUtils_1.areDatesEqual)(dv.date, date);
    });
    // datedValues are empty
    if (datedValues.length === 0) {
        return undefined;
        // exact match found
    }
    else if (exactValues.length > 0) {
        return _.first(exactValues).value;
        // find closest value
    }
    else if (closest) {
        // date is before earliest date
        if ((0, dateUtils_1.isDateBefore)(date, _.first(sortedValues).date)) {
            return _.first(sortedValues).value;
            // date is after latest date
        }
        else if ((0, dateUtils_1.isDateAfter)(date, _.last(sortedValues).date)) {
            return _.last(sortedValues).value;
            // date is between other dates
        }
        else {
            var earlier = _.last(sortedValues.filter(function (dv) { return dv.date < date; }));
            var earlierDiff = (0, dateUtils_1.dateDiff)(earlier.date, date, 'days');
            var later = _.first(sortedValues.filter(function (dv) { return dv.date > date; }));
            var laterDiff = (0, dateUtils_1.dateDiff)(date, later.date, 'days');
            return earlierDiff < laterDiff
                || (earlierDiff === laterDiff && (useEarlier !== null && useEarlier !== void 0 ? useEarlier : true))
                ? earlier.value
                : later.value;
        }
        // return undefined
    }
    else {
        return undefined;
    }
}
exports.getValueAtDate = getValueAtDate;
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
  Returns the input TDatedValue[] after sorting (ascending or descending)
INPUT
  datedValues: A TDatedValue[]
  desc?: Whether to sort in descending order (default: FALSE)
RETURN
  The sorted TDatedValue[]
*/
function sortDatedValues(datedValues, desc) {
    return datedValues.sort(desc ? sortFnDatedValueDesc : sortFnDatedValueAsc);
}
exports.sortDatedValues = sortDatedValues;
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
/*
DESC
  Function used for sorting TDatedValues in ascending order
INPUT
  a: The first TDatedValue
  b: The second TDatedValue
RETURN
  A negative number if a < b, otherwise a positive number if a > b
*/
function sortFnDatedValueAsc(a, b) {
    return sortFnDateAsc(a.date, b.date);
}
exports.sortFnDatedValueAsc = sortFnDatedValueAsc;
/*
DESC
  Function used for sorting TDatedValues in descending order
INPUT
  a: The first TDatedValue
  b: The second Date
RETURN
  A negative number if a > b, otherwise a positive number if a < b
*/
function sortFnDatedValueDesc(a, b) {
    return sortFnDateDesc(a.date, b.date);
}
exports.sortFnDatedValueDesc = sortFnDatedValueDesc;
