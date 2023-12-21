"use strict";
exports.__esModule = true;
exports.getReleasedProducts = void 0;
var dateUtils_1 = require("./dateUtils");
// =======
// generic
// =======
/*
DESC
  Returns the input IProduct[] with unreleased Products removed (eg. the Product
    releaseDate < today)
INPUT
  products: An IProduct[]
RETURN
  An IProduct[]
*/
function getReleasedProducts(products) {
    // get start of today
    var startOfToday = (0, dateUtils_1.getStartOfDate)(new Date());
    // filter products
    return products.filter(function (product) {
        return (0, dateUtils_1.isDateBefore)(product.releaseDate, startOfToday);
    });
}
exports.getReleasedProducts = getReleasedProducts;
