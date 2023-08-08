"use strict";
exports.__esModule = true;
exports.Portfolio = exports.Holding = void 0;
var _ = require("lodash");
var utils_1 = require("./utils");
// =======
// Holding
// =======
var Holding = /** @class */ (function () {
    // constructor
    function Holding(tcgplayerId, transactions) {
        this.tcgplayerId = tcgplayerId;
        this.transactions = transactions;
    }
    // -------
    // methods
    // -------
    // add transactions
    Holding.prototype.addTransactions = function (txnInput) {
        Array.isArray(txnInput)
            ? this.transactions = this.transactions.concat(txnInput)
            : this.transactions.push(txnInput);
    };
    // delete transaction
    Holding.prototype.deleteTransaction = function (txn) {
        var ix = this.transactions.findIndex(function (t) {
            return txn.type === t.type
                && txn.date === t.date
                && txn.price === t.price
                && txn.quantity === t.quantity;
        });
        if (ix >= 0) {
            this.transactions.splice(ix, 1);
        }
    };
    // delete transactions
    Holding.prototype.deleteTransactions = function () {
        this.transactions = [];
    };
    // get annualized return
    Holding.prototype.getAnnualizedReturn = function (price) {
        if (!this.hasPurchases()) {
            return undefined;
        }
        var elapsedDays = (new Date().getTime()
            - this.getFirstPurchaseDate().getTime())
            / utils_1.SECONDS_PER_DAY / utils_1.MILLISECONDS_PER_SECOND;
        return Math.pow(1 + this.getPercentageReturn(price), utils_1.DAYS_PER_YEAR / elapsedDays) - 1;
    };
    // get average cost
    Holding.prototype.getAverageCost = function () {
        return this.hasPurchases()
            ? this.getTotalCost() / this.getPurchaseQuantity()
            : undefined;
    };
    // get average cost
    Holding.prototype.getAverageRevenue = function () {
        return this.hasSales()
            ? this.getTotalRevenue() / this.getSaleQuantity()
            : undefined;
    };
    // get dollar return
    // TODO: account for profit
    Holding.prototype.getDollarReturn = function (price) {
        return this.hasPurchases()
            ? this.getMarketValue(price) - this.getTotalCost()
            : undefined;
    };
    // get first purchase date
    Holding.prototype.getFirstPurchaseDate = function () {
        var _a;
        return this.hasPurchases()
            ? (_a = _.minBy(this.getPurchases(), function (txn) {
                return txn.date;
            })) === null || _a === void 0 ? void 0 : _a.date
            : undefined;
    };
    // get last purchase date
    Holding.prototype.getLastPurchaseDate = function () {
        var _a;
        return this.hasPurchases()
            ? (_a = _.maxBy(this.getPurchases(), function (txn) {
                return txn.date;
            })) === null || _a === void 0 ? void 0 : _a.date
            : undefined;
    };
    // get market value
    Holding.prototype.getMarketValue = function (price) {
        return this.hasPurchases()
            ? _.sumBy(this.getPurchases(), function (txn) {
                return txn.quantity * price;
            })
            : undefined;
    };
    // get percentage return
    // TODO: account for profit
    Holding.prototype.getPercentageReturn = function (price) {
        return this.hasPurchases()
            ? this.getMarketValue(price) / this.getTotalCost() - 1
            : undefined;
    };
    // get profit
    Holding.prototype.getProfit = function () {
        return this.hasSales()
            ? this.getSaleQuantity() * this.getAverageRevenue() - this.getAverageCost()
            : undefined;
    };
    // get purchases
    Holding.prototype.getPurchases = function () {
        return this.transactions.filter(function (txn) {
            return txn.type === utils_1.TransactionType.Purchase;
        });
    };
    // get purchase quantity
    Holding.prototype.getPurchaseQuantity = function () {
        var value = _.sumBy(this.getPurchases(), function (txn) {
            return txn.quantity;
        });
        (0, utils_1.assert)(value >= 0, 'getPurchaseQuantity() is not at least 0');
        return value;
    };
    // get quantity
    Holding.prototype.getQuantity = function () {
        var value = this.getPurchaseQuantity() - this.getSaleQuantity();
        (0, utils_1.assert)(value >= 0, 'getQuantity() is not at least 0');
        return value;
    };
    // get sales
    Holding.prototype.getSales = function () {
        return this.transactions.filter(function (txn) {
            return txn.type === utils_1.TransactionType.Sale;
        });
    };
    // get sale quantity
    Holding.prototype.getSaleQuantity = function () {
        var value = _.sumBy(this.getSales(), function (txn) {
            return txn.quantity;
        });
        (0, utils_1.assert)(value >= 0, 'getSaleQuantity() is not at least 0');
        return value;
    };
    // get TCGplayer Id
    Holding.prototype.getTcgplayerId = function () {
        return this.tcgplayerId;
    };
    // get total cost
    Holding.prototype.getTotalCost = function () {
        return this.hasPurchases()
            ? _.sumBy(this.getPurchases(), function (txn) {
                return txn.quantity * txn.price;
            })
            : undefined;
    };
    // get total revenue
    // TODO: account for profit?
    Holding.prototype.getTotalRevenue = function () {
        var value = _.sumBy(this.getSales(), function (txn) {
            return txn.quantity * txn.price;
        });
        (0, utils_1.assert)(value >= 0, 'getTotalRev() is not at least 0');
        return value;
    };
    // get transactions
    Holding.prototype.getTransactions = function () {
        return this.transactions;
    };
    // has purchases
    Holding.prototype.hasPurchases = function () {
        return this.getPurchases().length > 0;
    };
    // has sales
    Holding.prototype.hasSales = function () {
        return this.getSales().length > 0;
    };
    return Holding;
}());
exports.Holding = Holding;
// =========
// Portfolio
// =========
var Portfolio = /** @class */ (function () {
    // constructor
    function Portfolio(userId, portfolioName, holdings) {
        this.userId = userId;
        this.portfolioName = portfolioName;
        this.holdings = holdings;
    }
    // -------
    // methods
    // -------
    // add holdings
    Portfolio.prototype.addHoldings = function (holdingInput) {
        Array.isArray(holdingInput)
            ? this.holdings = this.holdings.concat(holdingInput)
            : this.holdings.push(holdingInput);
    };
    // delete holding
    Portfolio.prototype.deleteHolding = function (tcgplayerId) {
        this.holdings = this.holdings.filter(function (holding) {
            return holding.tcgplayerId !== tcgplayerId;
        });
    };
    // delete holding
    Portfolio.prototype.deleteHoldings = function () {
        this.holdings = [];
    };
    // get dollar return
    // TODO: account for profits
    Portfolio.prototype.getDollarReturn = function (prices) {
        return this.hasPurchases()
            ? this.getMarketValue(prices) - this.getTotalCost()
            : undefined;
    };
    // get holdings
    Portfolio.prototype.getHoldings = function () {
        return this.holdings;
    };
    // get market value
    Portfolio.prototype.getMarketValue = function (prices) {
        return this.getHoldings().length > 0
            ? _.sum(this.getHoldings().map(function (holding) {
                var _a;
                var price = (_a = prices.get(holding.getTcgplayerId())) !== null && _a !== void 0 ? _a : 0;
                return holding.getMarketValue(price);
            }))
            : undefined;
    };
    // get percentage return
    // TODO: account for profits
    Portfolio.prototype.getPercentageReturn = function (prices) {
        return this.hasPurchases()
            ? this.getMarketValue(prices) / this.getTotalCost() - 1
            : undefined;
    };
    ;
    // get profit
    Portfolio.prototype.getProfit = function () {
        return this.hasHoldings()
            ? _.sum(this.getHoldings().map(function (holding) {
                return holding.getProfit();
            }))
            : undefined;
    };
    ;
    // get portfolio name
    Portfolio.prototype.getPortfolioName = function () {
        return this.portfolioName;
    };
    // get total cost
    Portfolio.prototype.getTotalCost = function () {
        return this.hasHoldings()
            ? _.sum(this.getHoldings().map(function (holding) {
                return holding.getTotalCost();
            }))
            : undefined;
    };
    // get total revenue
    Portfolio.prototype.getTotalRevenue = function () {
        return this.hasHoldings()
            ? _.sum(this.getHoldings().map(function (holding) {
                return holding.getTotalRevenue();
            }))
            : undefined;
    };
    // get user ID
    Portfolio.prototype.getUserId = function () {
        return this.userId;
    };
    // holding exists
    Portfolio.prototype.hasHolding = function (tcgplayerId) {
        return this.holdings.filter(function (holding) {
            return holding.tcgplayerId === tcgplayerId;
        }).length > 0;
    };
    // any holding exists
    Portfolio.prototype.hasHoldings = function () {
        return this.holdings.length > 0;
    };
    // has purchases
    Portfolio.prototype.hasPurchases = function () {
        this.holdings.forEach(function (holding) {
            if (holding.hasPurchases()) {
                return true;
            }
        });
        return false;
    };
    // has sales
    Portfolio.prototype.hasSales = function () {
        this.holdings.forEach(function (holding) {
            if (holding.hasSales()) {
                return true;
            }
        });
        return false;
    };
    return Portfolio;
}());
exports.Portfolio = Portfolio;
