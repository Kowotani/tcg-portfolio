import { 
  IDatedPriceData, IPopulatedHolding, IPriceData, IProduct, ProductLanguage, 
  ProductSubtype, TDatedValue,

  genFirstOfMonthDateRange, genFirstOfQuarterDateRange, genFirstOfYearDateRange,
  genSundayOfWeekDateRange, getDaysBetween,
  
  assert, isIDatedPriceData, isIPopulatedHolding, isIProduct, genDateRange
} from 'common'
import * as _ from 'lodash'


// ======
// arrays
// ======

// these ProductSubtypes should be excluded from display to the user
export const NonVisibileProductSubtypes = [
  ProductSubtype.FABVersionTwo,
  ProductSubtype.NonFoil
]


// =====
// enums
// =====

// -----
// Chart
// -----

// date range options for price charts
export enum ChartDateRange {
  All = 'All',
  OneMonth = 'One Month',
  OneYear = 'One Year',
  SixMonths = 'Six Months',
  ThreeMonths = 'Three Months',
}

// ---------------
// Portfolio Panel
// ---------------

// Portfolio panel subpages
export enum PortfolioPanelNav {
  Add = 'Add',
  All = 'All',
  Edit = 'Edit',
  Performance = 'Performance',
}

// ------------
// User Account
// ------------

// the types of user accounts
export enum UserType {
  Admin = 'Admin',
  User = 'User'
}

// -------
// Sidebar
// -------

// SideBarNav
export const SideBarNav = {
  HOME: {
    order: 1,
    name: 'Home',
    authorizedRoles: [UserType.Admin, UserType.User]
  } as ISideBarNav,
  PORTFOLIO: {
    order: 2, 
    name: 'Portfolio',
    authorizedRoles: [UserType.Admin, UserType.User]
  } as ISideBarNav,
  PRODUCT: {
    order: 3,
    name: 'Product',
    authorizedRoles: [UserType.Admin, UserType.User]
  } as ISideBarNav,
  ADD_PRODUCT: {
    order: 4,
    name: 'Add Product',
    authorizedRoles: [UserType.Admin]
  } as ISideBarNav
}


// ==========
// interfaces
// ==========

// LatestPriceContext
export interface ILatestPricesContext {
  latestPrices: Map<number, IDatedPriceData>,
  setLatestPrices: React.Dispatch<React.SetStateAction<Map<number, IDatedPriceData>>>
}

// SideBarNav
export interface ISideBarNav {
  order: number,
  name: string,
  authorizedRoles: UserType[],
}

// SideBarNavContext
export interface ISideBarNavContext {
  sideBarNav: ISideBarNav,
  setSideBarNav: React.Dispatch<React.SetStateAction<ISideBarNav>>
}

// User
export interface IUser {
  userId: number,
  userType: UserType,
}

// UserContext
export interface IUserContext {
  user: IUser,
  setUser: React.Dispatch<React.SetStateAction<IUser>>
}


// =========
// functions
// =========

// ------
// charts
// ------

