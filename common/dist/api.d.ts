import { IPortfolio, IProduct } from "./dataModels";
export declare enum DeletePortfoliosStatus {
    Success = "Successfully deleted Portfolio",
    Error = "Error deleting Portfolio"
}
export declare enum GetPortfoliosStatus {
    Success = "Successfully retrieved Portfolios",
    Error = "Error retrieving Portfolios"
}
export declare enum PutPortfoliosStatus {
    Success = "Successfully updated Portfolio",
    Error = "Error updating Portfolio"
}
export declare enum GetPricesStatus {
    Success = "Successfully retrieved latest Prices",
    Error = "Error retrieving latest Prices"
}
export declare enum PostLatestPriceStatus {
    Success = "Successfully loaded latest Price",
    Error = "Error loading latest Price"
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
export declare const CRUD_PORTFOLIO_URL = "/portfolio";
export declare const GET_PORTFOLIOS_URL = "/portfolios";
export declare const CRUD_PRODUCT_URL = "/product";
export declare const GET_PRODUCTS_URL = "/products";
export declare const ADD_LATEST_PRICE_URL = "/price/latest";
export declare const ADD_PRICE_URL = "/price";
export declare const GET_LATEST_PRICES_URL = "/prices/latest";
export declare type TResBody = {
    message: string;
};
export declare type TDataResBody<Type> = TResBody & {
    data: Type;
};
export declare type TProductPostResBody<Type> = TDataResBody<Type> & {
    tcgplayerId: number;
};
export declare type TDeletePortfolioReqBody = {
    userId: number;
    portfolioName: string;
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
