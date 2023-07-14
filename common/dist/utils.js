"use strict";
var _a, _b, _c;
exports.__esModule = true;
exports.sortFnDateDesc = exports.sortFnDateAsc = exports.isTCGPriceTypeValue = exports.isPriceString = exports.isNumeric = exports.isASCII = exports.getProductSubtypes = exports.getPriceFromString = exports.TCGToProductSubtype = exports.ProductTypeToProductSubtype = exports.TCGToProductType = exports.TransactionType = exports.TCGPriceType = exports.TCG = exports.ProductType = exports.ProductSubtype = exports.ProductLanguage = exports.TimeseriesGranularity = exports.ProductPostStatus = void 0;
var _ = require("lodash");
// =====
// enums
// =====
// -- FE / BE api
// POST to /product status
var ProductPostStatus;
(function (ProductPostStatus) {
    ProductPostStatus["Added"] = "tcgplayerId added";
    ProductPostStatus["AddedWithoutImage"] = "tcgplayerId added (without image)";
    ProductPostStatus["AlreadyExists"] = "tcgplayerId already exists";
})(ProductPostStatus = exports.ProductPostStatus || (exports.ProductPostStatus = {}));
// -- mongodb
// timeseries granularity
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
var ProductSubtype;
(function (ProductSubtype) {
    ProductSubtype["Collector"] = "Collector";
    ProductSubtype["CommanderDeck"] = "Commander Deck";
    ProductSubtype["Draft"] = "Draft";
    ProductSubtype["EliteTrainerBox"] = "Elite Trainer Box";
    ProductSubtype["FABVersionTwo"] = "2.0";
    ProductSubtype["FirstEdition"] = "1st Edition";
    ProductSubtype["Foil"] = "Foil";
    ProductSubtype["FoilEteched"] = "Foil Etched";
    ProductSubtype["NonFoil"] = "Non-Foil";
    ProductSubtype["SecondEdition"] = "2nd Edition";
    ProductSubtype["Set"] = "Set";
    ProductSubtype["TexturedFoil"] = "Textured Foil";
    ProductSubtype["UltraPremiumCollection"] = "Ultra Premium Collection";
    ProductSubtype["Unlimited"] = "Unlimited";
})(ProductSubtype = exports.ProductSubtype || (exports.ProductSubtype = {}));
;
// product type
var ProductType;
(function (ProductType) {
    ProductType["BoosterBox"] = "Booster Box";
    ProductType["Bundle"] = "Bundle";
    ProductType["CommanderDeck"] = "Commander Deck";
    ProductType["CommanderDeckSet"] = "Commander Deck Set";
    ProductType["SecretLair"] = "Secret Lair";
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
// -- portfolio
// transaction type
var TransactionType;
(function (TransactionType) {
    TransactionType["Purchase"] = "Purchase";
    TransactionType["Sale"] = "Sale";
})(TransactionType = exports.TransactionType || (exports.TransactionType = {}));
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
        ProductSubtype.Collector,
        ProductSubtype.Draft,
        ProductSubtype.FABVersionTwo,
        ProductSubtype.FirstEdition,
        ProductSubtype.SecondEdition,
        ProductSubtype.Set,
        ProductSubtype.Unlimited,
    ],
    // Bundle 
    _b[ProductType.Bundle] = [
        ProductSubtype.EliteTrainerBox,
        ProductSubtype.UltraPremiumCollection
    ],
    // Secret Lair
    _b[ProductType.SecretLair] = [
        ProductSubtype.CommanderDeck,
        ProductSubtype.Foil,
        ProductSubtype.FoilEteched,
        ProductSubtype.NonFoil,
        ProductSubtype.TexturedFoil,
    ],
    _b);
// TCG -> product subtype
exports.TCGToProductSubtype = (_c = {},
    // FAB
    _c[TCG.FleshAndBlood] = [
        ProductSubtype.FABVersionTwo,
        ProductSubtype.FirstEdition,
        ProductSubtype.Unlimited,
    ],
    // MTG
    _c[TCG.MagicTheGathering] = [
        ProductSubtype.Collector,
        ProductSubtype.CommanderDeck,
        ProductSubtype.Draft,
        ProductSubtype.Foil,
        ProductSubtype.FoilEteched,
        ProductSubtype.NonFoil,
        ProductSubtype.Set,
        ProductSubtype.TexturedFoil,
    ],
    // Metazoo
    _c[TCG.MetaZoo] = [
        ProductSubtype.FirstEdition,
        ProductSubtype.SecondEdition,
    ],
    // Pokemon
    _c[TCG.Pokemon] = [
        ProductSubtype.EliteTrainerBox,
        ProductSubtype.UltraPremiumCollection,
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
    Returns whether the input string contains only ASCII characters
INPUT
    A string to check
RETURN
    TRUE if the input contains only ASCII characters, FALSE otherwise
*/
function isASCII(value) {
    return /^[\x00-\x7F]*$/.test(value);
    ;
}
exports.isASCII = isASCII;
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
/*
DESC
    Function used for sorting dates in ascending order
INPUT
    a: The first Date
    b: The second Date
RETURN
    A negative number if a < b, otherwise a positive number if a > b
*/
function sortFnDateAsc(a, b) {
    return a.getTime() - b.getTime();
}
exports.sortFnDateAsc = sortFnDateAsc;
/*
DESC
    Function used for sorting dates in descending order
INPUT
    a: The first Date
    b: The second Date
RETURN
    A negative number if a > b, otherwise a positive number if a < b
*/
function sortFnDateDesc(a, b) {
    return b.getTime() - a.getTime();
}
exports.sortFnDateDesc = sortFnDateDesc;
