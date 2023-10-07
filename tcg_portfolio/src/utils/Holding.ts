import { 
  IPopulatedHolding,

  assert, isIPopulatedHolding
} from 'common'
import { isMatchingProduct } from './Product'


// =========
// functions
// =========

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