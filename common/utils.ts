import {
  TDataResBody, TProductPostReqBody, TProductPostResBody, TResBody,
} from './api'
import {
  IHolding, IPopulatedHolding, IPopulatedPortfolio, IPortfolio, IPrice, 
  IPriceData, IProduct, ITransaction, ProductLanguage, ProductSubtype, 
  ProductType, TCG, TCGPriceType, TransactionType,

  ProductTypeToProductSubtype, TCGToProductSubtype, 
} from './dataModels'
import * as _ from 'lodash'


// =========
// constants
// =========

export const DAYS_PER_YEAR = 365
export const MILLISECONDS_PER_SECOND = 1000
export const SECONDS_PER_DAY = 86400


// =========
// functions
// =========

// -------
// generic
// -------

/*
DESC
  Basic assertion function
INPUT
  condition: A condition to assert is true
  msg: An optional message to display
*/
export function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new Error('Assertion Error: ' + msg);
  }
  }

/*
DESC
  Converts a price string (determined by isPriceString()) to a number
INPUT
  A string to convert
RETURN
  The extracted price as a number from the string (eg. '$123.45' => 123.45)
  Will return NaN if the input is not a price string
*/
export function getPriceFromString(value: string): number {
  return isPriceString(value)
    ? parseFloat(value.substring(1))
    : NaN
}

/*
DESC
  Returns an array of valid ProductSubtypes for the given TCG and ProductType
INPUT
  tcg: A TCG enum
  productType: A ProductType enum
RETURN
  An array of ProductSubtypes for the given TCG and ProductType
*/
export function getProductSubtypes(tcg: TCG, productType: ProductType): ProductSubtype[] {
  const tcgArray = TCGToProductSubtype[tcg];
  const productTypeArray = ProductTypeToProductSubtype[productType];
  return _.intersection(tcgArray, productTypeArray);
}

/*
DESC
  Returns whether the input string contains only ASCII characters
INPUT
  A string to check
RETURN
  TRUE if the input contains only ASCII characters, FALSE otherwise
*/
export function isASCII(value: string): boolean {
  return /^[\x00-\x7F]*$/.test(value);;
}

/*
DESC
  Returns whether the input is a number
INPUT
  A value to check
RETURN
  TRUE if the input is a number, FALSE otherwise
*/
export function isNumeric(value: any): boolean {
  return !isNaN(value);
}

/*
DESC
  Returns whether the input is a valid price string
INPUT
  A string to check
RETURN
  TRUE if the input follows the following regex (which roughtly corresponds
    to numbers like $123.45), FALSE otherwise
  regex = ^\$\d+\.\d{2}$
*/
export function isPriceString(value: string): boolean {
  const regexp = new RegExp('^\\$\\d+\\.\\d{2}$');
  return regexp.test(value);
}

/*
DESC
  Returns whether the input string matches a TCGPriceType value
INPUT
  A string to check
RETURN
  TRUE if the input matches a TCGPriceType value
*/
export function isTCGPriceTypeValue(value: string): boolean {
  const arr = Object.values(TCGPriceType).map(v => v.toString());
  return arr.includes(value);
}

/*
DESC
  Function used for sorting dates in ascending order
INPUT
  a: The first Date
  b: The second Date
RETURN
  A negative number if a < b, otherwise a positive number if a > b
*/
export function sortFnDateAsc(a: Date, b: Date): number {
  return a.getTime() - b.getTime()
}

/*
DESC
  Function used for sorting dates in descending order
INPUT
  a: The first Date
  b: The second Date
RETURN
  A negative number if a > b, otherwise a positive number if a < b
*/
export function sortFnDateDesc(a: Date, b: Date): number {
  return b.getTime() - a.getTime()
}


// ===========
// type guards
// ===========

/*
DESC
  Returns whether or not the input is an IHolding
INPUT
  arg: An object that might be an IHolding 
RETURN
  TRUE if the input is an IHolding, FALSE otherwise
*/
export function isIHolding(arg: any): arg is IHolding {
  return arg
    && arg.tcgplayerId && typeof(arg.tcgplayerId) === 'number'
    && arg.transactions && Array.isArray(arg.transactions)
      && _.every(arg.transactions.map((el: any) => {
        return isITransaction(el)
      }))
}

/*
DESC
  Returns whether or not the input is an IPopulatedHolding
INPUT
  arg: An object that might be an IPopulatedHolding 
RETURN
  TRUE if the input is an IPopulatedHolding, FALSE otherwise
*/
export function isIPopulatedHolding(arg: any): arg is IPopulatedHolding {
  return arg
    && arg.product && isIProduct(arg.product)
    && arg.transactions && Array.isArray(arg.transactions)
      && _.every(arg.transactions.map((el: any) => {
        return isITransaction(el)
      }))
}

