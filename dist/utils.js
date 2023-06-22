"use strict";
// =====
// enums
// =====
Object.defineProperty(exports, "__esModule", { value: true });
exports.TCG = exports.ProductType = exports.ProductSubType = exports.ProductLanguage = void 0;
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
