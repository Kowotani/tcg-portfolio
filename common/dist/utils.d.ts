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
    Draft = "Draft",
    EliteTrainerBox = "Elite Trainer Box",
    FirstEdition = "1st Edition",
    SecondEdition = "2nd Edition",
    Set = "Set",
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
export declare type TPostFormData = {
    tcgplayerId: number;
    name: string;
    tcg: TCG;
    type: ProductType;
    releaseDate: string;
    language: ProductLanguage;
    subtype?: ProductSubtype;
    setCode?: string;
};
export declare type TPostBody = {
    formData: TPostFormData;
    imageUrl?: string;
};
export declare function getPriceFromString(value: string): number;
export declare function getProductSubtypes(tcg: TCG, productType: ProductType): ProductSubtype[];
export declare function isASCII(value: string): boolean;
export declare function isNumeric(value: any): boolean;
export declare function isPriceString(value: string): boolean;
export declare function isTCGPriceTypeValue(value: string): boolean;
