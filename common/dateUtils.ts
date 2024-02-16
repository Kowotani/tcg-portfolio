import { 
  add, clamp, sub,
  
  isAfter, isBefore, isEqual, 

  differenceInCalendarDays, differenceInDays, differenceInCalendarWeeks, 
  differenceInCalendarMonths, differenceInMonths, differenceInCalendarYears, 
  differenceInYears, 
  
  eachMonthOfInterval, eachQuarterOfInterval,  eachWeekOfInterval, 
  eachYearOfInterval, 

  startOfDay, startOfToday, parseJSON
} from 'date-fns'
import { format, utcToZonedTime } from 'date-fns-tz'
import * as _ from 'lodash'
import { assert } from './utils'


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
export function genDateRange(startDate: Date, endDate: Date): Date[] {

  let accumulator = startDate
  const days: Date[] = []

  while (endDate >= accumulator) {
    days.push(accumulator)
    accumulator = add(accumulator, {hours: 24})
  }

  return days
}

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
export function genFirstOfMonthDateRange(
  startDate: Date, 
  endDate: Date
): Date[] {

  return eachMonthOfInterval({
    start: startDate,
    end: endDate
  })
}

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
export function genFirstOfQuarterDateRange(
  startDate: Date, 
  endDate: Date
): Date[] {

  return eachQuarterOfInterval({
    start: startDate,
    end: endDate
  })
}

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
export function genFirstOfYearDateRange(
  startDate: Date, 
  endDate: Date
): Date[] {

  return eachYearOfInterval({
    start: startDate,
    end: endDate
  })
}

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
export function genSundayOfWeekDateRange(
  startDate: Date, 
  endDate: Date
): Date[] {

  return eachWeekOfInterval({
      start: startDate,
      end: endDate
    },
    {weekStartsOn: 0}
  )
}


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
export function areDatesEqual(first: Date, second: Date): boolean {
  return isEqual(first, second)
}

/*
DESC
  Adds the input duration to the input Date
INPUT
  date: A Date 
RETURN
  The Date after adding the duration
*/
export function dateAdd(date: Date, duration: TDateMathDuration): Date {
  return add(date, duration)
}

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
export function dateDiff(
  startDate: Date,
  endDate: Date, 
  units: 'days' | 'weeks' | 'months' | 'years'
): number {

  switch (units) {
    case 'days':
      return differenceInCalendarDays(endDate, startDate)

    case 'weeks':
      return differenceInCalendarWeeks(endDate, startDate)

    case 'months':
      return differenceInCalendarMonths(endDate, startDate)

      case 'years':
        return differenceInCalendarYears(endDate, startDate)
  }
}

/*
DESC
  Subtracts the input duration to the input Date
INPUT
  date: A Date 
RETURN
  The Date after subtracting the duration
*/
export function dateSub(date: Date, duration: TDateMathDuration): Date {
  return sub(date, duration)
}

/*
DESC
  Formats the input date as YYYY-MM-DD in UTC time
INPUT
  date: A Date 
RETURN
  A YYYY-MM-DD formatted version of the input date
*/
export function formatAsISO(date: Date): string {
  return formatInTimeZone(date, 'yyyy-MM-dd', 'UTC')
}

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
export function formatDateDiffAsYearsMonthsDays(
  startDate: Date, 
  endDate: Date
): string {

  assert(isBefore(startDate, endDate), 'startDate is not before endDate')

  // initialize variables
  let date = startDate
  let components: string[] = []

  // determine years
  const years = differenceInYears(endDate, date)
  if (years > 0) {
    components.push(years > 1 ? `${years} years` : '1 year')
  }

  // determine months
  date = dateAdd(date, {years: years})
  const months = differenceInMonths(endDate, date)
  if (months > 0) {
    components.push(months > 1 ? `${months} months` : '1 month')
  }

  // determine days
  date = dateAdd(date, {months: months})
  const days = differenceInDays(endDate, date)
  if (days > 0) {
    components.push(days > 1 ? `${days} days` : '1 day')
  }

  return _.join(components, ', ')
}

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
export function getClampedDate(
  date: Date,
  startDate: Date,
  endDate: Date
): Date {
  return clamp(
    date, 
    {
      start: startDate,
      end: endDate
    })
}

