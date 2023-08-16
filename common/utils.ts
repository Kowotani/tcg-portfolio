import * as _ from 'lodash'


// =========
// constants
// =========

export const DAYS_PER_YEAR = 365
export const MILLISECONDS_PER_SECOND = 1000
export const SECONDS_PER_DAY = 86400


// =====
// enums
// =====

// -- FE / BE api

// POST to /product status
export enum ProductPostStatus {
  Added = 'tcgplayerId added',
  AddedWithoutImage = 'tcgplayerId added (without image)',
  AlreadyExists = 'tcgplayerId already exists',
  Error = 'Error creating the Product doc',
}

export enum ProductsGetStatus {
  Success = 'Successfully retried Product docs',
  Error = 'Error retreiving Product docs',
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

// -- User

export interface IUser {
  userId: number,
  userName: string,
  passwordHash: string,
  passwordSalt: string,
  email: string,
}

// -- Price

// stores the price snapshot data
export interface IPrice {
  priceDate: Date;
  tcgplayerId: number;
  granularity: string;
  prices: IPriceData;
}

// stores the scraped price data
export interface IPriceData {
  marketPrice: number;
  buylistMarketPrice?: number;
  listedMedianPrice?: number;
}

// -- Product

// defines the required data for a Product
export interface IProduct {
  tcgplayerId: number;
  tcg: TCG;
  releaseDate: Date;
  name: string;
  type: ProductType;
  language: ProductLanguage;
  msrp?: number;
  subtype?: ProductSubtype;
  setCode?: string;
}

// -- Portfolio, Holding, and Transaction schemas

// transaction
export interface ITransaction {
  type: TransactionType,
  date: Date,
  price: number,
  quantity: number,
}

// dummy interface to support additional columns in React Table
export interface IReactTableTransaction extends ITransaction {
  delete?: boolean,
}

// holding
export interface IHolding {
  tcgplayerId: number,
  transactions: ITransaction[],
}

export interface IHoldingMethods {

  // CRUD transaction
  addTransactions(txnInput: ITransaction | ITransaction[]): void,
  deleteTransaction(txn: ITransaction): void,
  deleteTransactions(): void,

  // getters
  getTcgplayerId(): number,
  getTransactions(): ITransaction[],

  getPurchases(): ITransaction[],
  getFirstPurchaseDate(): Date | undefined,
  getLastPurchaseDate(): Date | undefined,
  getSales(): ITransaction[],

  getPurchaseQuantity(): number,
  getSaleQuantity(): number,
  getQuantity(): number

  // checkers
  hasPurchases(): boolean,
  hasSales(): boolean,

  // return calculation
  getTotalCost(): number | undefined,
  getTotalRevenue(): number | undefined,
  getAverageCost(): number | undefined,
  getAverageRevenue(): number | undefined,
  getProfit(): number | undefined,
  getMarketValue(price: number): number | undefined,

  getDollarReturn(price: number): number | undefined,
  getPercentageReturn(price: number): number | undefined,
  getAnnualizedReturn(price: number): number | undefined,
}

export interface IHydratedHolding {
  product: IProduct,
  transactions: ITransaction[],
}

// portfolio

export interface IPortfolio {
  userId: number,
  portfolioName: string,
  holdings: IHolding[],
  description?: string,
}

export interface IPortfolioMethods {

  // CRUD transaction
  addHoldings(holdingInput: IHolding | IHolding[]): void,
  deleteHolding(tcgplayerId: number): void, 
  deleteHoldings(): void,

  // getters
  getUserId(): number,
  getPortfolioName(): string,
  getDescription(): string | undefined,
  getHoldings(): IHolding[],
  getTotalCost(): number | undefined,
  getTotalRevenue(): number | undefined,
  getProfit(): number | undefined,
  getMarketValue(prices: Map<number, number>): number | undefined,

  // checkers
  hasHolding(tcgplayerId: number): boolean,
  hasHoldings(): boolean,
  hasPurchases(): boolean,
  hasSales(): boolean,

  // return calculation
  getDollarReturn(prices: Map<number, number>): number | undefined,
  getPercentageReturn(prices: Map<number, number>): number | undefined,
}

export interface IHydratedPortfolio {
  userId: number,
  portfolioName: string,
  hydratedHoldings: IHydratedHolding[],
}


// ======
// routes
// ======

export const ADD_PRODUCT_URL = '/product'
export const GET_PRODUCTS_URL = '/products'


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

// -------
// generic
// -------

/*
DESC
  Basic assertion function
INPUT
  condition: A condition to assert is true
  msg: An optional message to display
*/
export function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new Error('Assertion Error: ' + msg);
  }
  }

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


// ===========
// type guards
// ===========

