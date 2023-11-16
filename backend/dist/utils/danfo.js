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
exports.sortSeriesByIndex = exports.getSeriesFromDatedValues = exports.getDatedValuesFromSeries = exports.genZeroSeries = exports.densifyAndFillSeries = exports.defaultTrimOrExtendSeries = exports.accumulateAndDensifySeries = void 0;
const common_1 = require("common");
const df = __importStar(require("danfojs-node"));
const _ = __importStar(require("lodash"));
// =======
// generic
// =======
/*
  DESC
    Cumulatively sums the input series and then densifies to daily values
    between the input start and end dates
  INPUT
    series: A danfo Series
    startDate: The starting date
    endDate: The ending date
  RETURN
    A danfo Series with daily values after a cumulative sum
*/
function accumulateAndDensifySeries(series, startDate, endDate) {
    const theSeries = series.count()
        ? series.cumSum()
        : new df.Series();
    return densifyAndFillSeries(theSeries, startDate, endDate, 'locf', undefined, 0);
}
exports.accumulateAndDensifySeries = accumulateAndDensifySeries;
/*
  DESC
    Trims or extends the input series depending on the input start and end dates
    If start date < first date, fill with zeros
    If end date > last date, fill with last observed value
  INPUT
    series: A danfo Series
    startDate: The starting date
    endDate: The ending date
  RETURN
    The trimmed or extended danfo Series according to the above
*/
function defaultTrimOrExtendSeries(series, startDate, endDate) {
    return densifyAndFillSeries(series, startDate, endDate, 'locf', undefined, 0);
}
exports.defaultTrimOrExtendSeries = defaultTrimOrExtendSeries;
/*
DESC
  Transforms the input danfo Series by slicing / extending the date range and
  filling any gaps according to the input parameters
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
            values.push(Number(seriesValue));
            // unmatched
        }
        else {
            // first value
            if (ix === 0) {
                // ix.date < series start date
                if (date < _.head(series.index)) {
                    // initial value
                    if (initialValue) {
                        values.push(initialValue);
                        // fill value
                    }
                    else if (fillMode === 'value' && fillValue) {
                        values.push(fillValue);
                        // default
                    }
                    else {
                        values.push(0);
                    }
                    // ix.date > series start date
                }
                else if (date > _.last(series.index)) {
                    values.push(_.last(series.values));
                    // ix.date between start date and end date
                }
                else {
                    // locf
                    if (fillMode === 'locf' && series.count()) {
                        let seriesIndex = 0;
                        while (seriesIndex + 1 < series.index.length
                            && series.index[seriesIndex + 1] < date) {
                            seriesIndex += 1;
                        }
                        values.push(series.iat(seriesIndex));
                        // fill value
                    }
                    else if (fillMode === 'value' && fillValue) {
                        values.push(fillValue);
                        // default
                    }
                    else {
                        values.push(0);
                    }
                }
                // subsequent values
            }
            else {
                // locf
                if (fillMode === 'locf') {
                    values.push(values[ix - 1]);
                    // fill value
                }
                else if (fillMode === 'value' && fillValue) {
                    values.push(fillValue);
                    // default
                }
                else {
                    values.push(0);
                }
            }
        }
    });
    return new df.Series(values, { index });
}
exports.densifyAndFillSeries = densifyAndFillSeries;
/*
  DESC
    Generate a series of zeros with date index between the input start date
    and end date
  INPUT
    startDate: The starting date
    endDate: The ending date
  RETURN
    A danfo Series of zeros
*/
function genZeroSeries(startDate, endDate) {
    return densifyAndFillSeries(new df.Series([0], { index: [startDate.toISOString()] }), startDate, endDate, 'value', 0, 0);
}
exports.genZeroSeries = genZeroSeries;
// ==========
// converters
// ==========
/*
DESC
  Converts the input danfo Seeries into a TDatedValue[]
INPUT
  series: A danfo Series
  precision?: The precision of the values
RETURN
  A TDatedValue[]
*/
function getDatedValuesFromSeries(series, precision) {
    const datedValues = series.index.map((index) => {
        const date = _.isNumber(index)
            ? new Date(index)
            : new Date(Date.parse(index));
        const value = _.isNumber(index)
            ? Number(series.iat(index))
            : Number(series.at(index));
        const roundedValue = precision
            ? _.round(value, precision)
            : value;
        return {
            date: date,
            value: roundedValue
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
// sorting
// =======
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
