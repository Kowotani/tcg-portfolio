import { 
  clamp, eachDayOfInterval, eachMonthOfInterval, eachQuarterOfInterval, 
  eachWeekOfInterval, eachYearOfInterval
} from 'date-fns'


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

  startDate.setUTCHours(0, 0, 0, 0)
  endDate.setUTCHours(0, 0, 0, 0)

  return eachDayOfInterval({
    start: startDate,
    end: endDate
  })
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