/*
DESC
  Converts the input IDatedPriceData[] into an IPriceData[]
INPUT
  datedPriceData: An IDatedPriceData[]
RETURN
  An IPriceData[]
*/
export function getChartDataFromDatedValues(
  datedValues: TDatedValue[]
): TChartDataPoint[] {
  return datedValues.map((datedvalue: TDatedValue) => {
    return {
      date: datedvalue.date.getTime(),
      value: datedvalue.value
    } as TChartDataPoint
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
export const getDateAxisTicks = (
  startDate: Date, 
  endDate: Date, 
  dateRange: ChartDateRange
): number[] => {

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

  return dates.map((date: Date) => {
    return date.getTime()
  })
}

// ----------
// converters
// ----------

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

// ---------
// filtering
// ---------

/*
DESC
  Helper function used for filtering Product search results and Holdings in 
  the Portfolio view
RETURN
  TRUE if the Product matches the searchInput, FALSE otherwise
*/
function isMatchingProduct(product: IProduct, searchInput: string): boolean {
  const escapedInput = _.escapeRegExp(searchInput)
  return (
    // name
    _.toLower(product.name).match(_.toLower(escapedInput)) !== null

    // TCG
    || _.toLower(product.tcg).match(_.toLower(escapedInput)) !== null

    // ProductType
    || _.toLower(product.type).match(_.toLower(escapedInput)) !== null

    // ProductSubtype
    || (_.toLower(product.subtype).match(_.toLower(escapedInput)) !== null
      && !NonVisibileProductSubtypes.includes(
        product.subtype as ProductSubtype)
      )
  )
}

/*
DESC
  Function used for filtering wither an IProduct matches the input searchInput
  NOTE: This function returns another function
INPUT
  filterInput: A string to search using isMatchingProduct()
RETURN
  A function that accepts an IProduct and returns TRUE if the searchInput
  match the IProduct according to isMatchingProduct()
REF
  https://stackoverflow.com/questions/7759237/how-do-i-pass-an-extra-parameter-to-the-callback-function-in-javascript-filter
*/
export function filterFnHoldingCard(
  searchinput: string
): (element: IPopulatedHolding) => boolean {
  return function(holding: IPopulatedHolding) {
    return isMatchingProduct(holding.product, searchinput)
  }
}

/*
DESC
  Function used for filtering wither an IProduct matches the input searchInput
  NOTE: This function returns another function
INPUT
  searchInput: A string to search using isMatchingProduct()  
RETURN
  A function that accepts an IProduct and returns TRUE if the searchInput
  match the IProduct according to isMatchingProduct()
REF
  https://stackoverflow.com/questions/7759237/how-do-i-pass-an-extra-parameter-to-the-callback-function-in-javascript-filter
*/
export function filterFnProductSearchResult(
  searchInput: string
): (element: IProduct) => boolean {
  return function(product: IProduct) {
    return isMatchingProduct(product, searchInput)
  }
}

// -------
// generic
// -------

/*
DESC
  Returns the first locale detected from the browser (ie. navigator.languages). 
  Defaults to 'en-US' if none are found
RETURN
  The first locale detected from the browser
REF
  https://phrase.com/blog/posts/detecting-a-users-locale/
*/
export function getBrowserLocale(): string {
  
  const DEFAULT_LOCALE = 'en-US'

  const browserLocales = navigator.languages === undefined
    ? [navigator.language]
    : navigator.languages

  if (!browserLocales || browserLocales.length === 0) {
    return DEFAULT_LOCALE
  }

  return browserLocales[0].trim()
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
  Returns the Product's name with the added ProductLanguage if the language is
  not English
INPUT
  product: The IProduct with name to format
RETURN
  The Product's name formatted with the ProductLanguage if it's not English
*/
export function getProductNameWithLanguage(product: IProduct): string {
  return `${product.name} 
    ${product.language !== ProductLanguage.English 
      ? '[' + product.language + ']' 
      : ''}`
}

/*
DESC
  Checks if the input is a valid HTTP URL
INPUT
  input: a string that may be a URL
RETURN
  TRUE if the input is a valid HTTP URL, FALSE otherwise
REF
  https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
*/
export function isHttpUrl(input: string): boolean {
  let url
  
  try {
    url = new URL(input)
  } catch (_) {
    return false; 
  }
  
  return url.protocol === "http:" || url.protocol === "https:"
}

// -------
// sorting
// -------

/*
DESC
  Helper function used for generating sorting keys for IPopulatedHolding
  sorting functions
INPUT
  holding: The IPopulatedHolding
RETURN
  The generated sorting key
*/
function genPopulatedHoldingKey(holding: IPopulatedHolding): string {
  return holding.product.name
    + holding.product.tcg
    + holding.product.type
    + holding.product.subtype ?? ''
    + holding.product.language
}

/*
DESC
  Helper function used for generating sorting keys for IProduct search results
INPUT
  product: The IProduct
RETURN
  The generated sorting key
*/
function genProductSearchResultKey(product: IProduct): string {
  return product.name
    + product.tcg
    + product.type
    + product.subtype ?? ''
}

/*
DESC
  Function used for sorting IPopulatedHolding in ascending order
INPUT
  a: The first IPopulatedHolding
  b: The second IPopulatedHolding
RETURN
  A negative number if a < b, otherwise a positive number if a > b
*/
export function sortFnPopulatedHoldingAsc(a: any, b: any): number {
  assert(isIPopulatedHolding(a))
  assert(isIPopulatedHolding(b))
  const keyA = genPopulatedHoldingKey(a)
  const keyB = genPopulatedHoldingKey(b)
  return keyA < keyB ? -1 : keyB > keyA ? 1 : 0
}

/*
DESC
  Function used for sorting IPopulatedHolding in descending order
INPUT
  a: The first IPopulatedHolding
  b: The second IPopulatedHolding
RETURN
  A negative number if a > b, otherwise a positive number if a < b
*/
export function sortFnPopulatedHoldingDesc(a: any, b: any): number {
  assert(isIPopulatedHolding(a))
  assert(isIPopulatedHolding(b))
  const keyA = genPopulatedHoldingKey(a)
  const keyB = genPopulatedHoldingKey(b)
  return keyA < keyB ? 1 : keyB > keyA ? -1 : 0
}

/*
DESC
  Function used for sorting IProduct in ascending order for displaying
  search results
INPUT
  a: The first IProduct
  b: The second IProduct
RETURN
  A negative number if a < b, otherwise a positive number if a > b
*/
export function sortFnProductSearchResults(a: any, b: any): number {
  assert(isIProduct(a))
  assert(isIProduct(b))
  const keyA = genProductSearchResultKey(a)
  const keyB = genProductSearchResultKey(b)
  return keyA < keyB ? -1 : keyB > keyA ? 1 : 0
}


// =====
// types
// =====

// -----
// Chart
// -----

export type TChartDataPoint = {
  date: number,
  value: number,
  isInterpolated?: boolean
}

export type TChartMargins = {
  top: number,
  right: number,
  left: number,
  bottom: number
}