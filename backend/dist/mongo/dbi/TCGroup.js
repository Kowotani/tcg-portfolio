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
exports.insertTCGroups = exports.getTCGroupDocs = exports.getTCGroupDoc = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const tcgroupSchema_1 = require("../models/tcgroupSchema");
// =======
// globals
// =======
const url = 'mongodb://localhost:27017/tcgPortfolio';
// =======
// getters
// =======
/*
DESC
  Retrieves a TCGroup document by TCGCSV groupId
INPUT
  groupId: The TCGCSV groupId
RETURN
  The document if found, else null
*/
function getTCGroupDoc(groupId) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const tcgroupDoc = yield tcgroupSchema_1.TCGroup.findOne({ 'groupId': groupId });
            return tcgroupDoc;
        }
        catch (err) {
            const errMsg = `An error occurred in getTCGroupDoc(): ${err}`;
            throw new Error(errMsg);
        }
    });
}
exports.getTCGroupDoc = getTCGroupDoc;
/*
DESC
  Returns all TCGroups
RETURN
  An ITCGroup[]
*/
function getTCGroupDocs() {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const docs = yield tcgroupSchema_1.TCGroup.find({});
            return docs;
        }
        catch (err) {
            const errMsg = `An error occurred in getTCGroupDocs(): ${err}`;
            throw new Error(errMsg);
        }
    });
}
exports.getTCGroupDocs = getTCGroupDocs;
// =======
// setters
// =======
/*
DESC
  Inserts the input ITCGroup-shaped docs
INPUT
  docs: An ITCGroup[]
RETURN
  The number of documents inserted
*/
function insertTCGroups(docs) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const res = yield tcgroupSchema_1.TCGroup.insertMany(docs);
            return res.length;
        }
        catch (err) {
            const errMsg = `An error occurred in insertTCGroups(): ${err}`;
            throw new Error(errMsg);
        }
    });
}
exports.insertTCGroups = insertTCGroups;
