"use strict";
exports.__esModule = true;
exports.getUTCDateFromLocalDate = exports.getDateFromJSON = exports.getLocalDateFromISOString = exports.getClientTimezone = exports.formatInTimeZone = exports.getDateOneYearAgo = exports.getDateSixMonthsAgo = exports.getDateThreeMonthsAgo = exports.getDateOneMonthAgo = exports.getDateThirtyDaysAgo = exports.isDateBetween = exports.isDateBefore = exports.isDateAfter = exports.getStartOfDate = exports.getDaysBetween = exports.getClampedDate = exports.formatDateDiffAsYearsMonthsDays = exports.formatAsISO = exports.dateSub = exports.dateDiff = exports.dateAdd = exports.areDatesEqual = exports.genSundayOfWeekDateRange = exports.genFirstOfYearDateRange = exports.genFirstOfQuarterDateRange = exports.genFirstOfMonthDateRange = exports.genDateRange = void 0;
var date_fns_1 = require("date-fns");
var date_fns_tz_1 = require("date-fns-tz");
var _ = require("lodash");
var utils_1 = require("./utils");
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
    var accumulator = startDate;
    var days = [];
    while (endDate >= accumulator) {
        days.push(accumulator);
        accumulator = (0, date_fns_1.add)(accumulator, { hours: 24 });
    }
    return days;
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
  Returns whether the two input dates are equal
INPUT
  first: The first Date
  second: The second Date
RETURN
  TRUE if the dates are equal, FALSE otherwise
*/
function areDatesEqual(first, second) {
    return (0, date_fns_1.isEqual)(first, second);
}
exports.areDatesEqual = areDatesEqual;
/*
DESC
  Adds the input duration to the input Date
INPUT
  date: A Date
RETURN
  The Date after adding the duration
*/
function dateAdd(date, duration) {
    return (0, date_fns_1.add)(date, duration);
}
exports.dateAdd = dateAdd;
/*
DESC
  Returns the difference of endDate - startDate in the input calendar units
INPUT
  startDate: A Date
  endDate: A Date
  units: The supported units for the calculation
RETURN
  The number of calendar units in between startDate and endDate
*/
function dateDiff(startDate, endDate, units) {
    switch (units) {
        case 'days':
            return (0, date_fns_1.differenceInCalendarDays)(endDate, startDate);
        case 'weeks':
            return (0, date_fns_1.differenceInCalendarWeeks)(endDate, startDate);
        case 'months':
            return (0, date_fns_1.differenceInCalendarMonths)(endDate, startDate);
        case 'years':
            return (0, date_fns_1.differenceInCalendarYears)(endDate, startDate);
    }
}
exports.dateDiff = dateDiff;
/*
DESC
  Subtracts the input duration to the input Date
INPUT
  date: A Date
RETURN
  The Date after subtracting the duration
*/
function dateSub(date, duration) {
    return (0, date_fns_1.sub)(date, duration);
}
exports.dateSub = dateSub;
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
  Calculates the difference between the input start date and end date and
  returns the difference formatted as 'X years, Y months, Z days'
INPUT
  startDate: The start date
  endDate: The end date
RETURN
  The date difference formatted as 'X years, Y months, Z days'
