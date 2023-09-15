
import { 
  IHolding, IPopulatedHolding, ITransaction, TDatedValue,

  genDateRange,
  getHoldingSales
} from 'common'
import * as df from 'danfojs-node'


// =======
// generic
// =======

/*
DESC
  Converts the input danfo Seeries into a TDatedValue[]
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
    if (seriesValue) {
      values[ix] = Number(seriesValue)
    
    // unmatched, initial value
    } else if (ix === 0 && initialValue) {
      values[0] = initialValue

    // unmatched, fill value
    } else if (fillMode === 'value' && fillValue) {
      values[ix] = fillValue

    // unmatched, locf
    } else if (fillMode === 'locf' && ix > 0) {
      values[ix] = values[ix - 1]
    
    // default to 0
    } else {
      values[ix] = 0
    }
  })

  return new df.Series(values, {index})
}

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
    const ix = String(index)
    return {
      date: new Date(Date.parse(ix)),
      value: Number(series.loc([ix]))
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
// holding
// =======

/*
DESC
  Returns a series of daily revenue for the input IHolding
INPUT
  holding: An IHolding
RETURN
  A danfo Series
*/
export function getHoldingRevenueSeries(
  holding: IHolding | IPopulatedHolding
): df.Series {

  const sales = getHoldingSales(holding)

  const datedValues: TDatedValue[] = sales.map((txn: ITransaction) => {
    return {
      date: txn.date,
      value: txn.price * txn.quantity
    }
  })

  return getSeriesFromDatedValues(datedValues)
}


// =========
// portfolio
// =========
