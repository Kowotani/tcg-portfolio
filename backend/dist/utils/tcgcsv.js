"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MTG_SL_FOIL_MSRP = exports.MTG_SL_EDH_DECK_MSRP = exports.MTG_SET_BOOSTER_BOX_MSRP = exports.MTG_PLAY_BOOSTER_BOX_MSRP = exports.MTG_DRAFT_BOOSTER_BOX_MSRP = exports.MTG_COLLECTOR_BOOSTER_BOX_MSRP = exports.MTG_BUNDLE_MSRP = exports.MTG_SL_TEXTURED_FOIL_NAME = exports.MTG_SL_TEXTURED_FOIL_FORMAT = exports.MTG_SL_NON_FOIL_NAME = exports.MTG_SL_NON_FOIL_FORMAT = exports.MTG_SL_GILDED_FOIL_NAME = exports.MTG_SL_GILDED_FOIL_FORMAT = exports.MTG_SL_GALAXY_FOIL_NAME = exports.MTG_SL_GALAXY_FOIL_FORMAT = exports.MTG_SL_FOIL_NAME = exports.MTG_SL_FOIL_FORMAT = exports.MTG_SL_FOIL_ETCHED_NAME = exports.MTG_SL_FOIL_ETCHED_FORMAT = exports.MTG_SL_EDH_DECK_NAME = exports.MTG_SL_EDH_DECK_FORMAT = exports.MTG_SL_BUNDLE_FORMAT = exports.MTG_SL_FORMAT = exports.MTG_EDH_DECK_SET_NAME = exports.MTG_EDH_DECK_SET_FORMAT = exports.MTG_SET_BOOSTER_BOX_NAME = exports.MTG_SET_BOOSTER_BOX_FORMAT = exports.MTG_PLAY_BOOSTER_BOX_NAME = exports.MTG_PLAY_BOOSTER_BOX_FORMAT = exports.MTG_DRAFT_BOOSTER_BOX_NAME = exports.MTG_DRAFT_BOOSTER_BOX_FORMAT = exports.MTG_COLLECTOR_BOOSTER_BOX_NAME = exports.MTG_COLLECTOR_BOOSTER_BOX_FORMAT = exports.MTG_BUNDLE_NAME = exports.MTG_BUNDLE_FORMAT = exports.LORCANA_ILLUMINEERS_TROVE_MSRP = exports.LORCANA_BOOSTER_BOX_MSRP = exports.LORCANA_ILLUMINEERS_TROVE_NAME = exports.LORCANA_ILLUMINEERS_TROVE_FORMAT = exports.LORCANA_BOOSTER_BOX_NAME = exports.LORCANA_BOOSTER_BOX_FORMAT = exports.FAB_UNLIMITED_EDITION_BOOSTER_BOX_MSRP = exports.FAB_FIRST_EDITION_BOOSTER_BOX_MSRP = exports.FAB_BOOSTER_BOX_MSRP = exports.FAB_UNLIMITED_EDITION_BOOSTER_BOX_NAME = exports.FAB_UNLIMITED_EDITION_BOOSTER_BOX_FORMAT = exports.FAB_FIRST_EDITION_BOOSTER_BOX_NAME = exports.FAB_FIRST_EDITION_BOOSTER_BOX_FORMAT = exports.FAB_BOOSTER_BOX_NAME = exports.FAB_BOOSTER_BOX_FORMAT = void 0;
exports.TCCATEGORYID_TO_TCG_MAP = exports.TCCATEGORYNAME_TO_TCG_MAP = exports.TCG_TO_TCCATEGORY = exports.SORCERY_BOOSTER_BOX_MSRP = exports.SORCERY_BOOSTER_BOX_NAME = exports.SORCERY_BOOSTER_BOX_FORMAT = exports.PKM_UPC_MSRP = exports.PKM_ETB_MSRP = exports.PKM_BOOSTER_BUNDLE_MSRP = exports.PKM_BOOSTER_BOX_MSRP = exports.PKM_UPC_NAME = exports.PKM_UPC_FORMAT = exports.PKM_ETB_TYPE_NAME = exports.PKM_ETB_SET_NAME = exports.PKM_ETB_FORMAT = exports.PKM_BOOSTER_BUNDLE_NAME = exports.PKM_BOOSTER_BUNDLE_FORMAT = exports.PKM_BOOSTER_BOX_NAME = exports.PKM_BOOSTER_BOX_FORMAT = exports.PKM_CODE_CARD_FORMAT = exports.METAZOO_FIRST_EDITION_BOOSTER_BOX_MSRP = exports.METAZOO_FIRST_EDITION_BOOSTER_BOX_NAME = exports.METAZOO_FIRST_EDITION_BOOSTER_BOX_FORMAT = exports.MTG_SL_NON_FOIL_MSRP = void 0;
const common_1 = require("common");
// =========
// constants
// =========
// ----------------
// Flesh and Blood
// ----------------
// -- regex
exports.FAB_BOOSTER_BOX_FORMAT = /Booster Box$/g;
exports.FAB_BOOSTER_BOX_NAME = /.*(?= Booster Box$)/g;
exports.FAB_FIRST_EDITION_BOOSTER_BOX_FORMAT = /Booster Box \[1st Edition\]$/g;
exports.FAB_FIRST_EDITION_BOOSTER_BOX_NAME = /.*(?= Booster Box \[1st Edition\])$/g;
exports.FAB_UNLIMITED_EDITION_BOOSTER_BOX_FORMAT = /Booster Box \[Unlimited Edition\]$/g;
exports.FAB_UNLIMITED_EDITION_BOOSTER_BOX_NAME = /.*(?= Booster Box \[Unlimited Edition\]$)/g;
// -- msrp
exports.FAB_BOOSTER_BOX_MSRP = 110;
exports.FAB_FIRST_EDITION_BOOSTER_BOX_MSRP = 100;
exports.FAB_UNLIMITED_EDITION_BOOSTER_BOX_MSRP = 100;
// -------
// Lorcana
// -------
// -- regex
exports.LORCANA_BOOSTER_BOX_FORMAT = /Booster Box$/g;
exports.LORCANA_BOOSTER_BOX_NAME = /(?<=^Disney Lorcana: ).*(?= Booster Box$)/g;
exports.LORCANA_ILLUMINEERS_TROVE_FORMAT = /Illumineer's Trove$/g;
exports.LORCANA_ILLUMINEERS_TROVE_NAME = /(?<=^Disney Lorcana: ).*(?= Illumineer's Trove$)/g;
// -- msrp
exports.LORCANA_BOOSTER_BOX_MSRP = 145;
exports.LORCANA_ILLUMINEERS_TROVE_MSRP = 50;
// -------------------
// Magic the Gathering
// -------------------
// -- regex
exports.MTG_BUNDLE_FORMAT = /Bundle$/g;
exports.MTG_BUNDLE_NAME = /^.*?(?=( - )+.*Bundle$)/g;
exports.MTG_COLLECTOR_BOOSTER_BOX_FORMAT = /Collector Booster Display$/g;
exports.MTG_COLLECTOR_BOOSTER_BOX_NAME = /^.*(?= - Collector Booster Display$)/g;
exports.MTG_DRAFT_BOOSTER_BOX_FORMAT = /(Draft Booster (Box|Display)$|Booster Box$)/g;
exports.MTG_DRAFT_BOOSTER_BOX_NAME = /^.*(?= - Draft Booster (Box|Display)$| - Booster Box$)/g;
exports.MTG_PLAY_BOOSTER_BOX_FORMAT = /Play Booster Display$/g;
exports.MTG_PLAY_BOOSTER_BOX_NAME = /^.*(?= - Play Booster Display$)/g;
exports.MTG_SET_BOOSTER_BOX_FORMAT = /^.*(?= - Set Booster Display$)/g;
exports.MTG_SET_BOOSTER_BOX_NAME = /Set Booster Display$/g;
exports.MTG_EDH_DECK_SET_FORMAT = /^.*?(?=[ -]* Commander Deck(s? \[Set of \d\]| Case| Display))/g;
exports.MTG_EDH_DECK_SET_NAME = /Commander Deck(s? \[Set of \d\]| Case| Display)/g;
exports.MTG_SL_FORMAT = /^Secret Lair/g;
exports.MTG_SL_BUNDLE_FORMAT = /^Secret Lair.*Bundle/g;
exports.MTG_SL_EDH_DECK_FORMAT = /^Secret Lair Commander Deck:/g;
exports.MTG_SL_EDH_DECK_NAME = /(?<=^Secret Lair Commander Deck: ).*/g;
exports.MTG_SL_FOIL_ETCHED_FORMAT = /^Secret Lair Drop:.*(?=Foil Etched)/g;
exports.MTG_SL_FOIL_ETCHED_NAME = /(?<=^Secret Lair Drop: ).*(?= Foil Etched)/g;
exports.MTG_SL_FOIL_FORMAT = /^Secret Lair Drop:.*(?=Foil)/g;
exports.MTG_SL_FOIL_NAME = /(?<=^Secret Lair Drop: ).*(?= Foil)/g;
exports.MTG_SL_GALAXY_FOIL_FORMAT = /^Secret Lair Drop:.*(?=Galaxy Foil)/g;
exports.MTG_SL_GALAXY_FOIL_NAME = /(?<=^Secret Lair Drop: ).*(?= Galaxy Foil)/g;
exports.MTG_SL_GILDED_FOIL_FORMAT = /^Secret Lair Drop:.*(?=Gilded Foil)/g;
exports.MTG_SL_GILDED_FOIL_NAME = /(?<=^Secret Lair Drop: ).*(?= Gilded Foil)/g;
exports.MTG_SL_NON_FOIL_FORMAT = /^Secret Lair Drop:.*(?=Non-Foil)/g;
exports.MTG_SL_NON_FOIL_NAME = /(?<=^Secret Lair Drop: ).*(?= Non-Foil)/g;
exports.MTG_SL_TEXTURED_FOIL_FORMAT = /^Secret Lair Drop:.*(?=Textured Foil)/g;
exports.MTG_SL_TEXTURED_FOIL_NAME = /(?<=^Secret Lair Drop: ).*(?= Textured Foil)/g;
// -- msrp
exports.MTG_BUNDLE_MSRP = 40;
exports.MTG_COLLECTOR_BOOSTER_BOX_MSRP = 250;
exports.MTG_DRAFT_BOOSTER_BOX_MSRP = 100;
exports.MTG_PLAY_BOOSTER_BOX_MSRP = 140;
exports.MTG_SET_BOOSTER_BOX_MSRP = 120;
exports.MTG_SL_EDH_DECK_MSRP = 150;
exports.MTG_SL_FOIL_MSRP = 40;
exports.MTG_SL_NON_FOIL_MSRP = 30;
// -------
// MetaZoo
// -------
// -- regex
exports.METAZOO_FIRST_EDITION_BOOSTER_BOX_FORMAT = /First Edition Booster Box$/g;
exports.METAZOO_FIRST_EDITION_BOOSTER_BOX_NAME = /^.*(?=: First Edition Booster Box$)/g;
// -- msrp
exports.METAZOO_FIRST_EDITION_BOOSTER_BOX_MSRP = 190;
// -------
// Pokemon
// -------
// -- regex
exports.PKM_CODE_CARD_FORMAT = /^Code Card/g;
exports.PKM_BOOSTER_BOX_FORMAT = /Booster Box$/g;
exports.PKM_BOOSTER_BOX_NAME = /.*(?= Booster Box$)/g;
exports.PKM_BOOSTER_BUNDLE_FORMAT = /Booster Bundle$/g;
exports.PKM_BOOSTER_BUNDLE_NAME = /.*(?= Booster Bundle$)/g;
exports.PKM_ETB_FORMAT = /Elite Trainer Box($| \[(?!Set of).*\])/g;
exports.PKM_ETB_SET_NAME = /.*(?= Elite Trainer Box($| \[(?!Set of).*\]))/g;
exports.PKM_ETB_TYPE_NAME = /(?<=\[).*(?=\]$)/g;
exports.PKM_UPC_FORMAT = /Ultra-Premium Collection$/g;
exports.PKM_UPC_NAME = /.*(?= Ultra-Premium Collection$)/g;
// -- msrp
exports.PKM_BOOSTER_BOX_MSRP = 160;
exports.PKM_BOOSTER_BUNDLE_MSRP = 25;
exports.PKM_ETB_MSRP = 50;
exports.PKM_UPC_MSRP = 120;
// -------
// Sorcery
// -------
// -- regex
exports.SORCERY_BOOSTER_BOX_FORMAT = /Booster Box$/g;
exports.SORCERY_BOOSTER_BOX_NAME = /.*(?= Booster Box$)/g;
// -- msrp
exports.SORCERY_BOOSTER_BOX_MSRP = 150;
// ====================
// relationship objects
// ====================
// TCG -> ITCCategoryMetadata
exports.TCG_TO_TCCATEGORY = new Map([
    [common_1.TCG.FleshAndBlood,
        {
            categoryId: 62,
            name: 'Flesh & Blood TCG'
        }],
    [common_1.TCG.Lorcana,
        {
            categoryId: 71,
            name: 'Lorcana TCG'
        }],
    [common_1.TCG.MagicTheGathering,
        {
            categoryId: 1,
            name: 'Magic'
        }],
    [common_1.TCG.MetaZoo,
        {
            categoryId: 66,
            name: 'MetaZoo'
        }],
    [common_1.TCG.Pokemon,
        {
            categoryId: 3,
            name: 'Pokemon'
        }],
    [common_1.TCG.Sorcery,
        {
            categoryId: 77,
            name: 'Sorcery Contested Realm'
        }],
]);
// categoryName -> TCG
exports.TCCATEGORYNAME_TO_TCG_MAP = new Map([...exports.TCG_TO_TCCATEGORY.keys()].map((key) => {
    const value = exports.TCG_TO_TCCATEGORY.get(key);
    (0, common_1.assert)(value, `Key not found in TCG_TO_TCCATEGORY: ${key}`);
    return [value.name, key];
}));
// categoryID -> TCG
exports.TCCATEGORYID_TO_TCG_MAP = new Map([...exports.TCG_TO_TCCATEGORY.keys()].map((key) => {
    const value = exports.TCG_TO_TCCATEGORY.get(key);
    (0, common_1.assert)(value, `Key not found in TCG_TO_TCCATEGORY: ${key}`);
    return [value.categoryId, key];
}));
