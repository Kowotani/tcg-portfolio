"use strict";
exports.__esModule = true;
exports.getISOStringFromDate = exports.getClampedDate = exports.genSundayOfWeekDateRange = exports.genFirstOfYearDateRange = exports.genFirstOfQuarterDateRange = exports.genFirstOfMonthDateRange = exports.genDateRange = void 0;
var date_fns_1 = require("date-fns");
// ==========
// generators
// ==========
/*
DESC
  Generates an array of dates between the input startDate and endDate inclusive
INPUT
  startDate: The starting date
  endDate: The ending date
RETURN
  A Date[]
*/
function genDateRange(startDate, endDate) {
    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(0, 0, 0, 0);
    return (0, date_fns_1.eachDayOfInterval)({
        start: startDate,
        end: endDate
    });
}
exports.genDateRange = genDateRange;
/*
DESC
  Generates an array of dates corresponding to the first day of the month
  between the input startDate and endDate inclusive
INPUT
  startDate: The starting date
  endDate: The ending date
RETURN
  A Date[]
*/
function genFirstOfMonthDateRange(startDate, endDate) {
    return (0, date_fns_1.eachMonthOfInterval)({
        start: startDate,
        end: endDate
    });
}
exports.genFirstOfMonthDateRange = genFirstOfMonthDateRange;
/*
DESC
  Generates an array of dates corresponding to the first day of the quarter
  between the input startDate and endDate inclusive
INPUT
  startDate: The starting date
  endDate: The ending date
RETURN
  A Date[]
*/
function genFirstOfQuarterDateRange(startDate, endDate) {
    return (0, date_fns_1.eachQuarterOfInterval)({
        start: startDate,
        end: endDate
    });
}
exports.genFirstOfQuarterDateRange = genFirstOfQuarterDateRange;
/*
DESC
  Generates an array of dates corresponding to the first day of the year
  between the input startDate and endDate inclusive
INPUT
  startDate: The starting date
  endDate: The ending date
RETURN
  A Date[]
*/
function genFirstOfYearDateRange(startDate, endDate) {
    return (0, date_fns_1.eachYearOfInterval)({
        start: startDate,
        end: endDate
    });
}
exports.genFirstOfYearDateRange = genFirstOfYearDateRange;
/*
DESC
  Generates an array of dates corresponding to the first Sunday of each week
  between the input startDate and endDate inclusive
INPUT
  startDate: The starting date
  endDate: The ending date
RETURN
  A Date[]
*/
function genSundayOfWeekDateRange(startDate, endDate) {
    return (0, date_fns_1.eachWeekOfInterval)({
        start: startDate,
        end: endDate
    }, { weekStartsOn: 0 });
}
exports.genSundayOfWeekDateRange = genSundayOfWeekDateRange;
// =======
// generic
// =======
/*
DESC
  Returns the input Date clamped between the startDate and endDate inclusive
INPUT
  date: A Date
  startDate: The earliest date
  endDate: The latest date
RETURN
  The date clamped between the startDate and endDate inclusive
*/
function getClampedDate(date, startDate, endDate) {
    return (0, date_fns_1.clamp)(date, {
        start: startDate,
        end: endDate
    });
}
exports.getClampedDate = getClampedDate;
/*
  DESC
    Returns the input Date as an ISODate (YYYY-MM-DD)
  INPUT
    date: A Date
  RETURN
    A YYYY-MM-DD formatted version of the input date
*/
function getISOStringFromDate(date) {
    return (0, date_fns_1.format)(date, 'yyyy-MM-dd');
}
exports.getISOStringFromDate = getISOStringFromDate;
