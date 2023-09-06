"use strict";
exports.__esModule = true;
exports.GET_LATEST_PRICES_URL = exports.ADD_PRICE_URL = exports.ADD_LATEST_PRICE_URL = exports.GET_PRODUCTS_URL = exports.CRUD_PRODUCT_URL = exports.GET_PORTFOLIOS_URL = exports.CRUD_PORTFOLIO_URL = exports.GetProductsStatus = exports.PostProductStatus = exports.PostPriceStatus = exports.PostLatestPriceStatus = exports.GetPricesStatus = exports.PutPortfoliosStatus = exports.GetPortfoliosStatus = exports.DeletePortfoliosStatus = void 0;
// =====
// enums
// =====
// -- portfolio
/*
  Endpoint:   DELETE_PORTFOLIOS_URL
  Type:       DELETE
*/
var DeletePortfoliosStatus;
(function (DeletePortfoliosStatus) {
    DeletePortfoliosStatus["Success"] = "Successfully deleted Portfolio";
    DeletePortfoliosStatus["Error"] = "Error deleting Portfolio";
})(DeletePortfoliosStatus = exports.DeletePortfoliosStatus || (exports.DeletePortfoliosStatus = {}));
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
  Endpoint:   ADD_LATEST_PRICE_URL
  Type:       POST
*/
var PostLatestPriceStatus;
(function (PostLatestPriceStatus) {
    PostLatestPriceStatus["Success"] = "Successfully loaded latest Price";
    PostLatestPriceStatus["Error"] = "Error loading latest Price";
})(PostLatestPriceStatus = exports.PostLatestPriceStatus || (exports.PostLatestPriceStatus = {}));
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
exports.CRUD_PORTFOLIO_URL = '/portfolio';
exports.GET_PORTFOLIOS_URL = '/portfolios';
// -- product
exports.CRUD_PRODUCT_URL = '/product';
exports.GET_PRODUCTS_URL = '/products';
// -- prices
exports.ADD_LATEST_PRICE_URL = '/price/latest';
exports.ADD_PRICE_URL = '/price';
exports.GET_LATEST_PRICES_URL = '/prices/latest';
