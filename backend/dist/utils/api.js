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
const tcgcsv_1 = require("./tcgcsv");
const _ = __importStar(require("lodash"));
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
        if (tcgcsv_1.TCCATEGORYNAME_TO_TCG_MAP.get(el.name))
            categories.push(parseITCCategoryJSON(el));
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
  ITCProduct[], using the input tcg and group for supplemental data
INPUT
  tcg: A TCG enum
  group: An ITCGroup
  response: The response corresponding to the return value
RETURN
  An ITCProduct[]
*/
function parseTCProducts(tcg, group, response) {
    // check if response is Array-shaped
    (0, common_1.assert)(Array.isArray(response), 'Input is not an Array');
    let products = [];
    // parse each element
    response.forEach((el) => {
        const product = parseITCProductJSON(tcg, group, el);
        if (product) {
            // append if name was properly parsed
            if (product.name && product.name.length) {
                products.push(product);
                // log error message
            }
            else {
                const msg = `Error parsing name for tcgplayerId: ${product.tcgplayerId}`;
                console.log(msg);
            }
        }
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
                return tcgcsv_1.FAB_FIRST_EDITION_BOOSTER_BOX_MSRP;
                // unlimited edition booster box
            }
            else if (type === common_1.ProductType.BoosterBox &&
                subtype === common_1.ProductSubtype.Unlimited) {
                return tcgcsv_1.FAB_UNLIMITED_EDITION_BOOSTER_BOX_MSRP;
                // 2.0 booster box
            }
            else if (type === common_1.ProductType.BoosterBox &&
                subtype === common_1.ProductSubtype.FABVersionTwo) {
                return tcgcsv_1.FAB_BOOSTER_BOX_MSRP;
            }
            return null;
        // =======
        // Lorcana
        // =======
        case common_1.TCG.Lorcana:
            // booster box
            if (type === common_1.ProductType.BoosterBox) {
                return tcgcsv_1.LORCANA_BOOSTER_BOX_MSRP;
                // illumineer's trove
            }
            else if (type === common_1.ProductType.Bundle &&
                subtype === common_1.ProductSubtype.IllumineersTrove) {
                return tcgcsv_1.LORCANA_ILLUMINEERS_TROVE_MSRP;
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
                return tcgcsv_1.MTG_COLLECTOR_BOOSTER_BOX_MSRP;
                // set booster box
            }
            else if (type === common_1.ProductType.BoosterBox &&
                subtype === common_1.ProductSubtype.Set) {
                return tcgcsv_1.MTG_SET_BOOSTER_BOX_MSRP;
                // play booster box
            }
            else if (type === common_1.ProductType.BoosterBox &&
                subtype === common_1.ProductSubtype.Play) {
                return tcgcsv_1.MTG_PLAY_BOOSTER_BOX_MSRP;
                // draft booster box
            }
            else if (type === common_1.ProductType.BoosterBox &&
                subtype === common_1.ProductSubtype.Draft) {
                return tcgcsv_1.MTG_DRAFT_BOOSTER_BOX_MSRP;
                // bundle
            }
            else if (type === common_1.ProductType.Bundle) {
                return tcgcsv_1.MTG_BUNDLE_MSRP;
                // -- secret lair
                // SL commander deck
            }
            else if (type === common_1.ProductType.SecretLair &&
                subtype === common_1.ProductSubtype.CommanderDeck) {
                return tcgcsv_1.MTG_SL_EDH_DECK_MSRP;
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
                return tcgcsv_1.MTG_SL_FOIL_MSRP;
                // SL non foil
            }
            else if (type === common_1.ProductType.SecretLair &&
                subtype === common_1.ProductSubtype.NonFoil) {
                return tcgcsv_1.MTG_SL_NON_FOIL_MSRP;
            }
            return null;
        // =======
        // MetaZoo
        // =======
        case common_1.TCG.MetaZoo:
            // booster box
            if (type === common_1.ProductType.BoosterBox &&
                subtype === common_1.ProductSubtype.FirstEdition)
                return tcgcsv_1.METAZOO_FIRST_EDITION_BOOSTER_BOX_MSRP;
            return null;
        // =======
        // Pokemon
        // =======
        case common_1.TCG.Pokemon:
            // booster box
            if (type === common_1.ProductType.BoosterBox) {
                return tcgcsv_1.PKM_BOOSTER_BOX_MSRP;
                // booster bundle
            }
            else if (type === common_1.ProductType.Bundle &&
                subtype === common_1.ProductSubtype.BoosterBundle) {
                return tcgcsv_1.PKM_BOOSTER_BUNDLE_MSRP;
                // elite trainer box
            }
            else if (type === common_1.ProductType.Bundle &&
                subtype === common_1.ProductSubtype.EliteTrainerBox) {
                return tcgcsv_1.PKM_ETB_MSRP;
                // ultra premium collection
            }
            else if (type === common_1.ProductType.Bundle &&
                subtype === common_1.ProductSubtype.UltraPremiumCollection) {
                return tcgcsv_1.PKM_UPC_MSRP;
            }
            return null;
        // =======
        // Sorcery
        // =======
        case common_1.TCG.Sorcery:
            // booster box
            if (type === common_1.ProductType.BoosterBox)
                return tcgcsv_1.SORCERY_BOOSTER_BOX_MSRP;
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
            if (tcgcsv_1.FAB_FIRST_EDITION_BOOSTER_BOX_FORMAT.test(json.name)) {
                return {
                    name: _.head(json.name.match(tcgcsv_1.FAB_FIRST_EDITION_BOOSTER_BOX_NAME)),
                    type: common_1.ProductType.BoosterBox,
                    subtype: common_1.ProductSubtype.FirstEdition
                };
                // unlimited booster box
            }
            else if (tcgcsv_1.FAB_UNLIMITED_EDITION_BOOSTER_BOX_FORMAT.test(json.name)) {
                return {
                    name: _.head(json.name.match(tcgcsv_1.FAB_UNLIMITED_EDITION_BOOSTER_BOX_NAME)),
                    type: common_1.ProductType.BoosterBox,
                    subtype: common_1.ProductSubtype.Unlimited
                };
                // 2.0 booster box
            }
            else if (tcgcsv_1.FAB_BOOSTER_BOX_FORMAT.test(json.name)) {
                return {
                    name: _.head(json.name.match(tcgcsv_1.FAB_BOOSTER_BOX_NAME)),
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
            if (tcgcsv_1.LORCANA_BOOSTER_BOX_FORMAT.test(json.name)) {
                return {
                    name: _.head(json.name.match(tcgcsv_1.LORCANA_BOOSTER_BOX_NAME)),
                    type: common_1.ProductType.BoosterBox
                };
                // illumineer's trove
            }
            else if (tcgcsv_1.LORCANA_ILLUMINEERS_TROVE_FORMAT.test(json.name)) {
                return {
                    name: _.head(json.name.match(tcgcsv_1.LORCANA_ILLUMINEERS_TROVE_NAME)),
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
            if (tcgcsv_1.MTG_SL_FORMAT.test(json.name)) {
                // -------
                // exclude
                // -------
                if (tcgcsv_1.MTG_SL_BUNDLE_FORMAT.test(json.name))
                    return null;
                // -------
                // include
                // -------
                // SL commander deck
                if (tcgcsv_1.MTG_SL_EDH_DECK_FORMAT.test(json.name)) {
                    return {
                        name: _.head(json.name.match(tcgcsv_1.MTG_SL_EDH_DECK_NAME)),
                        type: common_1.ProductType.SecretLair,
                        subtype: common_1.ProductSubtype.CommanderDeck
                    };
                    // SL non foil
                }
                else if (tcgcsv_1.MTG_SL_NON_FOIL_FORMAT.test(json.name)) {
                    return {
                        name: _.head(json.name.match(tcgcsv_1.MTG_SL_NON_FOIL_NAME)),
                        type: common_1.ProductType.SecretLair,
                        subtype: common_1.ProductSubtype.NonFoil
                    };
                    // SL textured foil
                }
                else if (tcgcsv_1.MTG_SL_TEXTURED_FOIL_FORMAT.test(json.name)) {
                    return {
                        name: _.head(json.name.match(tcgcsv_1.MTG_SL_TEXTURED_FOIL_NAME)),
                        type: common_1.ProductType.SecretLair,
                        subtype: common_1.ProductSubtype.TexturedFoil
                    };
                    // SL galaxy foil
                }
                else if (tcgcsv_1.MTG_SL_GALAXY_FOIL_FORMAT.test(json.name)) {
                    return {
                        name: _.head(json.name.match(tcgcsv_1.MTG_SL_GALAXY_FOIL_NAME)),
                        type: common_1.ProductType.SecretLair,
                        subtype: common_1.ProductSubtype.GalaxyFoil
                    };
                    // SL gilded foil
                }
                else if (tcgcsv_1.MTG_SL_GILDED_FOIL_FORMAT.test(json.name)) {
                    return {
                        name: _.head(json.name.match(tcgcsv_1.MTG_SL_GILDED_FOIL_NAME)),
                        type: common_1.ProductType.SecretLair,
                        subtype: common_1.ProductSubtype.GildedFoil
                    };
                    // SL foil etched
                }
                else if (tcgcsv_1.MTG_SL_FOIL_ETCHED_FORMAT.test(json.name)) {
                    return {
                        name: _.head(json.name.match(tcgcsv_1.MTG_SL_FOIL_ETCHED_NAME)),
                        type: common_1.ProductType.SecretLair,
                        subtype: common_1.ProductSubtype.FoilEteched
                    };
                    // SL foil
                }
                else if (tcgcsv_1.MTG_SL_FOIL_FORMAT.test(json.name)) {
                    return {
                        name: _.head(json.name.match(tcgcsv_1.MTG_SL_FOIL_NAME)),
                        type: common_1.ProductType.SecretLair,
                        subtype: common_1.ProductSubtype.Foil
                    };
                }
                // -- non secret lairs
            }
            else {
                // -------
                // exclude
                // -------
                if (tcgcsv_1.MTG_JUMPSTART_BOOSTER_BOX_FORMAT.test(json.name))
                    return null;
                // -------
                // include
                // -------
                // collector booster box
                if (tcgcsv_1.MTG_COLLECTOR_BOOSTER_BOX_FORMAT.test(json.name)) {
                    return {
                        name: _.head(json.name.match(tcgcsv_1.MTG_COLLECTOR_BOOSTER_BOX_NAME)),
                        type: common_1.ProductType.BoosterBox,
                        subtype: common_1.ProductSubtype.Collector
                    };
                    // play booster box
                }
                else if (tcgcsv_1.MTG_PLAY_BOOSTER_BOX_FORMAT.test(json.name)) {
                    return {
                        name: _.head(json.name.match(tcgcsv_1.MTG_PLAY_BOOSTER_BOX_NAME)),
                        type: common_1.ProductType.BoosterBox,
                        subtype: common_1.ProductSubtype.Play
                    };
                    // set booster box
                }
                else if (tcgcsv_1.MTG_SET_BOOSTER_BOX_FORMAT.test(json.name)) {
                    return {
                        name: _.head(json.name.match(tcgcsv_1.MTG_SET_BOOSTER_BOX_NAME)),
                        type: common_1.ProductType.BoosterBox,
                        subtype: common_1.ProductSubtype.Set
                    };
                    // draft booster box
                }
                else if (tcgcsv_1.MTG_DRAFT_BOOSTER_BOX_FORMAT.test(json.name)) {
                    return {
                        name: _.head(json.name.match(tcgcsv_1.MTG_DRAFT_BOOSTER_BOX_NAME)),
                        type: common_1.ProductType.BoosterBox,
                        subtype: common_1.ProductSubtype.Draft
                    };
                    // commander deck set
                }
                else if (tcgcsv_1.MTG_EDH_DECK_SET_FORMAT.test(json.name)) {
                    return {
                        name: _.head(json.name.match(tcgcsv_1.MTG_EDH_DECK_SET_NAME)),
                        type: common_1.ProductType.CommanderDeckSet,
                    };
                    // bundle
                }
                else if (tcgcsv_1.MTG_BUNDLE_FORMAT.test(json.name)) {
                    return {
                        name: _.head(json.name.match(tcgcsv_1.MTG_BUNDLE_NAME)),
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
            if (tcgcsv_1.METAZOO_FIRST_EDITION_BOOSTER_BOX_FORMAT.test(json.name)) {
                return {
                    name: _.head(json.name.match(tcgcsv_1.METAZOO_FIRST_EDITION_BOOSTER_BOX_NAME)),
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
            if (tcgcsv_1.PKM_CODE_CARD_FORMAT.test(json.name))
                return null;
            // -------
            // include
            // -------
            // booster box
            if (tcgcsv_1.PKM_BOOSTER_BOX_FORMAT.test(json.name)) {
                return {
                    name: _.head(json.name.match(tcgcsv_1.PKM_BOOSTER_BOX_NAME)),
                    type: common_1.ProductType.BoosterBox
                };
                // booster bundle
            }
            else if (tcgcsv_1.PKM_BOOSTER_BUNDLE_FORMAT.test(json)) {
                return {
                    name: _.head(json.name.match(tcgcsv_1.PKM_BOOSTER_BUNDLE_NAME)),
                    type: common_1.ProductType.Bundle,
                    subtype: common_1.ProductSubtype.BoosterBundle
                };
                // elite trainer box
            }
            else if (tcgcsv_1.PKM_ETB_FORMAT.test(json.name)) {
                const setName = _.head(json.name.match(tcgcsv_1.PKM_ETB_SET_NAME));
                const typeName = _.head(json.name.match(tcgcsv_1.PKM_ETB_TYPE_NAME));
                return {
                    name: typeName ? `${setName} [${typeName}]` : `${setName}`,
                    type: common_1.ProductType.Bundle,
                    subtype: common_1.ProductSubtype.EliteTrainerBox
                };
                // ultra premium collection
            }
            else if (tcgcsv_1.PKM_UPC_FORMAT.test(json.name)) {
                return {
                    name: _.head(json.name.match(tcgcsv_1.PKM_UPC_NAME)),
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
            if (tcgcsv_1.SORCERY_BOOSTER_BOX_FORMAT.test(json.name)) {
                return {
                    name: _.head(json.name.match(tcgcsv_1.SORCERY_BOOSTER_BOX_NAME)),
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
        tcg: tcgcsv_1.TCCATEGORYNAME_TO_TCG_MAP.get(json.name)
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
  tcg: The TCG of the products
  group: An ITCGroup for the products
  json: A JSON representation of an ITCProduct
  setCode?: The set code of the product
RETURN
  An ITCProduct, or null if the product should not be parsed
*/
function parseITCProductJSON(tcg, group, json) {
    var _a;
    // get product metadata
    const metadata = getProductMetadata(tcg, json);
    // product should be parsed
    if (metadata) {
        const obj = {
            tcgplayerId: json.productId,
            groupId: json.groupId,
            categoryId: json.categoryId,
            tcg: tcg,
            releaseDate: group.publishedOn,
            name: metadata.name,
            type: metadata.type,
            language: common_1.ProductLanguage.English,
            msrp: (_a = getProductEstimatedMSRP(tcg, metadata.type, metadata.subtype)) !== null && _a !== void 0 ? _a : 1,
            status: common_1.ParsingStatus.ToBeValidated
        };
        if (metadata.subtype)
            obj['subtype'] = metadata.subtype;
        if (group.abbreviation)
            obj['setCode'] = group.abbreviation;
        (0, common_1.assert)((0, common_1.isITCProduct)(obj), 'Object is not an ITCProduct');
        return obj;
    }
    return null;
}
