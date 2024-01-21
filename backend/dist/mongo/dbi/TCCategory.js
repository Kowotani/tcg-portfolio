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
exports.insertTCCategories = exports.getTCCategoryDocs = exports.getTCCategoryDoc = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const tccategorySchema_1 = require("../models/tccategorySchema");
// =======
// globals
// =======
const url = 'mongodb://localhost:27017/tcgPortfolio';
// =======
// getters
// =======
/*
DESC
  Retrieves a TCCategory document by TCGCSV categoryId
INPUT
  categoryId: The TCGCSV categoryId
RETURN
  The document if found, else null
*/
function getTCCategoryDoc(categoryId) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const tcgcategoryDoc = yield tccategorySchema_1.TCCategory.findOne({ 'categoryId': categoryId });
            return tcgcategoryDoc;
        }
        catch (err) {
            const errMsg = `An error occurred in getTCCategoryDoc(): ${err}`;
            throw new Error(errMsg);
        }
    });
}
exports.getTCCategoryDoc = getTCCategoryDoc;
/*
DESC
  Returns all TCCategories
INPUT
  categoryId: The TCGCSV categoryId
RETURN
  An ITCCategory[]
*/
function getTCCategoryDocs() {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const docs = yield tccategorySchema_1.TCCategory.find({});
            return docs;
        }
        catch (err) {
            const errMsg = `An error occurred in getTCCategoryDocs(): ${err}`;
            throw new Error(errMsg);
        }
    });
}
exports.getTCCategoryDocs = getTCCategoryDocs;
// =======
// setters
// =======
/*
DESC
  Inserts the input ITCCategory-shaped docs
INPUT
  docs: An ITCCategory[]
RETURN
  The number of documents inserted
*/
function insertTCCategories(docs) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const res = yield tccategorySchema_1.TCCategory.insertMany(docs);
            return res.length;
        }
        catch (err) {
            const errMsg = `An error occurred in insertTCCategories(): ${err}`;
            throw new Error(errMsg);
        }
    });
}
exports.insertTCCategories = insertTCCategories;