/*
DESC
  Returns whether or not the input is an IPopulatedPortfolio
INPUT
  arg: An object that might be an IPopulatedPortfolio 
RETURN
  TRUE if the input is an IPopulatedPortfolio, FALSE otherwise
*/
export function isIPopulatedPortfolio(arg: any): arg is IPopulatedPortfolio {
  return arg
    && arg.userId && typeof(arg.userId) === 'number'
    && arg.portfolioName && typeof(arg.portfolioName) === 'string'
    && arg.populatedHoldings && Array.isArray(arg.populatedHoldings)
      && _.every(arg.populatedHoldings.forEach((el: any) => {
        return isIPopulatedHolding(el)
      }))
}

/*
DESC
  Returns whether or not the input is an IPortfolio
INPUT
  arg: An object that might be an IPortfolio 
RETURN
  TRUE if the input is an IPortfolio, FALSE otherwise
*/
export function isIPortfolio(arg: any): arg is IPortfolio {
  return arg
    && arg.userId && typeof(arg.userId) === 'number'
    && arg.portfolioName && typeof(arg.portfolioName) === 'string'
    && arg.holdings && Array.isArray(arg.holdings)
      && _.every(arg.holdings.forEach((el: any) => {
        return isIHolding(el)
      }))
}

/*
DESC
  Returns whether or not the input is an IPrice
INPUT
  arg: An object that might be an IPrice 
RETURN
  TRUE if the input is an IPrice, FALSE otherwise
*/
export function isIPrice(arg: any): arg is IPrice {
  return arg
    && arg.priceDate && arg.priceData instanceof Date
    && arg.tcgplayerId && typeof(arg.tcgplayerId) === 'number'
    && arg.granularity && typeof(arg.granularity) === 'string'
    && arg.prices && isIPriceData(arg.prices)
}

/*
DESC
  Returns whether or not the input is an IPriceData
INPUT
  arg: An object that might be an IPriceData 
RETURN
  TRUE if the input is an IPriceData, FALSE otherwise
*/
export function isIPriceData(arg: any): arg is IPriceData {
  return arg
    // required
    && arg.marketPrice && typeof(arg.marketPrice) === 'number'

    // optional
    && arg.buylistMarketPrice 
      ? typeof(arg.buylistMarketPrice) === 'number' 
      : true
    && arg.listedMedianPrice 
      ? typeof(arg.listedMedianPrice) === 'number' 
      : true
}

/*
DESC
  Returns whether or not the input is an IProduct
INPUT
  arg: An object that might be an IProduct 
RETURN
  TRUE if the input is an IProduct, FALSE otherwise
*/
export function isIProduct(arg: any): arg is IProduct {
  return arg
    // require
    && arg.tcgplayerId && typeof(arg.tcgplayerId) === 'number'
    && arg.tcg && _.values(TCG).includes(arg.tcg)
    && arg.releaseDate && arg.releaseDate instanceof Date
    && arg.name && typeof(arg.name) === 'string'
    && arg.type && _.values(ProductType).includes(arg.type)
    && arg.language && _.values(ProductLanguage).includes(arg.language)

    // optional
    && arg.msrp ? typeof(arg.msrp) === 'number' : true
    && arg.subtype ? _.values(ProductSubtype).includes(arg.subtype) : true
    && arg.setCode ? typeof(arg.setCode) === 'string' : true
}

/*
DESC
  Returns whether or not the input is an ITransaction
INPUT
  arg: An object that might be an ITransaction 
RETURN
  TRUE if the input is an ITransaction, FALSE otherwise
*/
export function isITransaction(arg: any): arg is ITransaction {
  return arg
    && arg.type && _.values(TransactionType).includes(arg.type)
    && arg.date && arg.date instanceof Date
    && arg.price && typeof(arg.price) === 'number'
    && arg.quantity && typeof(arg.quantity) === 'number'
}

// -- HTTP responses

/*
DESC
  Returns whether or not the input is a TResBody
INPUT
  arg: An object that might be an TResBody 
RETURN
  TRUE if the input is an TResBody, FALSE otherwise
*/
export function isTResBody(arg: any): arg is TResBody {
  return arg
    && arg.message && typeof(arg.message) === 'string'
}

/*
DESC
  Returns whether or not the input is a TDataResBody
INPUT
  arg: An object that might be an TDataResBody 
RETURN
  TRUE if the input is an TDataResBody, FALSE otherwise
*/
export function isTDataResBody<Type>(arg: any): arg is TDataResBody<Type> {
  return arg
    // TODO: implement the type check
    && arg.data
    && isTResBody(arg)
}

/*
DESC
  Returns whether or not the input is a TProductPostResBody
INPUT
  arg: An object that might be an TProductPostResBody 
RETURN
  TRUE if the input is an TProductPostResBody, FALSE otherwise
*/
export function isTProductPostResBody<Type>(
  arg: any
): arg is TProductPostResBody<Type> {
  return arg
    && arg.tcgplayerId && typeof(arg.tcgplayerId) === 'number'
    && isTDataResBody<Type>(arg)
}