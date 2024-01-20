"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTCProducts = exports.parseTCGroups = exports.parseTCCategories = void 0;
const common_1 = require("common");
const _ = __importStar(require("lodash"));
// =========
// constants
// =========
const TCCATEGORY_TO_TCG_MAP = new Map([
    ['Flesh & Blood TCG', common_1.TCG.FleshAndBlood],
    ['Lorcana TCG', common_1.TCG.Lorcana],
    ['Magic', common_1.TCG.MagicTheGathering],
    ['MetaZoo', common_1.TCG.MetaZoo],
    ['Pokemon', common_1.TCG.Pokemon],
    ['Sorcery Contested Realm', common_1.TCG.Sorcery]
]);
// --------------
// estimated MSRP
// --------------
// -- Flesh and Blood
const FAB_BOOSTER_BOX_MSRP = 110;
const FAB_FIRST_EDITION_BOOSTER_BOX_MSRP = 100;
const FAB_UNLIMITED_EDITION_BOOSTER_BOX_MSRP = 100;
// -- Lorcana
const LORCANA_BOOSTER_BOX_MSRP = 145;
const LORCANA_ILLUMINEERS_TROVE_MSRP = 50;
// -- Magic the Gathering
const MTG_BUNDLE_MSRP = 40;
const MTG_COLLECTOR_BOOSTER_BOX_MSRP = 250;
const MTG_DRAFT_BOOSTER_BOX_MSRP = 100;
const MTG_PLAY_BOOSTER_BOX_MSRP = 140;
const MTG_SET_BOOSTER_BOX_MSRP = 120;
const MTG_SL_EDH_DECK_MSRP = 150;
const MTG_SL_FOIL_MSRP = 40;
const MTG_SL_NON_FOIL_MSRP = 30;
// -- MetaZoo
const METAZOO_BOOSTER_BOX_MSRP = 190;
// -- Pokemon
const PKM_BOOSTER_BOX_MSRP = 160;
const PKM_BOOSTER_BUNDLE_MSRP = 25;
const PKM_ETB_MSRP = 50;
const PKM_UPC_MSRP = 120;
// -- Sorcery
const SORCERY_BOOSTER_BOX_MSRP = 150;
// --------------
// regex patterns
// --------------
// -- Flesh and Blood
const FAB_BOOSTER_BOX_FORMAT = /Booster Box$/;
const FAB_BOOSTER_BOX_NAME = /.*(?= Booster Box$)/g;
const FAB_FIRST_EDITION_BOOSTER_BOX_FORMAT = /Booster Box \[1st Edition\]$/;
const FAB_FIRST_EDITION_BOOSTER_BOX_NAME = /.*(?= Booster Box \[1st Edition\])$/g;
const FAB_UNLIMITED_EDITION_BOOSTER_BOX_FORMAT = /Booster Box \[Unlimited Edition\]$/;
const FAB_UNLIMITED_EDITION_BOOSTER_BOX_NAME = /.*(?= Booster Box \[Unlimited Edition\]$)/g;
// -- Lorcana
const LORCANA_BOOSTER_BOX_FORMAT = /Booster Box$/;
const LORCANA_BOOSTER_BOX_NAME = /(?<=^Disney Lorcana: ).*(?= Booster Box$)/g;
const LORCANA_ILLUMINEERS_TROVE_FORMAT = /Illumineer's Trove$/g;
const LORCANA_ILLUMINEERS_TROVE_NAME = /(?<=^Disney Lorcana: ).*(?= Illumineer's Trove$)/g;
// -- Magic the Gathering
const MTG_BUNDLE_FORMAT = /Bundle$/g;
const MTG_BUNDLE_NAME = /^.*?(?=( - )+.*Bundle$)/g;
const MTG_COLLECTOR_BOOSTER_BOX_FORMAT = /Collector Booster Display$/g;
const MTG_COLLECTOR_BOOSTER_BOX_NAME = /^.*(?= - Collector Booster Display$)/g;
const MTG_DRAFT_BOOSTER_BOX_FORMAT = /(Draft Booster (Box|Display)$|Booster Box$)/g;
const MTG_DRAFT_BOOSTER_BOX_NAME = /^.*(?= - Draft Booster (Box|Display)$| - Booster Box$)/g;
const MTG_PLAY_BOOSTER_BOX_FORMAT = /Play Booster Display$/g;
const MTG_PLAY_BOOSTER_BOX_NAME = /^.*(?= - Play Booster Display$)/g;
const MTG_SET_BOOSTER_BOX_FORMAT = /^.*(?= - Set Booster Display$)/g;
const MTG_SET_BOOSTER_BOX_NAME = /Set Booster Display$/g;
const MTG_EDH_DECK_SET_FORMAT = /^.*?(?=[ -]* Commander Deck(s? \[Set of \d\]| Case| Display))/;
const MTG_EDH_DECK_SET_NAME = /Commander Deck(s? \[Set of \d\]| Case| Display)/g;
const MTG_SL_FORMAT = /^Secret Lair/g;
const MTG_SL_BUNDLE_FORMAT = /^Secret Lair.*Bundle/g;
const MTG_SL_EDH_DECK_FORMAT = /^Secret Lair Commander Deck:/g;
const MTG_SL_EDH_DECK_NAME = /(?<=^Secret Lair Commander Deck: ).*/g;
const MTG_SL_FOIL_ETCHED_FORMAT = /^Secret Lair Drop:.*(?=Foil Etched)/g;
const MTG_SL_FOIL_ETCHED_NAME = /(?<=^Secret Lair Drop: ).*(?= Foil Etched)/g;
const MTG_SL_FOIL_FORMAT = /^Secret Lair Drop:.*(?=Foil)/g;
const MTG_SL_FOIL_NAME = /(?<=^Secret Lair Drop: ).*(?= Foil)/g;
const MTG_SL_GALAXY_FOIL_FORMAT = /^Secret Lair Drop:.*(?=Galaxy Foil)/g;
const MTG_SL_GALAXY_FOIL_NAME = /(?<=^Secret Lair Drop: ).*(?= Galaxy Foil)/g;
const MTG_SL_GILDED_FOIL_FORMAT = /^Secret Lair Drop:.*(?=Gilded Foil)/g;
const MTG_SL_GILDED_FOIL_NAME = /(?<=^Secret Lair Drop: ).*(?= Gilded Foil)/g;
const MTG_SL_NON_FOIL_FORMAT = /^Secret Lair Drop:.*(?=Non-Foil)/g;
const MTG_SL_NON_FOIL_NAME = /(?<=^Secret Lair Drop: ).*(?= Non-Foil)/g;
const MTG_SL_TEXTURED_FOIL_FORMAT = /^Secret Lair Drop:.*(?=Textured Foil)/g;
const MTG_SL_TEXTURED_FOIL_NAME = /(?<=^Secret Lair Drop: ).*(?= Textured Foil)/g;
// -- MetaZoo
const METAZOO_FIRST_EDITION_BOOSTER_BOX_FORMAT = /First Edition Booster Box$/;
const METAZOO_FIRST_EDITION_BOOSTER_BOX_NAME = /^.*(?=: First Edition Booster Box$)/;
// -- Pokemom
const PKM_CODE_CARD_FORMAT = /^Code Card/;
const PKM_BOOSTER_BOX_FORMAT = /Booster Box$/;
const PKM_BOOSTER_BOX_NAME = /.*(?= Booster Box$)/g;
const PKM_BOOSTER_BUNDLE_FORMAT = /Booster Bundle$/;
const PKM_BOOSTER_BUNDLE_NAME = /.*(?= Booster Bundle$)/g;
const PKM_ETB_FORMAT = /Elite Trainer Box($| \[(?!Set of).*\])/;
const PKM_ETB_SET_NAME = /.*(?= Elite Trainer Box($| \[(?!Set of).*\]))/g;
const PKM_ETB_TYPE_NAME = /(?<=\[).*(?=\]$)/g;
const PKM_UPC_FORMAT = /Ultra-Premium Collection$/;
const PKM_UPC_NAME = /.*(?= Ultra-Premium Collection$)/g;
// -- Sorcery
const SORCERY_BOOSTER_BOX_FORMAT = /Booster Box$/;
const SORCERY_BOOSTER_BOX_NAME = /.*(?= Booster Box$)/g;
// ========
// endpoint
// ========
/*
ENDPOINT
  GET:tcgcsvm.com/categories
DESC
  Parses the input response object from the endpoint and returns an
  ITCCategory[]
INPUT
  response: The response corresponding to the return value
RETURN
  An ITCCategory[]
*/
function parseTCCategories(response) {
    // check if response is Array-shaped
    (0, common_1.assert)(Array.isArray(response), 'Input is not an Array');
    let categories = [];
    // parse each element for a supported TCG
    response.forEach((el) => {
        (0, common_1.assert)((0, common_1.hasTCCategoryKeys)(el), 'Element is not ITCCategory shaped');
        if (TCCATEGORY_TO_TCG_MAP.get(el.name)) {
            categories.push(parseITCCategoryJSON(el));
        }
    });
    return categories;
}
exports.parseTCCategories = parseTCCategories;
/*
ENDPOINT
  GET:tcgcsvm.com/{categoryId}/groups
DESC
  Parses the input response object from the endpoint and returns an
  ITCGroup[]
INPUT
  response: The response corresponding to the return value
RETURN
  An ITCGroup[]
*/
function parseTCGroups(response) {
    // check if response is Array-shaped
    (0, common_1.assert)(Array.isArray(response), 'Input is not an Array');
    // parse each element
    const groups = response.map((el) => {
        return parseITCGroupJSON(el);
    });
    return groups;
}
exports.parseTCGroups = parseTCGroups;
/*
ENDPOINT
  GET:tcgcsvm.com/{categoryId}/{groupId}/products
DESC
  Parses the input response object from the endpoint and returns an
  ITCProduct[]
INPUT
  tcg: A TCG enum
  response: The response corresponding to the return value
RETURN
  An ITCProduct[]
*/
function parseTCProducts(tcg, response) {
    // check if response is Array-shaped
    (0, common_1.assert)(Array.isArray(response), 'Input is not an Array');
    let products = [];
    // parse each element
    response.forEach((el) => {
        const product = parseITCProductJSON(tcg, el);
        if (product)
            products.push(product);
    });
    return products;
}
exports.parseTCProducts = parseTCProducts;
// =======
// helpers
// =======
/*
DESC
  Returns the estimated MSRP of a Product based on the input TCG, ProductType,
  and ProductSubtype
INPUT
  tcg: A TCG enum
  type: A ProductType enum
  subtype?: A Subtype enum, if exists
RETURN
  The estimated MSRP, or null if it doesn't exist
*/
function getProductEstimatedMSRP(tcg, type, subtype) {
    switch (tcg) {
        // ===============
        // Flesh and Blood
        // ===============
        case common_1.TCG.FleshAndBlood:
            // first edition booster box
            if (type === common_1.ProductType.BoosterBox &&
                subtype === common_1.ProductSubtype.FirstEdition) {
                return FAB_FIRST_EDITION_BOOSTER_BOX_MSRP;
                // unlimited edition booster box
            }
            else if (type === common_1.ProductType.BoosterBox &&
                subtype === common_1.ProductSubtype.Unlimited) {
                return FAB_UNLIMITED_EDITION_BOOSTER_BOX_MSRP;
                // 2.0 booster box
            }
            else if (type === common_1.ProductType.BoosterBox &&
                subtype === common_1.ProductSubtype.FABVersionTwo) {
                return FAB_BOOSTER_BOX_MSRP;
            }
            return null;
        // =======
        // Lorcana
        // =======
        case common_1.TCG.Lorcana:
            // booster box
            if (type === common_1.ProductType.BoosterBox) {
                return LORCANA_BOOSTER_BOX_MSRP;
                // illumineer's trove
            }
            else if (type === common_1.ProductType.Bundle &&
                subtype === common_1.ProductSubtype.IllumineersTrove) {
                return LORCANA_ILLUMINEERS_TROVE_MSRP;
            }
            return null;
        // ===================
        // Magic the Gathering
        // ===================
        case common_1.TCG.MagicTheGathering:
            // -- non secret lair
            // collector booster box
            if (type === common_1.ProductType.BoosterBox &&
                subtype === common_1.ProductSubtype.Collector) {
                return MTG_COLLECTOR_BOOSTER_BOX_MSRP;
                // set booster box
            }
            else if (type === common_1.ProductType.BoosterBox &&
                subtype === common_1.ProductSubtype.Set) {
                return MTG_SET_BOOSTER_BOX_MSRP;
                // play booster box
            }
            else if (type === common_1.ProductType.BoosterBox &&
                subtype === common_1.ProductSubtype.Play) {
                return MTG_PLAY_BOOSTER_BOX_MSRP;
                // draft booster box
            }
            else if (type === common_1.ProductType.BoosterBox &&
                subtype === common_1.ProductSubtype.Draft) {
                return MTG_DRAFT_BOOSTER_BOX_MSRP;
                // bundle
            }
            else if (type === common_1.ProductType.Bundle) {
                return MTG_BUNDLE_MSRP;
                // -- secret lair
                // SL commander deck
            }
            else if (type === common_1.ProductType.SecretLair &&
                subtype === common_1.ProductSubtype.CommanderDeck) {
                return MTG_SL_EDH_DECK_MSRP;
                // SL foil (any type)
            }
            else if (type === common_1.ProductType.SecretLair &&
                [
                    common_1.ProductSubtype.Foil,
                    common_1.ProductSubtype.FoilEteched,
                    common_1.ProductSubtype.GalaxyFoil,
                    common_1.ProductSubtype.GildedFoil,
                    common_1.ProductSubtype.TexturedFoil
                ].includes(subtype)) {
                return MTG_SL_FOIL_MSRP;
                // SL non foil
            }
            else if (type === common_1.ProductType.SecretLair &&
                subtype === common_1.ProductSubtype.NonFoil) {
                return MTG_SL_NON_FOIL_MSRP;
            }
            return null;
        // =======
        // MetaZoo
        // =======
        case common_1.TCG.MetaZoo:
            // booster box
            if (type === common_1.ProductType.BoosterBox &&
                subtype === common_1.ProductSubtype.FirstEdition)
                return METAZOO_BOOSTER_BOX_MSRP;
            return null;
        // =======
        // Pokemon
        // =======
        case common_1.TCG.Pokemon:
            // booster box
            if (type === common_1.ProductType.BoosterBox) {
                return PKM_BOOSTER_BOX_MSRP;
                // booster bundle
            }
            else if (type === common_1.ProductType.Bundle &&
                subtype === common_1.ProductSubtype.BoosterBundle) {
                return PKM_BOOSTER_BUNDLE_MSRP;
                // elite trainer box
            }
            else if (type === common_1.ProductType.Bundle &&
                subtype === common_1.ProductSubtype.EliteTrainerBox) {
                return PKM_ETB_MSRP;
                // ultra premium collection
            }
            else if (type === common_1.ProductType.Bundle &&
                subtype === common_1.ProductSubtype.UltraPremiumCollection) {
                return PKM_UPC_MSRP;
            }
            return null;
        // =======
        // Sorcery
        // =======
        case common_1.TCG.Sorcery:
            // booster box
            if (type === common_1.ProductType.BoosterBox)
                return SORCERY_BOOSTER_BOX_MSRP;
            return null;
        default:
            return null;
    }
}
/*
DESC
  Returns an IProductMetadata if the input JSON corresponds to a scrapable
  product for the input TCG
INPUT
  tcg: The TCG of the JSON data
  json: A JSON representation of an ITCProduct
RETURN
  An IProductMetadata if the data should be scraped, otherwise null
*/
function getProductMetadata(tcg, json) {
    switch (tcg) {
        // ===============
        // Flesh and Blood
        // ===============
        case common_1.TCG.FleshAndBlood:
            // 1st edition booster box
            if (FAB_FIRST_EDITION_BOOSTER_BOX_FORMAT.test(json.name)) {
                return {
                    name: _.head(json.name.match(FAB_FIRST_EDITION_BOOSTER_BOX_NAME)),
                    type: common_1.ProductType.BoosterBox,
                    subtype: common_1.ProductSubtype.FirstEdition
                };
                // unlimited booster box
            }
            else if (FAB_UNLIMITED_EDITION_BOOSTER_BOX_FORMAT.test(json.name)) {
                return {
                    name: _.head(json.name.match(FAB_UNLIMITED_EDITION_BOOSTER_BOX_NAME)),
                    type: common_1.ProductType.BoosterBox,
                    subtype: common_1.ProductSubtype.Unlimited
                };
                // 2.0 booster box
            }
            else if (FAB_BOOSTER_BOX_FORMAT.test(json.name)) {
                return {
                    name: _.head(json.name.match(FAB_BOOSTER_BOX_NAME)),
                    type: common_1.ProductType.BoosterBox,
                    subtype: common_1.ProductSubtype.FABVersionTwo
                };
            }
            return null;
        // =======
        // Lorcana
        // =======
        case common_1.TCG.Lorcana:
            // booster box
            if (LORCANA_BOOSTER_BOX_FORMAT.test(json.name)) {
                return {
                    name: _.head(json.name.match(LORCANA_BOOSTER_BOX_NAME)),
                    type: common_1.ProductType.BoosterBox
                };
                // illumineer's trove
            }
            else if (LORCANA_ILLUMINEERS_TROVE_FORMAT.test(json.name)) {
                return {
                    name: _.head(json.name.match(LORCANA_ILLUMINEERS_TROVE_NAME)),
                    type: common_1.ProductType.Bundle,
                    subtype: common_1.ProductSubtype.IllumineersTrove
                };
            }
            return null;
        // ===================
        // Magic the Gathering
        // ===================
        case common_1.TCG.MagicTheGathering:
            // -- secret lairs
            if (MTG_SL_FORMAT.test(json.name)) {
                // -------
                // exclude
                // -------
                if (MTG_SL_BUNDLE_FORMAT.test(json.name))
                    return null;
                // -------
                // include
                // -------
                // SL commander deck
                if (MTG_SL_EDH_DECK_FORMAT.test(json.name)) {
                    return {
                        name: _.head(json.name.match(MTG_SL_EDH_DECK_NAME)),
                        type: common_1.ProductType.SecretLair,
                        subtype: common_1.ProductSubtype.CommanderDeck
                    };
                    // SL non foil
                }
                else if (MTG_SL_NON_FOIL_FORMAT.test(json.name)) {
                    return {
                        name: _.head(json.name.match(MTG_SL_NON_FOIL_NAME)),
                        type: common_1.ProductType.SecretLair,
                        subtype: common_1.ProductSubtype.NonFoil
                    };
                    // SL textured foil
                }
                else if (MTG_SL_TEXTURED_FOIL_FORMAT.test(json.name)) {
                    return {
                        name: _.head(json.name.match(MTG_SL_TEXTURED_FOIL_NAME)),
                        type: common_1.ProductType.SecretLair,
                        subtype: common_1.ProductSubtype.TexturedFoil
                    };
                    // SL galaxy foil
                }
                else if (MTG_SL_GALAXY_FOIL_FORMAT.test(json.name)) {
                    return {
                        name: _.head(json.name.match(MTG_SL_GALAXY_FOIL_NAME)),
                        type: common_1.ProductType.SecretLair,
                        subtype: common_1.ProductSubtype.GalaxyFoil
                    };
                    // SL gilded foil
                }
                else if (MTG_SL_GILDED_FOIL_FORMAT.test(json.name)) {
                    return {
                        name: _.head(json.name.match(MTG_SL_GILDED_FOIL_NAME)),
                        type: common_1.ProductType.SecretLair,
                        subtype: common_1.ProductSubtype.GildedFoil
                    };
                    // SL foil etched
                }
                else if (MTG_SL_FOIL_ETCHED_FORMAT.test(json.name)) {
                    return {
                        name: _.head(json.name.match(MTG_SL_FOIL_ETCHED_NAME)),
                        type: common_1.ProductType.SecretLair,
                        subtype: common_1.ProductSubtype.FoilEteched
                    };
                    // SL foil
                }
                else if (MTG_SL_FOIL_FORMAT.test(json.name)) {
                    return {
                        name: _.head(json.name.match(MTG_SL_FOIL_NAME)),
                        type: common_1.ProductType.SecretLair,
                        subtype: common_1.ProductSubtype.Foil
                    };
                }
                // -- non secret lairs
            }
            else {
                // collector booster box
                if (MTG_COLLECTOR_BOOSTER_BOX_FORMAT.test(json.name)) {
                    return {
                        name: _.head(json.name.match(MTG_COLLECTOR_BOOSTER_BOX_NAME)),
                        type: common_1.ProductType.BoosterBox,
                        subtype: common_1.ProductSubtype.Collector
                    };
                    // play booster box
                }
                else if (MTG_PLAY_BOOSTER_BOX_FORMAT.test(json.name)) {
                    return {
                        name: _.head(json.name.match(MTG_PLAY_BOOSTER_BOX_NAME)),
                        type: common_1.ProductType.BoosterBox,
                        subtype: common_1.ProductSubtype.Play
                    };
                    // set booster box
                }
                else if (MTG_SET_BOOSTER_BOX_FORMAT.test(json.name)) {
                    return {
                        name: _.head(json.name.match(MTG_SET_BOOSTER_BOX_NAME)),
                        type: common_1.ProductType.BoosterBox,
                        subtype: common_1.ProductSubtype.Set
                    };
                    // draft booster box
                }
                else if (MTG_DRAFT_BOOSTER_BOX_FORMAT.test(json.name)) {
                    return {
                        name: _.head(json.name.match(MTG_DRAFT_BOOSTER_BOX_NAME)),
                        type: common_1.ProductType.BoosterBox,
                        subtype: common_1.ProductSubtype.Draft
                    };
                    // commander deck set
                }
                else if (MTG_EDH_DECK_SET_FORMAT.test(json.name)) {
                    return {
                        name: _.head(json.name.match(MTG_EDH_DECK_SET_NAME)),
                        type: common_1.ProductType.CommanderDeckSet,
                    };
                    // bundle
                }
                else if (MTG_BUNDLE_FORMAT.test(json.name)) {
                    return {
                        name: _.head(json.name.match(MTG_BUNDLE_NAME)),
                        type: common_1.ProductType.Bundle,
                    };
                }
            }
            return null;
        // =======
        // MetaZoo
        // =======
        case common_1.TCG.MetaZoo:
            // first edition booster box
            if (METAZOO_FIRST_EDITION_BOOSTER_BOX_FORMAT.test(json.name)) {
                return {
                    name: _.head(json.name.match(METAZOO_FIRST_EDITION_BOOSTER_BOX_NAME)),
                    type: common_1.ProductType.BoosterBox,
                    subtype: common_1.ProductSubtype.FirstEdition
                };
            }
            return null;
        // =======
        // Pokemon
        // =======
        case common_1.TCG.Pokemon:
            // -------
            // exclude
            // -------
            if (PKM_CODE_CARD_FORMAT.test(json.name))
                return null;
            // -------
            // include
            // -------
            // booster box
            if (PKM_BOOSTER_BOX_FORMAT.test(json.name)) {
                return {
                    name: _.head(json.name.match(PKM_BOOSTER_BOX_NAME)),
                    type: common_1.ProductType.BoosterBox
                };
                // booster bundle
            }
            else if (PKM_BOOSTER_BUNDLE_FORMAT.test(json)) {
                return {
                    name: _.head(json.name.match(PKM_BOOSTER_BUNDLE_NAME)),
                    type: common_1.ProductType.Bundle,
                    subtype: common_1.ProductSubtype.BoosterBundle
                };
                // elite trainer box
            }
            else if (PKM_ETB_FORMAT.test(json.name)) {
                const setName = _.head(json.name.match(PKM_ETB_SET_NAME));
                const typeName = _.head(json.name.match(PKM_ETB_TYPE_NAME));
                return {
                    name: typeName ? `${setName} [${typeName}]` : `${setName}`,
                    type: common_1.ProductType.Bundle,
                    subtype: common_1.ProductSubtype.EliteTrainerBox
                };
                // ultra premium collection
            }
            else if (PKM_UPC_FORMAT.test(json.name)) {
                return {
                    name: _.head(json.name.match(PKM_UPC_NAME)),
                    type: common_1.ProductType.Bundle,
                    subtype: common_1.ProductSubtype.UltraPremiumCollection
                };
            }
            return null;
        // =======
        // Sorcery
        // =======
        case common_1.TCG.Sorcery:
            // booster box
            if (SORCERY_BOOSTER_BOX_FORMAT.test(json.name)) {
                return {
                    name: _.head(json.name.match(SORCERY_BOOSTER_BOX_NAME)),
                    type: common_1.ProductType.BoosterBox
                };
            }
            return null;
        default:
            return null;
    }
}
// =======
// parsers
// =======
/*
DESC
  Returns an ITCCategory after parsing the input json
INPUT
  json: A JSON representation of an ITCCategory
RETURN
  An ITCCategory
*/
function parseITCCategoryJSON(json) {
    // verify keys exist
    (0, common_1.assert)((0, common_1.hasTCCategoryKeys)(json), 'JSON is not ITCCategory shaped');
    // parse json
    const obj = {
        categoryId: json.categoryId,
        name: json.name,
        displayName: json.displayName,
        tcg: TCCATEGORY_TO_TCG_MAP.get(json.name)
    };
    (0, common_1.assert)((0, common_1.isITCCategory)(obj), 'Object is not an ITCCategory');
    return obj;
}
/*
DESC
  Returns an ITCGroup after parsing the input json
INPUT
  json: A JSON representation of an ITCGroup
RETURN
  An ITCGroup
*/
function parseITCGroupJSON(json) {
    // verify keys exist
    (0, common_1.assert)((0, common_1.hasITCGroupKeys)(json), 'JSON is not ITCGroup shaped');
    // parse json
    const obj = {
        groupId: json.groupId,
        categoryId: json.categoryId,
        name: json.name
    };
    if (json.abbreviation && json.abbreviation.length) {
        obj['abbreviation'] = json.abbreviation;
    }
    if (json.publishedOn && json.publishedOn.length) {
        const publishedOnDate = (0, common_1.getDateFromJSON)(json.publishedOn);
        obj['publishedOn'] = publishedOnDate;
    }
    (0, common_1.assert)((0, common_1.isITCGroup)(obj), 'Object is not an ITCGroup');
    return obj;
}
/*
DESC
  Returns an ITCProduct after parsing the input json, or null if the product
  should not be parsed
INPUT
  json: A JSON representation of an ITCProduct
RETURN
  An ITCProduct, or null if the product should not be parsed
*/
function parseITCProductJSON(tcg, json) {
    var _a;
    // verify keys exist
    (0, common_1.assert)((0, common_1.hasITCProductKeys)(json), 'JSON is not ITCProduct shaped');
    // get product metadata
    const metadata = getProductMetadata(tcg, json);
    // product should be parsed
    if (metadata) {
        const obj = {
            tcgplayerId: json.productId,
            groupId: json.groupId,
            categoryId: json.categoryId,
            tcg: tcg,
            releaseDate: (0, common_1.getDateFromJSON)(json.publishedOn),
            name: metadata.name,
            type: metadata.type,
            language: common_1.ProductLanguage.English,
            msrp: (_a = getProductEstimatedMSRP(tcg, metadata.type, metadata.subtype)) !== null && _a !== void 0 ? _a : 0,
            status: common_1.ParsingStatus.ToBeValidated
        };
        if (metadata.subtype)
            obj['subtype'] = metadata.subtype;
        (0, common_1.assert)((0, common_1.isITCProduct)(obj), 'Object is not an ITCProduct');
        return obj;
    }
    return null;
}
