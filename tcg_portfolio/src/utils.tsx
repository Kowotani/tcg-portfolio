import { IPortfolio, IProduct, ITransaction, ProductLanguage, 
  ProductSubtype 
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

export interface IEditPortfolioContext {
  portfolio: IPortfolio,
  setPortfolio: React.Dispatch<React.SetStateAction<IPortfolio>>
}

export interface IEditTransactionsContext {
  transactions: ITransaction[],
  setTransactions: React.Dispatch<React.SetStateAction<ITransaction[]>>
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