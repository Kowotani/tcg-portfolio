"use strict";
exports.__esModule = true;
exports.isITransactionArray = exports.isITransaction = exports.hasITransactionKeys = exports.isTPerformanceData = exports.hasTPerformanceDataKeys = exports.isTDatedvalueArray = exports.isTDatedvalue = exports.hasTDatedValueKeys = exports.isITCProduct = exports.hasITCProductKeys = exports.isITCGroup = exports.hasITCGroupKeys = exports.isITCCategory = exports.hasITCCategoryKeys = exports.hasIProductKeys = exports.isIPriceDataArray = exports.isIPriceData = exports.isIPriceArray = exports.isIPrice = exports.isIDatedPriceData = exports.hasIDatedPriceDataKeys = exports.isIPortfolioArray = exports.isIPortfolio = exports.isIPopulatedPortfolioArray = exports.isIPopulatedPortfolio = exports.hasIPortfolioKeys = exports.hasIPortfolioBaseKeys = exports.hasIPopulatedPortfolioKeys = exports.isIProduct = exports.isIPopulatedHolding = exports.isIHoldingArray = exports.isIHolding = exports.hasIPopulatedHoldingKeys = exports.hasIHoldingKeys = exports.hasIHoldingBaseKeys = exports.isTProductPostResBody = exports.isTDataResBody = exports.isTResBody = void 0;
var dataModels_1 = require("./dataModels");
var _ = require("lodash");
// ===
// api
// ===
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
// =======
// holding
// =======
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
// =========
// portfolio
// =========
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
// =====
// price
// =====
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
// =======
// product
// =======
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
// ==========
// TCCategory
// ==========
/*
DESC
  Returns whether or not the input has all ITCCategory keys
INPUT
  arg: An object that might be an ITCCategory
RETURN
  TRUE if the input has all ITCCategory keys, FALSE otherwise
*/
function hasITCCategoryKeys(arg) {
    return arg
        && arg.categoryId
        && arg.name
        && arg.displayName
        && arg.tcg;
}
exports.hasITCCategoryKeys = hasITCCategoryKeys;
/*
DESC
  Returns whether or not the input is an ITCCategory
INPUT
  arg: An object that might be an ITCCategory
RETURN
  TRUE if the input is an ITCCategory, FALSE otherwise
*/
function isITCCategory(arg) {
    return arg
        && hasITCCategoryKeys(arg)
        && typeof (arg.categoryId) === 'number'
        && typeof (arg.name) === 'string'
        && typeof (arg.displayName) === 'string'
        && _.values(dataModels_1.TCG).includes(arg.tcg);
}
exports.isITCCategory = isITCCategory;
// ========
// ITCGroup
// ========
/*
DESC
  Returns whether or not the input has all ITCGroup keys
INPUT
  arg: An object that might be an ITCGroup
RETURN
  TRUE if the input has all ITCGroup keys, FALSE otherwise
*/
function hasITCGroupKeys(arg) {
    return arg
        && arg.groupId
        && arg.categoryId
        && arg.name
        && arg.abbreviation
        && arg.publishedOn;
}
exports.hasITCGroupKeys = hasITCGroupKeys;
/*
DESC
  Returns whether or not the input is an isITCGroup
INPUT
  arg: An object that might be an isITCGroup
RETURN
  TRUE if the input is an isITCGroup, FALSE otherwise
*/
function isITCGroup(arg) {
    return arg
        && hasITCGroupKeys(arg)
        && typeof (arg.groupId) === 'number'
        && typeof (arg.categoryId) === 'number'
        && typeof (arg.name) === 'string'
        && typeof (arg.abbreviation) === 'string'
        && _.isDate(arg.publishedOn);
}
exports.isITCGroup = isITCGroup;
// ==========
// ITCProduct
// ==========
/*
DESC
  Returns whether or not the input has all ITCProduct keys
INPUT
  arg: An object that might be an ITCProduct
RETURN
  TRUE if the input has all ITCProduct keys, FALSE otherwise
*/
function hasITCProductKeys(arg) {
    var _a, _b, _c;
    return arg
        // required
        && arg.tcgplayerId
        && arg.groupId
        && arg.categoryId
        && arg.tcg
        && arg.releaseDate
        && arg.name
        && arg.type
        && arg.language
        && arg.status
        // optional
        && ((_a = arg.msrp) !== null && _a !== void 0 ? _a : true)
        && ((_b = arg.subtype) !== null && _b !== void 0 ? _b : true)
        && ((_c = arg.setCode) !== null && _c !== void 0 ? _c : true);
}
exports.hasITCProductKeys = hasITCProductKeys;
/*
DESC
  Returns whether or not the input is an ITCProduct
INPUT
  arg: An object that might be an ITCProduct
RETURN
  TRUE if the input is an ITCProduct, FALSE otherwise
*/
function isITCProduct(arg) {
    return arg
        // required
        && hasITCProductKeys(arg)
        && typeof (arg.tcgplayerId) === 'number'
        && typeof (arg.groupId) === 'number'
        && typeof (arg.categoryId) === 'number'
        && _.values(dataModels_1.TCG).includes(arg.tcg)
        && _.isDate(arg.releaseDate)
        && typeof (arg.name) === 'string'
        && _.values(dataModels_1.ProductType).includes(arg.type)
        && _.values(dataModels_1.ProductLanguage).includes(arg.language)
        && _.values(dataModels_1.ParsingStatus).includes(arg.status)
        // optional
        && arg.msrp ? typeof (arg.msrp) === 'number' : true
        && arg.subtype ? _.values(dataModels_1.ProductSubtype).includes(arg.subtype) : true
        && arg.setCode ? typeof (arg.setCode) === 'string' : true;
}
exports.isITCProduct = isITCProduct;
// ===========
// TDatedValue
// ===========
/*
DESC
  Returns whether or not the input has all TDatedValue keys
INPUT
  arg: An object that might be a TDatedValue
RETURN
  TRUE if the input has all TDatedValue keys, FALSE otherwise
*/
function hasTDatedValueKeys(arg) {
    return arg
        && arg.date
        && arg.value;
}
exports.hasTDatedValueKeys = hasTDatedValueKeys;
/*
DESC
  Returns whether or not the input is an TDatedValue
INPUT
  arg: An object that might be an TDatedValue
RETURN
  TRUE if the input is an TDatedValue, FALSE otherwise
*/
function isTDatedvalue(arg) {
    return arg
        && hasTDatedValueKeys(arg)
        && _.isDate(arg.date)
        && typeof (arg.value) === 'number';
}
exports.isTDatedvalue = isTDatedvalue;
/*
DESC
  Returns whether or not the input is an TDatedValue[]
INPUT
  arg: An object that might be an TDatedValue[]
RETURN
  TRUE if the input is an TDatedValue[], FALSE otherwise
*/
function isTDatedvalueArray(arg) {
    return arg
        && Array.isArray(arg)
        && _.every(arg.map(function (el) {
            return isTDatedvalue(el);
        }));
}
exports.isTDatedvalueArray = isTDatedvalueArray;
// ================
// TPerformanceData
// ================
/*
DESC
  Returns whether or not the input has all TPerformanceData keys
INPUT
  arg: An object that might be a TPerformanceData
RETURN
  TRUE if the input has all TPerformanceData keys, FALSE otherwise
*/
function hasTPerformanceDataKeys(arg) {
    return arg
        && _.every(Object.keys(arg), function (key) {
            return Object.values(dataModels_1.PerformanceMetric).includes(key);
        });
}
exports.hasTPerformanceDataKeys = hasTPerformanceDataKeys;
/*
DESC
  Returns whether or not the input is an TPerformanceData
INPUT
  arg: An object that might be an TPerformanceData
RETURN
  TRUE if the input is an TPerformanceData, FALSE otherwise
*/
function isTPerformanceData(arg) {
    return arg
        && hasTPerformanceDataKeys(arg)
        && _.every(Object.keys(arg), function (key) {
            return isTDatedvalueArray(arg[key]);
        });
}
exports.isTPerformanceData = isTPerformanceData;
// ===========
// transaction
// ===========
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
