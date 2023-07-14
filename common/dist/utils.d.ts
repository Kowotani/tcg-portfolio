export declare enum ProductPostStatus {
    Added = "tcgplayerId added",
    AddedWithoutImage = "tcgplayerId added (without image)",
    AlreadyExists = "tcgplayerId already exists"
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
export interface IPriceData {
    marketPrice: Number;
    buylistMarketPrice: Number;
    listedMedianPrice: Number;
}
export interface IProductPriceData {
    tcgplayerId: Number;
    priceData: IPriceData;
}
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
export interface ITransaction {
    type: TransactionType;
    date: Date;
    price: Number;
    quantity: Number;
}
export declare type TProductPostBody = {
    formData: IProduct;
    imageUrl?: string;
};
export declare function getPriceFromString(value: string): number;
export declare function getProductSubtypes(tcg: TCG, productType: ProductType): ProductSubtype[];
export declare function isASCII(value: string): boolean;
export declare function isNumeric(value: any): boolean;
export declare function isPriceString(value: string): boolean;
export declare function isTCGPriceTypeValue(value: string): boolean;
export declare function sortFnDateAsc(a: Date, b: Date): number;
export declare function sortFnDateDesc(a: Date, b: Date): number;
