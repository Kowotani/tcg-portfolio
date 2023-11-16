import { TDatedValue, genDateRange } from 'common'
import * as df from 'danfojs-node'
import * as _ from 'lodash'


// =======
// generic
// =======

/*
  DESC
    Trims or extends the input series depending on the input start and end dates
    If start date < first date, fill with zeros
    If end date > last date, fill with last observed value
  INPUTDepending on the start
    series: A danfo Series
    startDate: The starting date
    endDate: The ending date
  RETURN
    The trimmed or extended danfo Series according to the above
*/
export function defaultTrimOrExtendSeries(
  series: df.Series,
  startDate: Date,
  endDate: Date,  
): df.Series {
  return densifyAndFillSeries(
    series,
    startDate,
    endDate,
    'locf',
    undefined,
    0
  )
}

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
export function densifyAndFillSeries(
  series: df.Series,
  startDate: Date,
  endDate: Date,
  fillMode: 'locf' | 'value',
  fillValue?: number,
  initialValue?: number
): df.Series {

  // get Series index
  const index = genDateRange(startDate, endDate).map((date: Date) => {
    return date.toISOString()
  })

  // populate values for Series
  let values: number[] = []
  index.forEach((date: string, ix: number) => {

    // get value from series, if available
    const seriesValue = series.at(date)

    // matched
    if (seriesValue !== undefined) {
      values.push(Number(seriesValue))
    
    // unmatched, initial value
    } else if (ix === 0 && initialValue) {
      values.push(initialValue)

    // unmatched, fill value
    } else if (fillMode === 'value' && fillValue) {
      values.push(fillValue)

    // unmatched, locf
    } else if (fillMode === 'locf' && ix > 0) {
      values.push(values[ix - 1])
    
    // default to 0
    } else {
      values.push(0)
    }
  })

  return new df.Series(values, {index})
}

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
export function genZeroSeries(
  startDate: Date,
  endDate: Date
): df.Series {
  return densifyAndFillSeries(
    new df.Series([0], {index: [startDate.toISOString()]}),
    startDate,
    endDate,
    'value',
    0,
    0
  )
}


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
export function getDatedValuesFromSeries(
  series: df.Series,
  precision?: number
): TDatedValue[] {

  const datedValues = series.index.map((index: string | number) => {
    
    const date = _.isNumber(index)
      ? new Date(index)
      : new Date(Date.parse(index))

    const value = _.isNumber(index)
      ? Number(series.iat(index))
      : Number(series.at(index))

    const roundedValue = precision
      ? _.round(value, precision)
      : value

    return {
      date: date,
      value: roundedValue
    }
  })

  return datedValues
}

/*
DESC
  Converts the input TDatedValue[] into a danfo Seeries
INPUT
  datedValues: A TDatedValue[]
RETURN
  A danfo Series
*/
export function getSeriesFromDatedValues(
  datedValues: TDatedValue[]
): df.Series {

  const index = datedValues.map((dv: TDatedValue) => {
    return dv.date.toISOString()
  })

  const values = datedValues.map((dv: TDatedValue) => {
    return dv.value
  })

  return new df.Series(values, {index})
}


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
export function sortSeriesByIndex(
  series: df.Series
): df.Series {

  const index = _.sortBy(series.index, el => el)

  const values = index.map((ix: string | number) => {

    return typeof ix === 'string'
      ? series.at(ix)
      : series.iat(ix)
  })
  
  return new df.Series(values, {index})
}