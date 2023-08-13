import { 
  IHydratedHolding, IProduct, ProductLanguage, ProductSubtype, 
  
  assert, isIHydratedHolding, isIProduct
} from 'common'


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


// =========
// functions
// =========

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

  return prefix ? prefix + formattedPrice : formattedPrice
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
  Helper function used for generating sorting keys for IHydratedHolding
  sorting functions
INPUT
  holding: The IHydratedHolding
RETURN
  The generated sorting key
*/
function genHydratedHoldingKey(holding: IHydratedHolding): string {
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
  Function used for sorting IHydratedHolding in ascending order
INPUT
  a: The first IHydratedHolding
  b: The second IHydratedHolding
RETURN
  A negative number if a < b, otherwise a positive number if a > b
*/
export function sortFnHydratedHoldingAsc(a: any, b: any): number {
  assert(isIHydratedHolding(a))
  assert(isIHydratedHolding(b))
  const keyA = genHydratedHoldingKey(a)
  const keyB = genHydratedHoldingKey(b)
  return keyA < keyB ? -1 : keyB > keyA ? 1 : 0
}

/*
DESC
  Function used for sorting IHydratedHolding in descending order
INPUT
  a: The first IHydratedHolding
  b: The second IHydratedHolding
RETURN
  A negative number if a > b, otherwise a positive number if a < b
*/
export function sortFnHydratedHoldingDesc(a: any, b: any): number {
  assert(isIHydratedHolding(a))
  assert(isIHydratedHolding(b))
  const keyA = genHydratedHoldingKey(a)
  const keyB = genHydratedHoldingKey(b)
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