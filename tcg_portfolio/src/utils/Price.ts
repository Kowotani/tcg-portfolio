import { 
  IDatedPriceData, IPriceData, 
  
  assert, isIDatedPriceData 
} from 'common'
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
  locale: The locale to format against
  decimal?: The number of decimals to format to, defaults to 0
  prefix?: Any prefix to pre-pend to the price
RETURN
  The price formatted to the locale with the prfeix and number of decimal places
*/
export function getFormattedPrice(
  price: number, 
  locale: string,
  prefix?: string,
  decimals?: number,
  suffix?: string,
): string {

  // round trao;omg decimals to handle potential rounding from toLocaleString()
  const roundedPrice = decimals 
    ? Math.round(price * Math.pow(10, decimals)) / Math.pow(10, decimals)
    : Math.round(price)

  let formattedPrice = roundedPrice.toLocaleString(locale)
  const decimalIx = formattedPrice.indexOf('.')
  const precision = decimalIx >= 0 
    ? formattedPrice.toString().length - decimalIx - 1 
    : 0

  // precision required
  if (decimals !== undefined && decimals > 0) {
    
    // no existing precision
    if (precision === 0) {
      formattedPrice = formattedPrice + '.' + '0'.repeat(decimals)

    // existing precision too high
    } else if (precision > decimals) {
      formattedPrice = formattedPrice.substring(0, 
        formattedPrice.length - (precision - decimals))

    // existing precision too low
    } else if (precision < decimals) {
      formattedPrice = formattedPrice + '0'.repeat(decimals - precision)
    }
  
  // precision not required
  } else if (decimalIx >= 0) {
    formattedPrice = formattedPrice.substring(0, decimalIx)
  }

  // prefix and suffixe
  return (prefix ?? '') + formattedPrice + (suffix ?? '')
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