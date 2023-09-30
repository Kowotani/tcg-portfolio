"use strict";
exports.__esModule = true;
exports.getPortfolioUnrealizedPnl = exports.getPortfolioTotalRevenue = exports.getPortfolioTotalPnl = exports.getPortfolioTotalCost = exports.getPortfolioSaleQuantity = exports.getPortfolioRealizedPnl = exports.getPortfolioPurchaseQuantity = exports.getPortfolioPercentPnl = exports.getPortfolioMarketValue = exports.getAggPortfolioTotalCost = exports.getAggPortfolioMarketValue = exports.getPortfolioNames = exports.getPortfolioHoldings = exports.getPortfolioHolding = exports.getPortfolioFirstTransactionDate = exports.getIPortfoliosFromIPopulatedPortfolios = void 0;
var _ = require("lodash");
var utils_1 = require("./utils");
var holdingUtils_1 = require("./holdingUtils");
// ==========
// converters
// ==========
/*
DESC
  Returns an IPortfolio[] derived from the input IPopulatedPortfolio[]
INPUT
  populatedPortfolios: An IPopulatedPortfolio[]
RETURN
  An IPortfolio[]
*/
function getIPortfoliosFromIPopulatedPortfolios(populatedPortfolios) {
    var portfolios = populatedPortfolios.map(function (populatedPortfolio) {
        var portfolio = {
            userId: populatedPortfolio.userId,
            portfolioName: populatedPortfolio.portfolioName,
            holdings: (0, holdingUtils_1.getIHoldingsFromIPopulatedHoldings)(populatedPortfolio.populatedHoldings)
        };
        if (populatedPortfolio.description) {
            portfolio['description'] = populatedPortfolio.description;
        }
        return portfolio;
    });
    return portfolios;
}
exports.getIPortfoliosFromIPopulatedPortfolios = getIPortfoliosFromIPopulatedPortfolios;
// =======
// getters
// =======
/*
DESC
  Returns the date of the first transaction for the input IPortfolio
INPUT
   portfolio: An IPortfolio
RETURN
  The Date of the first transaction in the Portfolio
*/
function getPortfolioFirstTransactionDate(portfolio) {
    // get holdings
    var holdings = (0, utils_1.isIPortfolio)(portfolio)
        ? portfolio.holdings
        : portfolio.populatedHoldings;
    // first transaction dates for holdings
    var txnDates = holdings.map(function (holding) {
        return (0, holdingUtils_1.getHoldingFirstTransactionDate)(holding);
    });
    return _.min(txnDates);
}
exports.getPortfolioFirstTransactionDate = getPortfolioFirstTransactionDate;
/*
DESC
  Returns the Holding for the input IPortfolio and tcgplayerId, or null if it
  does not exist
INPUT
  portfolio: An IPortfolio or IPopulatedPortfolio
  tcgplayerId: The tcgplayerId of the Holding
RETURN
  An IHolding or IPopulatedHolding if exists, otherwise null
*/
function getPortfolioHolding(portfolio, tcgplayerId) {
    var isPopulated = (0, utils_1.isIPopulatedPortfolio)(portfolio);
    var holdings = isPopulated
        ? portfolio.populatedHoldings
        : portfolio.holdings;
    var filtered = isPopulated
        ? holdings.filter(function (h) {
            return h.product.tcgplayerId === tcgplayerId;
        })
        : holdings.filter(function (h) {
            return h.tcgplayerId === tcgplayerId;
        });
    return filtered.length ? filtered[0] : null;
}
exports.getPortfolioHolding = getPortfolioHolding;
/*
DESC
  Returns the Holdings for the input IPortfolio
INPUT
  portfolio: An IPortfolio or IPopulatedPortfolio
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
  Returns the portfolioNames from an input IPortfolio[]
INPUT
  portfolios: An IPortfolio[]
RETURN
  An array of portfolioNames from the IPortfolio[]
*/
function getPortfolioNames(portfolios) {
    return portfolios.map(function (portfolio) {
        return portfolio.portfolioName;
    });
}
exports.getPortfolioNames = getPortfolioNames;
// ==================
// metric calculators
// ==================
/*
DESC
  Returns the aggregate market value of the input IPortfolio[] based on the
  input prices
INPUT
  portfolios: An IPortfolio[]
  prices: A Map<number, IPriceData> where the key is a tcgplayerId
RETURN
  The aggregate market value of the Portfolios
*/
function getAggPortfolioMarketValue(portfolios, prices) {
    var marketValues = portfolios.map(function (portfolio) {
        return getPortfolioMarketValue(portfolio, prices);
    });
    return _.sum(marketValues);
}
exports.getAggPortfolioMarketValue = getAggPortfolioMarketValue;
/*
DESC
  Returns the total purchase cost of the input IPortfolio[]. This value
  should never be negative
INPUT
  portfolios: An IPortfolio[]
RETURN
  The total purchase cost from the input IPortfolio, or undefined if every
  Portfolio as undefined total cost
*/
function getAggPortfolioTotalCost(portfolios) {
    var totalCosts = portfolios.map(function (portfolio) {
        return getPortfolioTotalCost(portfolio);
    });
    if (_.every(totalCosts, function (el) { return el === undefined; })) {
        return undefined;
    }
    var value = _.sum(totalCosts);
    (0, utils_1.assert)(value >= 0, 'getAggPortfolioTotalCost() is not at least 0');
    return value;
}
exports.getAggPortfolioTotalCost = getAggPortfolioTotalCost;
/*
DESC
  Returns the market value of the input IPortfolio based on the input prices
INPUT
  portfolio: An IPortfolio
  prices: A Map<number, IPriceData> where the key is a tcgplayerId
RETURN
  The market value of the Portfolio
*/
function getPortfolioMarketValue(portfolio, prices) {
    var holdings = getPortfolioHoldings(portfolio);
    var marketValues = holdings.map(function (holding) {
        var price = (0, utils_1.isIHolding)(holding)
            ? prices.get(holding.tcgplayerId).marketPrice
            : prices.get(holding.product.tcgplayerId).marketPrice;
        return (0, holdingUtils_1.getHoldingMarketValue)(holding, price);
    });
    return _.sum(marketValues);
}
exports.getPortfolioMarketValue = getPortfolioMarketValue;
/*
DESC
  Returns the total pnl percent for the input IPortfolio and price relative
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
        : totalPnl / totalCost;
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
  The total purchase cost from the input IPortfolio, or undefined if every
  Holding as undefined total cost
*/
function getPortfolioTotalCost(portfolio) {
    var holdings = getPortfolioHoldings(portfolio);
    var totalCosts = holdings.map(function (holding) {
        return (0, holdingUtils_1.getHoldingTotalCost)(holding);
    });
    if (_.every(totalCosts, function (el) { return el === undefined; })) {
        return undefined;
    }
    var value = _.sum(totalCosts);
    (0, utils_1.assert)(value >= 0, 'getPortfolioTotalCost() is not at least 0');
    return value;
}
exports.getPortfolioTotalCost = getPortfolioTotalCost;
/*
DESC
  Returns the total pnl from the input IPortfolio and prices, defined as:
    totalPnl = marketValue - totalCost
INPUT
  portfolio: An IPortfolio
  prices: A Map<number, IPriceData> where the key is a tcgplayerId
RETURN
  The total pnl defined as marketValue - totalCost, or undefined if totalCost
  and marketValue are both undefined
*/
function getPortfolioTotalPnl(portfolio, prices) {
    var totalCost = getPortfolioTotalCost(portfolio);
    var marketValue = getPortfolioMarketValue(portfolio, prices);
    return (totalCost && marketValue)
        ? marketValue - totalCost
        : undefined;
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
