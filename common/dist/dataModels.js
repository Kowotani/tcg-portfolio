"use strict";
// =====
// enums
// =====
var _a, _b, _c;
exports.__esModule = true;
exports.TCGToProductSubtype = exports.ProductTypeToProductSubtype = exports.TCGToProductType = exports.TransactionType = exports.TCGPriceType = exports.ParsingStatus = exports.TCG = exports.ProductType = exports.ProductSubtype = exports.ProductLanguage = exports.PerformanceMetric = exports.TimeseriesGranularity = void 0;
// -- mongodb
// timeseries granularity
var TimeseriesGranularity;
(function (TimeseriesGranularity) {
    TimeseriesGranularity["Seconds"] = "seconds";
    TimeseriesGranularity["Minutes"] = "minutes";
    TimeseriesGranularity["Hours"] = "hours";
})(TimeseriesGranularity = exports.TimeseriesGranularity || (exports.TimeseriesGranularity = {}));
// -- performance metric
var PerformanceMetric;
(function (PerformanceMetric) {
    PerformanceMetric["CumPnL"] = "Cumulative Profit and Loss";
    PerformanceMetric["DailyPnL"] = "Daily Profit and Loss";
    PerformanceMetric["MarketValue"] = "Market Value";
    PerformanceMetric["TotalCost"] = "Total Cost";
})(PerformanceMetric = exports.PerformanceMetric || (exports.PerformanceMetric = {}));
// -- product features
// product language
var ProductLanguage;
(function (ProductLanguage) {
    ProductLanguage["English"] = "ENG";
    ProductLanguage["Japanese"] = "JPN";
})(ProductLanguage = exports.ProductLanguage || (exports.ProductLanguage = {}));
// product subtype
var ProductSubtype;
(function (ProductSubtype) {
    ProductSubtype["BoosterBundle"] = "Booster Bundle";
    ProductSubtype["Collector"] = "Collector";
    ProductSubtype["CommanderDeck"] = "Commander Deck";
    ProductSubtype["Draft"] = "Draft";
    ProductSubtype["EliteTrainerBox"] = "Elite Trainer Box";
    ProductSubtype["FABVersionTwo"] = "2.0";
    ProductSubtype["FirstEdition"] = "1st Edition";
    ProductSubtype["Foil"] = "Foil";
    ProductSubtype["GalaxyFoil"] = "Galaxy Foil";
    ProductSubtype["GildedFoil"] = "Gilded Foil";
    ProductSubtype["FoilEteched"] = "Foil Etched";
    ProductSubtype["NonFoil"] = "Non-Foil";
    ProductSubtype["Play"] = "Play";
    ProductSubtype["SecondEdition"] = "2nd Edition";
    ProductSubtype["Set"] = "Set";
    ProductSubtype["TexturedFoil"] = "Textured Foil";
    ProductSubtype["UltraPremiumCollection"] = "Ultra Premium Collection";
    ProductSubtype["Unlimited"] = "Unlimited";
})(ProductSubtype = exports.ProductSubtype || (exports.ProductSubtype = {}));
// product type
var ProductType;
(function (ProductType) {
    ProductType["BoosterBox"] = "Booster Box";
    ProductType["Bundle"] = "Bundle";
    ProductType["CommanderDeck"] = "Commander Deck";
    ProductType["CommanderDeckSet"] = "Commander Deck Set";
    ProductType["SecretLair"] = "Secret Lair";
})(ProductType = exports.ProductType || (exports.ProductType = {}));
// TCG
var TCG;
(function (TCG) {
    TCG["FleshAndBlood"] = "Flesh and Blood";
    TCG["Lorcana"] = "Lorcana";
    TCG["MagicTheGathering"] = "Magic: The Gathering";
    TCG["MetaZoo"] = "MetaZoo";
    TCG["Pokemon"] = "Pokemon";
    TCG["Sorcery"] = "Sorcery";
})(TCG = exports.TCG || (exports.TCG = {}));
// TCGCSV parsing status
var ParsingStatus;
(function (ParsingStatus) {
    ParsingStatus["ToBeValidated"] = "To be Validated";
    ParsingStatus["Validated"] = "Validated";
})(ParsingStatus = exports.ParsingStatus || (exports.ParsingStatus = {}));
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
    // Lorcana
    _a[TCG.Lorcana] = [
        ProductType.BoosterBox
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
        ProductSubtype.Play,
        ProductSubtype.SecondEdition,
        ProductSubtype.Set,
        ProductSubtype.Unlimited,
    ],
    // Bundle 
    _b[ProductType.Bundle] = [
        ProductSubtype.BoosterBundle,
        ProductSubtype.EliteTrainerBox,
        ProductSubtype.UltraPremiumCollection,
    ],
    // Secret Lair
    _b[ProductType.SecretLair] = [
        ProductSubtype.CommanderDeck,
        ProductSubtype.Foil,
        ProductSubtype.FoilEteched,
        ProductSubtype.GalaxyFoil,
        ProductSubtype.GildedFoil,
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
    // Lorcana
    // MTG
    _c[TCG.MagicTheGathering] = [
        ProductSubtype.Collector,
        ProductSubtype.CommanderDeck,
        ProductSubtype.Draft,
        ProductSubtype.Foil,
        ProductSubtype.FoilEteched,
        ProductSubtype.GalaxyFoil,
        ProductSubtype.GildedFoil,
        ProductSubtype.NonFoil,
        ProductSubtype.Play,
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
        ProductSubtype.BoosterBundle,
        ProductSubtype.EliteTrainerBox,
        ProductSubtype.UltraPremiumCollection,
    ],
    _c);
