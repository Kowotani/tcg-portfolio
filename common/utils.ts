import {
  ProductSubtype, ProductType, TCG, TCGPriceType, TDatedValue,

  ProductTypeToProductSubtype, TCGToProductSubtype
} from './dataModels'
import { areDatesEqual, dateDiff, isDateAfter, isDateBefore } from './dateUtils'
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
export function getProductSubtypes(
  tcg: TCG, 
  productType: ProductType
): ProductSubtype[] {
  const tcgArray = TCGToProductSubtype[tcg];
  const productTypeArray = ProductTypeToProductSubtype[productType];
  return _.intersection(tcgArray, productTypeArray);
}

/*
DESC
  Returns the value from the input TDatedValue[] at the input Date (optionally 
    return the closest value found)
INPUT
  datedValues: A TDatedValue[]
  date: The Date to find
  closest?: Whether to return the closest value if an exact date match is not 
    found (default: FALSE)
  useEarlier?: In the event of a tie for closest, whether to use the value 
    corresponding to the earlier date (default: TRUE)
RETURN
  The value corresponding to the (closest) date, or potentially undefined if
  there is no match
*/
export function getValueAtDate(
  datedValues: TDatedValue[],
  date: Date,
  closest?: boolean,
  useEarlier?: boolean
): number | undefined {

  // sort datedValues
  const sortedValues = sortDatedValues(datedValues)

  // look for exact match
  const exactValues = sortedValues.filter((dv: TDatedValue) => {
    return areDatesEqual(dv.date, date)
  })

  // datedValues are empty
  if (datedValues.length === 0) {
    return undefined

  // exact match found
  } else if (exactValues.length > 0) {
    return _.first(exactValues).value
  
  // find closest value
  } else if (closest) {

    // date is before earliest date
    if (isDateBefore(date, _.first(sortedValues).date)) {
      return _.first(sortedValues).value
    
    // date is after latest date
    } else if (isDateAfter(date, _.last(sortedValues).date)) {
      return _.last(sortedValues).value

    // date is between other dates
    } else {

      const earlier = _.last(
        sortedValues.filter((dv: TDatedValue) => { return dv.date < date })
      )
      const earlierDiff = dateDiff(earlier.date, date, 'days')
      const later = _.first(
        sortedValues.filter((dv: TDatedValue) => { return dv.date > date })
      )
      const laterDiff = dateDiff(date, later.date, 'days')

      return earlierDiff < laterDiff 
        || (earlierDiff === laterDiff && (useEarlier ?? true))
          ? earlier.value
          : later.value 
    }

  // return undefined
  } else {
    return undefined
  }
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
  Returns the input TDatedValue[] after sorting (ascending or descending)
INPUT
  datedValues: A TDatedValue[]
  desc?: Whether to sort in descending order (default: FALSE)
RETURN
  The sorted TDatedValue[]
*/
export function sortDatedValues(
  datedValues: TDatedValue[],
  desc?: boolean
): TDatedValue[] {
  return datedValues.sort(desc ? sortFnDatedValueDesc : sortFnDatedValueAsc)
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

/*
DESC
  Function used for sorting TDatedValues in ascending order
INPUT
  a: The first TDatedValue
  b: The second TDatedValue
RETURN
  A negative number if a < b, otherwise a positive number if a > b
*/
export function sortFnDatedValueAsc(a: TDatedValue, b: TDatedValue): number {
  return sortFnDateAsc(a.date, b.date)
}

/*
DESC
  Function used for sorting TDatedValues in descending order
INPUT
  a: The first TDatedValue
  b: The second Date
RETURN
  A negative number if a > b, otherwise a positive number if a < b
*/
export function sortFnDatedValueDesc(a: TDatedValue, b: TDatedValue): number {
  return sortFnDateDesc(a.date, b.date)
}