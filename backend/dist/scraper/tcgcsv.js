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
exports.getParsedTCGroups = exports.getParsedTCCategories = void 0;
const axios_1 = __importDefault(require("axios"));
const api_1 = require("../utils/api");
// =========
// constants
// =========
const URL_BASE = 'https://tcgcsv.com';
// =========
// functions
// =========
// -- ITCCategory
/*
DESC
  Returns an ITCCategory[] of all scraped Categories
RETURN
  An ITCCategory[]
*/
function getParsedTCCategories() {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${URL_BASE}/categories`;
        const res = yield (0, axios_1.default)({
            method: 'get',
            url: url,
        });
        return (0, api_1.parseTCCategories)(res.data.results);
    });
}
exports.getParsedTCCategories = getParsedTCCategories;
// -- ITCGroup
/*
DESC
  Returns an ITCGroup[] of scraped Groups for the input categoryId
INPUT
  categoryId: The categoryId to scrape
RETURN
  An ITCGroup[]
*/
function getParsedTCGroups(categoryId) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${URL_BASE}/${categoryId}/groups`;
        const res = yield (0, axios_1.default)({
            method: 'get',
            url: url,
        });
        return (0, api_1.parseTCGroups)(res.data.results);
    });
}
exports.getParsedTCGroups = getParsedTCGroups;
