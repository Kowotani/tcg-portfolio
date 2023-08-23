import { IProduct, TTcgplayerIdPrices } from "./dataModels";
export declare enum GetPortfoliosStatus {
    Success = "Successfully retrieved Portfolios",
    Error = "Error retrieving Portfolios"
}
export declare enum GetPricesStatus {
    Success = "Successfully retrieved latest Prices",
    Error = "Error retrieving latest Prices"
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
export declare const ADD_PRODUCT_URL = "/product";
export declare const GET_LATEST_PRICES_URL = "/prices/latest";
export declare const GET_PORTFOLIOS_URL = "/portfolios";
export declare const GET_PRODUCTS_URL = "/products";
export declare type TResBody = {
    message: string;
};
export declare type TDataResBody<Type> = TResBody & {
    data: Type;
};
export declare type TProductPostResBody<Type> = TDataResBody<Type> & {
    tcgplayerId: number;
};
export declare type TPricesGetResBody = TDataResBody<TTcgplayerIdPrices>;
export declare type TProductPostReqBody = {
    formData: IProduct;
    imageUrl?: string;
};
