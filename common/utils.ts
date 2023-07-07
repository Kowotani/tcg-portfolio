import * as _ from 'lodash'

// =====
// enums
// =====

// -- mongodb

export enum TimeseriesGranularity {
    Seconds = 'seconds',
    Minutes = 'minutes',
    Hours = 'hours',
};

// -- product features

// product language
export enum ProductLanguage {
    English = 'ENG',
    Japanese = 'JPN',
};

// product subtype
export enum ProductSubtype {
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


// -- scraper 

// TCG price types
export enum TCGPriceType {
    MarketPrice = 'Market Price',
    BuylistMarketPrice = 'Buylist Market Price',
    ListedMedianPrice = 'Listed Median Price',
}


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
export const ProductTypeToProductSubtype: { [key in ProductType]?: ProductSubtype[] } = {

    // Booster box
    [ProductType.BoosterBox]: [
        ProductSubtype.Collector,
        ProductSubtype.Draft,
        ProductSubtype.FirstEdition,
        ProductSubtype.SecondEdition,
        ProductSubtype.Set,
        ProductSubtype.Unlimited,
    ]
}

// TCG -> product subtype
export const TCGToProductSubtype: { [key in TCG]?: ProductSubtype[] } = {

    // FAB
    [TCG.FleshAndBlood]: [
        ProductSubtype.FirstEdition,
        ProductSubtype.Unlimited,
    ],

    // MTG
    [TCG.MagicTheGathering]: [
        ProductSubtype.Collector,
        ProductSubtype.Draft,
        ProductSubtype.Set,
    ],

    // Metazoo
    [TCG.MetaZoo]: [
        ProductSubtype.FirstEdition,
        ProductSubtype.SecondEdition,
    ],

    // Pokemon

    // Sorcery
}


// ==========
// interfaces
// ==========

// used with IProductPriceData for storing scraped price data
export interface IPriceData {
    marketPrice: Number;
    buylistMarketPrice: Number;
    listedMedianPrice: Number;
}

// used with IPriceData for storing scraped price data
export interface IProductPriceData {
    tcgplayerId: Number;
    priceData: IPriceData;
}


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
export function getPriceFromString(value: string): number {
    return isPriceString(value)
        ? parseFloat(value.substring(1))
        : NaN
}


/*
DESC
    Returns an array of valid ProductSubtypes for the given TCG and ProductType
INPUT
    tcg: A TCG enum
    productType: A ProductType enum
RETURN
    An array of ProductSubtypes for the given TCG and ProductType
*/
export function getProductSubtypes(tcg: TCG, productType: ProductType): ProductSubtype[] {
    const tcgArray = TCGToProductSubtype[tcg];
    const productTypeArray = ProductTypeToProductSubtype[productType];
    return _.intersection(tcgArray, productTypeArray);
}


/*
DESC
    Returns whether the input string contains only ASCII characters
INPUT
    A string to check
RETURN
    TRUE if the input contains only ASCII characters, FALSE otherwise
*/
export function isASCII(value: string): boolean {
    return _.deburr(value) === value;
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


/*
DESC
    Returns whether the input string matches a TCGPriceType value
INPUT
    A string to check
RETURN
    TRUE if the input matches a TCGPriceType value
*/
export function isTCGPriceTypeValue(value: string): boolean {
    const arr = Object.values(TCGPriceType).map(v => v.toString());
    return arr.includes(value);
}