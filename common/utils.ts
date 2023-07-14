import * as _ from 'lodash'

// =====
// enums
// =====

// -- FE / BE api

// POST to /product status
export enum ProductPostStatus {
    Added = 'tcgplayerId added',
    AddedWithoutImage = 'tcgplayerId added (without image)',
    AlreadyExists = 'tcgplayerId already exists',
}

// -- mongodb

// timeseries granularity
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
    CommanderDeck = 'Commander Deck',
    Draft = 'Draft',
    EliteTrainerBox = 'Elite Trainer Box',
    FABVersionTwo = '2.0',
    FirstEdition = '1st Edition',
    Foil = 'Foil',
    FoilEteched = 'Foil Etched',
    NonFoil = 'Non-Foil',
    SecondEdition = '2nd Edition',
    Set = 'Set',
    TexturedFoil = 'Textured Foil',
    UltraPremiumCollection = 'Ultra Premium Collection',
    Unlimited = 'Unlimited',
};

// product type
export enum ProductType {
    BoosterBox = 'Booster Box',
    Bundle = 'Bundle',
    CommanderDeck = 'Commander Deck',
    CommanderDeckSet = 'Commander Deck Set',
    SecretLair = 'Secret Lair',
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

// -- portfolio

// transaction type
export enum TransactionType {
    Purchase = 'Purchase',
    Sale = 'Sale',
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
        ProductSubtype.FABVersionTwo,
        ProductSubtype.FirstEdition,
        ProductSubtype.SecondEdition,
        ProductSubtype.Set,
        ProductSubtype.Unlimited,
    ],

    // Bundle 
    [ProductType.Bundle]: [
        ProductSubtype.EliteTrainerBox,
        ProductSubtype.UltraPremiumCollection
    ],

    // Secret Lair
    [ProductType.SecretLair]: [
        ProductSubtype.CommanderDeck,
        ProductSubtype.Foil,
        ProductSubtype.FoilEteched,
        ProductSubtype.NonFoil,
        ProductSubtype.TexturedFoil,
    ],
}

// TCG -> product subtype
export const TCGToProductSubtype: { [key in TCG]?: ProductSubtype[] } = {

    // FAB
    [TCG.FleshAndBlood]: [
        ProductSubtype.FABVersionTwo,
        ProductSubtype.FirstEdition,
        ProductSubtype.Unlimited,
    ],

    // MTG
    [TCG.MagicTheGathering]: [
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
    [TCG.MetaZoo]: [
        ProductSubtype.FirstEdition,
        ProductSubtype.SecondEdition,
    ],

    // Pokemon
    [TCG.Pokemon]: [
        ProductSubtype.EliteTrainerBox,
        ProductSubtype.UltraPremiumCollection,
    ],    

    // Sorcery
}


// ==========
// interfaces
// ==========

// -- Product and Price schemas

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

// defines the required data for a Product
export interface IProduct {
    tcgplayerId: Number;
    tcg: TCG;
    releaseDate: Date;
    name: String;
    type: ProductType;
    language: ProductLanguage;
    subtype?: ProductSubtype;
    setCode?: String;
}

// -- Portfolio, Holding, and Transaction schemas

// transaction
export interface ITransaction {
    type: TransactionType,
    date: Date,
    price: number,
    quantity: number,
}

// holding
export interface IHolding {
    product: IProduct,
    transactions: ITransaction[]
}

export interface IHoldingMethods {

    // CRUD transaction
    addTransaction(txn: ITransaction): void,
    deleteTransaction(id: string): void,

    // getters
    getPurchases(): ITransaction[],
    getFirstPurchaseDate(): Date | undefined,
    getLastPurchaseDate(): Date | undefined,
    getTotalCost(): number | undefined,
    getAvgCost(): number | undefined,
    getMarketValue(price: number): number | undefined,

    // return calculation
    getDollarReturn(price: number): number | undefined,
    getPercentageReturn(price: number): number | undefined,
    getAnnualizedReturn(price: number): number | undefined,
}


// =====
// types
// =====

// -- FE / BE endpoints

// body for POST request to /product
export type TProductPostBody = {
    formData: IProduct,
    imageUrl?: string, 
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
    return /^[\x00-\x7F]*$/.test(value);;
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

/*
DESC
    Function used for sorting dates in ascending order
INPUT
    a: The first Date
    b: The second Date
RETURN
    A negative number if a < b, otherwise a positive number if a > b
*/
export function sortFnDateAsc(a: Date, b: Date): number {
    return a.getTime() - b.getTime()
}

/*
DESC
    Function used for sorting dates in descending order
INPUT
    a: The first Date
    b: The second Date
RETURN
    A negative number if a > b, otherwise a positive number if a < b
*/
export function sortFnDateDesc(a: Date, b: Date): number {
    return b.getTime() - a.getTime()
}