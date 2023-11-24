import { 
  TDatedValue, PerformanceMetric,

  genFirstOfMonthDateRange, genFirstOfQuarterDateRange, genFirstOfYearDateRange,
  genSundayOfWeekDateRange, getDaysBetween,

  formatInTimeZone, genDateRange, getDateOneMonthAgo, getDateThreeMonthsAgo, 
  getDateSixMonthsAgo, getDateOneYearAgo,

  assert
} from 'common'
import * as _ from 'lodash'
import { getFormattedPrice } from './Price'


// =====
// enums
// =====

// date range options for price charts
export enum ChartDateRange {
  All = 'All',
  OneMonth = 'One Month',
  OneYear = 'One Year',
  SixMonths = 'Six Months',
  ThreeMonths = 'Three Months',
}


// =========
// functions
// =========

/*
DESC
  Converts the input array of number ticks into readable date ticks
INPUT
  ticks: A number[] representing dates
RETURN
  A string[] with readable dates
*/
export function dateAxisTickFormatter(tick: number): string {
  return formatInTimeZone(new Date(tick), 'MMM d', 'UTC')
}

/*
DESC
  Parses the input object and returns the chart dataKeys as follows:
    - primary: The name of the primary dataKey
    - reference?: The name of the reference dataKey
INPUT
  keys: An object containing the type of key to the name of the dataKey
RETURN
  An object with the parsed chart dataKeys
*/
export function getChartDataKeys(
  keys: {[key: string]: string}
): {[key: string]: string} {
  const dataKeys: {[key: string]: string} = {}

  // primary
  if ('primaryKey' in keys) {
    dataKeys['primaryKey'] = keys['primaryKey']
  }

  // reference
  if ('referenceKey' in keys) {
    dataKeys['referenceKey'] = keys['referenceKey']
  }

  return dataKeys
}

/*
DESC
  Returns a TChartDataPoint[] containing all of the input TDatedValue[]
INPUT
  datedValues: A Map of seriesName -> TDatedValue[]
RETURN
  A TChartDataPoint[] with a key in values for each of the input dateValuesMap 
  keys
*/
export function getChartDataFromDatedValues(
  datedValuesMap: Map<string, TDatedValue[]>
): TChartDataPoint[] {

  let dataMap = new Map<number, {[key: string]: number}>()

  // populate dataMap
  datedValuesMap.forEach((datedValues, seriesName) => {
    datedValues.forEach((datedValue: TDatedValue) => {
      
      const date = _.isDate(datedValue.date)
        ? datedValue.date
        : new Date(Date.parse(datedValue.date))
      const dateAsNumber = date.getTime()
      let values = dataMap.get(dateAsNumber)
      
      // set in existing object
      if (values) {
        values[seriesName] = datedValue.value
        
      // create new object
      } else {
        values = {[seriesName]: datedValue.value}
      }

      dataMap.set(date.getTime(), values)
    })
  })

  const dataPoints: TChartDataPoint[] = []

  // populate datapoints
  dataMap.forEach((values, dateAsNumber) => {
    dataPoints.push({
      date: dateAsNumber,
      values: values
    })
  })

  return _.sortBy(dataPoints, (dataPoint: TChartDataPoint) => {
    return dataPoint.date
  })
}