/*
DESC
  Returns the number of calendar days between two dates
INPUT
  startDate: The start date
  endDate: The end date
RETURN
  The number of calendar days between the two dates
*/
export function getDaysBetween(
  startDate: Date,
  endDate: Date
): number {
  return differenceInCalendarDays(endDate, startDate)
}

/*
DESC
  Returns the input Date starting at midnight
INPUT
  date: A Date
RETURN
  The date starting at midnight
*/
export function getStartOfDate(date: Date): Date {
  return startOfDay(date)
}

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
export function isDateAfter(
  first: Date, 
  second: Date, 
  orEqual?: boolean
): boolean {
  return isAfter(first, second) 
    || (orEqual ? isEqual(first, second) : false)
}

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
export function isDateBefore(
  first: Date, 
  second: Date, 
  orEqual?: boolean
): boolean {
  return isBefore(first, second) 
    || (orEqual ? isEqual(first, second) : false)
}

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
export function isDateBetween(
  date: Date,
  start: Date, 
  end: Date, 
  orEqual?: boolean
): boolean {
  return orEqual 
    ? (isAfter(date, start) || isEqual(date, start))
      && (isBefore(date, end) || isBefore(date, end))
    : (isAfter(date, start) && isBefore(date, end))
}


// =====================
// n periods ago helpers
// =====================

/*
DESC
  Returns a date that is 30 days ago
RETURN
  The date that is 30 days ago
*/
export function getDateThirtyDaysAgo(): Date {
  return dateSub(startOfToday(), {days: 30})
}

/*
DESC
  Returns a date that is 1 month ago
RETURN
  The date that is 1 month ago
*/
export function getDateOneMonthAgo(): Date {
  return dateSub(startOfToday(), {months: 1})
}

/*
DESC
  Returns a date that is 3 months ago
RETURN
  The date that is 3 months ago
*/
export function getDateThreeMonthsAgo(): Date {
  return dateSub(startOfToday(), {months: 3})
}

/*
DESC
  Returns a date that is 6 months ago
RETURN
  The date that is 6 months ago
*/
export function getDateSixMonthsAgo(): Date {
  return dateSub(startOfToday(), {months: 6})
}

/*
DESC
  Returns a date that is 1 year ago
RETURN
  The date that is 1 year ago
*/
export function getDateOneYearAgo(): Date {
  return dateSub(startOfToday(), {years: 1})
}


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
export function formatInTimeZone(
  date: Date,
  dateFormat: string,
  timezone: string
): string {
  return format(
    utcToZonedTime(date, timezone),
    dateFormat,
    {timeZone: timezone}
  )
}

/*
DESC
  Returns the client's timezone (eg. America/Toronto)
RETURN
  The client's timezone
*/
export function getClientTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

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
export function getLocalDateFromISOString(ISOString: string): Date {

  // verify format
  const format = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
  assert(format.test(ISOString), 'ISOString is not in correct format')

  // date parameters
  const year = Number(ISOString.substring(0,4))
  const month = Number(ISOString.substring(5,7)) - 1  // 0-indexed
  const day = Number(ISOString.substring(8,10))

  return new Date(year, month, day)
}

/*
DESC
  Wrapper for date-fns parseJSON (https://date-fns.org/v3.2.0/docs/parseJSON)
INPUT
  json: A JSON formatted date
RETURN
  A Date
*/
export function getDateFromJSON(json: string): Date {
  return parseJSON(json)
}

/*
DESC
  Returns a UTC date with the same year, month, and day as the input date but 
  the time is set to midnight
INPUT
  localDate: A date in local timezone (eg. 2020-01-01T05:00:00.000Z)
RETURN
  A new date in UTC timezone (eg. 2020-01-01T00:00:00.000Z)
*/
export function getUTCDateFromLocalDate(localDate: Date): Date {

  return new Date(Date.UTC(
    localDate.getFullYear(),
    localDate.getMonth(),
    localDate.getDate()
  ))
}


// =====
// types
// =====

type TDateMathDuration = {
  years?: number,
  months?: number,
  weeks?: number,
  days?: number,
  hours?: number,
  minutes?: number,
  seconds?: number
}