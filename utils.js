// imports
const enumMod = require('./enum');


// =====
// enums
// =====


// product language
const ProductLanguage = enumMod.Enum({
    English: 'ENG',
    Japanese: 'JPN'
});

// product subtype
const ProductSubType = enumMod.Enum({
    Collector: 'Collector',
    Draft: 'Draft',
    FirstEdition: '1st Edition',
    Unlimited: 'Unlimited',
    Set: 'Set'
})

// product type
const ProductType = enumMod.Enum({
    BoosterBox: 'Booster Box',
    Bundle: 'Bundle',
    CommanderDeck: 'Commander Deck',
    EliteTrainerBox: 'Elite Trainer Box',
    SecretLair: 'Secret Lair'
});

// TCG
const TCG = enumMod.Enum({
    FleshAndBlood: 'Flesh and Blood',
    MagicTheGathering: 'Magic: The Gathering',
    MetaZoo: 'MetaZoo',
    Pokemon: 'Pokemon',
    Sorcery: 'Sorcery'
});


// =========
// functions
// =========

// /*
// DESC
//     Checks whether the input data object has correctly formatted data for
//     creating a new Product document:

//     tcgplayer_id - the TCGplayer product id
//     release_date - product release date in YYYY-MM-DD format
//     name - product name
//     type - ProductType enum
//     language - ProductLanguage enum
//     subtype [OPTIONAL] - ProductSubType enum
//     set_code [OPTIONAL] - product set code
// INPUT
//     Object with data fields
// RETURN
//     TRUE if the input data object is valid for a Product doc, FALSE otherwise
// */
// function isValidProductData(data) {
    
//     // tcgplayer_id
//     if (!('tcgplayer_id' in data)) {
//         throw new Error('[tcgplayer_id] property not found');
//     }
//     if (!Number.isInteger(Number(data.tcgplayer_id))) {
//         throw new Error('[tcgplayer_id] property is not an integer');
//     }

//     // tcg
//     if (!('tcg' in data)) {
//         throw new Error('[tcg] property not found');
//     }
//     if (!Object.values(TCG).includes(data.tcg)) {
//         throw new Error(`Unrecognized TCG: ${data.tcg}`);
//     }    

//     // release_date
//     if (!('release_date' in data)) {
//         throw new Error('[release_date] property not found');
//     }
//     try {
//         Date.parse(data.release_date.substring(0,10));
//     } catch(err) {
//         throw new Error(`Unrecognized format for release_date: ${date.release_date}`);
//     }

//     // name
//     if (!('name' in data)) {
//         throw new Error('[name] property not found');
//     }

//     // type
//     if (!('type' in data)) {
//         throw new Error('[type] property not found');
//     }
//     if (!Object.values(ProductType).includes(data.type)) {
//         throw new Error(`Unrecognized product type: ${data.type}`);
//     }

//     // language
//     if (!('language' in data)) {
//         throw new Error('[language] property not found');
//     }
//     if (!Object.values(ProductLanguage).includes(data.language)) {
//         throw new Error(`Unrecognized product language: ${data.language}`);
//     }

//     // subtype
//     if (('subtype' in data) && !Object.values(ProductSubType).includes(data.subtype)) {
//         throw new Error(`Unrecognized product subtype: ${data.subtype}`);
//     }
// }

module.exports = { 
    ProductLanguage, ProductSubType, ProductType, TCG 
}