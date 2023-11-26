import { 
  IDatedPriceData, IPriceData, 
  
  assert, isIDatedPriceData 
} from 'common'
import { formatNumber } from './generic'
import * as _ from 'lodash'


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