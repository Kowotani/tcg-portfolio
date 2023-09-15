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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHoldingRevenueSeries = exports.getSeriesFromDatedValues = exports.getDatedValuesFromSeries = exports.densifyAndFillSeries = void 0;
const common_1 = require("common");
const df = __importStar(require("danfojs-node"));
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
        if (seriesValue) {
            values[ix] = Number(seriesValue);
            // unmatched, initial value
        }
        else if (ix === 0 && initialValue) {
            values[0] = initialValue;
            // unmatched, fill value
        }
        else if (fillMode === 'value' && fillValue) {
            values[ix] = fillValue;
            // unmatched, locf
        }
        else if (fillMode === 'locf' && ix > 0) {
            values[ix] = values[ix - 1];
            // default to 0
        }
        else {
            values[ix] = 0;
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
        const ix = String(index);
        return {
            date: new Date(Date.parse(ix)),
            value: Number(series.loc([ix]))
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
// =======
// holding
// =======
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
    return getSeriesFromDatedValues(datedValues);
}
exports.getHoldingRevenueSeries = getHoldingRevenueSeries;
// =========
// portfolio
// =========
