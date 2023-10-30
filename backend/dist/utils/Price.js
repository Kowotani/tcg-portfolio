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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPriceDoc = exports.getIMPricesFromIPrices = void 0;
const common_1 = require("common");
const priceSchema_1 = require("../mongo/models/priceSchema");
const Product_1 = require("../mongo/dbi/Product");
const Product_2 = require("./Product");
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
        const productDocs = yield (0, Product_1.getProductDocs)();
        const newPrices = prices.map((price) => {
            // find Product
            const productDoc = productDocs.find((product) => {
                return product.tcgplayerId === Number(price.tcgplayerId);
            });
            (0, common_1.assert)((0, Product_2.isProductDoc)(productDoc), (0, Product_2.genProductNotFoundError)('getIMPricesFromIPrices()').toString());
            // create IMPrice
            return Object.assign(Object.assign({}, price), { product: productDoc._id });
        });
        return newPrices;
    });
}
exports.getIMPricesFromIPrices = getIMPricesFromIPrices;
// ===========
// type guards
// ===========
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
        && arg instanceof priceSchema_1.Price;
}
exports.isPriceDoc = isPriceDoc;
