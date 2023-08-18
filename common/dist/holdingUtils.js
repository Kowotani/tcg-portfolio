"use strict";
exports.__esModule = true;
exports.getTotalRevenue = exports.getTotalCost = exports.getSaleQuantity = exports.getSales = exports.getQuantity = exports.getPurchaseQuantity = exports.getPurchases = exports.getProfit = exports.getAverageRevenue = exports.getAverageCost = void 0;
var _ = require("lodash");
var dataModels_1 = require("./dataModels");
var utils_1 = require("./utils");
/*
DESC
  Returns the average purchase cost from the input ITransaction. This value
  should never be negative
INPUT
  transactions: An ITransaction array
RETURN
  The average purchase cost from the input ITransaction, or undefined
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
  Returns the average sale revemue from the input ITransaction. This value
  should never be negative
INPUT
  transactions: An ITransaction array
RETURN
  The average sale revenue from the input ITransaction, or undefined
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
  Returns the realized profit (or loss) determined as
    profit = salesQuantity * (avgRev - avgCost)
INPUT
  transactions: An ITransaction array
RETURN
  The realized profit based on sales and avg cost vs avg revenue from the
  ITransaction array, or undefined if saleQuantity === 0
*/
function getProfit(transactions) {
    var quantity = getSaleQuantity(transactions);
    return quantity === 0
        ? undefined
        : (getAverageRevenue(transactions) - getAverageCost(transactions))
            * quantity;
}
exports.getProfit = getProfit;
/*
DESC
  Returns the purchases from the input ITransaction array
INPUT
  transactions: An ITransaction array
RETURN
  An array of purchases from the ITransaction array
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
  transactions: An ITransaction array
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
  transactions: An ITransaction array
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
  Returns the sales from the input ITransaction array
INPUT
  transactions: An ITransaction array
RETURN
  An array of sales from the ITransaction array
*/
function getSales(transactions) {
    return transactions.filter(function (txn) {
        return txn.type === dataModels_1.TransactionType.Sale;
    });
}
exports.getSales = getSales;
/*
DESC
  Returns the sale quantity from the input ITransaction. This value
  should never be negative
INPUT
  transactions: An ITransaction array
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
  Returns the total purchase cost from the input ITransaction. This value
  should never be negative
INPUT
  transactions: An ITransaction array
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
  Returns the total sale revenue from the input ITransaction. This value
  should never be negative
INPUT
  transactions: An ITransaction array
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
