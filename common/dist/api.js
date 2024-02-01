"use strict";
exports.__esModule = true;
exports.UNVALIDATED_TCPRODUCTS_URL = exports.TCPRODUCT_URL = exports.PRICE_URL = exports.LATEST_PRICES_URL = exports.LATEST_PRICE_URL = exports.PRODUCTS_URL = exports.PRODUCT_PERFORMANCE_URL = exports.PRODUCT_URL = exports.PORTFOLIOS_URL = exports.PORTFOLIO_HOLDINGS_PERFORMANCE_URL = exports.PORTFOLIO_PERFORMANCE_URL = exports.PORTFOLIO_URL = exports.PutTCProductStatus = exports.GetUnvalidatedTCProductsStatus = exports.GetProductsStatus = exports.GetProductPerformanceStatus = exports.PostProductStatus = exports.PostPriceStatus = exports.GetPricesStatus = exports.PostLatestPriceStatus = exports.GetPortfoliosStatus = exports.GetPortfolioPerformanceStatus = exports.GetPortfolioHoldingsPerformanceStatus = exports.PutPortfolioStatus = exports.PostPortfolioStatus = exports.DeletePortfolioStatus = void 0;
// =====
// enums
// =====
// -- portfolio
/*
  Endpoint:   PORTFOLIO_URL
  Type:       DELETE
*/
var DeletePortfolioStatus;
(function (DeletePortfolioStatus) {
    DeletePortfolioStatus["Success"] = "Successfully deleted Portfolio";
    DeletePortfolioStatus["DoesNotExist"] = "Portfolio does not exist";
    DeletePortfolioStatus["Error"] = "Error deleting Portfolio";
})(DeletePortfolioStatus = exports.DeletePortfolioStatus || (exports.DeletePortfolioStatus = {}));
/*
  Endpoint:   PORTFOLIO_URL
  Type:       POST
*/
var PostPortfolioStatus;
(function (PostPortfolioStatus) {
    PostPortfolioStatus["Success"] = "Successfully created Portfolio";
    PostPortfolioStatus["Error"] = "Error creating Portfolio";
})(PostPortfolioStatus = exports.PostPortfolioStatus || (exports.PostPortfolioStatus = {}));
/*
  Endpoint:   PORTFOLIO_URL
  Type:       PUT
*/
var PutPortfolioStatus;
(function (PutPortfolioStatus) {
    PutPortfolioStatus["Success"] = "Successfully updated Portfolio";
    PutPortfolioStatus["Error"] = "Error updating Portfolio";
})(PutPortfolioStatus = exports.PutPortfolioStatus || (exports.PutPortfolioStatus = {}));
/*
  Endpoint:   PORTFOLIO_HOLDINGS_PERFORMANCE_URL
  Type:       GET
*/
var GetPortfolioHoldingsPerformanceStatus;
(function (GetPortfolioHoldingsPerformanceStatus) {
    GetPortfolioHoldingsPerformanceStatus["Success"] = "Successfully retrieved Portfolio Holdings performance";
    GetPortfolioHoldingsPerformanceStatus["Error"] = "Error retrieving Portfolio Holdings performance";
})(GetPortfolioHoldingsPerformanceStatus = exports.GetPortfolioHoldingsPerformanceStatus || (exports.GetPortfolioHoldingsPerformanceStatus = {}));
/*
  Endpoint:   PORTFOLIO_PERFORMANCE_URL
  Type:       GET
*/
var GetPortfolioPerformanceStatus;
(function (GetPortfolioPerformanceStatus) {
    GetPortfolioPerformanceStatus["Success"] = "Successfully retrieved Portfolio performance";
    GetPortfolioPerformanceStatus["Error"] = "Error retrieving Portfolio performance";
})(GetPortfolioPerformanceStatus = exports.GetPortfolioPerformanceStatus || (exports.GetPortfolioPerformanceStatus = {}));
/*
  Endpoint:   PORTFOLIOS_URL
  Type:       GET
*/
var GetPortfoliosStatus;
(function (GetPortfoliosStatus) {
    GetPortfoliosStatus["Success"] = "Successfully retrieved Portfolios";
    GetPortfoliosStatus["Error"] = "Error retrieving Portfolios";
})(GetPortfoliosStatus = exports.GetPortfoliosStatus || (exports.GetPortfoliosStatus = {}));
// -- prices
/*
  Endpoint:   LATEST_PRICE_URL
  Type:       POST
*/
var PostLatestPriceStatus;
(function (PostLatestPriceStatus) {
    PostLatestPriceStatus["Success"] = "Successfully loaded latest Price";
    PostLatestPriceStatus["Error"] = "Error loading latest Price";
})(PostLatestPriceStatus = exports.PostLatestPriceStatus || (exports.PostLatestPriceStatus = {}));
/*
  Endpoint:   LATEST_PRICES_URL
  Type:       GET
*/
var GetPricesStatus;
(function (GetPricesStatus) {
    GetPricesStatus["Success"] = "Successfully retrieved latest Prices";
    GetPricesStatus["Error"] = "Error retrieving latest Prices";
})(GetPricesStatus = exports.GetPricesStatus || (exports.GetPricesStatus = {}));
/*
  Endpoint:   PRICE_URL
  Type:       POST
*/
var PostPriceStatus;
(function (PostPriceStatus) {
    PostPriceStatus["Success"] = "Successfully added Price";
    PostPriceStatus["Error"] = "Error adding Price";
})(PostPriceStatus = exports.PostPriceStatus || (exports.PostPriceStatus = {}));
// -- product
/*
  Endpoint:   PRODUCT_URL
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
  Endpoint:   PRODUCT_PERFORMANCE_URL
  Type:       GET
*/
var GetProductPerformanceStatus;
(function (GetProductPerformanceStatus) {
    GetProductPerformanceStatus["Success"] = "Successfully retrieved Product performance";
    GetProductPerformanceStatus["Error"] = "Error retrieving Product performance";
})(GetProductPerformanceStatus = exports.GetProductPerformanceStatus || (exports.GetProductPerformanceStatus = {}));
/*
  Endpoint:   PRODUCTS_URL
  Type:       GET
*/
var GetProductsStatus;
(function (GetProductsStatus) {
    GetProductsStatus["Success"] = "Successfully retrieved Products";
    GetProductsStatus["Error"] = "Error retrieving Products";
})(GetProductsStatus = exports.GetProductsStatus || (exports.GetProductsStatus = {}));
// -- tcproduct
/*
  Endpoint:   UNVALIDATED_TCPRODUCTS_URL
  Type:       GET
*/
var GetUnvalidatedTCProductsStatus;
(function (GetUnvalidatedTCProductsStatus) {
    GetUnvalidatedTCProductsStatus["Success"] = "Successfully retrieved unvalidated TCProducts";
    GetUnvalidatedTCProductsStatus["Error"] = "Error retrieving unvalidated TCProducts";
})(GetUnvalidatedTCProductsStatus = exports.GetUnvalidatedTCProductsStatus || (exports.GetUnvalidatedTCProductsStatus = {}));
/*
  Endpoint:   TCPRODUCT_URL
  Type:       POST
*/
var PutTCProductStatus;
(function (PutTCProductStatus) {
    PutTCProductStatus["Success"] = "Successfully updated TCProduct";
    PutTCProductStatus["Error"] = "Error updating TCProduct";
})(PutTCProductStatus = exports.PutTCProductStatus || (exports.PutTCProductStatus = {}));
// ======
// routes
// ======
// -- portfolio
exports.PORTFOLIO_URL = '/portfolio';
exports.PORTFOLIO_PERFORMANCE_URL = "".concat(exports.PORTFOLIO_URL, "/performance");
exports.PORTFOLIO_HOLDINGS_PERFORMANCE_URL = "".concat(exports.PORTFOLIO_URL, "/holdings/performance");
exports.PORTFOLIOS_URL = '/portfolios';
// -- product
exports.PRODUCT_URL = '/product';
exports.PRODUCT_PERFORMANCE_URL = '/product/performance';
exports.PRODUCTS_URL = '/products';
// -- price
exports.LATEST_PRICE_URL = '/price/latest';
exports.LATEST_PRICES_URL = '/prices/latest';
exports.PRICE_URL = '/price';
// -- tcproduct
exports.TCPRODUCT_URL = '/tcproduct';
exports.UNVALIDATED_TCPRODUCTS_URL = '/tcproducts/unvalidated';
