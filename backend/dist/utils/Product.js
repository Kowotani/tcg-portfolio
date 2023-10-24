"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProductDoc = exports.genProductNotFoundError = void 0;
const productSchema_1 = require("../mongo/models/productSchema");
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
function genProductNotFoundError(fnName, tcgplayerId) {
    const errMsg = tcgplayerId
        ? `Product not found for tcgplayerId: ${tcgplayerId} in ${fnName}`
        : `Product not found in ${fnName}`;
    return new Error(errMsg);
}
exports.genProductNotFoundError = genProductNotFoundError;
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
function isProductDoc(arg) {
    return arg
        && arg instanceof productSchema_1.Product;
}
exports.isProductDoc = isProductDoc;
