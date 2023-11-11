"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasValidTransactions = exports.areValidHoldings = exports.getHoldingRevenueSeries = exports.getHoldingTransactionQuantitySeries = exports.getHoldingTotalCostSeries = exports.getHoldingTotalCostAsDatedValues = exports.getHoldingTimeWeightedReturn = exports.getHoldingPurchaseCostSeries = exports.getHoldingPnLSeries = exports.getHoldingCostOfGoodsSoldSeries = exports.getHoldingMarketValueSeries = exports.getHoldingMarketValueAsDatedValues = exports.getIMHoldingsFromIHoldings = void 0;
const common_1 = require("common");
const danfo_1 = require("./danfo");
const _ = __importStar(require("lodash"));
const Product_1 = require("../mongo/dbi/Product");
const Price_1 = require("../mongo/dbi/Price");
const Product_2 = require("./Product");
// ==========
// converters
// ==========
/*
DESC
  Converts an IHolding[] to an IMHolding[], which entails:
    - adding the product field with Product ObjectId
INPUT
  holdings: An IHolding[]
RETURN
  An IMHolding[]
*/
function getIMHoldingsFromIHoldings(holdings) {
    return __awaiter(this, void 0, void 0, function* () {
        const productDocs = yield (0, Product_1.getProductDocs)();
        const newHoldings = holdings.map((holding) => {
            // find Product
            const productDoc = productDocs.find((product) => {
                return product.tcgplayerId === Number(holding.tcgplayerId);
            });
            (0, common_1.assert)((0, Product_2.isProductDoc)(productDoc), (0, Product_2.genProductNotFoundError)('getIMHoldingsFromIHoldings()').toString());
            // create IMHolding
            return Object.assign(Object.assign({}, holding), { product: productDoc._id });
        });
        return newHoldings;
    });
}
exports.getIMHoldingsFromIHoldings = getIMHoldingsFromIHoldings;
// =======
// getters
// =======
/*
DESC
  Returns the market value of the input Portfolio between the startDate and
  endDate
INPUT
  holding: A IHolding
  startDate?: The start date for market value calculation
  endDate?: The end date for market value calculation
*/
function getHoldingMarketValueAsDatedValues(holding, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        // get price map
        const tcgplayerId = (0, common_1.getHoldingTcgplayerId)(holding);
        const priceMap = yield (0, Price_1.getPriceMapOfSeries)([tcgplayerId], startDate, endDate);
        const priceSeries = priceMap.get(tcgplayerId);
        // get market value
        const marketValueSeries = getHoldingMarketValueSeries(holding, priceSeries, startDate, endDate);
        return (0, danfo_1.getDatedValuesFromSeries)(marketValueSeries);
    });
}
exports.getHoldingMarketValueAsDatedValues = getHoldingMarketValueAsDatedValues;
/*
DESC
  Returns a series of daily market values for the input IHolding between the
  input startDate and endDate using the input priceSeries
INPUT
  holding: An IHolding
  priceSeries: A danfo Series of prices
  startDate?: The start date of the Series (default: first transaction date)
  endDate?: The end date of the Series (default: T-1)
RETURN
  A danfo Series
*/
function getHoldingMarketValueSeries(holding, priceSeries, startDate, endDate) {
    // get start and end dates
    const [startDt, endDt] = getStartAndEndDates(holding, startDate, endDate);
    // align price series
    const prices = (0, danfo_1.densifyAndFillSeries)(priceSeries, startDt, endDt, 'locf', undefined, 0);
    // -- get holding value series
    const transactionSeries = getHoldingTransactionQuantitySeries(holding);
    const cumTransactionSeries = transactionSeries.cumSum();
    const quantitySeries = (0, danfo_1.densifyAndFillSeries)(cumTransactionSeries, startDt, endDt, 'locf', undefined, 0);
    const pricesIx = prices.index.map((ix) => {
        return String(ix) >= startDt.toISOString()
            && String(ix) <= endDt.toISOString();
    });
    const holdingValueSeries = quantitySeries.mul(prices.loc(pricesIx));
    // -- get revenue series
    const dailyRevenueSeries = getHoldingRevenueSeries(holding, startDt, endDt);
    const cumRevenueSeries = dailyRevenueSeries.count()
        ? dailyRevenueSeries.cumSum()
        : dailyRevenueSeries;
    const revenueSeries = (0, danfo_1.densifyAndFillSeries)(cumRevenueSeries, startDt, endDt, 'locf', undefined, 0);
    // -- get market value series
    return holdingValueSeries.add(revenueSeries);
}
exports.getHoldingMarketValueSeries = getHoldingMarketValueSeries;
/*
DESC
  Returns a series of cost of goods sold for the input IHolding. The index of
  the returned Series will correspond to each date with a Sale
INPUT
  holding: An IHolding
RETURN
  A danfo Series
*/
function getHoldingCostOfGoodsSoldSeries(holding) {
    // get Purchase and Sales
    const purchases = (0, common_1.getHoldingAggregatedPurchases)(holding);
    const sales = (0, common_1.getHoldingAggregatedSales)(holding);
    // sort Purchases and Sales
    let sortedPurchases = _.sortBy(purchases, [(txn) => txn.date]);
    const sortedSales = _.sortBy(sales, [(txn) => txn.date]);
    // store datedValues of COGS
    let cogs = [];
    // create datedValues of cost of goods sold for each Sale transaction date
    sortedSales.map((sale) => {
        // accumulate price and quantity of COGS
        let price = 0;
        let quantity = 0;
        // calculate COGS
        while (quantity < sale.quantity && sortedPurchases.length) {
            // get first remaining Purchase
            const purchase = sortedPurchases.shift();
            (0, common_1.assert)(purchase, 'sortedPurchases is empty');
            (0, common_1.assert)((0, common_1.isDateBefore)(purchase.date, sale.date, true), 'Insufficient Purchases to calculate COGS');
            // calculate the portion of the Purchase used (eg. sold)
            const usedQuantity = Math.min(sale.quantity - quantity, purchase.quantity);
            // update COGS
            price = (price * quantity + purchase.price * usedQuantity)
                / (quantity + usedQuantity);
            quantity = quantity + usedQuantity;
            // add back unused portion of the Purchase
            if (usedQuantity < purchase.quantity) {
                sortedPurchases.unshift({
                    date: purchase.date,
                    price: purchase.price,
                    quantity: purchase.quantity - usedQuantity,
                    type: purchase.type
                });
            }
        }
        // set the COGS
        cogs.push({
            date: sale.date,
            value: price * quantity
        });
    });
    // return COGS as Danfo Series
    return (0, danfo_1.sortSeriesByIndex)((0, danfo_1.getSeriesFromDatedValues)(cogs));
}
exports.getHoldingCostOfGoodsSoldSeries = getHoldingCostOfGoodsSoldSeries;
/*
DESC
  Returns a series of cumulative PnL for the input IHolding between the
  input startDate and endDate using the input priceSeries. This can be
  calculated as the Market Value - Total Cost
INPUT
  holding: An IHolding
  priceSeries: A danfo Series of prices
  startDate?: The start date of the Series (default: first transaction date)
  endDate?: The end date of the Series (default: T-1)
RETURN
  A danfo Series
*/
function getHoldingPnLSeries(holding, priceSeries, startDate, endDate) {
    // get start and end dates
    const [startDt, endDt] = getStartAndEndDates(holding, startDate, endDate);
    // align price series
    const prices = (0, danfo_1.densifyAndFillSeries)(priceSeries, startDt, endDt, 'locf', undefined, 0);
    // get market value series
    const marketValueSeries = getHoldingMarketValueSeries(holding, prices, startDt, endDt);
    // get total cost series
    const totalCostSeries = getHoldingTotalCostSeries(holding, startDt, endDt);
    // return market value - total cost
    return marketValueSeries.sub(totalCostSeries);
}
exports.getHoldingPnLSeries = getHoldingPnLSeries;
/*
DESC
  Returns a series of purchase costs for the input IHolding between the
  input startDate and endDate
INPUT
  holding: An IHolding
  startDate?: The start date of the  (default: first transaction date)
  endDate?: The end date of the Series (default: T-1)
RETURN
  A danfo Series
*/
function getHoldingPurchaseCostSeries(holding, startDate, endDate) {
    // get start and end dates
    const [startDt, endDt] = getStartAndEndDates(holding, startDate, endDate);
    // get dated values of daily purchase costs
    const allPurchases = (0, common_1.getHoldingPurchases)(holding);
    const purchases = allPurchases.filter((txn) => {
        return (0, common_1.isDateAfter)(txn.date, startDt, true)
            && (0, common_1.isDateBefore)(txn.date, endDt, true);
    });
    const datedValues = purchases.map((txn) => {
        return {
            date: txn.date,
            value: txn.price * txn.quantity
        };
    });
    return (0, danfo_1.sortSeriesByIndex)((0, danfo_1.getSeriesFromDatedValues)(datedValues));
}
exports.getHoldingPurchaseCostSeries = getHoldingPurchaseCostSeries;
/*
DESC
  Returns the time-weighted return for the input IHolding between the input
  startDate and endDate using the input priceSeries, annualized if input
INPUT
  holding: An IHolding
  priceSeries: A danfo Series of prices
  startDate: The start date of the Series (default: first transaction date)
  endDate: The end date of the  (default: T-1)
  annualized?: TRUE if the return should be annualized, FALSE otherwise
RETURN
  The time-weighted return
*/
function getHoldingTimeWeightedReturn(holding, priceSeries, startDate, endDate, annualized) {
    // get start and end dates
    const [startDt, endDt] = getStartAndEndDates(holding, startDate, endDate);
    // get market value series
    const marketValueSeries = getHoldingMarketValueSeries(holding, priceSeries, startDt, endDate);
    // get daily purchase cost series
    const dailyPurchaseSeries = getHoldingPurchaseCostSeries(holding, startDt, endDate);
    // get daily revenue series
    const dailyRevenueSeries = getHoldingRevenueSeries(holding, startDt, endDt);
    // get cost of goods sold series
    const costOfGoodsSoldSeries = getHoldingCostOfGoodsSoldSeries(holding);
    // create index for return calculations
    const index = _.uniq(_.concat(dailyPurchaseSeries.index, costOfGoodsSoldSeries.index, [endDt.toISOString()])).sort();
    // create numerator array
    // since returns are defined as t / (t-1), ignore the first element
    const numerators = _.slice(index, 1).map((date) => {
        const marketValue = marketValueSeries.at(date);
        const purchaseCost = dailyPurchaseSeries.index.includes(date)
            ? dailyPurchaseSeries.at(date)
            : 0;
        const revenue = dailyRevenueSeries.index.includes(date)
            ? dailyRevenueSeries.at(date)
            : 0;
        const cogs = costOfGoodsSoldSeries.index.includes(date)
            ? costOfGoodsSoldSeries.at(date)
            : 0;
        (0, common_1.assert)(_.isNumber(marketValue), 'Numerator market value is not a number');
        (0, common_1.assert)(_.isNumber(purchaseCost), 'Numerator purchase cost is not a number');
        (0, common_1.assert)(_.isNumber(revenue), 'Numerator revenue cost is not a number');
        (0, common_1.assert)(_.isNumber(cogs), 'Numerator cogs cost is not a number');
        return marketValue - purchaseCost + revenue - cogs;
    });
    // create denominator array
    // since returns are defined as t / (t-1), ignore the last element
    const denominators = _.slice(index, 0, index.length - 1)
        .map((date, ix) => {
        const value = ix === 0
            ? dailyPurchaseSeries.at(date)
            : marketValueSeries.at(date);
        (0, common_1.assert)(_.isNumber(value), 'Denominator market value is not a number');
        return value;
    });
    // create return series
    (0, common_1.assert)(numerators.length === denominators.length, 'Numerator and denominator arrays are not the same length');
    const returns = numerators.map((numerator, ix) => {
        const denominator = denominators[ix];
        return numerator / denominator - 1;
    });
    // calculate time-weighted return for the period
    const timeWeightedReturn = returns.reduce((acc, cur) => {
        return acc = acc * (1 + cur);
    }, 1) - 1;
    // annualize if necessary
    return annualized
        ? Math.pow((1 + timeWeightedReturn), 365 / (0, common_1.getDaysBetween)(startDt, endDt)) - 1
        : timeWeightedReturn;
}
exports.getHoldingTimeWeightedReturn = getHoldingTimeWeightedReturn;
/*
DESC
  Returns the total cost of the input Holding between the startDate and
  endDate
INPUT
  holding: An IHolding
  startDate?: The start date for market value calculation
  endDate?: The end date for market value calculation
*/
function getHoldingTotalCostAsDatedValues(holding, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        // get total cost
        const totalCostSeries = getHoldingTotalCostSeries(holding, startDate, endDate);
        return (0, danfo_1.getDatedValuesFromSeries)(totalCostSeries);
    });
}
exports.getHoldingTotalCostAsDatedValues = getHoldingTotalCostAsDatedValues;
/*
DESC
  Returns a series of total cost for the input IHolding between the input
  startDate and endDate
INPUT
  holding: An IHolding
  startDate?: The start date of the Series (default: first transaction date)
  endDate?: The end date of the Series (default: T-1)
RETURN
  A danfo Series
*/
function getHoldingTotalCostSeries(holding, startDate, endDate) {
    // get start and end dates
    const [startDt, endDt] = getStartAndEndDates(holding, startDate, endDate);
    // get dated values of daily purchase costs
    const purchases = (0, common_1.getHoldingPurchases)(holding);
    const datedValues = purchases.map((txn) => {
        return {
            date: txn.date,
            value: txn.price * txn.quantity
        };
    });
    // align daily purchase costs to date index
    const dailyPurchaseSeries = (0, danfo_1.sortSeriesByIndex)((0, danfo_1.getSeriesFromDatedValues)(datedValues));
    const purchaseSeries = (0, danfo_1.densifyAndFillSeries)(dailyPurchaseSeries, startDt, endDt, 'value', 0);
    return purchaseSeries.cumSum();
}
exports.getHoldingTotalCostSeries = getHoldingTotalCostSeries;
/*
DESC
  Returns a series of daily transaction quantities for the input IHolding
INPUT
  holding: An IHolding
RETURN
  A danfo Series
*/
function getHoldingTransactionQuantitySeries(holding) {
    // get purchase and sales
    const purchases = (0, common_1.getHoldingPurchases)(holding);
    const sales = (0, common_1.getHoldingSales)(holding);
    // summarize transaction quantities in a map
    const quantityMap = new Map();
    purchases.forEach((txn) => {
        var _a;
        quantityMap.set(txn.date.toISOString(), ((_a = quantityMap.get(txn.date.toISOString())) !== null && _a !== void 0 ? _a : 0) + txn.quantity);
    });
    sales.forEach((txn) => {
        var _a;
        quantityMap.set(txn.date.toISOString(), ((_a = quantityMap.get(txn.date.toISOString())) !== null && _a !== void 0 ? _a : 0) - txn.quantity);
    });
    const datedValues = [];
    quantityMap.forEach((value, key) => {
        if (value !== 0) {
            datedValues.push({
                date: new Date(Date.parse(key)),
                value: value
            });
        }
    });
    return (0, danfo_1.sortSeriesByIndex)((0, danfo_1.getSeriesFromDatedValues)(datedValues));
}
exports.getHoldingTransactionQuantitySeries = getHoldingTransactionQuantitySeries;
/*
DESC
  Returns a series of daily revenue for the input IHolding between the input
  startDate and endDate
INPUT
  holding: An IHolding
  startDate?: The start date of the Series (default: first transaction date)
  endDate?: The end date of the Series (default: T-1)
RETURN
  A danfo Series
*/
function getHoldingRevenueSeries(holding, startDate, endDate) {
    // get start and end dates
    const [startDt, endDt] = getStartAndEndDates(holding, startDate, endDate);
    const allSales = (0, common_1.getHoldingSales)(holding);
    const sales = allSales.filter((txn) => {
        return (0, common_1.isDateAfter)(txn.date, startDt, true)
            && (0, common_1.isDateBefore)(txn.date, endDt, true);
    });
    const datedValues = sales.map((txn) => {
        return {
            date: txn.date,
            value: txn.price * txn.quantity
        };
    });
    return (0, danfo_1.sortSeriesByIndex)((0, danfo_1.getSeriesFromDatedValues)(datedValues));
}
exports.getHoldingRevenueSeries = getHoldingRevenueSeries;
/*
DESC
  Returns the default starting and ending dates for the input Holding for use
  in the various getter functions above
INPUT
  holding: An IHolding
  startDate?: The start date for the calculation
  endDate?: The end date for the calculation
RETURN
  An array with two elements
    start: The non-undefined starting date
    end: The non-undefined ending date
*/
function getStartAndEndDates(holding, startDate, endDate) {
    // starting date
    const start = startDate !== null && startDate !== void 0 ? startDate : (0, common_1.getHoldingFirstTransactionDate)(holding);
    // ending date
    const end = endDate !== null && endDate !== void 0 ? endDate : (0, common_1.dateSub)(new Date(), { days: 1 });
    return [start, end];
}
// ==========
// validators
// ==========
/*
DESC
  Validates whether the input Holdings are valid. The validity checks are:
    - unique tcgplayerId for each Holding
    - the Product exists for each Holding
    - the Transaction quantity >= 0 for each Holding
INPUT
  holdings: An IHolding[]
RETURN
  TRUE if the input is a valid set of IHolding[], FALSE otherwise
*/
function areValidHoldings(holdings) {
    return __awaiter(this, void 0, void 0, function* () {
        // unique tcgplayerId
        const tcgplayerIds = holdings.map((holding) => {
            return Number(holding.tcgplayerId);
        });
        if (tcgplayerIds.length > _.uniq(tcgplayerIds).length) {
            console.log(`Duplicate tcgplayerIds detected in isValidHoldings()`);
            return false;
        }
        // all Products exist
        const productDocs = yield (0, Product_1.getProductDocs)();
        const productTcgplayerIds = productDocs.map((doc) => {
            return doc.tcgplayerId;
        });
        const unknownTcgplayerIds = _.difference(tcgplayerIds, productTcgplayerIds);
        if (unknownTcgplayerIds.length > 0) {
            console.log(`Products not found for tcgplayerIds in hasValidHoldings(): ${unknownTcgplayerIds}`);
            return false;
        }
        // quantity >= 0
        if (!_.every(holdings, (holding) => {
            return hasValidTransactions(holding);
        })) {
            return false;
        }
        // all checks passed
        return true;
    });
}
exports.areValidHoldings = areValidHoldings;
/*
DESC
  Validates whether the input IHolding has valid Transactions. The validity
  checks are:
    - the net quantity is greater than or equal to 0
INPUT
  holding: An IHolding[]
RETURN
  TRUE if the input IHolding has valid set of ITransaction[], FALSE otherwise
*/
function hasValidTransactions(holding) {
    // net quantity
    return (0, common_1.getHoldingQuantity)(holding) >= 0;
}
exports.hasValidTransactions = hasValidTransactions;
