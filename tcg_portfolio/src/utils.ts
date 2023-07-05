import * as _ from "lodash";


// =====
// enums
// =====

// -- product features

// product language
export enum ProductLanguage {
    English = 'ENG',
    Japanese = 'JPN',
};

// product subtype
export enum ProductSubType {
    Collector = 'Collector',
    Draft = 'Draft',
    FirstEdition = '1st Edition',
    SecondEdition = '2nd Edition',
    Set = 'Set',
    Unlimited = 'Unlimited',
};

// product type
export enum ProductType {
    BoosterBox = 'Booster Box',
    Bundle = 'Bundle',
    CommanderDeck = 'Commander Deck',
    CommanderDeckSet = 'Commander Deck Set',
    EliteTrainerBox = 'Elite Trainer Box',
    SecretLair = 'Secret Lair',
    UltraPremiumCollection = 'Ultra Premium Collection',
};

// TCG
export enum TCG {
    FleshAndBlood = 'Flesh and Blood',
    MagicTheGathering = 'Magic: The Gathering',
    MetaZoo = 'MetaZoo',
    Pokemon = 'Pokemon',
    Sorcery = 'Sorcery',
};


// ====================
// relationship objects
// ====================

// https://stackoverflow.com/questions/44243060/use-enum-as-restricted-key-type-in-typescript
// TCG -> product type
export const TCGToProductType: { [key in TCG]: ProductType[] } = {

    // FAB
    [TCG.FleshAndBlood]: [
        ProductType.BoosterBox,
    ],

    // MTG
    [TCG.MagicTheGathering]: [
        ProductType.BoosterBox,
        ProductType.Bundle,
        ProductType.CommanderDeck,
        ProductType.CommanderDeckSet,
        ProductType.SecretLair,
    ],

    // Metazoo
    [TCG.MetaZoo]: [
        ProductType.BoosterBox,
    ],

    // Pokemon
    [TCG.Pokemon]: [
        ProductType.BoosterBox,
        ProductType.Bundle,
        ProductType.UltraPremiumCollection,
    ],

    // Sorcery
    [TCG.Sorcery]: [
        ProductType.BoosterBox
    ]
}

// product type -> product subtype
export const ProductTypeToProductSubtype: { [key in ProductType]?: ProductSubType[] } = {

    // Booster box
    [ProductType.BoosterBox]: [
        ProductSubType.Collector,
        ProductSubType.Draft,
        ProductSubType.FirstEdition,
        ProductSubType.SecondEdition,
        ProductSubType.Set,
        ProductSubType.Unlimited,
    ]
}

// TCG -> product subtype
export const TCGToProductSubtype: { [key in TCG]?: ProductSubType[] } = {

    // FAB
    [TCG.FleshAndBlood]: [
        ProductSubType.FirstEdition,
        ProductSubType.Unlimited,
    ],

    // MTG
    [TCG.MagicTheGathering]: [
        ProductSubType.Collector,
        ProductSubType.Draft,
        ProductSubType.Set,
    ],

    // Metazoo
    [TCG.MetaZoo]: [
        ProductSubType.FirstEdition,
        ProductSubType.SecondEdition,
    ],

    // Pokemon

    // Sorcery
}


// =========
// functions
// =========

/*
DESC
    Returns an array of valid ProductSubtypes for the given TCG and ProductType
INPUT
    tcg: A TCG enum
    productType: A ProductType enum
RETURN
    An array of ProductSubtypes for the given TCG and ProductType
*/
export function getProductSubtypes(tcg: TCG, productType: ProductType): ProductSubType[] {
    const tcgArray = TCGToProductSubtype[tcg];
    const productTypeArray = ProductTypeToProductSubtype[productType];
    return _.intersection(tcgArray, productTypeArray);
}

/*
DESC
    Returns whether the input is a number
INPUT
    A value to check
RETURN
    TRUE if the input is a number, FALSE otherwise
*/
export function isNumeric(value: any): boolean {
    return !isNaN(value);
}

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
export function isPriceString(value: string): boolean {
    const regexp = new RegExp('^\\$\\d+\\.\\d{2}$');
    return regexp.test(value);
}