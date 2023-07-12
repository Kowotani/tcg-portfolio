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
exports.insertPrices = exports.insertProducts = exports.getProducts = exports.getProduct = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const priceSchema_1 = require("./models/priceSchema");
const productSchema_1 = require("./models/productSchema");
// get mongo client
const url = 'mongodb://localhost:27017/tcgPortfolio';
// mongoose models
const Product = mongoose_1.default.model('product', productSchema_1.productSchema);
const Price = mongoose_1.default.model('price', priceSchema_1.priceSchema);
function getProduct({ tcgplayerId, hexStringId } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        // check that tcgplayer_id or id is provided
        if (tcgplayerId === undefined && hexStringId === undefined) {
            return null;
        }
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const doc = tcgplayerId !== undefined
                ? yield Product.find({ 'tcgplayerId': tcgplayerId })
                : yield Product.findById(hexStringId);
            if (doc !== null) {
                return doc;
            }
        }
        catch (err) {
            console.log(`An error occurred in getProduct(): ${err}`);
        }
        return null;
    });
}
exports.getProduct = getProduct;
/*
DESC
    Returns all Products
RETURN
    Array of Product docs
*/
function getProducts() {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const docs = yield Product.find({});
            return docs;
        }
        catch (err) {
            console.log(`An error occurred in getProducts(): ${err}`);
        }
        return [];
    });
}
exports.getProducts = getProducts;
/*
DESC
    Constructs Price documents from the input data and inserts them
INPUT
    An array of IPrice objects
RETURN
    The number of documents inserted
*/
function insertProducts(docs) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const res = yield Product.insertMany(docs);
            return res.length;
        }
        catch (err) {
            console.log(`An error occurred in insertProducts(): ${err}`);
            return -1;
        }
    });
}
exports.insertProducts = insertProducts;
/*
DESC
    Constructs Price documents from the input data and inserts them
INPUT
    An array of IPrice objects
RETURN
    The number of documents inserted
*/
function insertPrices(docs) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const res = yield Price.insertMany(docs);
            return res.length;
        }
        catch (err) {
            console.log(`An error occurred in insertPrices(): ${err}`);
            return -1;
        }
    });
}
exports.insertPrices = insertPrices;
// async function main() {
//     let ids = await getProductIds();
//     console.log(ids);
// }
// main()
//     .then(console.log)
//     .catch(console.error);
