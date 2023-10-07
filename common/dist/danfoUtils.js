"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
exports.__esModule = true;
exports.getPortfolioMarketValueSeries = exports.getHoldingRevenueSeries = exports.getHoldingTransactionQuantitySeries = exports.getHoldingTotalCostSeries = exports.getHoldingPurchaseCostSeries = exports.getHoldingMarketValueSeries = exports.sortSeriesByIndex = exports.getSeriesFromDatedValues = exports.getDatedValuesFromSeries = exports.densifyAndFillSeries = void 0;
var df = __importStar(require("danfojs-node"));
var dateUtils_1 = require("./dateUtils");
var holdingUtils_1 = require("./holdingUtils");
var _ = __importStar(require("lodash"));
var portfolioUtils_1 = require("./portfolioUtils");
var utils_1 = require("./utils");
// =======
// generic
// =======
/*
DESC
  Converts the input danfo Seeries into a TDatedValue[]
INPUT
  series: A danfo Series
  startDate: The starting date
  endDate: The ending date
  fillMode: The method by which to fill missing values
    locf: Last observed carry forward
    value: Use the input fillValue
  fillValue?: The static value to use with fillMode=value
  initalValue?: The initial value to use if startDate is earlier than the
    first danfo Series date
RETURN
  A danfo Series
*/
function densifyAndFillSeries(series, startDate, endDate, fillMode, fillValue, initialValue) {
    // get Series index
    var index = (0, dateUtils_1.genDateRange)(startDate, endDate).map(function (date) {
        return date.toISOString();
    });
    // populate values for Series
    var values = [];
    index.forEach(function (date, ix) {
        // get value from series, if available
        var seriesValue = series.at(date);
        // matched
        if (seriesValue !== undefined) {
            values.push(Number(seriesValue));
            // unmatched, initial value
        }
        else if (ix === 0 && initialValue) {
            values.push(initialValue);
            // unmatched, fill value
        }
        else if (fillMode === 'value' && fillValue) {
            values.push(fillValue);
            // unmatched, locf
        }
        else if (fillMode === 'locf' && ix > 0) {
            values.push(values[ix - 1]);
            // default to 0
        }
        else {
            values.push(0);
        }
    });
    return new df.Series(values, { index: index });
}
exports.densifyAndFillSeries = densifyAndFillSeries;
/*
DESC
  Converts the input danfo Seeries into a TDatedValue[]
INPUT
  series: A danfo Series
RETURN
  A TDatedValue[]
*/
function getDatedValuesFromSeries(series) {
    var datedValues = series.index.map(function (index) {
        var date = _.isNumber(index)
            ? new Date(index)
            : new Date(Date.parse(index));
        var value = _.isNumber(index)
            ? Number(series.iat(index))
            : Number(series.at(index));
        return {
            date: date,
            value: value
        };
    });
    return datedValues;
}
exports.getDatedValuesFromSeries = getDatedValuesFromSeries;
/*
DESC
  Converts the input TDatedValue[] into a danfo Seeries
INPUT
  datedValues: A TDatedValue[]
RETURN
  A danfo Series
*/
function getSeriesFromDatedValues(datedValues) {
    var index = datedValues.map(function (dv) {
        return dv.date.toISOString();
    });
    var values = datedValues.map(function (dv) {
        return dv.value;
    });
    return new df.Series(values, { index: index });
}
exports.getSeriesFromDatedValues = getSeriesFromDatedValues;
/*
DESC
  Returns the input Series sorted by the index
INPUT
  series: A danfo Series
RETURN
  A danfo Series
*/
function sortSeriesByIndex(series) {
    var index = _.sortBy(series.index, function (el) { return el; });
    var values = index.map(function (ix) {
        return typeof ix === 'string'
            ? series.at(ix)
            : series.iat(ix);
    });
    return new df.Series(values, { index: index });
}
exports.sortSeriesByIndex = sortSeriesByIndex;
// =======
// holding
// =======
/*
DESC
  Returns a series of daily market values for the input IHolding between the
  input startDate and endDate using the input priceSeries
INPUT
  holding: An IHolding
  priceSeries: A danfo Series of prices
  startDate: The start date of the Series
  endDate: The end date of the Series
RETURN
  A danfo Series
*/
function getHoldingMarketValueSeries(holding, priceSeries, startDate, endDate) {
    // align price series
    var prices = densifyAndFillSeries(priceSeries, startDate, endDate, 'locf', undefined, 0);
    // -- get holding value series
    var transactionSeries = getHoldingTransactionQuantitySeries(holding);
    var cumTransactionSeries = transactionSeries.cumSum();
    var quantitySeries = densifyAndFillSeries(cumTransactionSeries, startDate, endDate, 'locf', undefined, 0);
    var pricesIx = prices.index.map(function (ix) {
        return String(ix) >= startDate.toISOString()
            && String(ix) <= endDate.toISOString();
    });
    var holdingValueSeries = quantitySeries.mul(prices.loc(pricesIx));
    // -- get revenue series
    var dailyRevenueSeries = getHoldingRevenueSeries(holding);
    var cumRevenueSeries = dailyRevenueSeries.cumSum();
    var revenueSeries = densifyAndFillSeries(cumRevenueSeries, startDate, endDate, 'locf', undefined, 0);
    // -- get market value series
    return holdingValueSeries.add(revenueSeries);
}
exports.getHoldingMarketValueSeries = getHoldingMarketValueSeries;
/*
DESC
  Returns a series of purchase costs for the input IHolding between the
  input startDate and endDate
INPUT
  holding: An IHolding
  startDate: The start date of the Series
  endDate: The end date of the Series
RETURN
  A danfo Series
*/
function getHoldingPurchaseCostSeries(holding, startDate, endDate) {
    // get dated values of daily purchase costs
    var allPurchases = (0, holdingUtils_1.getHoldingPurchases)(holding);
    var purchases = allPurchases.filter(function (txn) {
        return (0, dateUtils_1.isDateAfter)(txn.date, startDate, true)
            && (0, dateUtils_1.isDateBefore)(txn.date, endDate, true);
    });
    var datedValues = purchases.map(function (txn) {
        return {
            date: txn.date,
            value: txn.price * txn.quantity
        };
    });
    return sortSeriesByIndex(getSeriesFromDatedValues(datedValues));
}
exports.getHoldingPurchaseCostSeries = getHoldingPurchaseCostSeries;
/*
DESC
  Returns a series of total cost for the input IHolding between the input
  startDate and endDate
INPUT
  holding: An IHolding
  startDate: The start date of the Series
  endDate: The end date of the Series
RETURN
  A danfo Series
*/
function getHoldingTotalCostSeries(holding, startDate, endDate) {
    // get dated values of daily purchase costs
    var purchases = (0, holdingUtils_1.getHoldingPurchases)(holding);
    var datedValues = purchases.map(function (txn) {
        return {
            date: txn.date,
            value: txn.price * txn.quantity
        };
    });
    // align daily purchase costs to date index
    var dailyPurchaseSeries = sortSeriesByIndex(getSeriesFromDatedValues(datedValues));
    var purchaseSeries = densifyAndFillSeries(dailyPurchaseSeries, startDate, endDate, 'value', 0);
    return purchaseSeries.cumSum();
}
exports.getHoldingTotalCostSeries = getHoldingTotalCostSeries;
/*
DESC
  Returns a series of daily transaction quantities for the input IHolding
INPUT
  holding: An IHolding
RETURN
  A danfo Series
*/
function getHoldingTransactionQuantitySeries(holding) {
    // get purchase and sales
    var purchases = (0, holdingUtils_1.getHoldingPurchases)(holding);
    var sales = (0, holdingUtils_1.getHoldingSales)(holding);
    // summarize transaction quantities in a map
    var quantityMap = new Map();
    purchases.forEach(function (txn) {
        var _a;
        quantityMap.set(txn.date.toISOString(), ((_a = quantityMap.get(txn.date.toISOString())) !== null && _a !== void 0 ? _a : 0) + txn.quantity);
    });
    sales.forEach(function (txn) {
        var _a;
        quantityMap.set(txn.date.toISOString(), ((_a = quantityMap.get(txn.date.toISOString())) !== null && _a !== void 0 ? _a : 0) - txn.quantity);
    });
    var datedValues = [];
    quantityMap.forEach(function (value, key) {
        if (value !== 0) {
            datedValues.push({
                date: new Date(Date.parse(key)),
                value: value
            });
        }
    });
    return sortSeriesByIndex(getSeriesFromDatedValues(datedValues));
}
exports.getHoldingTransactionQuantitySeries = getHoldingTransactionQuantitySeries;
/*
DESC
  Returns a series of daily revenue for the input IHolding
INPUT
  holding: An IHolding
RETURN
  A danfo Series
*/
function getHoldingRevenueSeries(holding) {
    var sales = (0, holdingUtils_1.getHoldingSales)(holding);
    var datedValues = sales.map(function (txn) {
        return {
            date: txn.date,
            value: txn.price * txn.quantity
        };
    });
    return sortSeriesByIndex(getSeriesFromDatedValues(datedValues));
}
exports.getHoldingRevenueSeries = getHoldingRevenueSeries;
// =========
// portfolio
// =========
/*
DESC
  Returns a series of daily market values for the input IPortfolio between the
  input startDate and endDate using prices in the input priceSeriesMap
INPUT
  portfolio: An IPortfolio
  priceSeriesMap: A Map of tcgplayerId => danfo Series of Prices
  startDate: The start date of the Series
  endDate: The end date of the Series
RETURN
  A danfo Series
*/
function getPortfolioMarketValueSeries(portfolio, priceSeriesMap, startDate, endDate) {
    var holdings = (0, portfolioUtils_1.getPortfolioHoldings)(portfolio);
    // get market value series of holdings
    var marketValues = holdings.map(function (holding) {
        var tcgplayerId = (0, holdingUtils_1.getHoldingTcgplayerId)(holding);
        var priceSeries = priceSeriesMap.get(tcgplayerId);
        // verify that prices exist for this tcgplayerId
        (0, utils_1.assert)(priceSeries instanceof df.Series, "Could not find prices for tcgplayerId: ".concat(tcgplayerId));
        return getHoldingMarketValueSeries(holding, priceSeries, startDate, endDate);
    });
    // create empty Series used for summation
    var emptySeries = densifyAndFillSeries(new df.Series([0], { index: [startDate.toISOString()] }), startDate, endDate, 'value', 0, 0);
    // get market value series of portfolio
    return marketValues.reduce(function (acc, cur) {
        return acc = acc.add(cur);
    }, emptySeries);
}
exports.getPortfolioMarketValueSeries = getPortfolioMarketValueSeries;
