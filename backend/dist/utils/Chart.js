"use strict";
// =====
// enums
// =====
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTCGPlayerDateRange = exports.TcgPlayerChartDataRangeToDateRangeChart = exports.TcgPlayerChartDataRangeToDateRangeButton = exports.TcgPlayerChartDateRange = void 0;
// date range options for price charts
var TcgPlayerChartDateRange;
(function (TcgPlayerChartDateRange) {
    TcgPlayerChartDateRange["OneMonth"] = "1 Month";
    TcgPlayerChartDateRange["OneYear"] = "1 Year";
    TcgPlayerChartDateRange["SixMonths"] = "6 Months";
    TcgPlayerChartDateRange["ThreeMonths"] = "3 Months";
})(TcgPlayerChartDateRange = exports.TcgPlayerChartDateRange || (exports.TcgPlayerChartDateRange = {}));
// TcgPlayerChartDataRange -> date range button label
exports.TcgPlayerChartDataRangeToDateRangeButton = {
    [TcgPlayerChartDateRange.OneMonth]: '1M',
    [TcgPlayerChartDateRange.OneYear]: '1Y',
    [TcgPlayerChartDateRange.SixMonths]: '6M',
    [TcgPlayerChartDateRange.ThreeMonths]: '3M'
};
// TcgPlayerChartDataRange -> date range chart label
exports.TcgPlayerChartDataRangeToDateRangeChart = {
    [TcgPlayerChartDateRange.OneMonth]: 'Past Month',
    [TcgPlayerChartDateRange.OneYear]: 'Past Year',
    [TcgPlayerChartDateRange.SixMonths]: 'Past 6 Months',
    [TcgPlayerChartDateRange.ThreeMonths]: 'Past 3 Months'
};
// ==========
// validators
// ==========
/*
DESC
  Determines if the input is a valid price date range from TCGPlayer
  The expected regex format is:
    \d{1,2}\/\d{1,2} to \d{1,2}\/\d{1,2}
INPUT
  value: The string to validate
RETURN
  TRUE if the input is a valid price date range from TCGPlayer, FALSE otherwise
*/
function isTCGPlayerDateRange(value) {
    const regexp = new RegExp('^\\d{1,2}\\/\\d{1,2} to \\d{1,2}\\/\\d{1,2}$');
    return regexp.test(value);
}
exports.isTCGPlayerDateRange = isTCGPlayerDateRange;
