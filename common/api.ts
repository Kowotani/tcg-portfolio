import { 
  IPortfolio, IProduct, THoldingPerformanceData, TPerformanceData 
} from './dataModels'


// =====
// enums
// =====

// -- portfolio

/*
  Endpoint:   PORTFOLIO_URL
  Type:       DELETE
*/
export enum DeletePortfolioStatus {
  Success = 'Successfully deleted Portfolio',
  DoesNotExist = 'Portfolio does not exist',
  Error = 'Error deleting Portfolio',
}

/*
  Endpoint:   PORTFOLIO_URL
  Type:       POST
*/
export enum PostPortfolioStatus {
  Success = 'Successfully created Portfolio',
  Error = 'Error creating Portfolio',
}

/*
  Endpoint:   PORTFOLIO_URL
  Type:       PUT
*/
export enum PutPortfolioStatus {
  Success = 'Successfully updated Portfolio',
  Error = 'Error updating Portfolio',
}

/*
  Endpoint:   PORTFOLIO_HOLDINGS_PERFORMANCE_URL
  Type:       GET
*/
export enum GetPortfolioHoldingsPerformanceStatus {
  Success = 'Successfully retrieved Portfolio Holdings performance',
  Error = 'Error retrieving Portfolio Holdings performance',
}

/*
  Endpoint:   PORTFOLIO_PERFORMANCE_URL
  Type:       GET
*/
export enum GetPortfolioPerformanceStatus {
  Success = 'Successfully retrieved Portfolio performance',
  Error = 'Error retrieving Portfolio performance',
}

/*
  Endpoint:   PORTFOLIOS_URL
  Type:       GET
*/
export enum GetPortfoliosStatus {
  Success = 'Successfully retrieved Portfolios',
  Error = 'Error retrieving Portfolios',
}

// -- prices

/*
  Endpoint:   LATEST_PRICE_URL
  Type:       POST
*/
export enum PostLatestPriceStatus {
  Success = 'Successfully loaded latest Price',
  Error = 'Error loading latest Price',
}

/*
  Endpoint:   LATEST_PRICES_URL
  Type:       GET
*/
export enum GetPricesStatus {
  Success = 'Successfully retrieved latest Prices',
  Error = 'Error retrieving latest Prices',
}

/*
  Endpoint:   PRICE_URL
  Type:       POST
*/
export enum PostPriceStatus {
  Success = 'Successfully added Price',
  Error = 'Error adding Price',
}

// -- product

/*
  Endpoint:   PRODUCT_URL
  Type:       POST
*/
export enum PostProductStatus {
  Added = 'tcgplayerId added',
  AddedWithoutImage = 'tcgplayerId added (without image)',
  AlreadyExists = 'tcgplayerId already exists',
  Error = 'Error creating the Product doc',
}

/*
  Endpoint:   PRODUCTS_URL
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
export const PORTFOLIO_URL = '/portfolio'
export const PORTFOLIO_PERFORMANCE_URL = `${PORTFOLIO_URL}/performance`
export const PORTFOLIO_HOLDINGS_PERFORMANCE_URL 
  = `${PORTFOLIO_URL}/holdings/performance`
export const PORTFOLIOS_URL = '/portfolios'

// -- product
export const PRODUCT_URL = '/product'
export const PRODUCTS_URL = '/products'

// -- prices
export const LATEST_PRICE_URL = '/price/latest'
export const LATEST_PRICES_URL = '/prices/latest'
export const PRICE_URL = '/price'



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

// -- portfolio

/*
  Endpoint:   PORTFOLIO_PERFORMANCE_URL
  Type:       GET
  Req / Res:  Response
*/
export type TGetPortfolioPerformanceResBody 
  = TDataResBody<TPerformanceData>

/*
  Endpoint:   PORTFOLIO_HOLDINGS_PERFORMANCE_URL
  Type:       GET
  Req / Res:  Response
*/
export type TGetPortfolioHoldingsPerformanceResBody 
  = TDataResBody<THoldingPerformanceData[]>

// -- product

/*
  Endpoint:   PRODUCT_URL
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
  Endpoint:   PORTFOLIO_URL
  Type:       DELETE
  Req / Res:  Request
*/
export type TDeletePortfolioReqBody = {
  userId: number,
  portfolioName: string
}

/*
  Endpoint:   PORTFOLIO_URL
  Type:       POST
  Req / Res:  Request
*/
export type TPostPortfolioReqBody = {
  portfolio: IPortfolio
}

/*
  Endpoint:   PORTFOLIO_URL
  Type:       PUT
  Req / Res:  Request
*/
export type TPutPortfolioReqBody = {
  existingPortfolio: IPortfolio,
  newPortfolio: IPortfolio
}

// -- price

/*
  Endpoint:   LATEST_PRICE_URL
  Type:       POST
  Req / Res:  Request
*/
export type TPostLatestPriceReqBody = {
  tcgplayerId: number
}

/*
  Endpoint:   PRICE_URL
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
  Endpoint:   PRODUCT_URL
  Type:       POST
  Req / Res:  Request
*/
export type TPostProductReqBody = {
  formData: IProduct,
  imageUrl?: string
}