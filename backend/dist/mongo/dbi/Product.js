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
exports.setProductProperty = exports.insertProducts = exports.getProductDocs = exports.getProductDoc = void 0;
const common_1 = require("common");
const mongoose_1 = __importDefault(require("mongoose"));
const productSchema_1 = require("../models/productSchema");
const Product_1 = require("../../utils/Product");
// =======
// globals
// =======
const url = 'mongodb://localhost:27017/tcgPortfolio';
function getProductDoc({ tcgplayerId, hexStringId } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        // check that tcgplayer_id or id is provided
        if (tcgplayerId === undefined && hexStringId === undefined) {
            const errMsg = 'No tcgplayerId or hexStringId provided to getProductDoc()';
            throw new Error(errMsg);
        }
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const productDoc = tcgplayerId
                ? yield productSchema_1.Product.findOne({ 'tcgplayerId': tcgplayerId })
                : yield productSchema_1.Product.findById(hexStringId);
            return productDoc;
        }
        catch (err) {
            const errMsg = `An error occurred in getProductDoc(): ${err}`;
            throw new Error(errMsg);
        }
    });
}
exports.getProductDoc = getProductDoc;
/*
DESC
  Returns all Products
RETURN
  Array of Product docs
*/
function getProductDocs() {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const docs = yield productSchema_1.Product.find({});
            return docs;
        }
        catch (err) {
            const errMsg = `An error occurred in getProductDocs(): ${err}`;
            throw new Error(errMsg);
        }
    });
}
exports.getProductDocs = getProductDocs;
/*
DESC
  Constructs Price documents from the input data and inserts them
INPUT
  An array of IProducts
RETURN
  The number of documents inserted
*/
function insertProducts(docs) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const res = yield productSchema_1.Product.insertMany(docs);
            return res.length;
        }
        catch (err) {
            const errMsg = `An error occurred in insertProducts(): ${err}`;
            throw new Error(errMsg);
        }
    });
}
exports.insertProducts = insertProducts;
/*
DESC
  Sets a property on a Product document to the input value using the
  tcgplayerId to find the Product
INPUT
  tcgplayerId: TCGPlayerId identifying the product
  key: The property name to set
  value: The property value to set
RETURN
  TRUE if the property was successfully set, FALSE otherwise
*/
function setProductProperty(tcgplayerId, key, value) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            // check if Product exists
            const productDoc = yield getProductDoc({ tcgplayerId: tcgplayerId });
            if (!(0, Product_1.isProductDoc)(productDoc)) {
                throw (0, Product_1.genProductNotFoundError)('setProductProperty()', tcgplayerId);
            }
            (0, common_1.assert)((0, Product_1.isProductDoc)(productDoc), (0, Product_1.genProductNotFoundError)('setProductProperty()', tcgplayerId).toString());
            // update Product
            productDoc.set(key, value);
            yield productDoc.save();
            return true;
        }
        catch (err) {
            const errMsg = `An error occurred in setProductProperty(): ${err}`;
            throw new Error(errMsg);
        }
    });
}
exports.setProductProperty = setProductProperty;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let res;
        // const product: IProduct = {
        //   tcgplayerId: 449558,
        //   tcg: TCG.MagicTheGathering,
        //   releaseDate: new Date(),
        //   name: 'Foo',
        //   type: ProductType.BoosterBox,
        //   language: ProductLanguage.Japanese,
        // }
        // const res = await insertProducts([product])
        // console.log(res)
        // // -- Set Product
        // const tcgplayerId= 121527
        // const key = 'msrp'
        // const value = 80
        // res = await setProductProperty(tcgplayerId, key, value)
        // if (res) {
        //   console.log(`Product (${tcgplayerId}) updated {${key}: ${value}}`)
        // } else {
        //   console.log('Product not updated')
        // }
        // const p233232 = await getProductDoc({'tcgplayerId': 233232})
        // const p449558 = await getProductDoc({'tcgplayerId': 449558})
        return 0;
    });
}
main()
    .then(console.log)
    .catch(console.error);
