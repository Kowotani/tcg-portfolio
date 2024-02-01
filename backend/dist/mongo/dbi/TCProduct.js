"use strict";
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
exports.setTCProductProperty = exports.setTCProduct = exports.insertTCProducts = exports.getTCProductDocs = exports.getTCProductDoc = void 0;
const common_1 = require("common");
const mongoose_1 = __importDefault(require("mongoose"));
const tcproductSchema_1 = require("../models/tcproductSchema");
const Product_1 = require("../../utils/Product");
// =======
// globals
// =======
const url = 'mongodb://localhost:27017/tcgPortfolio';
// =======
// getters
// =======
/*
DESC
  Retrieves a TCProduct document by tcgplayerId
INPUT
  tcgplayerId: The tcgplayerId
RETURN
  The document if found, else null
*/
function getTCProductDoc(tcgplayerId) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const tcProductDoc = yield tcproductSchema_1.TCProduct.findOne({ 'tcgplayerId': tcgplayerId });
            return tcProductDoc;
        }
        catch (err) {
            const errMsg = `An error occurred in getTCProductDoc(): ${err}`;
            throw new Error(errMsg);
        }
    });
}
exports.getTCProductDoc = getTCProductDoc;
function getTCProductDocs({ categoryId, groupId, status } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            let filter = {};
            if (categoryId)
                filter['categoryId'] = categoryId;
            if (groupId)
                filter['groupId'] = groupId;
            if (status)
                filter['status'] = status;
            const docs = yield tcproductSchema_1.TCProduct.find(filter);
            return docs;
        }
        catch (err) {
            const errMsg = `An error occurred in getTCProductDocs(): ${err}`;
            throw new Error(errMsg);
        }
    });
}
exports.getTCProductDocs = getTCProductDocs;
// =======
// setters
// =======
/*
DESC
  Inserts the input ITCProduct-shaped docs
INPUT
  docs: An ITCProduct[]
RETURN
  The number of documents inserted
*/
function insertTCProducts(docs) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const res = yield tcproductSchema_1.TCProduct.insertMany(docs);
            return res.length;
        }
        catch (err) {
            const errMsg = `An error occurred in insertTCProducts(): ${err}`;
            throw new Error(errMsg);
        }
    });
}
exports.insertTCProducts = insertTCProducts;
/*
DESC
  Sets an existing TCProduct to be equal to a new TCProduct
INPUT
  existingTCProduct: The TCProduct to update
  newTCProduct: The new state of the TCProduct
RETURN
  TRUE if the TCProduct was successfully set, FALSE otherwise
*/
function setTCProduct(existingTCProduct, newTCProduct) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            // check if TCProduct exists
            const productDoc = yield getTCProductDoc(existingTCProduct.tcgplayerId);
            (0, common_1.assert)((0, common_1.isITCProduct)(productDoc), (0, Product_1.genProductNotFoundError)('setTCProduct()', existingTCProduct.tcgplayerId).toString());
            // overwrite TCProduct
            productDoc.overwrite(newTCProduct);
            yield productDoc.save();
            return true;
        }
        catch (err) {
            const errMsg = `An error occurred in setTCProduct(): ${err}`;
            throw new Error(errMsg);
        }
    });
}
exports.setTCProduct = setTCProduct;
/*
DESC
  Sets a property on a TCProduct document to the input value using the
  tcgplayerId to find the TCProduct
INPUT
  tcgplayerId: TCGPlayerId identifying the ITCproduct
  key: The property name to set
  value: The property value to set
RETURN
  TRUE if the property was successfully set, FALSE otherwise
*/
function setTCProductProperty(tcgplayerId, key, value) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            // check if TCProduct exists
            const productDoc = yield getTCProductDoc(tcgplayerId);
            (0, common_1.assert)((0, common_1.isITCProduct)(productDoc), (0, Product_1.genProductNotFoundError)('setTCProductProperty()', tcgplayerId).toString());
            // update TCProduct
            productDoc.set(key, value);
            yield productDoc.save();
            return true;
        }
        catch (err) {
            const errMsg = `An error occurred in setTCProductProperty(): ${err}`;
            throw new Error(errMsg);
        }
    });
}
exports.setTCProductProperty = setTCProductProperty;
