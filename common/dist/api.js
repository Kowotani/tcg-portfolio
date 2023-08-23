"use strict";
exports.__esModule = true;
exports.GET_PRODUCTS_URL = exports.GET_PORTFOLIOS_URL = exports.GET_LATEST_PRICES_URL = exports.ADD_PRODUCT_URL = exports.GetProductsStatus = exports.PostProductStatus = exports.GetPricesStatus = exports.GetPortfoliosStatus = void 0;
// =====
// enums
// =====
/*
  Endpoint:   GET_PORTFOLIOS_URL
  Type:       GET
*/
var GetPortfoliosStatus;
(function (GetPortfoliosStatus) {
    GetPortfoliosStatus["Success"] = "Successfully retrieved Portfolios";
    GetPortfoliosStatus["Error"] = "Error retrieving Portfolios";
})(GetPortfoliosStatus = exports.GetPortfoliosStatus || (exports.GetPortfoliosStatus = {}));
/*
  Endpoint:   GET_LATEST_PRICES_URL
  Type:       GET
*/
var GetPricesStatus;
(function (GetPricesStatus) {
    GetPricesStatus["Success"] = "Successfully retrieved latest Prices";
    GetPricesStatus["Error"] = "Error retrieving latest Prices";
})(GetPricesStatus = exports.GetPricesStatus || (exports.GetPricesStatus = {}));
/*
  Endpoint:   ADD_PRODUCT_URL
  Type:       POST
*/
var PostProductStatus;
(function (PostProductStatus) {
    PostProductStatus["Added"] = "tcgplayerId added";
    PostProductStatus["AddedWithoutImage"] = "tcgplayerId added (without image)";
    PostProductStatus["AlreadyExists"] = "tcgplayerId already exists";
    PostProductStatus["Error"] = "Error creating the Product doc";
})(PostProductStatus = exports.PostProductStatus || (exports.PostProductStatus = {}));
/*
  Endpoint:   GET_PRODUCTS_URL
  Type:       GET
*/
var GetProductsStatus;
(function (GetProductsStatus) {
    GetProductsStatus["Success"] = "Successfully retrieved Products";
    GetProductsStatus["Error"] = "Error retrieving Products";
})(GetProductsStatus = exports.GetProductsStatus || (exports.GetProductsStatus = {}));
// ======
// routes
// ======
exports.ADD_PRODUCT_URL = '/product';
exports.GET_LATEST_PRICES_URL = '/prices/latest';
exports.GET_PORTFOLIOS_URL = '/portfolios';
exports.GET_PRODUCTS_URL = '/products';
