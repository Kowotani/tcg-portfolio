import { IProduct } from "./dataModels"


// =====
// enums
// =====

// GET to /portfolios status
export enum PortfolioGetStatus {
  Success = 'Successfully retrieved Portfolio docs',
  Error = 'Error retrieving Portfolio docs',
}

// POST to /product status
export enum ProductPostStatus {
  Added = 'tcgplayerId added',
  AddedWithoutImage = 'tcgplayerId added (without image)',
  AlreadyExists = 'tcgplayerId already exists',
  Error = 'Error creating the Product doc',
}

export enum ProductsGetStatus {
  Success = 'Successfully retrieved Product docs',
  Error = 'Error retrieving Product docs',
}


// ======
// routes
// ======

export const GET_PORTFOLIOS_URL = '/portfolios'
export const ADD_PRODUCT_URL = '/product'
export const GET_PRODUCTS_URL = '/products'


// =====
// types
// =====

// -- responses

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

// -- requests

/*
  Endpoint:   ADD_PRODUCT_URL
  Type:       POST
  Req / Res:  Request
*/
export type TProductPostReqBody = {
  formData: IProduct,
  imageUrl?: string, 
}