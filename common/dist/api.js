"use strict";
exports.__esModule = true;
exports.GET_PRODUCTS_URL = exports.ADD_PRODUCT_URL = exports.GET_PORTFOLIOS_URL = exports.ProductsGetStatus = exports.ProductPostStatus = exports.PortfolioGetStatus = void 0;
// =====
// enums
// =====
// GET to /portfolios status
var PortfolioGetStatus;
(function (PortfolioGetStatus) {
    PortfolioGetStatus["Success"] = "Successfully retrieved Portfolio docs";
    PortfolioGetStatus["Error"] = "Error retrieving Portfolio docs";
})(PortfolioGetStatus = exports.PortfolioGetStatus || (exports.PortfolioGetStatus = {}));
// POST to /product status
var ProductPostStatus;
(function (ProductPostStatus) {
    ProductPostStatus["Added"] = "tcgplayerId added";
    ProductPostStatus["AddedWithoutImage"] = "tcgplayerId added (without image)";
    ProductPostStatus["AlreadyExists"] = "tcgplayerId already exists";
    ProductPostStatus["Error"] = "Error creating the Product doc";
})(ProductPostStatus = exports.ProductPostStatus || (exports.ProductPostStatus = {}));
var ProductsGetStatus;
(function (ProductsGetStatus) {
    ProductsGetStatus["Success"] = "Successfully retrieved Product docs";
    ProductsGetStatus["Error"] = "Error retrieving Product docs";
})(ProductsGetStatus = exports.ProductsGetStatus || (exports.ProductsGetStatus = {}));
// ======
// routes
// ======
exports.GET_PORTFOLIOS_URL = '/portfolios';
exports.ADD_PRODUCT_URL = '/product';
exports.GET_PRODUCTS_URL = '/products';
