import { IPortfolio, IProduct } from "./dataModels"


// =====
// enums
// =====

// -- portfolio

/*
  Endpoint:   GET_PORTFOLIOS_URL
  Type:       GET
*/
export enum GetPortfoliosStatus {
  Success = 'Successfully retrieved Portfolios',
  Error = 'Error retrieving Portfolios',
}

/*
  Endpoint:   UPDATE_PORTFOLIO_URL
  Type:       PUT
*/
export enum PutPortfoliosStatus {
  Success = 'Successfully updated Portfolio',
  Error = 'Error updating Portfolio',
}

// -- prices

/*
  Endpoint:   GET_LATEST_PRICES_URL
  Type:       GET
*/
export enum GetPricesStatus {
  Success = 'Successfully retrieved latest Prices',
  Error = 'Error retrieving latest Prices',
}

/*
  Endpoint:   ADD_LATEST_PRICE_URL
  Type:       POST
*/
export enum PostLatestPriceStatus {
  Success = 'Successfully loaded latest Price',
  Error = 'Error loading latest Price',
}

/*
  Endpoint:   ADD_PRICE_URL
  Type:       POST
*/
export enum PostPriceStatus {
  Success = 'Successfully added Price',
  Error = 'Error adding Price',
}

// -- product

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

// -- portfolio
export const GET_PORTFOLIOS_URL = '/portfolios'
export const UPDATE_PORTFOLIO_URL = '/portfolio'

// -- product
export const ADD_PRODUCT_URL = '/product'
export const GET_PRODUCTS_URL = '/products'

// -- prices
export const ADD_LATEST_PRICE_URL = '/price/latest'
export const ADD_PRICE_URL = '/price'
export const GET_LATEST_PRICES_URL = '/prices/latest'


// =====
// types
// =====

// ---------
// responses
// ---------

// -- base

// base body response
export type TResBody = {
  message: string
}

// body for successful response with data
export type TDataResBody<Type> = TResBody & {
  data: Type
}

// -- product

/*
  Endpoint:   ADD_PRODUCT_URL
  Type:       POST
  Req / Res:  Response
*/
export type TProductPostResBody<Type> = TDataResBody<Type> & {
  tcgplayerId: number
}

// --------
// requests
// --------

// -- portfolio

/*
  Endpoint:   UPDATE_PORTFOLIO_URL
  Type:       PUT
  Req / Res:  Request
*/
export type TPutPortfolioReqBody = {
  existingPortfolio: IPortfolio,
  newPortfolio: IPortfolio
}

// -- price

/*
  Endpoint:   ADD_LATEST_PRICE_URL
  Type:       POST
  Req / Res:  Request
*/
export type TPostLatestPriceReqBody = {
  tcgplayerId: number
}

/*
  Endpoint:   ADD_PRICE_URL
  Type:       POST
  Req / Res:  Request
*/
export type TPostPriceReqBody = {
  marketPrice: number,
  priceDate: Date,
  tcgplayerId: number,
  buylistMarketPrice?: number,
  listedMedianPrice?: number
}

// -- product

/*
  Endpoint:   ADD_PRODUCT_URL
  Type:       POST
  Req / Res:  Request
*/
export type TPostProductReqBody = {
  formData: IProduct,
  imageUrl?: string
}