import {
  TDataResBody, TProductPostResBody, TResBody,
} from './api'
import {
  IHolding, IPopulatedHolding, IPopulatedPortfolio, IPortfolio, IPrice, 
  IPriceData, IProduct, ITransaction, ProductLanguage, ProductSubtype, 
  ProductType, TCG, TCGPriceType, TransactionType,

  ProductTypeToProductSubtype, TCGToProductSubtype, IDatedPriceData, 
} from './dataModels'
import * as _ from 'lodash'
import { inspect } from 'util'


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
    throw new Error('Assertion Error: ' + msg)
  }
}

/*
DESC
  Converts a price string (determined by isPriceString()) to a number
INPUT
  A string to convert
RETURN
  The extracted price as a number from the string (eg. '$1,234.56' => 1234.56)
  Will return NaN if the input is not a price string
*/
export function getPriceFromString(value: string): number {
  return isPriceString(value)
    ? parseFloat(value.replace(',','').substring(1))
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
  The expected unescaped regex format is:
    ^\$\d+\.\d{2}$
INPUT
  A string to check
RETURN
  TRUE if the input follows the following regex (which roughtly corresponds
    to numbers like $123.45), FALSE otherwise
*/
export function isPriceString(value: string): boolean {
  const regexp = new RegExp('^\\$\\d+(,?\\d+)*\\.\\d{2}$');
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
  Console.logs the input Object with full details
INPUT
  arg: An Object
*/
export function logObject(arg: Object): void {
  console.log(inspect(arg, false, null, true))
}

/*
DESC
  Pauses execution for the input ms
INPUT
  ms: The milliseconds to sleep
*/
export function sleep(ms: number): Promise<any> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// -------
// sorting
// -------

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


// ------------------
// has interface keys
// ------------------

/*
DESC
  Returns whether or not the input has all IHoldingBase keys
INPUT
  arg: An object that might be an IHoldingBase
RETURN
  TRUE if the input has all IHoldingBase keys, FALSE otherwise
*/
export function hasIHoldingBaseKeys(arg: any): boolean {
  return arg 
    && arg.transactions
}

/*
DESC
  Returns whether or not the input has all IHolding keys
INPUT
  arg: An object that might be an IHolding 
RETURN
  TRUE if the input has all IHolding keys, FALSE otherwise
*/
export function hasIHoldingKeys(arg: any): boolean {
  return arg 
    && hasIHoldingBaseKeys(arg)
    && arg.tcgplayerId
}

/*
DESC
  Returns whether or not the input has all IPopulatedHolding keys
INPUT
  arg: An object that might be an IPopulatedHolding 
RETURN
  TRUE if the input has all IPopulatedHolding keys, FALSE otherwise
*/
export function hasIPopulatedHoldingKeys(arg: any): boolean {
  return arg 
    && hasIHoldingBaseKeys(arg)
    && arg.product
}

/*
DESC
  Returns whether or not the input has all IPopulatedPortfolio keys
INPUT
  arg: An object that might be an IPopulatedPortfolio 
RETURN
  TRUE if the input has all IPopulatedPortfolio keys, FALSE otherwise
*/
export function hasIPopulatedPortfolioKeys(arg: any): boolean {
  return arg 
    && hasIPortfolioBaseKeys(arg)
    && arg.populatedHoldings
}

/*
DESC
  Returns whether or not the input has all IPortfolioBase keys
INPUT
  arg: An object that might be an IPortfolioBase
RETURN
  TRUE if the input has all IPortfolioBase keys, FALSE otherwise
*/
export function hasIPortfolioBaseKeys(arg: any): boolean {
  return arg 
    && arg.userId
    && arg.portfolioName
}

/*
DESC
  Returns whether or not the input has all IPortfolio keys
INPUT
  arg: An object that might be an IPortfolio 
RETURN
  TRUE if the input has all IPortfolio keys, FALSE otherwise
*/
export function hasIPortfolioKeys(arg: any): boolean {
  return arg 
    && hasIPortfolioBaseKeys(arg)
    && arg.holdings
}


// ---------
// is object
// ---------

/*
DESC
  Returns whether or not the input is a Date
INPUT
  arg: An object that might be a Date 
RETURN
  TRUE if the input is a Date, FALSE otherwise
*/
export function isDate(arg: any): arg is Date {
  return arg
    && !Number.isNaN(Date.parse(arg))
}

/*
DESC
  Returns whether or not the input is an IDatedPriceData
INPUT
  arg: An object that might be an IDatedPriceData 
RETURN
  TRUE if the input is an IDatedPriceData, FALSE otherwise
*/
export function isIDatedPriceData(arg: any): arg is IDatedPriceData {
  return arg
    && arg.priceDate && isDate(arg.priceDate)
    && arg.prices && isIPriceData(arg.prices)
}

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
    && hasIHoldingKeys(arg)
    && typeof(arg.tcgplayerId) === 'number'
    && Array.isArray(arg.transactions)
      && _.every(arg.transactions.map((el: any) => {
        return isITransaction(el)
      }))
}

/*
DESC
  Returns whether or not the input is an IHolding[]
INPUT
  arg: An object that might be an IHolding[] 
RETURN
  TRUE if the input is an IHolding[], FALSE otherwise
*/
export function isIHoldingArray(arg: any): arg is IHolding[] {
  return arg
    && Array.isArray(arg)
    && _.every(arg.map((el: any) => {
      return isIHolding(el)
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
    && hasIPopulatedHoldingKeys(arg)
    && isIProduct(arg.product)
    && Array.isArray(arg.transactions)
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
    && hasIPopulatedPortfolioKeys(arg)
    && typeof(arg.userId) === 'number'
    && typeof(arg.portfolioName) === 'string'
    && Array.isArray(arg.populatedHoldings)
      && _.every(arg.populatedHoldings.map((el: any) => {
        return isIPopulatedHolding(el)
      }))
}

/*
DESC
  Returns whether or not the input is an IPopulatedPortfolio[]
INPUT
  arg: An object that might be an IPopulatedPortfolio[] 
RETURN
  TRUE if the input is an IPopulatedPortfolio[], FALSE otherwise
*/
export function isIPopulatedPortfolioArray(
  arg: any
): arg is IPopulatedPortfolio[] {
  return arg
    && Array.isArray(arg)
    && _.every(arg.map((el: any) => {
      return isIPopulatedPortfolio(el)
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
    && hasIPortfolioKeys(arg)
    && typeof(arg.userId) === 'number'
    && typeof(arg.portfolioName) === 'string'
    && Array.isArray(arg.holdings)
      && _.every(arg.holdings.map((el: any) => {
        return isIHolding(el)
      }))
}

/*
DESC
  Returns whether or not the input is an IPortfolio[]
INPUT
  arg: An object that might be an IPortfolio[] 
RETURN
  TRUE if the input is an IPortfolio[], FALSE otherwise
*/
export function isIPortfolioArray(arg: any): arg is IPortfolio[] {
  return arg
    && Array.isArray(arg)
    && _.every(arg.map((el: any) => {
      return isIPortfolio(el)
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
    && arg.priceDate && isDate(arg.priceData)
    && arg.tcgplayerId && typeof(arg.tcgplayerId) === 'number'
    && arg.granularity && typeof(arg.granularity) === 'string'
    && arg.prices && isIPriceData(arg.prices)
}

/*
DESC
  Returns whether or not the input is an IPrice[]
INPUT
  arg: An object that might be an IPrice[]
RETURN
  TRUE if the input is an IPrice[], FALSE otherwise
*/
export function isIPriceArray(arg: any): arg is IPrice {
  return arg
    && Array.isArray(arg)
    && _.every(arg.map((el: any) => {
      return isIPrice(el)
    }))
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
  Returns whether or not the input is an IPriceData[]
INPUT
  arg: An object that might be an IPriceData[] 
RETURN
  TRUE if the input is an IPriceData[], FALSE otherwise
*/
export function isIPriceDataArray(arg: any): arg is IPriceData[] {
  return arg
    && Array.isArray(arg)
    && _.every(arg.map((el: any) => {
      return isIPriceData(el)
    }))
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
    && arg.releaseDate && isDate(arg.releaseDate)
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
    && arg.date && isDate(arg.date)
    && arg.price && typeof(arg.price) === 'number'
    && arg.quantity && typeof(arg.quantity) === 'number'
}

/*
DESC
  Returns whether or not the input is an ITransaction[]
INPUT
  arg: An object that might be an ITransaction[] 
RETURN
  TRUE if the input is an ITransaction[], FALSE otherwise
*/
export function isITransactionArray(arg: any): arg is ITransaction[] {
  return arg
    && Array.isArray(arg)
    && _.every(arg.map((el: any) => {
      return isITransaction(el)
    }))
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