/*
DESC
  Returns a TChartDataPoint[] specifically for a PnlChart using the input 
  TDatedValue[]. It is expected that one of the datedValuesMap keys is 
  'Cumulative Profit and Loss' or 'Daily Profit and Loss'
INPUT
  datedValues: A Map of seriesName -> TDatedValue[]
RETURN
  A TChartDataPoint[] with the following keys:
    - values['Cumulative Profit and Loss'] or values['Daily Profit and Loss']
    - values['Total Cost']
    - arrayValues['Profit Area']
    - arrayValues['Profit Line']
    - arrayValues['Loss Line']
    - arrayValues['Loss Area']
*/
export function getPnlChartDataFromDatedValues(
  datedValuesMap: Map<string, TDatedValue[]>
): TChartDataPoint[] {

  // get TChartDataPoint[] with populated values
  const valuesDataPoints = getChartDataFromDatedValues(datedValuesMap)
  const dataPoints = valuesDataPoints.map((dataPoint: TChartDataPoint) => {

    // assert required data exists
    assert(dataPoint.values, 'Data point is missing values')
    assert(dataPoint.values[PerformanceMetric.DailyPnL] 
      || dataPoint.values[PerformanceMetric.CumPnL], 
      'Data point is missing pnl value')
    assert(dataPoint.values[PerformanceMetric.TotalCost], 
      'Data point is missing total cost value')

    const pnl = dataPoint.values[PerformanceMetric.DailyPnL] 
      ?? dataPoint.values[PerformanceMetric.CumPnL] 
    const totalCost = dataPoint.values[PerformanceMetric.TotalCost]

    // calculate pnl
    let pnlArrayValues: {[key: string]: number[]} = {}
    let pnlValues: {[key: string]: number} = {...dataPoint.values}
    if (pnl >= 0) {
      pnlArrayValues['Profit Area'] = [totalCost, totalCost + pnl]
      pnlValues['Profit Line'] = totalCost + pnl
    }
    if (pnl < 0) {
      pnlArrayValues['Loss Area'] = [totalCost + pnl, totalCost]
      pnlValues['Loss Line'] = totalCost + pnl
    }

    return {
      date: dataPoint.date,
      values: pnlValues,
      arrayValues: pnlArrayValues
    } as TChartDataPoint
  })

  return _.sortBy(dataPoints, (dataPoint: TChartDataPoint) => {
    return dataPoint.date
  })
}

/*
DESC
  Returns an array of numbers (Dates) representing the ticks for the date axis
  using either the input dateRange or numTicks
INPUT
  startDate: The starting date
  endDate: The ending date
  dateRange: A ChartDateRange
  number?: The number of ticks
RETURN
  A number[]
*/
export function getDateAxisTicks(
  startDate: Date, 
  endDate: Date, 
  dateRange: ChartDateRange
): number[] {

  let dates: Date[] = []

  switch(dateRange) {
    case ChartDateRange.OneMonth:
      dates = genSundayOfWeekDateRange(startDate, endDate)
      break
    case ChartDateRange.ThreeMonths:
    case ChartDateRange.SixMonths:
      dates = genFirstOfMonthDateRange(startDate, endDate)
      break
    case ChartDateRange.OneYear:
      dates = genFirstOfQuarterDateRange(startDate, endDate)
      break
    case ChartDateRange.All:
      const daysBetween = getDaysBetween(startDate, endDate)

      // daily
      if (daysBetween <= 14) {
        dates = genDateRange(startDate, endDate)

      // weekly
      } else if (daysBetween <= 30) {
        dates = genSundayOfWeekDateRange(startDate, endDate)

      // monthly
      } else if (daysBetween <= 360) {
        dates = genFirstOfMonthDateRange(startDate, endDate)

      // quarterly
      } else if (daysBetween <= 720) {
        dates = genFirstOfQuarterDateRange(startDate, endDate)

      // yearly
      } else {
        dates = genFirstOfYearDateRange(startDate, endDate)

      }
      break
  }

  // // remove endpoints if they are beyond the startDate or endDate
  // const ticks = dates.filter((date: Date) => {
  //   return date.getTime() >= startDate.getTime() 
  //     && date.getTime() <= endDate.getTime()
  // })

  return dates.map((date: Date) => {
    return date.getTime()
  })
}

/*
DESC
  Returns the start date based on the input ChartDateRange
INPUT
  dateRange: A ChartDateRange
RETURN
  The start date
*/
export function getStartDateFromChartDateRange(
  dateRange: ChartDateRange
): Date {

  // one month
  if (dateRange === ChartDateRange.OneMonth) {
    return getDateOneMonthAgo()

  // three months
  } else if (dateRange === ChartDateRange.ThreeMonths) {
    return getDateThreeMonthsAgo()

  // six months
  } else if (dateRange === ChartDateRange.SixMonths) {
    return getDateSixMonthsAgo()

  // one year
  } else if (dateRange === ChartDateRange.OneYear) {
    return getDateOneYearAgo()

  // default to one year ago
  } else {
    return getDateOneYearAgo()
  }

}

/*
DESC
  Converts the input array of number ticks into more readable price ticks
INPUT
  ticks: A number representing prices
RETURN
  A string with readable dates
*/
export function priceAxisTickFormatter(tick: number): string {
  return getFormattedPrice(tick, '$', 0)
}


// =====
// types
// =====

export type TChartDataPoint = {
  date: number,
  values?: {[key: string]: number},
  arrayValues?: {[key: string]: number[]}
}

export type TChartMargins = {
  top: number,
  right: number,
  left: number,
  bottom: number
}