/*
DESC
  Returns whether or not the input is an IHolding
INPUT
  arg: An object that might be an IHolding 
RETURN
  TRUE if the input is an IHolding, FALSE otherwise
*/
export function isIHolding(arg: any): arg is IHolding {
  return arg
    && arg.tcgplayerId && typeof(arg.tcgplayerId) === 'number'
    && arg.transactions && Array.isArray(arg.transactions)
      && _.every(arg.transactions.map((el: any) => {
        return isITransaction(el)
      }))
}

/*
DESC
  Returns whether or not the input is an IHydratedHolding
INPUT
  arg: An object that might be an IHydratedHolding 
RETURN
  TRUE if the input is an IHydratedHolding, FALSE otherwise
*/
export function isIHydratedHolding(arg: any): arg is IHydratedHolding {
  return arg
    && arg.product && isIProduct(arg.product)
    && arg.transactions && Array.isArray(arg.transactions)
      && _.every(arg.transactions.map((el: any) => {
        return isITransaction(el)
      }))
}

/*
DESC
  Returns whether or not the input is an IHydratedPortfolio
INPUT
  arg: An object that might be an IHydratedPortfolio 
RETURN
  TRUE if the input is an IHydratedPortfolio, FALSE otherwise
*/
export function isIHydratedPortfolio(arg: any): arg is IHydratedPortfolio {
  return arg
    && arg.userId && typeof(arg.userId) === 'number'
    && arg.portfolioName && typeof(arg.portfolioName) === 'string'
    && arg.holdings && Array.isArray(arg.holdings)
      && _.every(arg.holdings.forEach((el: any) => {
        return isIHydratedHolding(el)
      }))
}

/*
DESC
  Returns whether or not the input is an IPortfolio
INPUT
  arg: An object that might be an IPortfolio 
RETURN
  TRUE if the input is an IPortfolio, FALSE otherwise
*/
export function isIPortfolio(arg: any): arg is IPortfolio {
  return arg
    && arg.userId && typeof(arg.userId) === 'number'
    && arg.portfolioName && typeof(arg.portfolioName) === 'string'
    && arg.holdings && Array.isArray(arg.holdings)
      && _.every(arg.holdings.forEach((el: any) => {
        return isIHolding(el)
      }))
}

/*
DESC
  Returns whether or not the input is an IPrice
INPUT
  arg: An object that might be an IPrice 
RETURN
  TRUE if the input is an IPrice, FALSE otherwise
*/
export function isIPrice(arg: any): arg is IPrice {
  return arg
    && arg.priceDate && arg.priceData instanceof Date
    && arg.tcgplayerId && typeof(arg.tcgplayerId) === 'number'
    && arg.granularity && typeof(arg.granularity) === 'string'
    && arg.prices && isIPriceData(arg.prices)
}

/*
DESC
  Returns whether or not the input is an IPriceData
INPUT
  arg: An object that might be an IPriceData 
RETURN
  TRUE if the input is an IPriceData, FALSE otherwise
*/
export function isIPriceData(arg: any): arg is IPriceData {
  return arg
    // required
    && arg.marketPrice && typeof(arg.marketPrice) === 'number'

    // optional
    && arg.buylistMarketPrice 
      ? typeof(arg.buylistMarketPrice) === 'number' 
      : true
    && arg.listedMedianPrice 
      ? typeof(arg.listedMedianPrice) === 'number' 
      : true
}

/*
DESC
  Returns whether or not the input is an IProduct
INPUT
  arg: An object that might be an IProduct 
RETURN
  TRUE if the input is an IProduct, FALSE otherwise
*/
export function isIProduct(arg: any): arg is IProduct {
  return arg
    // require
    && arg.tcgplayerId && typeof(arg.tcgplayerId) === 'number'
    && arg.tcg && _.values(TCG).includes(arg.tcg)
    && arg.releaseDate && arg.releaseDate instanceof Date
    && arg.name && typeof(arg.name) === 'string'
    && arg.type && _.values(ProductType).includes(arg.type)
    && arg.language && _.values(ProductLanguage).includes(arg.language)

    // optional
    && arg.msrp ? typeof(arg.msrp) === 'number' : true
    && arg.subtype ? _.values(ProductSubtype).includes(arg.subtype) : true
    && arg.setCode ? typeof(arg.setCode) === 'string' : true
}

/*
DESC
  Returns whether or not the input is an ITransaction
INPUT
  arg: An object that might be an ITransaction 
RETURN
  TRUE if the input is an ITransaction, FALSE otherwise
*/
export function isITransaction(arg: any): arg is ITransaction {
  return arg
    && arg.type && _.values(TransactionType).includes(arg.type)
    && arg.date && arg.date instanceof Date
    && arg.price && typeof(arg.price) === 'number'
    && arg.quantity && typeof(arg.quantity) === 'number'
}