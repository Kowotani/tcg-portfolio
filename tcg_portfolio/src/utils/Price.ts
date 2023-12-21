import { 
  // data models
  IDatedPriceData, IPriceData,

  // others
  getDaysBetween
} from 'common'
import { formatNumber } from './generic'


// ==========
// interfaces
// ==========

export interface ILatestPricesContext {
  latestPrices: Map<number, IDatedPriceData>,
  setLatestPrices: React.Dispatch<React.SetStateAction<Map<number, IDatedPriceData>>>
}


// =========
// functions
// =========

/*
DESC
  Returns the input number formatted as a price (eg. $1,234.56)
INPUT
  value: The value to format
RETURN
  The formatted number
*/
export function formatAsPrice(value: number): string {
  return formatNumber({
    value: value,
    prefix: '$',
    precision: 2
  })
}

/*
  DESC
    Calculates the annualized return based on the input prices and dates
  INPUT
    startPrice: The starting price
    endPrice: The ending price
    startDate: The start date
    endDate: The end date
  RETURN
    The annualized return
*/
export function getAnnualizedReturn(
  startPrice: number,
  endPrice: number,
  startDate: Date,
  endDate: Date,
  precision?: number
): number {
  const simpleReturn = (endPrice / startPrice) - 1
  const elapsedDays = getDaysBetween(startDate, endDate)
  return Math.pow(1 + simpleReturn, 365 / elapsedDays) - 1
}

/*
DESC
  Converts the input IDatedPriceData[] into an IPriceData[]
INPUT
  datedPriceData: An IDatedPriceData[]
RETURN
  An IPriceData[]
*/
export function getIPriceDataFromIDatedPriceData(
  datedPriceData: IDatedPriceData[]
): IPriceData[] {
  const priceData = datedPriceData.map((data: IDatedPriceData) => {
    return data.prices
  })
  return priceData
}

/*
DESC
  Converts the input Map<number, IDatedPriceData> into a
  Map<number, IPriceData>
INPUT
  datedPriceDataMap: A Map<number, IDatedPriceData>
RETURN
  A Map<number, IPriceData>
*/
export function getIPriceDataMapFromIDatedPriceDataMap(
  datedPriceDataMap: Map<number, IDatedPriceData>
): Map<number, IPriceData> {
  let priceMap = new Map<number, IPriceData>()
  datedPriceDataMap.forEach((v: IDatedPriceData, k: number) => {
    priceMap.set(k, v.prices)
  })
  return priceMap
}