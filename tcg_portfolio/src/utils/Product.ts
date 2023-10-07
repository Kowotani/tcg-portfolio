import { 
  IProduct, ProductLanguage, ProductSubtype,

  assert, isIProduct
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


// =========
// functions
// =========

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
  Helper function used for filtering Product search results and Holdings in 
  the Portfolio view
RETURN
  TRUE if the Product matches the searchInput, FALSE otherwise
*/
export function isMatchingProduct(product: IProduct, searchInput: string): boolean {
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