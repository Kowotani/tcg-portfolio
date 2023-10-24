"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPortfolioDoc = exports.getPortfolioMarketValueSeries = exports.genPortfolioNotFoundError = exports.genPortfolioAlreadyExistsError = void 0;
const common_1 = require("common");
const danfo_1 = require("./danfo");
const df = __importStar(require("danfojs-node"));
const Holding_1 = require("./Holding");
const portfolioSchema_1 = require("../mongo/models/portfolioSchema");
// ======
// errors
// ======
/*
DESC
  Returns an Error with standardized error message when a Portfolio already
  exists for a userId / portfolioName combination
INPUT
  userId: The userId associated with the Portfolio
  portfolioName: The portfolioName associated with the Portfolio
  fnName: The name of the function generating the error
RETURN
  An error
*/
function genPortfolioAlreadyExistsError(userId, portfolioName, fnName) {
    const errMsg = `Portfolio ${portfolioName} already exists for userId: ${userId} in ${fnName}`;
    return new Error(errMsg);
}
exports.genPortfolioAlreadyExistsError = genPortfolioAlreadyExistsError;
/*
DESC
  Returns an Error with standardized error message when a Portfolio is not found
  for a userId / portfolioName combination
INPUT
  userId: The userId associated with the Portfolio
  portfolioName: The portfolioName associated with the Portfolio
  fnName: The name of the function generating the error
RETURN
  An error
*/
function genPortfolioNotFoundError(userId, portfolioName, fnName) {
    const errMsg = userId && portfolioName
        ? `Portfolio not found for [${userId}, ${portfolioName}] in ${fnName}`
        : `Portfolio not found in ${fnName}`;
    return new Error(errMsg);
}
exports.genPortfolioNotFoundError = genPortfolioNotFoundError;
// =======
// getters
// =======
/*
DESC
  Returns a series of daily market values for the input IPortfolio between the
  input startDate and endDate using prices in the input priceSeriesMap
INPUT
  portfolio: An IPortfolio
  priceSeriesMap: A Map of tcgplayerId => danfo Series of Prices
  startDate: The start date of the Series
  endDate: The end date of the Series
RETURN
  A danfo Series
*/
function getPortfolioMarketValueSeries(portfolio, priceSeriesMap, startDate, endDate) {
    const holdings = (0, common_1.getPortfolioHoldings)(portfolio);
    // get market value series of holdings
    const marketValues = holdings.map((holding) => {
        const tcgplayerId = (0, common_1.getHoldingTcgplayerId)(holding);
        const priceSeries = priceSeriesMap.get(tcgplayerId);
        // verify that prices exist for this tcgplayerId
        (0, common_1.assert)(priceSeries instanceof df.Series, `Could not find prices for tcgplayerId: ${tcgplayerId}`);
        return (0, Holding_1.getHoldingMarketValueSeries)(holding, priceSeries, startDate, endDate);
    });
    // create empty Series used for summation
    const emptySeries = (0, danfo_1.densifyAndFillSeries)(new df.Series([0], { index: [startDate.toISOString()] }), startDate, endDate, 'value', 0, 0);
    // get market value series of portfolio
    return marketValues.reduce((acc, cur) => {
        return acc = acc.add(cur);
    }, emptySeries);
}
exports.getPortfolioMarketValueSeries = getPortfolioMarketValueSeries;
// ===========
// type guards
// ===========
/*
DESC
  Returns whether or not the input is a Portfolio doc
INPUT
  arg: An object that might be a Portfolio doc
RETURN
  TRUE if the input is a Portfolio doc, FALSE otherwise
*/
function isPortfolioDoc(arg) {
    return arg
        && arg instanceof portfolioSchema_1.Portfolio;
}
exports.isPortfolioDoc = isPortfolioDoc;
