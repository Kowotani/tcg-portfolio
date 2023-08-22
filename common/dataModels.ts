// =====
// enums
// =====

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

interface IHoldingBase {
  transactions: ITransaction[],
}

export interface IHolding extends IHoldingBase{
  tcgplayerId: number,
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

export interface IPopulatedHolding extends IHoldingBase {
  product: IProduct,
}

// portfolio

interface IPortfolioBase {
  userId: number,
  portfolioName: string,
  description?: string,
}

export interface IPortfolio extends IPortfolioBase {
  holdings: IHolding[],
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

export interface IPopulatedPortfolio extends IPortfolioBase {
  populatedHoldings: IPopulatedHolding[],
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


// =====
// types
// =====

// map of TcgplayerId -> prices
export type TTcgplayerIdPrices = {
  [tcgplayerId: number]: number
}