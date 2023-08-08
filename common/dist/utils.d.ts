export declare const DAYS_PER_YEAR = 365;
export declare const MILLISECONDS_PER_SECOND = 1000;
export declare const SECONDS_PER_DAY = 86400;
export declare enum ProductPostStatus {
    Added = "tcgplayerId added",
    AddedWithoutImage = "tcgplayerId added (without image)",
    AlreadyExists = "tcgplayerId already exists",
    Error = "Error creating the Product doc"
}
export declare enum ProductsGetStatus {
    Success = "Successfully retried Product docs",
    Error = "Error retreiving Product docs"
}
export declare enum TimeseriesGranularity {
    Seconds = "seconds",
    Minutes = "minutes",
    Hours = "hours"
}
export declare enum ProductLanguage {
    English = "ENG",
    Japanese = "JPN"
}
export declare enum ProductSubtype {
    Collector = "Collector",
    CommanderDeck = "Commander Deck",
    Draft = "Draft",
    EliteTrainerBox = "Elite Trainer Box",
    FABVersionTwo = "2.0",
    FirstEdition = "1st Edition",
    Foil = "Foil",
    FoilEteched = "Foil Etched",
    NonFoil = "Non-Foil",
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
    MagicTheGathering = "Magic: The Gathering",
    MetaZoo = "MetaZoo",
    Pokemon = "Pokemon",
    Sorcery = "Sorcery"
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
export declare const TCGToProductType: {
    [key in TCG]: ProductType[];
};
export declare const ProductTypeToProductSubtype: {
    [key in ProductType]?: ProductSubtype[];
};
export declare const TCGToProductSubtype: {
    [key in TCG]?: ProductSubtype[];
};
export interface IUser {
    userId: number;
    userName: string;
    passwordHash: string;
    passwordSalt: string;
    email: string;
}
export interface IPrice {
    priceDate: Date;
    tcgplayerId: number;
    granularity: string;
    prices: IPriceData;
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
    msrp?: number;
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
export interface IHolding {
    tcgplayerId: number;
    transactions: ITransaction[];
}
export interface IHoldingMethods {
    addTransactions(txnInput: ITransaction | ITransaction[]): void;
    deleteTransaction(type: TransactionType, date: Date, price: number, quantity: number): void;
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
export interface IHydratedHolding extends IHolding {
    quantity: number;
    price: number;
    totalCost: number;
    averageCost: number;
    marketValue: number;
    dollarReturn: number;
    percentageReturn: number;
    annualizedReturn: number;
}
export interface IPortfolio {
    userId: number;
    portfolioName: string;
    holdings: IHolding[];
}
export interface IPortfolioMethods {
    addHoldings(holdingInput: IHolding | IHolding[]): void;
    deleteHolding(tcgplayerId: number): void;
    deleteHoldings(): void;
    getUserId(): number;
    getPortfolioName(): string;
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
export interface IHydratedPortfolio extends IPortfolio {
    hydratedHoldings: IHydratedHolding[];
    totalCost: number;
    marketValue: number;
    dollarReturn: number;
    percentageReturn: number;
    annualizedReturn: number;
}
export declare const ADD_PRODUCT_URL = "/product";
export declare const GET_PRODUCTS_URL = "/products";
export declare type TProductPostBody = {
    formData: IProduct;
    imageUrl?: string;
};
export declare function assert(condition: any, msg?: string): asserts condition;
export declare function getPriceFromString(value: string): number;
export declare function getProductSubtypes(tcg: TCG, productType: ProductType): ProductSubtype[];
export declare function isASCII(value: string): boolean;
export declare function isNumeric(value: any): boolean;
export declare function isPriceString(value: string): boolean;
export declare function isTCGPriceTypeValue(value: string): boolean;
export declare function sortFnDateAsc(a: Date, b: Date): number;
export declare function sortFnDateDesc(a: Date, b: Date): number;
export declare function getAverageCost(transactions: ITransaction[]): number | undefined;
export declare function getAverageRevenue(transactions: ITransaction[]): number | undefined;
export declare function getProfit(transactions: ITransaction[]): number | undefined;
export declare function getPurchases(transactions: ITransaction[]): ITransaction[];
export declare function getPurchaseQuantity(transactions: ITransaction[]): number;
export declare function getQuantity(transactions: ITransaction[]): number;
export declare function getSales(transactions: ITransaction[]): ITransaction[];
export declare function getSaleQuantity(transactions: ITransaction[]): number;
export declare function getTotalCost(transactions: ITransaction[]): number;
export declare function getTotalRevenue(transactions: ITransaction[]): number;
