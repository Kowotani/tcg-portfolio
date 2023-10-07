import { TDatedValue } from 'common'
import * as df from 'danfojs'
import * as _ from 'lodash'


// =========
// functions
// =========

/*
DESC
  Converts the input danfo Seeries into a TDatedValue[]
INPUT
  series: A danfo Series
RETURN
  A TDatedValue[]
*/
export function getDatedValuesFromSeries(
  series: df.Series
): TDatedValue[] {

  const datedValues = series.index.map((index: string | number) => {
    
    const date = _.isNumber(index)
      ? new Date(index)
      : new Date(Date.parse(index))

    const value = _.isNumber(index)
      ? Number(series.iat(index))
      : Number(series.at(index))

    return {
      date: date,
      value: value
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