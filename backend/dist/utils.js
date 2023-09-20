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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasValidTransactions = exports.areValidHoldings = exports.isProductDoc = exports.isPriceDoc = exports.isPortfolioDoc = exports.genProductNotFoundError = exports.genPortfolioNotFoundError = exports.genPortfolioAlreadyExistsError = exports.isTCGPlayerDateRange = exports.getIMPricesFromIPrices = exports.getIMHoldingsFromIHoldings = exports.Product = exports.Price = exports.Portfolio = exports.HistoricalPrice = void 0;
const common_1 = require("common");
const _ = __importStar(require("lodash"));
const mongoose_1 = __importDefault(require("mongoose"));
const historicalPriceSchema_1 = require("./mongo/models/historicalPriceSchema");
const portfolioSchema_1 = require("./mongo/models/portfolioSchema");
const priceSchema_1 = require("./mongo/models/priceSchema");
const productSchema_1 = require("./mongo/models/productSchema");
const mongoManager_1 = require("./mongo/mongoManager");
// models
exports.HistoricalPrice = mongoose_1.default.model('HistoricalPrice', historicalPriceSchema_1.historicalPriceSchema);
exports.Portfolio = mongoose_1.default.model('Portfolio', portfolioSchema_1.portfolioSchema);
exports.Price = mongoose_1.default.model('Price', priceSchema_1.priceSchema);
exports.Product = mongoose_1.default.model('Product', productSchema_1.productSchema);
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
        const productDocs = yield (0, mongoManager_1.getProductDocs)();
        const newHoldings = holdings.map((holding) => {
            // find Product
            const productDoc = productDocs.find((product) => {
                return product.tcgplayerId === Number(holding.tcgplayerId);
            });
            (0, common_1.assert)(isProductDoc(productDoc), genProductNotFoundError('getIMHoldingsFromIHoldings()').toString());
            // create IMHolding
            return Object.assign(Object.assign({}, holding), { product: productDoc._id });
        });
        return newHoldings;
    });
}
exports.getIMHoldingsFromIHoldings = getIMHoldingsFromIHoldings;
/*
DESC
  Converts an IPrice[] to an IMPrice[], which entails:
    - adding the product field with Product ObjectId
INPUT
  prices: An IPrice[]
RETURN
  An IMPrice[]
*/
function getIMPricesFromIPrices(prices) {
    return __awaiter(this, void 0, void 0, function* () {
        const productDocs = yield (0, mongoManager_1.getProductDocs)();
        const newPrices = prices.map((price) => {
            // find Product
            const productDoc = productDocs.find((product) => {
                return product.tcgplayerId === Number(price.tcgplayerId);
            });
            (0, common_1.assert)(isProductDoc(productDoc), genProductNotFoundError('getIMPricesFromIPrices()').toString());
            // create IMPrice
            return Object.assign(Object.assign({}, price), { product: productDoc._id });
        });
        return newPrices;
    });
}
exports.getIMPricesFromIPrices = getIMPricesFromIPrices;
// =======
// generic
// =======
/*
DESC
  Determines if the input is a valid price date range from TCGPlayer
  The expected regex format is:
    \d{1,2}\/\d{1,2} to \d{1,2}\/\d{1,2}
INPUT
  value: The string to validate
RETURN
  TRUE if the input is a valid price date range from TCGPlayer, FALSE otherwise
*/
function isTCGPlayerDateRange(value) {
    const regexp = new RegExp('^\\d{1,2}\\/\\d{1,2} to \\d{1,2}\\/\\d{1,2}$');
    return regexp.test(value);
}
exports.isTCGPlayerDateRange = isTCGPlayerDateRange;
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
/*
DESC
  Returns an Error with standardized error message when a Product is not found
  for a tcgplayerId
INPUT
  tcgplayerId: The tcgplayerId associated with the Product
  fnName: The name of the function generating the error
RETURN
  An error
*/
function genProductNotFoundError(fnName, tcgplayerId) {
    const errMsg = tcgplayerId
        ? `Product not found for tcgplayerId: ${tcgplayerId} in ${fnName}`
        : `Product not found in ${fnName}`;
    return new Error(errMsg);
}
exports.genProductNotFoundError = genProductNotFoundError;
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
        && arg instanceof exports.Portfolio;
}
exports.isPortfolioDoc = isPortfolioDoc;
/*
DESC
  Returns whether or not the input is a Price doc
INPUT
  arg: An object that might be a Price doc
RETURN
  TRUE if the input is a Price doc, FALSE otherwise
*/
function isPriceDoc(arg) {
    return arg
        && arg instanceof exports.Price;
}
exports.isPriceDoc = isPriceDoc;
/*
DESC
  Returns whether or not the input is a Product doc
INPUT
  arg: An object that might be a Product doc
RETURN
  TRUE if the input is a Product doc, FALSE otherwise
*/
function isProductDoc(arg) {
    return arg
        && arg instanceof exports.Product;
}
exports.isProductDoc = isProductDoc;
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
        const productDocs = yield (0, mongoManager_1.getProductDocs)();
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
