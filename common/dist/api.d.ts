import { IProduct } from "./dataModels";
export declare enum PortfolioGetStatus {
    Success = "Successfully retrieved Portfolio docs",
    Error = "Error retrieving Portfolio docs"
}
export declare enum ProductPostStatus {
    Added = "tcgplayerId added",
    AddedWithoutImage = "tcgplayerId added (without image)",
    AlreadyExists = "tcgplayerId already exists",
    Error = "Error creating the Product doc"
}
export declare enum ProductsGetStatus {
    Success = "Successfully retrieved Product docs",
    Error = "Error retrieving Product docs"
}
export declare const GET_PORTFOLIOS_URL = "/portfolios";
export declare const ADD_PRODUCT_URL = "/product";
export declare const GET_PRODUCTS_URL = "/products";
export declare type TResBody = {
    message: string;
};
export declare type TDataResBody = TResBody & {
    data: any;
};
export declare type TProductPostResBody = TDataResBody & {
    tcgplayerId: number;
};
export declare type TProductPostReqBody = {
    formData: IProduct;
    imageUrl?: string;
};
