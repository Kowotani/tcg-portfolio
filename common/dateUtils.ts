import { 
  add, clamp, differenceInCalendarDays, differenceInDays, differenceInMonths, 
  differenceInYears, eachMonthOfInterval, eachQuarterOfInterval, 
  eachWeekOfInterval, eachYearOfInterval, isAfter, isBefore, isEqual, 
  startOfToday, sub
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
  Returns the client's timezone (eg. America/Toronto)
RETURN
  The client's timezone
*/
export function getClientTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
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
  return orEqual 
    ? isAfter(first, second) || isEqual(first, second)
    : isAfter(first, second)
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
  return orEqual 
    ? isBefore(first, second) || isEqual(first, second)
    : isBefore(first, second)
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