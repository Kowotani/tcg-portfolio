"use strict";
exports.__esModule = true;
exports.getUnrealizedPnl = exports.getTotalRevenue = exports.getTotalPnl = exports.getTotalCost = exports.getSaleQuantity = exports.getSales = exports.getRealizedPnl = exports.getQuantity = exports.getPurchaseQuantity = exports.getPurchases = exports.getPercentPnl = exports.getAverageRevenue = exports.getAverageCost = void 0;
var _ = require("lodash");
var dataModels_1 = require("./dataModels");
var utils_1 = require("./utils");
/*
DESC
  Returns the average purchase cost from the input ITransaction[]. This value
  should never be negative
INPUT
  transactions: An ITransaction[]
RETURN
  The average purchase cost from the input ITransaction[], or undefined
  if purchaseQuantity === 0
*/
function getAverageCost(transactions) {
    var quantity = getPurchaseQuantity(transactions);
    return quantity === 0
        ? undefined
        : getTotalCost(transactions) / quantity;
}
exports.getAverageCost = getAverageCost;
/*
DESC
  Returns the average sale revemue from the input ITransaction[]. This value
  should never be negative
INPUT
  transactions: An ITransaction[]
RETURN
  The average sale revenue from the input ITransaction[], or undefined
  if saleQuantity === 0
*/
function getAverageRevenue(transactions) {
    var quantity = getSaleQuantity(transactions);
    return quantity === 0
        ? undefined
        : getTotalRevenue(transactions) / quantity;
}
exports.getAverageRevenue = getAverageRevenue;
/*
DESC
  Returns the total pnl percent from the input ITransaction[] and price relative
  to the total cost
INPUT
  transactions: An ITransaction[]
  price: The market price
RETURN
  The total pnl as a percentage return relative to the total cost
*/
function getPercentPnl(transactions, price) {
    var totalCost = getTotalCost(transactions);
    return totalCost === 0
        ? undefined
        : getTotalPnl(transactions, price) / totalCost;
}
exports.getPercentPnl = getPercentPnl;
/*
DESC
  Returns the purchases from the input ITransaction[]
INPUT
  transactions: An ITransaction[]
RETURN
  An array of purchases from the ITransaction[]
*/
function getPurchases(transactions) {
    return transactions.filter(function (txn) {
        return txn.type === dataModels_1.TransactionType.Purchase;
    });
}
exports.getPurchases = getPurchases;
/*
DESC
  Returns the purchase quantity from the input ITransaction. This value
  should never be negative
INPUT
  transactions: An ITransaction[]
RETURN
  The purchase quantity from the input ITransaction
*/
function getPurchaseQuantity(transactions) {
    var value = _.sumBy(getPurchases(transactions), function (txn) {
        return txn.quantity;
    });
    (0, utils_1.assert)(value >= 0, 'getPurchaseQuantity() is not at least 0');
    return value;
}
exports.getPurchaseQuantity = getPurchaseQuantity;
/*
DESC
  Returns the total cost of items
INPUT
  transactions: An ITransaction[]
RETURN
  The item quantity available from the input ITransaction
*/
function getQuantity(transactions) {
    var value = getPurchaseQuantity(transactions) - getSaleQuantity(transactions);
    (0, utils_1.assert)(value >= 0, 'getQuantity() is not at least 0');
    return value;
}
exports.getQuantity = getQuantity;
/*
DESC
  Returns the realized pnl determined as:
    pnl = salesQuantity * (avgRev - avgCost)
INPUT
  transactions: An ITransaction[]
RETURN
  The realized pnl based on sales and avg cost vs avg revenue from the
  ITransaction[], or undefined if saleQuantity === 0
*/
function getRealizedPnl(transactions) {
    var saleQuantity = getSaleQuantity(transactions);
    return saleQuantity === 0
        ? undefined
        : (getAverageRevenue(transactions) - getAverageCost(transactions))
            * saleQuantity;
}
exports.getRealizedPnl = getRealizedPnl;
/*
DESC
  Returns the sales from the input ITransaction[]
INPUT
  transactions: An ITransaction[]
RETURN
  An array of sales from the ITransaction[]
*/
function getSales(transactions) {
    return transactions.filter(function (txn) {
        return txn.type === dataModels_1.TransactionType.Sale;
    });
}
exports.getSales = getSales;
/*
DESC
  Returns the sale quantity from the input ITransaction[]. This value
  should never be negative
INPUT
  transactions: An ITransaction[]
RETURN
  The sale quantity from the input ITransaction
*/
function getSaleQuantity(transactions) {
    var value = _.sumBy(getSales(transactions), function (txn) {
        return txn.quantity;
    });
    (0, utils_1.assert)(value >= 0, 'getSaleQuantity() is not at least 0');
    return value;
}
exports.getSaleQuantity = getSaleQuantity;
/*
DESC
  Returns the total purchase cost from the input ITransaction[]. This value
  should never be negative
INPUT
  transactions: An ITransaction[]
RETURN
  The total purchase cost from the input ITransaction
*/
function getTotalCost(transactions) {
    var value = _.sumBy(getPurchases(transactions), function (txn) {
        return txn.quantity * txn.price;
    });
    (0, utils_1.assert)(value >= 0, 'getTotalCost() is not at least 0');
    return value;
}
exports.getTotalCost = getTotalCost;
/*
DESC
  Returns the total pnl from the input ITransaction[] and price
INPUT
  transactions: An ITransaction[]
  price: The market price
RETURN
  The total pnl based on the market price and avg cost vs avg rev from the
  ITransaction[]
*/
function getTotalPnl(transactions, price) {
    var _a;
    return (_a = getRealizedPnl(transactions)
        + getUnrealizedPnl(transactions, price)) !== null && _a !== void 0 ? _a : 0;
}
exports.getTotalPnl = getTotalPnl;
/*
DESC
  Returns the total sale revenue from the input ITransaction[]. This value
  should never be negative
INPUT
  transactions: An ITransaction[]
RETURN
  The total sale revenue from the input ITransaction
*/
function getTotalRevenue(transactions) {
    var value = _.sumBy(getSales(transactions), function (txn) {
        return txn.quantity * txn.price;
    });
    (0, utils_1.assert)(value >= 0, 'getTotalRev() is not at least 0');
    return value;
}
exports.getTotalRevenue = getTotalRevenue;
/*
DESC
  Returns the unrealized pnl determined as:
    pnl = quantity * (price - avgCost)
INPUT
  transactions: An ITransaction[]
  price: The market price
RETURN
  The unrealized pnl based on market price and avg cost from the
  ITransaction[], or undefined if quantity === 0
*/
function getUnrealizedPnl(transactions, price) {
    var quantity = getQuantity(transactions);
    return quantity === 0
        ? undefined
        : (price - getAverageCost(transactions)) * quantity;
}
exports.getUnrealizedPnl = getUnrealizedPnl;
