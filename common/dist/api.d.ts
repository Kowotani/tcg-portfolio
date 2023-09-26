import { IPortfolio, IProduct, TPortfolioPerformanceData } from "./dataModels";
export declare enum DeletePortfolioStatus {
    Success = "Successfully deleted Portfolio",
    DoesNotExist = "Portfolio does not exist",
    Error = "Error deleting Portfolio"
}
export declare enum PostPortfolioStatus {
    Success = "Successfully created Portfolio",
    Error = "Error creating Portfolio"
}
export declare enum PutPortfolioStatus {
    Success = "Successfully updated Portfolio",
    Error = "Error updating Portfolio"
}
export declare enum GetPortfolioPerformanceStatus {
    Success = "Successfully retrieved Portfolio performance",
    Error = "Error retrieving Portfolio performance"
}
export declare enum GetPortfoliosStatus {
    Success = "Successfully retrieved Portfolios",
    Error = "Error retrieving Portfolios"
}
export declare enum PostLatestPriceStatus {
    Success = "Successfully loaded latest Price",
    Error = "Error loading latest Price"
}
export declare enum GetPricesStatus {
    Success = "Successfully retrieved latest Prices",
    Error = "Error retrieving latest Prices"
}
export declare enum PostPriceStatus {
    Success = "Successfully added Price",
    Error = "Error adding Price"
}
export declare enum PostProductStatus {
    Added = "tcgplayerId added",
    AddedWithoutImage = "tcgplayerId added (without image)",
    AlreadyExists = "tcgplayerId already exists",
    Error = "Error creating the Product doc"
}
export declare enum GetProductsStatus {
    Success = "Successfully retrieved Products",
    Error = "Error retrieving Products"
}
export declare const PORTFOLIO_URL = "/portfolio";
export declare const PORTFOLIO_PERFORMANCE_URL: string;
export declare const PORTFOLIOS_URL = "/portfolios";
export declare const PRODUCT_URL = "/product";
export declare const PRODUCTS_URL = "/products";
export declare const LATEST_PRICE_URL = "/price/latest";
export declare const LATEST_PRICES_URL = "/prices/latest";
export declare const PRICE_URL = "/price";
export declare type TResBody = {
    message: string;
};
export declare type TDataResBody<Type> = TResBody & {
    data: Type;
};
export declare type TGetPortfolioPerformanceResBody = TDataResBody<TPortfolioPerformanceData>;
export declare type TProductPostResBody<Type> = TDataResBody<Type> & {
    tcgplayerId: number;
};
export declare type TDeletePortfolioReqBody = {
    userId: number;
    portfolioName: string;
};
export declare type TPostPortfolioReqBody = {
    portfolio: IPortfolio;
};
export declare type TPutPortfolioReqBody = {
    existingPortfolio: IPortfolio;
    newPortfolio: IPortfolio;
};
export declare type TPostLatestPriceReqBody = {
    tcgplayerId: number;
};
export declare type TPostPriceReqBody = {
    marketPrice: number;
    priceDate: Date;
    tcgplayerId: number;
    buylistMarketPrice?: number;
    listedMedianPrice?: number;
};
export declare type TPostProductReqBody = {
    formData: IProduct;
    imageUrl?: string;
};
