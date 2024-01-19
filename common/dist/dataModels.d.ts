export declare enum TimeseriesGranularity {
    Seconds = "seconds",
    Minutes = "minutes",
    Hours = "hours"
}
export declare enum PerformanceMetric {
    CumPnL = "Cumulative Profit and Loss",
    DailyPnL = "Daily Profit and Loss",
    MarketValue = "Market Value",
    TotalCost = "Total Cost"
}
export declare enum ProductLanguage {
    English = "ENG",
    Japanese = "JPN"
}
export declare enum ProductSubtype {
    BoosterBundle = "Booster Bundle",
    Collector = "Collector",
    CommanderDeck = "Commander Deck",
    Draft = "Draft",
    EliteTrainerBox = "Elite Trainer Box",
    FABVersionTwo = "2.0",
    FirstEdition = "1st Edition",
    Foil = "Foil",
    GalaxyFoil = "Galaxy Foil",
    GildedFoil = "Gilded Foil",
    FoilEteched = "Foil Etched",
    NonFoil = "Non-Foil",
    Play = "Play",
    SecondEdition = "2nd Edition",
    Set = "Set",
    TexturedFoil = "Textured Foil",
    UltraPremiumCollection = "Ultra Premium Collection",
    Unlimited = "Unlimited"
}
export declare enum ProductType {
    BoosterBox = "Booster Box",
    Bundle = "Bundle",
    CommanderDeck = "Commander Deck",
    CommanderDeckSet = "Commander Deck Set",
    SecretLair = "Secret Lair"
}
export declare enum TCG {
    FleshAndBlood = "Flesh and Blood",
    Lorcana = "Lorcana",
    MagicTheGathering = "Magic: The Gathering",
    MetaZoo = "MetaZoo",
    Pokemon = "Pokemon",
    Sorcery = "Sorcery"
}
export declare enum ParsingStatus {
    ToBeValidated = "To be Validated",
    Validated = "Validated"
}
export declare enum TCGPriceType {
    MarketPrice = "Market Price",
    BuylistMarketPrice = "Buylist Market Price",
    ListedMedianPrice = "Listed Median Price"
}
export declare enum TransactionType {
    Purchase = "Purchase",
    Sale = "Sale"
}
export interface IHistoricalPrice {
    tcgplayerId: number;
    date: Date;
    marketPrice: number;
    isInterpolated: boolean;
}
export interface IDatedPriceData {
    priceDate: Date;
    prices: IPriceData;
}
export interface IPrice extends IDatedPriceData {
    tcgplayerId: number;
    granularity: string;
}
export interface IPriceData {
    marketPrice: number;
    buylistMarketPrice?: number;
    listedMedianPrice?: number;
}
export interface IProduct {
    tcgplayerId: number;
    tcg: TCG;
    releaseDate: Date;
    name: string;
    type: ProductType;
    language: ProductLanguage;
    msrp: number;
    subtype?: ProductSubtype;
    setCode?: string;
}
export interface ITransaction {
    type: TransactionType;
    date: Date;
    price: number;
    quantity: number;
}
export interface IReactTableTransaction extends ITransaction {
    delete?: boolean;
}
export interface IHoldingBase {
    transactions: ITransaction[];
}
export interface IHolding extends IHoldingBase {
    tcgplayerId: number;
}
export interface IHoldingMethods {
    addTransactions(txnInput: ITransaction | ITransaction[]): void;
    deleteTransaction(txn: ITransaction): void;
    deleteTransactions(): void;
    getTcgplayerId(): number;
    getTransactions(): ITransaction[];
    getPurchases(): ITransaction[];
    getFirstPurchaseDate(): Date | undefined;
    getLastPurchaseDate(): Date | undefined;
    getSales(): ITransaction[];
    getPurchaseQuantity(): number;
    getSaleQuantity(): number;
    getQuantity(): number;
    hasPurchases(): boolean;
    hasSales(): boolean;
    getTotalCost(): number | undefined;
    getTotalRevenue(): number | undefined;
    getAverageCost(): number | undefined;
    getAverageRevenue(): number | undefined;
    getProfit(): number | undefined;
    getMarketValue(price: number): number | undefined;
    getDollarReturn(price: number): number | undefined;
    getPercentageReturn(price: number): number | undefined;
    getAnnualizedReturn(price: number): number | undefined;
}
export interface IPopulatedHolding extends IHoldingBase {
    product: IProduct;
}
export interface IPortfolioBase {
    userId: number;
    portfolioName: string;
    description?: string;
}
export interface IPortfolio extends IPortfolioBase {
    holdings: IHolding[];
}
export interface IPortfolioMethods {
    addHoldings(holdingInput: IHolding | IHolding[]): void;
    deleteHolding(tcgplayerId: number): void;
    deleteHoldings(): void;
    getUserId(): number;
    getPortfolioName(): string;
    getDescription(): string | undefined;
    getHoldings(): IHolding[];
    getTotalCost(): number | undefined;
    getTotalRevenue(): number | undefined;
    getProfit(): number | undefined;
    getMarketValue(prices: Map<number, number>): number | undefined;
    hasHolding(tcgplayerId: number): boolean;
    hasHoldings(): boolean;
    hasPurchases(): boolean;
    hasSales(): boolean;
    getDollarReturn(prices: Map<number, number>): number | undefined;
    getPercentageReturn(prices: Map<number, number>): number | undefined;
}
export interface IPopulatedPortfolio extends IPortfolioBase {
    populatedHoldings: IPopulatedHolding[];
}
export interface ITCCategory {
    categoryId: number;
    name: string;
    displayName: string;
    tcg: TCG;
}
export interface ITCGroup {
    groupId: number;
    categoryId: number;
    name: string;
    abbreviation?: string;
    publishedOn?: Date;
}
export interface ITCProduct {
    tcgplayerId: number;
    groupId: number;
    categoryId: number;
    tcg: TCG;
    releaseDate: Date;
    name: string;
    type: ProductType;
    language: ProductLanguage;
    status: ParsingStatus;
    msrp?: number;
    subtype?: ProductSubtype;
    setCode?: string;
}
export interface IUser {
    userId: number;
    userName: string;
    passwordHash: string;
    passwordSalt: string;
    email: string;
}
export declare const TCGToProductType: {
    [key in TCG]: ProductType[];
};
export declare const ProductTypeToProductSubtype: {
    [key in ProductType]?: ProductSubtype[];
};
export declare const TCGToProductSubtype: {
    [key in TCG]?: ProductSubtype[];
};
export declare type TDatedArray = {
    date: Date;
    values: number[];
};
export declare type TDatedValue = {
    date: Date;
    value: number;
};
export declare type THoldingValueSeries = {
    tcgplayerId: number;
    values: TDatedValue[];
};
export declare type TPerformanceData = {
    [key in PerformanceMetric]?: TDatedValue[];
};
export declare type THoldingPerformanceData = {
    tcgplayerId: number;
    performanceData: TPerformanceData;
};
