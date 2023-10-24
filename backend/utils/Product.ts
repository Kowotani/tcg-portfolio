import { IMProduct, Product } from '../mongo/models/productSchema'


// ======
// errors
// ======

/*
DESC
  Returns an Error with standardized error message when a Product is not found
  for a tcgplayerId
INPUT
  tcgplayerId: The tcgplayerId associated with the Product
  fnName: The name of the function generating the error
RETURN
  An error
*/
export function genProductNotFoundError(
  fnName: string,
  tcgplayerId?: number
): Error {
  const errMsg = tcgplayerId
    ? `Product not found for tcgplayerId: ${tcgplayerId} in ${fnName}`
    : `Product not found in ${fnName}`
  return new Error(errMsg)
}


// ===========
// type guards
// ===========

/*
DESC
  Returns whether or not the input is a Product doc
INPUT
  arg: An object that might be a Product doc
RETURN
  TRUE if the input is a Product doc, FALSE otherwise
*/
export function isProductDoc(arg: any): arg is IMProduct {
  return arg
    && arg instanceof Product
}