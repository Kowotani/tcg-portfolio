"use strict";
var _a, _b, _c;
exports.__esModule = true;
exports.isTCGPriceTypeValue = exports.isPriceString = exports.isNumeric = exports.getProductSubtypes = exports.getPriceFromString = exports.TCGToProductSubtype = exports.ProductTypeToProductSubtype = exports.TCGToProductType = exports.TCGPriceType = exports.TCG = exports.ProductType = exports.ProductSubType = exports.ProductLanguage = exports.TimeseriesGranularity = void 0;
var _ = require("lodash");
// =====
// enums
// =====
// -- mongodb
var TimeseriesGranularity;
(function (TimeseriesGranularity) {
    TimeseriesGranularity["Seconds"] = "seconds";
    TimeseriesGranularity["Minutes"] = "minutes";
    TimeseriesGranularity["Hours"] = "hours";
})(TimeseriesGranularity = exports.TimeseriesGranularity || (exports.TimeseriesGranularity = {}));
;
// -- product features
// product language
var ProductLanguage;
(function (ProductLanguage) {
    ProductLanguage["English"] = "ENG";
    ProductLanguage["Japanese"] = "JPN";
})(ProductLanguage = exports.ProductLanguage || (exports.ProductLanguage = {}));
;
// product subtype
var ProductSubType;
(function (ProductSubType) {
    ProductSubType["Collector"] = "Collector";
    ProductSubType["Draft"] = "Draft";
    ProductSubType["FirstEdition"] = "1st Edition";
    ProductSubType["SecondEdition"] = "2nd Edition";
    ProductSubType["Set"] = "Set";
    ProductSubType["Unlimited"] = "Unlimited";
})(ProductSubType = exports.ProductSubType || (exports.ProductSubType = {}));
;
// product type
var ProductType;
(function (ProductType) {
    ProductType["BoosterBox"] = "Booster Box";
    ProductType["Bundle"] = "Bundle";
    ProductType["CommanderDeck"] = "Commander Deck";
    ProductType["CommanderDeckSet"] = "Commander Deck Set";
    ProductType["EliteTrainerBox"] = "Elite Trainer Box";
    ProductType["SecretLair"] = "Secret Lair";
    ProductType["UltraPremiumCollection"] = "Ultra Premium Collection";
})(ProductType = exports.ProductType || (exports.ProductType = {}));
;
// TCG
var TCG;
(function (TCG) {
    TCG["FleshAndBlood"] = "Flesh and Blood";
    TCG["MagicTheGathering"] = "Magic: The Gathering";
    TCG["MetaZoo"] = "MetaZoo";
    TCG["Pokemon"] = "Pokemon";
    TCG["Sorcery"] = "Sorcery";
})(TCG = exports.TCG || (exports.TCG = {}));
;
// -- scraper 
// TCG price types
var TCGPriceType;
(function (TCGPriceType) {
    TCGPriceType["MarketPrice"] = "Market Price";
    TCGPriceType["BuylistMarketPrice"] = "Buylist Market Price";
    TCGPriceType["ListedMedianPrice"] = "Listed Median Price";
})(TCGPriceType = exports.TCGPriceType || (exports.TCGPriceType = {}));
// ====================
// relationship objects
// ====================
// https://stackoverflow.com/questions/44243060/use-enum-as-restricted-key-type-in-typescript
// TCG -> product type
exports.TCGToProductType = (_a = {},
    // FAB
    _a[TCG.FleshAndBlood] = [
        ProductType.BoosterBox,
    ],
    // MTG
    _a[TCG.MagicTheGathering] = [
        ProductType.BoosterBox,
        ProductType.Bundle,
        ProductType.CommanderDeck,
        ProductType.CommanderDeckSet,
        ProductType.SecretLair,
    ],
    // Metazoo
    _a[TCG.MetaZoo] = [
        ProductType.BoosterBox,
    ],
    // Pokemon
    _a[TCG.Pokemon] = [
        ProductType.BoosterBox,
        ProductType.Bundle,
        ProductType.UltraPremiumCollection,
    ],
    // Sorcery
    _a[TCG.Sorcery] = [
        ProductType.BoosterBox
    ],
    _a);
// product type -> product subtype
exports.ProductTypeToProductSubtype = (_b = {},
    // Booster box
    _b[ProductType.BoosterBox] = [
        ProductSubType.Collector,
        ProductSubType.Draft,
        ProductSubType.FirstEdition,
        ProductSubType.SecondEdition,
        ProductSubType.Set,
        ProductSubType.Unlimited,
    ],
    _b);
// TCG -> product subtype
exports.TCGToProductSubtype = (_c = {},
    // FAB
    _c[TCG.FleshAndBlood] = [
        ProductSubType.FirstEdition,
        ProductSubType.Unlimited,
    ],
    // MTG
    _c[TCG.MagicTheGathering] = [
        ProductSubType.Collector,
        ProductSubType.Draft,
        ProductSubType.Set,
    ],
    // Metazoo
    _c[TCG.MetaZoo] = [
        ProductSubType.FirstEdition,
        ProductSubType.SecondEdition,
    ],
    _c);
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
    Returns an array of valid ProductSubtypes for the given TCG and ProductType
INPUT
    tcg: A TCG enum
    productType: A ProductType enum
RETURN
    An array of ProductSubtypes for the given TCG and ProductType
*/
function getProductSubtypes(tcg, productType) {
    var tcgArray = exports.TCGToProductSubtype[tcg];
    var productTypeArray = exports.ProductTypeToProductSubtype[productType];
    return _.intersection(tcgArray, productTypeArray);
}
exports.getProductSubtypes = getProductSubtypes;
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
    var regexp = new RegExp('^\\$\\d+\\.\\d{2}$');
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
    var arr = Object.values(TCGPriceType).map(function (v) { return v.toString(); });
    return arr.includes(value);
}
exports.isTCGPriceTypeValue = isTCGPriceTypeValue;
