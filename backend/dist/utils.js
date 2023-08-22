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
exports.getIMHoldingsFromIHoldings = exports.hasValidTransactions = exports.areValidHoldings = void 0;
const common_1 = require("common");
const _ = __importStar(require("lodash"));
const mongoose_1 = __importDefault(require("mongoose"));
const productSchema_1 = require("./mongo/models/productSchema");
const mongoManager_1 = require("./mongo/mongoManager");
// models
const Product = mongoose_1.default.model('Product', productSchema_1.productSchema);
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
            return holding.tcgplayerId;
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
            console.log(`Products not found for tcgplayerIds in isValidHoldings(): ${unknownTcgplayerIds}`);
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
                return product.tcgplayerId === holding.tcgplayerId;
            });
            (0, common_1.assert)(productDoc instanceof Product, 'Product not found in getIMHoldingsFromIHoldings()');
            // create IMHolding
            return Object.assign(Object.assign({}, holding), { product: productDoc._id });
        });
        return newHoldings;
    });
}
exports.getIMHoldingsFromIHoldings = getIMHoldingsFromIHoldings;
