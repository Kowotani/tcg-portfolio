import { IProduct, TTcgplayerIdPrices } from "./dataModels"


// =====
// enums
// =====

/*
  Endpoint:   GET_PORTFOLIOS_URL
  Type:       GET
*/
export enum GetPortfoliosStatus {
  Success = 'Successfully retrieved Portfolios',
  Error = 'Error retrieving Portfolios',
}

/*
  Endpoint:   GET_LATEST_PRICES_URL
  Type:       GET
*/
export enum GetPricesStatus {
  Success = 'Successfully retrieved latest Prices',
  Error = 'Error retrieving latest Prices',
}

/*
  Endpoint:   ADD_PRODUCT_URL
  Type:       POST
*/
export enum PostProductStatus {
  Added = 'tcgplayerId added',
  AddedWithoutImage = 'tcgplayerId added (without image)',
  AlreadyExists = 'tcgplayerId already exists',
  Error = 'Error creating the Product doc',
}

/*
  Endpoint:   GET_PRODUCTS_URL
  Type:       GET
*/
export enum GetProductsStatus {
  Success = 'Successfully retrieved Products',
  Error = 'Error retrieving Products',
}


// ======
// routes
// ======

export const ADD_PRODUCT_URL = '/product'
export const GET_LATEST_PRICES_URL = '/prices/latest'
export const GET_PORTFOLIOS_URL = '/portfolios'
export const GET_PRODUCTS_URL = '/products'


// =====
// types
// =====

// ---------
// responses
// ---------

// base body response
export type TResBody = {
  message: string
}

// body for successful response with data
export type TDataResBody<Type> = TResBody & {
  data: Type
}

/*
  Endpoint:   ADD_PRODUCT_URL
  Type:       POST
  Req / Res:  Response
*/
export type TProductPostResBody<Type> = TDataResBody<Type> & {
  tcgplayerId: number
}

/*
  Endpoint:   GET_LATEST_PRICES_URL
  Type:       GET
  Req / Res:  Response
*/
export type TPricesGetResBody = TDataResBody<TTcgplayerIdPrices>

// --------
// requests
// --------

/*
  Endpoint:   ADD_PRODUCT_URL
  Type:       POST
  Req / Res:  Request
*/
export type TProductPostReqBody = {
  formData: IProduct,
  imageUrl?: string, 
}