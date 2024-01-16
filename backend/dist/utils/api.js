"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTCCategories = void 0;
const common_1 = require("common");
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
// =======
// generic
// =======
/*
DESC
  Returns the TCG enum for the input TCGCSV Category name
INPUT
  name: The TCGCSV Category name
RETURN
  A TCG enum, or null if not matched
*/
function getTCGFromCategoryName(name) {
    switch (name) {
        case 'Flesh & Blood TCG':
            return common_1.TCG.FleshAndBlood;
        case 'Lorcana TCG':
            return common_1.TCG.Lorcana;
        case 'Magic':
            return common_1.TCG.MagicTheGathering;
        case 'MetaZoo':
            return common_1.TCG.MetaZoo;
        case 'Pokemon':
            return common_1.TCG.Pokemon;
        case 'Sorcery Contested Realm':
            return common_1.TCG.Sorcery;
    }
    return common_1.TCG.MagicTheGathering;
}
/*
  DESC
    Returns an ITCCategory after parsing the input json
  INPUT
    json: A JSON representation of a ITCCategory
  RETURN
    An ITCCategory
*/
function parseITCCategoryJSON(json) {
    // console.log(json)
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
