import { 
  IDatedPriceData, IPriceData, 
  
  assert, isIDatedPriceData 
} from 'common'
import * as _ from 'lodash'
import numeral from 'numeral'


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

/*
DESC
  Returns the input price formatted according to the locale and the number
  of decimal places
INPUT
  price: The price to format
  decimal?: The number of decimals to format to, defaults to 0
  prefix?: Any prefix to pre-pend to the price
RETURN
  The price formatted to the locale with the prfeix and number of decimal places
*/
export function getFormattedPrice(
  price: number, 
  prefix?: string,
  decimals?: number,
  suffix?: string,
): string {

  // base format
  const baseFormat = '0,0'

  // precision
  const precision = decimals ? `.[${_.repeat('0', decimals)}]` : ''

  // final format
  const format = `${prefix}${baseFormat}${precision}${suffix}`

  return numeral(price).format(format)
}

/*
DESC
  Converts the API response from Price endpoints into a useable Map
INPUT
  data: An object of format {[k: string]: IDatedPriceData}
RETURN
  A Map of [tcgplayerId: IDatedPriceData] 
*/
export function getPriceMapFromPriceAPIResponse(
  data: {[k: string]: IDatedPriceData}
): Map<number, IDatedPriceData> {

  const priceMap = new Map<number, IDatedPriceData>()

  Object.keys(data).forEach((key: any) => {

    // tcgplayerId check
    const tcgplayerId = Number(key)
    assert(
      _.isNumber(tcgplayerId), 
      'Unexepcted key type in response body of GET_LATEST_PRICES_URL')

    // datedPriceData check
    const datedPriceData = data[tcgplayerId]
    assert(
      isIDatedPriceData(datedPriceData),
      'Unexepcted value type in response body of GET_LATEST_PRICES_URL'
    )
    priceMap.set(tcgplayerId, datedPriceData)
  })
  return priceMap
}