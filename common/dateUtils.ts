import { 
  add, clamp, differenceInCalendarDays, eachMonthOfInterval, 
  eachQuarterOfInterval, eachWeekOfInterval, eachYearOfInterval, isAfter, 
  isBefore, isEqual, sub
} from 'date-fns'
import { format, utcToZonedTime } from 'date-fns-tz'


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
    accumulator = add(accumulator, {days: 1})
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
  return differenceInCalendarDays(startDate, endDate)
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