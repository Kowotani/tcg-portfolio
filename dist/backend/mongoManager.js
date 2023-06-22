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
exports.insertDocs = exports.getProductIds = exports.getProduct = void 0;
// imports
const mongoose_1 = __importDefault(require("mongoose"));
const productSchema_1 = require("./models/productSchema");
// get mongo client
const url = 'mongodb://localhost:27017/tcgPortfolio';
// mongoose models
const Product = mongoose_1.default.model('product', productSchema_1.productSchema);
function getProduct({ tcgplayer_id, id } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        // check that tcgplayer_id or id is provided
        if (tcgplayer_id === undefined && id === undefined) {
            return null;
        }
        let docs;
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            docs = tcgplayer_id !== undefined
                ? yield Product.find({ 'tcgplayer_id': tcgplayer_id })
                : yield Product.findById(id);
        }
        catch (err) {
            console.log(`An error occurred in getProduct(): ${err}`);
        }
        return docs.length > 0 ? docs[0] : null;
    });
}
exports.getProduct = getProduct;
/*
DESC
    Returns the product ids for all known products
RETURN
    Array of product objects containing
        id: Document ObjectID
        tcgplayer_id: Document tcgplayer_id
*/
function getProductIds() {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const docs = yield Product.find({});
            const ids = docs.map(doc => {
                return {
                    'id': doc._id,
                    'tcgplayer_id': doc.tcgplayer_id
                };
            });
            return ids;
        }
        catch (err) {
            console.log(`An error occurred in getProductIds(): ${err}`);
        }
        return null;
    });
}
exports.getProductIds = getProductIds;
/*
DESC
    Inserts documents constructed from the input data for the specified model
INPUT
    model: The name of the document model (mongoose automatically looks for
        the plural lowercase version of the model as the collection)
    data: An array of object data from which to construct the documents
RETURN
    The number of documents inserted
*/
function insertDocs(model, data) {
    return __awaiter(this, void 0, void 0, function* () {
        // get schema
        let schema;
        switch (model) {
            case 'product':
                schema = productSchema_1.productSchema;
                break;
            case 'price':
                schema = null;
                break;
        }
        const Model = mongoose_1.default.model(model, schema);
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const res = yield Model.insertMany(data);
        }
        catch (err) {
            console.log(`An error occurred in insertDocs(): ${err}`);
        }
        return 0;
    });
}
exports.insertDocs = insertDocs;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let ids = yield getProductIds();
        console.log(ids);
    });
}
main()
    .then(console.log)
    .catch(console.error);
