"use strict";
// =====
// enums
// =====
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTCGPriceTypeValue = exports.isPriceString = exports.isNumeric = exports.getPriceFromString = exports.TCGPriceType = exports.TCG = exports.ProductType = exports.ProductSubType = exports.ProductLanguage = exports.TimeseriesGranularity = void 0;
// -- mongodb
var TimeseriesGranularity;
(function (TimeseriesGranularity) {
    TimeseriesGranularity["Seconds"] = "seconds";
    TimeseriesGranularity["Minutes"] = "minutes";
    TimeseriesGranularity["Hours"] = "hours";
})(TimeseriesGranularity || (exports.TimeseriesGranularity = TimeseriesGranularity = {}));
;
// -- product features
// product language
var ProductLanguage;
(function (ProductLanguage) {
    ProductLanguage["English"] = "ENG";
    ProductLanguage["Japanese"] = "JPN";
})(ProductLanguage || (exports.ProductLanguage = ProductLanguage = {}));
;
// product subtype
var ProductSubType;
(function (ProductSubType) {
    ProductSubType["Collector"] = "Collector";
    ProductSubType["Draft"] = "Draft";
    ProductSubType["FirstEdition"] = "1st Edition";
    ProductSubType["Unlimited"] = "Unlimited";
    ProductSubType["Set"] = "Set";
})(ProductSubType || (exports.ProductSubType = ProductSubType = {}));
;
// product type
var ProductType;
(function (ProductType) {
    ProductType["BoosterBox"] = "Booster Box";
    ProductType["Bundle"] = "Bundle";
    ProductType["CommanderDeck"] = "Commander Deck";
    ProductType["EliteTrainerBox"] = "Elite Trainer Box";
    ProductType["SecretLair"] = "Secret Lair";
})(ProductType || (exports.ProductType = ProductType = {}));
;
// TCG
var TCG;
(function (TCG) {
    TCG["FleshAndBlood"] = "Flesh and Blood";
    TCG["MagicTheGathering"] = "Magic: The Gathering";
    TCG["MetaZoo"] = "MetaZoo";
    TCG["Pokemon"] = "Pokemon";
    TCG["Sorcery"] = "Sorcery";
})(TCG || (exports.TCG = TCG = {}));
;
// -- scraper 
// TCG price types
var TCGPriceType;
(function (TCGPriceType) {
    TCGPriceType["MarketPrice"] = "Market Price";
    TCGPriceType["BuylistMarketPrice"] = "Buylist Market Price";
    TCGPriceType["ListedMedianPrice"] = "Listed Median Price";
})(TCGPriceType || (exports.TCGPriceType = TCGPriceType = {}));
// =========
// functions
// =========
/*
DESC
    Converts a price string (determined by isPriceString()) to a number
INPUT
    A string to convert
RETURN
    The extracted price as a number from the string (eg. '$123.45' => 123.45)
    Will return NaN if the input is not a price string
*/
function getPriceFromString(value) {
    return isPriceString(value)
        ? parseFloat(value.substring(1))
        : NaN;
}
exports.getPriceFromString = getPriceFromString;
/*
DESC
    Returns whether the input is a number
INPUT
    A value to check
RETURN
    TRUE if the input is a number, FALSE otherwise
*/
function isNumeric(value) {
    return !isNaN(value);
}
exports.isNumeric = isNumeric;
/*
DESC
    Returns whether the input is a valid price string
INPUT
    A string to check
RETURN
    TRUE if the input follows the following regex (which roughtly corresponds
        to numbers like $123.45), FALSE otherwise
    regex = ^\$\d+\.\d{2}$
*/
function isPriceString(value) {
    const regexp = new RegExp('^\\$\\d+\\.\\d{2}$');
    return regexp.test(value);
}
exports.isPriceString = isPriceString;
/*
DESC
    Returns whether the input string matches a TCGPriceType value
INPUT
    A string to check
RETURN
    TRUE if the input matches a TCGPriceType value
*/
function isTCGPriceTypeValue(value) {
    const arr = Object.values(TCGPriceType).map(v => v.toString());
    return arr.includes(value);
}
exports.isTCGPriceTypeValue = isTCGPriceTypeValue;
