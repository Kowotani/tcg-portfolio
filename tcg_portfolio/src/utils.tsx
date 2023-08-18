import { 
  IPopulatedHolding, IProduct, ProductLanguage, ProductSubtype, 
  
  assert, isIPopulatedHolding, isIProduct
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

// Portfolio panel subpages
export enum PortfolioPanelNav {
  Add = 'Add',
  All = 'All',
  Edit = 'Edit',
  Performance = 'Performance',
}

// the types of user accounts
export enum UserType {
  Admin = 'Admin',
  User = 'User'
}

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

// -- filtering

/*
DESC
  Helper function used for filtering Product search results and Holdings in 
  the Portfolio view
RETURN
  TRUE if the Product matches the searchInput, FALSE otherwise
*/
function isMatchingProduct(product: IProduct, searchInput: string): boolean {
  return (
    // name
    _.toLower(product.name).match(_.toLower(searchInput)) !== null

    // TCG
    || _.toLower(product.tcg).match(_.toLower(searchInput)) !== null

    // ProductType
    || _.toLower(product.type).match(_.toLower(searchInput)) !== null

    // ProductSubtype
    || (_.toLower(product.subtype).match(_.toLower(searchInput)) !== null
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

// -- generic

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

// -- sorting

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