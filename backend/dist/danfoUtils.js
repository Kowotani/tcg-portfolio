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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPortfolioMarketValueSeries = exports.getHoldingRevenueSeries = exports.getHoldingTransactionQuantitySeries = exports.getHoldingMarketValueSeries = exports.sortSeriesByIndex = exports.getSeriesFromDatedValues = exports.getDatedValuesFromSeries = exports.densifyAndFillSeries = void 0;
const common_1 = require("common");
const df = __importStar(require("danfojs-node"));
const _ = __importStar(require("lodash"));
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
    const index = (0, common_1.genDateRange)(startDate, endDate).map((date) => {
        return date.toISOString();
    });
    // populate values for Series
    let values = [];
    index.forEach((date, ix) => {
        // get value from series, if available
        const seriesValue = series.at(date);
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
    return new df.Series(values, { index });
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
    const datedValues = series.index.map((index) => {
        const date = _.isNumber(index)
            ? new Date(index)
            : new Date(Date.parse(index));
        const value = _.isNumber(index)
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
    const index = datedValues.map((dv) => {
        return dv.date.toISOString();
    });
    const values = datedValues.map((dv) => {
        return dv.value;
    });
    return new df.Series(values, { index });
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
    const index = _.sortBy(series.index, el => el);
    const values = index.map((ix) => {
        return typeof ix === 'string'
            ? series.at(ix)
            : series.iat(ix);
    });
    return new df.Series(values, { index });
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
    // verify that priceSeries has sufficient data
    (0, common_1.assert)(String(_.head(priceSeries.index)) <= startDate.toISOString(), 'priceSeries does not have data on or before startDate');
    (0, common_1.assert)(String(_.last(priceSeries.index)) >= endDate.toISOString(), 'priceSeries does not have data on or after endDate');
    // -- get holding value series
    const transactionSeries = getHoldingTransactionQuantitySeries(holding);
    const cumTransactionSeries = transactionSeries.cumSum();
    const quantitySeries = densifyAndFillSeries(cumTransactionSeries, startDate, endDate, 'locf', undefined, 0);
    const pricesIx = priceSeries.index.map((ix) => {
        return String(ix) >= startDate.toISOString()
            && String(ix) <= endDate.toISOString();
    });
    const holdingValueSeries = quantitySeries.mul(priceSeries.loc(pricesIx));
    // -- get revenue series
    const dailyRevenueSeries = getHoldingRevenueSeries(holding);
    const cumRevenueSeries = dailyRevenueSeries.cumSum();
    const revenueSeries = densifyAndFillSeries(cumRevenueSeries, startDate, endDate, 'locf', undefined, 0);
    // -- get market value series
    return holdingValueSeries.add(revenueSeries);
}
exports.getHoldingMarketValueSeries = getHoldingMarketValueSeries;
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
    const purchases = (0, common_1.getHoldingPurchases)(holding);
    const sales = (0, common_1.getHoldingSales)(holding);
    // summarize transaction quantities in a map
    const quantityMap = new Map();
    purchases.forEach((txn) => {
        var _a;
        quantityMap.set(txn.date.toISOString(), ((_a = quantityMap.get(txn.date.toISOString())) !== null && _a !== void 0 ? _a : 0) + txn.quantity);
    });
    sales.forEach((txn) => {
        var _a;
        quantityMap.set(txn.date.toISOString(), ((_a = quantityMap.get(txn.date.toISOString())) !== null && _a !== void 0 ? _a : 0) - txn.quantity);
    });
    const datedValues = [];
    quantityMap.forEach((value, key) => {
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
    const sales = (0, common_1.getHoldingSales)(holding);
    const datedValues = sales.map((txn) => {
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
    const holdings = (0, common_1.getPortfolioHoldings)(portfolio);
    // get market value series of holdings
    const marketValues = holdings.map((holding) => {
        const tcgplayerId = (0, common_1.getHoldingTcgplayerId)(holding);
        const priceSeries = priceSeriesMap.get(tcgplayerId);
        // verify that prices exist for this tcgplayerId
        (0, common_1.assert)(priceSeries instanceof df.Series, `Could not find prices for tcgplayerId: ${tcgplayerId}`);
        return getHoldingMarketValueSeries(holding, priceSeries, startDate, endDate);
    });
    // create empty Series used for summation
    const emptySeries = densifyAndFillSeries(new df.Series([0], { index: [startDate.toISOString()] }), startDate, endDate, 'value', 0, 0);
    // get market value series of portfolio
    return marketValues.reduce((acc, cur) => {
        return acc = acc.add(cur);
    }, emptySeries);
}
exports.getPortfolioMarketValueSeries = getPortfolioMarketValueSeries;
