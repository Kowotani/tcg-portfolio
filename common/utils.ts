import {
  ProductSubtype, ProductType, TCG, TCGPriceType,

  ProductTypeToProductSubtype, TCGToProductSubtype
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