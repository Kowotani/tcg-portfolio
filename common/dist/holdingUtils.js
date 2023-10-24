"use strict";
exports.__esModule = true;
exports.getHoldingUnrealizedPnl = exports.getHoldingTotalRevenue = exports.getHoldingTotalPnl = exports.getHoldingTotalCost = exports.getHoldingSaleQuantity = exports.getHoldingSales = exports.getHoldingRealizedPnl = exports.getHoldingQuantity = exports.getHoldingPurchaseQuantity = exports.getHoldingPurchases = exports.getHoldingPercentPnl = exports.getHoldingMarketValue = exports.getHoldingAverageRevenue = exports.getHoldingAverageCost = exports.getHoldingAggregatedSales = exports.getHoldingAggregatedPurchases = exports.getHoldingTcgplayerId = exports.getHoldingFirstTransactionDate = exports.getIHoldingsFromIPopulatedHoldings = void 0;
var dateUtils_1 = require("./dateUtils");
var dataModels_1 = require("./dataModels");
var _ = require("lodash");
var utils_1 = require("./utils");
// ==========
// converters
// ==========
/*
DESC
  Returns an IHolding[] derived from the input IPopulatedHolding[]
INPUT
  populatedHoldings: An IPopulatedHolding[]
RETURN
  An IHolding[]
*/
function getIHoldingsFromIPopulatedHoldings(populatedHoldings) {
    var holdings = populatedHoldings.map(function (populatedHolding) {
        return {
            tcgplayerId: populatedHolding.product.tcgplayerId,
            transactions: populatedHolding.transactions
        };
    });
    return holdings;
}
exports.getIHoldingsFromIPopulatedHoldings = getIHoldingsFromIPopulatedHoldings;
// =======
// getters
// =======
/*
DESC
  Returns the date of the first transaction for the input IHolding
INPUT
  holding: An IHolding
RETURN
  The Date of the first transaction
*/
function getHoldingFirstTransactionDate(holding) {
    // no transactions
    if (holding.transactions.length === 0) {
        return undefined;
    }
    else {
        var firstTxn = _.minBy(holding.transactions, function (txn) {
            return txn.date.getTime();
        });
        return firstTxn.date;
    }
}
exports.getHoldingFirstTransactionDate = getHoldingFirstTransactionDate;
/*
DESC
  Returns the tcgplayerId for the input IHolding | IPopulatedHolding
INPUT
  holding: An IHolding | IPopulatedHolding
RETURN
  The Holding's tcgplayerId
*/
function getHoldingTcgplayerId(holding) {
    return (0, utils_1.isIHolding)(holding)
        ? holding.tcgplayerId
        : holding.product.tcgplayerId;
}
exports.getHoldingTcgplayerId = getHoldingTcgplayerId;
// ==================
// metric calculators
// ==================
/*
DESC
  Returns the Purchases of the input Holding aggregated by transaction date
INPUT
  holding: An IHolding
RETURN
  An ITransaction[] with Puchases aggregated by transaction date
*/
function getHoldingAggregatedPurchases(holding) {
    // get Holding Purchases
    var purchases = getHoldingPurchases(holding);
    // create Map of [Date as string] => [ITransaction]
    var purchaseMap = new Map();
    // aggregate each Purchase into the Map
    purchases.forEach(function (txn) {
        var existingTxn = purchaseMap.get((0, dateUtils_1.formatAsISO)(txn.date));
        purchaseMap.set((0, dateUtils_1.formatAsISO)(txn.date), existingTxn
            ? {
                date: txn.date,
                price: (existingTxn.price * existingTxn.quantity
                    + txn.price * txn.quantity) / (existingTxn.quantity + txn.quantity),
                quantity: existingTxn.quantity + txn.quantity,
                type: txn.type
            }
            : txn);
    });
    return Array.from(purchaseMap.values());
}
exports.getHoldingAggregatedPurchases = getHoldingAggregatedPurchases;
/*
DESC
  Returns the Sales of the input Holding aggregated by transaction date
INPUT
  holding: An IHolding
RETURN
  An ITransaction[] with Sales aggregated by transaction date
*/
function getHoldingAggregatedSales(holding) {
    // get Holding Sales
    var sales = getHoldingSales(holding);
    // create Map of [Date as string] => [ITransaction]
    var purchaseMap = new Map();
    // aggregate each Sale into the Map
    sales.forEach(function (txn) {
        var existingTxn = purchaseMap.get((0, dateUtils_1.formatAsISO)(txn.date));
        purchaseMap.set((0, dateUtils_1.formatAsISO)(txn.date), existingTxn
            ? {
                date: txn.date,
                price: (existingTxn.price * existingTxn.quantity
                    + txn.price * txn.quantity) / (existingTxn.quantity + txn.quantity),
                quantity: existingTxn.quantity + txn.quantity,
                type: txn.type
            }
            : txn);
    });
    return Array.from(purchaseMap.values());
}
exports.getHoldingAggregatedSales = getHoldingAggregatedSales;
/*
DESC
  Returns the average purchase cost from the input IHolding. This value
  should never be negative
INPUT
  holding: An IHolding
RETURN
  The average purchase cost from the input IHolding, or undefined
  if purchaseQuantity === 0
*/
function getHoldingAverageCost(holding) {
    var quantity = getHoldingPurchaseQuantity(holding);
    return quantity === 0
        ? undefined
        : getHoldingTotalCost(holding) / quantity;
}
exports.getHoldingAverageCost = getHoldingAverageCost;
/*
DESC
  Returns the average sale revemue from the input IHolding. This value
  should never be negative
INPUT
  holding: An IHolding
RETURN
  The average sale revenue from the input IHolding, or undefined
  if saleQuantity === 0
*/
function getHoldingAverageRevenue(holding) {
    var saleQuantity = getHoldingSaleQuantity(holding);
    return saleQuantity === 0
        ? undefined
        : getHoldingTotalRevenue(holding) / saleQuantity;
}
exports.getHoldingAverageRevenue = getHoldingAverageRevenue;
/*
DESC
  Returns the market value of the Holding based on the input price
INPUT
  holding: An IHolding
  price: The market price
RETURN
  The market value of the Holding
*/
function getHoldingMarketValue(holding, price) {
    var holdingValue = getHoldingQuantity(holding) * price;
    var totalRev = getHoldingTotalRevenue(holding);
    return holdingValue + totalRev;
}
exports.getHoldingMarketValue = getHoldingMarketValue;
/*
DESC
  Returns the total pnl percent from the input IHolding and price relative
  to the total cost
INPUT
  holding: An IHolding
  price: The market price
RETURN
  The total pnl as a percentage return relative to the total cost, or undefined
  if total cost === 0
*/
function getHoldingPercentPnl(holding, price) {
    var totalCost = getHoldingTotalCost(holding);
    var totalPnl = getHoldingTotalPnl(holding, price);
    return totalCost === 0
        ? undefined
        : totalPnl / totalCost;
}
exports.getHoldingPercentPnl = getHoldingPercentPnl;
/*
DESC
  Returns the purchase ITransactions from the input IHolding
INPUT
  holding: An IHolding
RETURN
  An array of purchase ITransactions from the IHolding
*/
function getHoldingPurchases(holding) {
    return holding.transactions.filter(function (txn) {
        return txn.type === dataModels_1.TransactionType.Purchase;
    });
}
exports.getHoldingPurchases = getHoldingPurchases;
/*
DESC
  Returns the purchase quantity from the input ITransaction. This value
  should never be negative
INPUT
  holding: An IHolding
RETURN
  The purchase quantity from the input ITransaction
*/
function getHoldingPurchaseQuantity(holding) {
    var value = _.sum(getHoldingPurchases(holding).map(function (txn) {
        return Number(txn.quantity);
    }));
    (0, utils_1.assert)(value >= 0, 'getHoldingPurchaseQuantity() value is not at least 0');
    return value;
}
exports.getHoldingPurchaseQuantity = getHoldingPurchaseQuantity;
/*
DESC
  Returns the total cost of items
INPUT
  holding: An IHolding
RETURN
  The item quantity available from the input IHolding
*/
function getHoldingQuantity(holding) {
    var value = getHoldingPurchaseQuantity(holding)
        - getHoldingSaleQuantity(holding);
    (0, utils_1.assert)(value >= 0, 'getHoldingQuantity() value is not at least 0');
    return value;
}
exports.getHoldingQuantity = getHoldingQuantity;
/*
DESC
  Returns the realized pnl determined as:
    pnl = salesQuantity * (avgRev - avgCost)
INPUT
  holding: An IHolding
RETURN
  The realized pnl based on sales and avg cost vs avg revenue from the
  IHolding, or undefined if saleQuantity === 0
*/
function getHoldingRealizedPnl(holding) {
    var saleQuantity = getHoldingSaleQuantity(holding);
    return saleQuantity === 0
        ? undefined
        : (getHoldingAverageRevenue(holding) - getHoldingAverageCost(holding))
            * saleQuantity;
}
exports.getHoldingRealizedPnl = getHoldingRealizedPnl;
/*
DESC
  Returns the sale ITransactions from the input IHolding
INPUT
  holding: An IHolding
RETURN
  An array of sale ITransactions from the IHolding
*/
function getHoldingSales(holding) {
    return holding.transactions.filter(function (txn) {
        return txn.type === dataModels_1.TransactionType.Sale;
    });
}
exports.getHoldingSales = getHoldingSales;
/*
DESC
  Returns the sale quantity from the input IHolding. This value
  should never be negative
INPUT
  holding: An IHolding
RETURN
  The sale quantity from the input IHolding
*/
function getHoldingSaleQuantity(holding) {
    var value = _.sum(getHoldingSales(holding).map(function (txn) {
        return Number(txn.quantity);
    }));
    (0, utils_1.assert)(value >= 0, 'getHoldingSaleQuantity() value is not at least 0');
    return value;
}
exports.getHoldingSaleQuantity = getHoldingSaleQuantity;
/*
DESC
  Returns the total purchase cost from the input IHolding. This value
  should never be negative
INPUT
  holding: An IHolding
RETURN
  The total purchase cost from the input ITransaction, or undefined if there
  are no purchases
*/
function getHoldingTotalCost(holding) {
    var purchases = getHoldingPurchases(holding);
    if (purchases.length === 0) {
        return undefined;
    }
    var value = _.sumBy(purchases, function (txn) {
        return txn.quantity * txn.price;
    });
    (0, utils_1.assert)(value >= 0, 'getHoldingTotalCost() is not at least 0');
    return value;
}
exports.getHoldingTotalCost = getHoldingTotalCost;
/*
DESC
  Returns the total pnl from the input IHolding and price, defined as:
    totalPnl = marketValue - totalCost
INPUT
  holding: An IHolding
  price: The market price
RETURN
  The total pnl defined as marketValue - totalCost, or undefined if totalCost
  and marketValue are both undefined
*/
function getHoldingTotalPnl(holding, price) {
    var totalCost = getHoldingTotalCost(holding);
    var marketValue = getHoldingMarketValue(holding, price);
    return (totalCost && marketValue)
        ? marketValue - totalCost
        : undefined;
}
exports.getHoldingTotalPnl = getHoldingTotalPnl;
/*
DESC
  Returns the total sale revenue from the input IHolding. This value
  should never be negative
INPUT
  holding: An IHolding
RETURN
  The total sale revenue from the input IHolding
*/
function getHoldingTotalRevenue(holding) {
    var value = _.sumBy(getHoldingSales(holding), function (txn) {
        return txn.quantity * txn.price;
    });
    (0, utils_1.assert)(value >= 0, 'getHoldingTotalRev() is not at least 0');
    return value;
}
exports.getHoldingTotalRevenue = getHoldingTotalRevenue;
/*
DESC
  Returns the unrealized pnl determined as:
    pnl = quantity * (price - avgCost)
INPUT
  holding: An IHolding
  price: The market price
RETURN
  The unrealized pnl based on market price and avg cost from the
  IHolding, or undefined if quantity === 0
*/
function getHoldingUnrealizedPnl(holding, price) {
    var quantity = getHoldingQuantity(holding);
    return quantity === 0
        ? undefined
        : (price - getHoldingAverageCost(holding)) * quantity;
}
exports.getHoldingUnrealizedPnl = getHoldingUnrealizedPnl;
