"use strict";
exports.__esModule = true;
exports.GET_LATEST_PRICES_URL = exports.ADD_PRICE_URL = exports.GET_PRODUCTS_URL = exports.ADD_PRODUCT_URL = exports.UPDATE_PORTFOLIO_URL = exports.GET_PORTFOLIOS_URL = exports.GetProductsStatus = exports.PostProductStatus = exports.PostPriceStatus = exports.GetPricesStatus = exports.PutPortfoliosStatus = exports.GetPortfoliosStatus = void 0;
// =====
// enums
// =====
// -- portfolio
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
  Endpoint:   UPDATE_PORTFOLIO_URL
  Type:       PUT
*/
var PutPortfoliosStatus;
(function (PutPortfoliosStatus) {
    PutPortfoliosStatus["Success"] = "Successfully updated Portfolio";
    PutPortfoliosStatus["Error"] = "Error updating Portfolio";
})(PutPortfoliosStatus = exports.PutPortfoliosStatus || (exports.PutPortfoliosStatus = {}));
// -- prices
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
  Endpoint:   ADD_PRICE_URL
  Type:       POST
*/
var PostPriceStatus;
(function (PostPriceStatus) {
    PostPriceStatus["Success"] = "Successfully added Price";
    PostPriceStatus["Error"] = "Error adding Price";
})(PostPriceStatus = exports.PostPriceStatus || (exports.PostPriceStatus = {}));
// -- product
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
// -- portfolio
exports.GET_PORTFOLIOS_URL = '/portfolios';
exports.UPDATE_PORTFOLIO_URL = '/portfolio';
// -- product
exports.ADD_PRODUCT_URL = '/product';
exports.GET_PRODUCTS_URL = '/products';
// -- prices
exports.ADD_PRICE_URL = '/price';
exports.GET_LATEST_PRICES_URL = '/prices/latest';
