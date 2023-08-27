"use strict";
exports.__esModule = true;
exports.getPortfolioUnrealizedPnl = exports.getPortfolioTotalRevenue = exports.getPortfolioTotalPnl = exports.getPortfolioTotalCost = exports.getPortfolioSaleQuantity = exports.getPortfolioRealizedPnl = exports.getPortfolioPurchaseQuantity = exports.getPortfolioPercentPnl = exports.getPortfolioHoldings = void 0;
var _ = require("lodash");
var utils_1 = require("./utils");
var holdingUtils_1 = require("./holdingUtils");
/*
DESC
  Returns the Holdings for the input IPortfolio
INPUT
  portfolio: An IPortfolio
RETURN
  An IHolding[] or IPopulatedHolding[]
*/
function getPortfolioHoldings(portfolio) {
    return (0, utils_1.isIPortfolio)(portfolio)
        ? portfolio.holdings
        : portfolio.populatedHoldings;
}
exports.getPortfolioHoldings = getPortfolioHoldings;
/*
DESC
  Returns the total pnl percent from the input IHolding and price relative
  to the total cost
INPUT
  portfolio: An IPortfolio
  prices: A Map<number, IPriceData> where the key is a tcgplayerId
RETURN
  The total pnl as a percentage return relative to the total cost, or undefined
  if total cost === 0
*/
function getPortfolioPercentPnl(portfolio, prices) {
    var totalCost = getPortfolioTotalCost(portfolio);
    var totalPnl = getPortfolioTotalPnl(portfolio, prices);
    return totalCost === 0
        ? undefined
        : totalPnl / totalCost - 1;
}
exports.getPortfolioPercentPnl = getPortfolioPercentPnl;
/*
DESC
  Returns the purchase quantity from the input IPortfolio. This value
  should never be negative
INPUT
  portfolio: An IPortfolio
RETURN
  The purchase quantity from the input IPortfolio
*/
function getPortfolioPurchaseQuantity(portfolio) {
    var holdings = getPortfolioHoldings(portfolio);
    var value = _.sum(holdings.map(function (holding) {
        return (0, holdingUtils_1.getHoldingPurchaseQuantity)(holding);
    }));
    (0, utils_1.assert)(value >= 0, 'getPortfolioPurchaseQuantity() is not at least 0');
    return value;
}
exports.getPortfolioPurchaseQuantity = getPortfolioPurchaseQuantity;
/*
DESC
  Returns the realized pnl determined as the summed IHolding realized pnl
INPUT
  portfolio: An IPortfolio
RETURN
  The summed realized pnl from IHoldings, or undefined if saleQuantity === 0
*/
function getPortfolioRealizedPnl(portfolio) {
    var holdings = getPortfolioHoldings(portfolio);
    return getPortfolioSaleQuantity(portfolio) === 0
        ? undefined
        : _.sum(holdings.map(function (holding) {
            return (0, holdingUtils_1.getHoldingRealizedPnl)(holding);
        }));
}
exports.getPortfolioRealizedPnl = getPortfolioRealizedPnl;
/*
DESC
  Returns the sale quantity from the input IPortfolio. This value
  should never be negative
INPUT
  portfolio: An IPortfolio
RETURN
  The sale quantity from the input IPortfolio
*/
function getPortfolioSaleQuantity(portfolio) {
    var holdings = getPortfolioHoldings(portfolio);
    var value = _.sum(holdings.map(function (holding) {
        return (0, holdingUtils_1.getHoldingSaleQuantity)(holding);
    }));
    (0, utils_1.assert)(value >= 0, 'getPortfolioSaleQuantity() is not at least 0');
    return value;
}
exports.getPortfolioSaleQuantity = getPortfolioSaleQuantity;
/*
DESC
  Returns the total purchase cost from the input IPortfolio. This value
  should never be negative
INPUT
  portfolio: An IPortfolio
RETURN
  The total purchase cost from the input IPortfolio
*/
function getPortfolioTotalCost(portfolio) {
    var holdings = getPortfolioHoldings(portfolio);
    var value = _.sum(holdings.map(function (holding) {
        return (0, holdingUtils_1.getHoldingTotalCost)(holding);
    }));
    (0, utils_1.assert)(value >= 0, 'getPortfolioTotalCost() is not at least 0');
    return value;
}
exports.getPortfolioTotalCost = getPortfolioTotalCost;
/*
DESC
  Returns the total pnl from the input IHolding and price
INPUT
  portfolio: An IPortfolio
  prices: A Map<number, IPriceData> where the key is a tcgplayerId
RETURN
  The total pnl based on the market price and avg cost vs avg rev from the
  IHolding, or undefined if both realizedPnl and unrealizedPnl are undefined
*/
function getPortfolioTotalPnl(portfolio, prices) {
    var realizedPnl = getPortfolioRealizedPnl(portfolio);
    var unrealizedPnl = getPortfolioUnrealizedPnl(portfolio, prices);
    return (realizedPnl === undefined && unrealizedPnl === undefined)
        ? undefined
        : (realizedPnl !== null && realizedPnl !== void 0 ? realizedPnl : 0) + (unrealizedPnl !== null && unrealizedPnl !== void 0 ? unrealizedPnl : 0);
}
exports.getPortfolioTotalPnl = getPortfolioTotalPnl;
/*
DESC
  Returns the total sale revenue from the input IPortfolio. This value
  should never be negative
INPUT
  portfolio: An IPortfolio
RETURN
  The total sale revenue from the input ITransaction
*/
function getPortfolioTotalRevenue(portfolio) {
    var holdings = getPortfolioHoldings(portfolio);
    var value = _.sum(holdings.map(function (holding) {
        return (0, holdingUtils_1.getHoldingTotalRevenue)(holding);
    }));
    (0, utils_1.assert)(value >= 0, 'getPortfolioTotalCost() is not at least 0');
    return value;
}
exports.getPortfolioTotalRevenue = getPortfolioTotalRevenue;
/*
DESC
  Returns the unrealized pnl determined as the summed IHolding unrealized pnl
INPUT
  portfolio: An IPortfolio
  prices: A Map<number, IPriceData> where the key is a tcgplayerId
RETURN
  The unrealized pnl based on the IHoldings, or undefined if quantity === 0
*/
function getPortfolioUnrealizedPnl(portfolio, prices) {
    var holdings = getPortfolioHoldings(portfolio);
    var quantity = getPortfolioPurchaseQuantity(portfolio)
        - getPortfolioSaleQuantity(portfolio);
    return quantity === 0
        ? undefined
        : _.sum(holdings.map(function (holding) {
            var price = (0, utils_1.isIHolding)(holding)
                ? prices.get(holding.tcgplayerId).marketPrice
                : prices.get(holding.product.tcgplayerId).marketPrice;
            return (0, holdingUtils_1.getHoldingUnrealizedPnl)(holding, price);
        }));
}
exports.getPortfolioUnrealizedPnl = getPortfolioUnrealizedPnl;
