import { IPortfolio, IProduct } from "./dataModels";
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
export declare const GET_PORTFOLIOS_URL = "/portfolios";
export declare const UPDATE_PORTFOLIO_URL = "/portfolio";
export declare const ADD_PRODUCT_URL = "/product";
export declare const GET_PRODUCTS_URL = "/products";
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
export declare type TPutPortfolioReqBody = {
    existingPortfolio: IPortfolio;
    newPortfolio: IPortfolio;
};
export declare type TPostPriceReqBody = {
    marketPrice: number;
    priceDate: Date;
    tcgplayerId: number;
    buylistMarketPrice?: number;
    listedMedianPrice?: number;
};
export declare type TProductPostReqBody = {
    formData: IProduct;
    imageUrl?: string;
};