*/
function formatDateDiffAsYearsMonthsDays(startDate, endDate) {
    (0, utils_1.assert)((0, date_fns_1.isBefore)(startDate, endDate), 'startDate is not before endDate');
    // initialize variables
    var date = startDate;
    var components = [];
    // determine years
    var years = (0, date_fns_1.differenceInYears)(endDate, date);
    if (years > 0) {
        components.push(years > 1 ? "".concat(years, " years") : '1 year');
    }
    // determine months
    date = dateAdd(date, { years: years });
    var months = (0, date_fns_1.differenceInMonths)(endDate, date);
    if (months > 0) {
        components.push(months > 1 ? "".concat(months, " months") : '1 month');
    }
    // determine days
    date = dateAdd(date, { months: months });
    var days = (0, date_fns_1.differenceInDays)(endDate, date);
    if (days > 0) {
        components.push(days > 1 ? "".concat(days, " days") : '1 day');
    }
    return _.join(components, ', ');
}
exports.formatDateDiffAsYearsMonthsDays = formatDateDiffAsYearsMonthsDays;
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
    return (0, date_fns_1.differenceInCalendarDays)(endDate, startDate);
}
exports.getDaysBetween = getDaysBetween;
/*
DESC
  Returns the input Date starting at midnight
INPUT
  date: A Date
RETURN
  The date starting at midnight
*/
function getStartOfDate(date) {
    return (0, date_fns_1.startOfDay)(date);
}
exports.getStartOfDate = getStartOfDate;
/*
DESC
  Returns whether the first date is after the second date, or equal to if
  orEqual is TRUE
INPUT
  firstDate: The first date
  secondDate: The second date
  orEqual?: Whether equality should be TRUE
RETURN
  TRUE if the first date is after (or equal to) the second date, FALSE otherwise
*/
function isDateAfter(first, second, orEqual) {
    return (0, date_fns_1.isAfter)(first, second)
        || orEqual ? (0, date_fns_1.isEqual)(first, second) : false;
}
exports.isDateAfter = isDateAfter;
/*
DESC
  Returns whether the first date is before the second date, or equal to if
  orEqual is TRUE
INPUT
  firstDate: The first date
  secondDate: The second date
  orEqual?: Whether equality should be TRUE
RETURN
  TRUE if the first date is before (or equal to) the second date, FALSE otherwise
*/
function isDateBefore(first, second, orEqual) {
    return (0, date_fns_1.isBefore)(first, second)
        || orEqual ? (0, date_fns_1.isEqual)(first, second) : false;
}
exports.isDateBefore = isDateBefore;
/*
DESC
  Returns whether the date is between the start and end dates, or equal to if
  orEqual is TRUE
INPUT
  date: The date
  startDate: The start date
  endDate: The end date
  orEqual?: Whether equality should be TRUE
RETURN
  TRUE if the date is between (or equal to) the start and end dates,
  FALSE otherwise
*/
function isDateBetween(date, start, end, orEqual) {
    return orEqual
        ? ((0, date_fns_1.isAfter)(date, start) || (0, date_fns_1.isEqual)(date, start))
            && ((0, date_fns_1.isBefore)(date, end) || (0, date_fns_1.isBefore)(date, end))
        : ((0, date_fns_1.isAfter)(date, start) && (0, date_fns_1.isBefore)(date, end));
}
exports.isDateBetween = isDateBetween;
// =====================
// n periods ago helpers
// =====================
/*
DESC
  Returns a date that is 30 days ago
RETURN
  The date that is 30 days ago
*/
function getDateThirtyDaysAgo() {
    return dateSub((0, date_fns_1.startOfToday)(), { days: 30 });
}
exports.getDateThirtyDaysAgo = getDateThirtyDaysAgo;
/*
DESC
  Returns a date that is 1 month ago
RETURN
  The date that is 1 month ago
*/
function getDateOneMonthAgo() {
    return dateSub((0, date_fns_1.startOfToday)(), { months: 1 });
}
exports.getDateOneMonthAgo = getDateOneMonthAgo;
/*
DESC
  Returns a date that is 3 months ago
RETURN
  The date that is 3 months ago
*/
function getDateThreeMonthsAgo() {
    return dateSub((0, date_fns_1.startOfToday)(), { months: 3 });
}
exports.getDateThreeMonthsAgo = getDateThreeMonthsAgo;
/*
DESC
  Returns a date that is 6 months ago
RETURN
  The date that is 6 months ago
*/
function getDateSixMonthsAgo() {
    return dateSub((0, date_fns_1.startOfToday)(), { months: 6 });
}
exports.getDateSixMonthsAgo = getDateSixMonthsAgo;
/*
DESC
  Returns a date that is 1 year ago
RETURN
  The date that is 1 year ago
*/
function getDateOneYearAgo() {
    return dateSub((0, date_fns_1.startOfToday)(), { years: 1 });
}
exports.getDateOneYearAgo = getDateOneYearAgo;
// =========
// time zone
// =========
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
  Returns the client's timezone (eg. America/Toronto)
RETURN
  The client's timezone
*/
function getClientTimezone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
exports.getClientTimezone = getClientTimezone;
/*
DESC
  Returns a date in the input timezone with the same year, month, and day as
  the input ISOString. This function does preserve the date to be equivalent
  to the input date (unless the timezone is UTC)
INPUT
  ISOString: A date in ISO string format (eg. 2020-01-01T:00:00:00.000Z)
RETURN
  A new date in the timezone (eg. 2020-01-01T:00:00:00.000 in local)
*/
function getLocalDateFromISOString(ISOString) {
    // verify format
    var format = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    (0, utils_1.assert)(format.test(ISOString), 'ISOString is not in correct format');
    // date parameters
    var year = Number(ISOString.substring(0, 4));
    var month = Number(ISOString.substring(5, 7)) - 1; // 0-indexed
    var day = Number(ISOString.substring(8, 10));
    return new Date(year, month, day);
}
exports.getLocalDateFromISOString = getLocalDateFromISOString;
/*
DESC
  Wrapper for date-fns parseJSON (https://date-fns.org/v3.2.0/docs/parseJSON)
INPUT
  json: A JSON formatted date
RETURN
  A Date
*/
function getDateFromJSON(json) {
    return (0, date_fns_1.parseJSON)(json);
}
exports.getDateFromJSON = getDateFromJSON;
/*
DESC
  Returns a UTC date with the same year, month, and day as the input date but
  the time is set to midnight
INPUT
  localDate: A date in local timezone (eg. 2020-01-01T05:00:00.000Z)
RETURN
  A new date in UTC timezone (eg. 2020-01-01T00:00:00.000Z)
*/
function getUTCDateFromLocalDate(localDate) {
    return new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate()));
}
exports.getUTCDateFromLocalDate = getUTCDateFromLocalDate;
