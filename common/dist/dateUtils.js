"use strict";
exports.__esModule = true;
exports.getDaysBetween = exports.getClampedDate = exports.formatInTimeZone = exports.formatAsISO = exports.genSundayOfWeekDateRange = exports.genFirstOfYearDateRange = exports.genFirstOfQuarterDateRange = exports.genFirstOfMonthDateRange = exports.genDateRange = void 0;
var date_fns_1 = require("date-fns");
var date_fns_tz_1 = require("date-fns-tz");
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
  Formats the input date as YYYY-MM-DD in UTC time
INPUT
  date: A Date
RETURN
  A YYYY-MM-DD formatted version of the input date
*/
function formatAsISO(date) {
    return formatInTimeZone(date, 'yyyy-MM-dd', 'UTC');
}
exports.formatAsISO = formatAsISO;
/*
DESC
  Formats the input date in the input time zone as per the input dateFormat
INPUT
  date: The date to format
  dateFormat: The format following date-fns standard
  timezone: The timezone for the formatted date
RETURN
  The formatted date
REF
  https://stackoverflow.com/questions/58561169/date-fns-how-do-i-format-to-utc
*/
function formatInTimeZone(date, dateFormat, timezone) {
    return (0, date_fns_tz_1.format)((0, date_fns_tz_1.utcToZonedTime)(date, timezone), dateFormat, { timeZone: timezone });
}
exports.formatInTimeZone = formatInTimeZone;
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
  Returns the number of calendar days between two dates
INPUT
  startDate: The start date
  endDate: The end date
RETURN
  The number of calendar days between the two dates
*/
function getDaysBetween(startDate, endDate) {
    return (0, date_fns_1.differenceInCalendarDays)(startDate, endDate);
}
exports.getDaysBetween = getDaysBetween;
