import {
  TDataResBody, TProductPostResBody, TResBody,
} from './api'
import {
  IDatedPriceData, IHolding, IPopulatedHolding, IPopulatedPortfolio, IPortfolio, 
  IPrice, IPriceData, IProduct, ITransaction, ProductLanguage, ProductSubtype, 
  ProductType, TCG, TDatedValue, TransactionType,
} from './dataModels'
import * as _ from 'lodash'


// ===
// api
// ===

/*
DESC
  Returns whether or not the input is a TResBody
INPUT
  arg: An object that might be an TResBody 
RETURN
  TRUE if the input is an TResBody, FALSE otherwise
*/
export function isTResBody(arg: any): arg is TResBody {
  return arg
    && arg.message && typeof(arg.message) === 'string'
}

/*
DESC
  Returns whether or not the input is a TDataResBody
INPUT
  arg: An object that might be an TDataResBody 
RETURN
  TRUE if the input is an TDataResBody, FALSE otherwise
*/
export function isTDataResBody<Type>(arg: any): arg is TDataResBody<Type> {
  return arg
    // TODO: implement the type check
    && arg.data
    && isTResBody(arg)
}

/*
DESC
  Returns whether or not the input is a TProductPostResBody
INPUT
  arg: An object that might be an TProductPostResBody 
RETURN
  TRUE if the input is an TProductPostResBody, FALSE otherwise
*/
export function isTProductPostResBody<Type>(
  arg: any
): arg is TProductPostResBody<Type> {
  return arg
    && arg.tcgplayerId && typeof(arg.tcgplayerId) === 'number'
    && isTDataResBody<Type>(arg)
}


// =======
// generic
// =======

/*
DESC
  Returns whether or not the input has all TDatedValue keys
INPUT
  arg: An object that might be a TDatedValue
RETURN
  TRUE if the input has all TDatedValue keys, FALSE otherwise
*/
export function hasTDatedValueKeys(arg: any): boolean {
  return arg
    && arg.date
    && arg.value
}

/*
DESC
  Returns whether or not the input is an IHolding[]
INPUT
  arg: An object that might be an IHolding[] 
RETURN
  TRUE if the input is an IHolding[], FALSE otherwise
*/
export function isTDatedvalue(arg: any): arg is TDatedValue {
  return arg
    && hasTDatedValueKeys(arg)
    && _.isDate(arg.date)
    && typeof(arg.value) === 'number'
}


// =======
// holding
// =======

/*
DESC
  Returns whether or not the input has all IHoldingBase keys
INPUT
  arg: An object that might be an IHoldingBase
RETURN
  TRUE if the input has all IHoldingBase keys, FALSE otherwise
*/
export function hasIHoldingBaseKeys(arg: any): boolean {
  return arg 
    && arg.transactions
}

/*
DESC
  Returns whether or not the input has all IHolding keys
INPUT
  arg: An object that might be an IHolding 
RETURN
  TRUE if the input has all IHolding keys, FALSE otherwise
*/
export function hasIHoldingKeys(arg: any): boolean {
  return arg 
    && hasIHoldingBaseKeys(arg)
    && arg.tcgplayerId
}

/*
DESC
  Returns whether or not the input has all IPopulatedHolding keys
INPUT
  arg: An object that might be an IPopulatedHolding 
RETURN
  TRUE if the input has all IPopulatedHolding keys, FALSE otherwise
*/
export function hasIPopulatedHoldingKeys(arg: any): boolean {
  return arg 
    && hasIHoldingBaseKeys(arg)
    && arg.product
}

/*
DESC
  Returns whether or not the input is an IHolding
INPUT
  arg: An object that might be an IHolding 
RETURN
  TRUE if the input is an IHolding, FALSE otherwise
*/
export function isIHolding(arg: any): arg is IHolding {
  return arg
    && hasIHoldingKeys(arg)
    && typeof(arg.tcgplayerId) === 'number'
    && Array.isArray(arg.transactions)
      && _.every(arg.transactions.map((el: any) => {
        return isITransaction(el)
      }))
}

/*
DESC
  Returns whether or not the input is an IHolding[]
INPUT
  arg: An object that might be an IHolding[] 
RETURN
  TRUE if the input is an IHolding[], FALSE otherwise
*/
export function isIHoldingArray(arg: any): arg is IHolding[] {
  return arg
    && Array.isArray(arg)
    && _.every(arg.map((el: any) => {
      return isIHolding(el)
    }))
}

/*
DESC
  Returns whether or not the input is an IPopulatedHolding
INPUT
  arg: An object that might be an IPopulatedHolding 
RETURN
  TRUE if the input is an IPopulatedHolding, FALSE otherwise
*/
export function isIPopulatedHolding(arg: any): arg is IPopulatedHolding {
  return arg
    && hasIPopulatedHoldingKeys(arg)
    && isIProduct(arg.product)
    && Array.isArray(arg.transactions)
      && _.every(arg.transactions.map((el: any) => {
        return isITransaction(el)
      }))
}

/*
DESC
  Returns whether or not the input is an IProduct
INPUT
  arg: An object that might be an IProduct 
RETURN
  TRUE if the input is an IProduct, FALSE otherwise
*/
export function isIProduct(arg: any): arg is IProduct {
  return arg
    // required
    && hasIProductKeys(arg)
    && typeof(arg.tcgplayerId) === 'number'
    && _.values(TCG).includes(arg.tcg)
    && _.isDate(arg.releaseDate)
    && typeof(arg.name) === 'string'
    && _.values(ProductType).includes(arg.type)
    && _.values(ProductLanguage).includes(arg.language)

    // optional
    && arg.msrp ? typeof(arg.msrp) === 'number' : true
    && arg.subtype ? _.values(ProductSubtype).includes(arg.subtype) : true
    && arg.setCode ? typeof(arg.setCode) === 'string' : true
}


// =========
// portfolio
// =========

/*
DESC
  Returns whether or not the input has all IPopulatedPortfolio keys
INPUT
  arg: An object that might be an IPopulatedPortfolio 
RETURN
  TRUE if the input has all IPopulatedPortfolio keys, FALSE otherwise
*/
export function hasIPopulatedPortfolioKeys(arg: any): boolean {
  return arg 
    && hasIPortfolioBaseKeys(arg)
    && arg.populatedHoldings
}

/*
DESC
  Returns whether or not the input has all IPortfolioBase keys
INPUT
  arg: An object that might be an IPortfolioBase
RETURN
  TRUE if the input has all IPortfolioBase keys, FALSE otherwise
*/
export function hasIPortfolioBaseKeys(arg: any): boolean {
  return arg 
    && arg.userId
    && arg.portfolioName
}

/*
DESC
  Returns whether or not the input has all IPortfolio keys
INPUT
  arg: An object that might be an IPortfolio 
RETURN
  TRUE if the input has all IPortfolio keys, FALSE otherwise
*/
export function hasIPortfolioKeys(arg: any): boolean {
  return arg 
    && hasIPortfolioBaseKeys(arg)
    && arg.holdings
}

/*
DESC
  Returns whether or not the input is an IPopulatedPortfolio
INPUT
  arg: An object that might be an IPopulatedPortfolio 
RETURN
  TRUE if the input is an IPopulatedPortfolio, FALSE otherwise
*/
export function isIPopulatedPortfolio(arg: any): arg is IPopulatedPortfolio {
  return arg
    && hasIPopulatedPortfolioKeys(arg)
    && typeof(arg.userId) === 'number'
    && typeof(arg.portfolioName) === 'string'
    && Array.isArray(arg.populatedHoldings)
      && _.every(arg.populatedHoldings.map((el: any) => {
        return isIPopulatedHolding(el)
      }))
}

/*
DESC
  Returns whether or not the input is an IPopulatedPortfolio[]
INPUT
  arg: An object that might be an IPopulatedPortfolio[] 
RETURN
  TRUE if the input is an IPopulatedPortfolio[], FALSE otherwise
*/
export function isIPopulatedPortfolioArray(
  arg: any
): arg is IPopulatedPortfolio[] {
  return arg
    && Array.isArray(arg)
    && _.every(arg.map((el: any) => {
      return isIPopulatedPortfolio(el)
    }))
}

/*
DESC
  Returns whether or not the input is an IPortfolio
INPUT
  arg: An object that might be an IPortfolio 
RETURN
  TRUE if the input is an IPortfolio, FALSE otherwise
*/
export function isIPortfolio(arg: any): arg is IPortfolio {
  return arg
    && hasIPortfolioKeys(arg)
    && typeof(arg.userId) === 'number'
    && typeof(arg.portfolioName) === 'string'
    && Array.isArray(arg.holdings)
      && _.every(arg.holdings.map((el: any) => {
        return isIHolding(el)
      }))
}

/*
DESC
  Returns whether or not the input is an IPortfolio[]
INPUT
  arg: An object that might be an IPortfolio[] 
RETURN
  TRUE if the input is an IPortfolio[], FALSE otherwise
*/
export function isIPortfolioArray(arg: any): arg is IPortfolio[] {
  return arg
    && Array.isArray(arg)
    && _.every(arg.map((el: any) => {
      return isIPortfolio(el)
    }))
}


// =====
// price
// =====

/*
DESC
  Returns whether or not the input has all IDatedPriceData keys
INPUT
  arg: An object that might be an IDatedPriceData
RETURN
  TRUE if the input has all IDatedPriceData keys, FALSE otherwise
*/
export function hasIDatedPriceDataKeys(arg: any): boolean {
  return arg 
    && arg.priceDate 
    && arg.prices
}

/*
DESC
  Returns whether or not the input is an IDatedPriceData
INPUT
  arg: An object that might be an IDatedPriceData 
RETURN
  TRUE if the input is an IDatedPriceData, FALSE otherwise
*/
export function isIDatedPriceData(arg: any): arg is IDatedPriceData {
  return arg
    && hasIDatedPriceDataKeys(arg)
    && _.isDate(arg.priceDate)
    && isIPriceData(arg.prices)
}

/*
DESC
  Returns whether or not the input is an IPrice
INPUT
  arg: An object that might be an IPrice 
RETURN
  TRUE if the input is an IPrice, FALSE otherwise
*/
export function isIPrice(arg: any): arg is IPrice {
  return arg
    && arg.priceDate && _.isDate(arg.priceData)
    && arg.tcgplayerId && typeof(arg.tcgplayerId) === 'number'
    && arg.granularity && typeof(arg.granularity) === 'string'
    && arg.prices && isIPriceData(arg.prices)
}

/*
DESC
  Returns whether or not the input is an IPrice[]
INPUT
  arg: An object that might be an IPrice[]
RETURN
  TRUE if the input is an IPrice[], FALSE otherwise
*/
export function isIPriceArray(arg: any): arg is IPrice {
  return arg
    && Array.isArray(arg)
    && _.every(arg.map((el: any) => {
      return isIPrice(el)
    }))
}

/*
DESC
  Returns whether or not the input is an IPriceData
INPUT
  arg: An object that might be an IPriceData 
RETURN
  TRUE if the input is an IPriceData, FALSE otherwise
*/
export function isIPriceData(arg: any): arg is IPriceData {
  return arg
    // required
    && arg.marketPrice && typeof(arg.marketPrice) === 'number'

    // optional
    && arg.buylistMarketPrice 
      ? typeof(arg.buylistMarketPrice) === 'number' 
      : true
    && arg.listedMedianPrice 
      ? typeof(arg.listedMedianPrice) === 'number' 
      : true
}

/*
DESC
  Returns whether or not the input is an IPriceData[]
INPUT
  arg: An object that might be an IPriceData[] 
RETURN
  TRUE if the input is an IPriceData[], FALSE otherwise
*/
export function isIPriceDataArray(arg: any): arg is IPriceData[] {
  return arg
    && Array.isArray(arg)
    && _.every(arg.map((el: any) => {
      return isIPriceData(el)
    }))
}


// =======
// product
// =======

/*
DESC
  Returns whether or not the input has all IProduct keys
INPUT
  arg: An object that might be an IProduct
RETURN
  TRUE if the input has all IProduct keys, FALSE otherwise
*/
export function hasIProductKeys(arg: any): boolean {
  return arg 
    && arg.tcgplayerId 
    && arg.tcg 
    && arg.releaseDate
    && arg.name
    && arg.type
    && arg.language
}


// ===========
// transaction
// ===========

/*
DESC
  Returns whether or not the input has all ITransaction keys
INPUT
  arg: An object that might be an ITransaction
RETURN
  TRUE if the input has all ITransaction keys, FALSE otherwise
*/
export function hasITransactionKeys(arg: any): boolean {
  return arg 
  && arg.type
  && arg.date
  && arg.price
  && arg.quantity
}

/*
DESC
  Returns whether or not the input is an ITransaction
INPUT
  arg: An object that might be an ITransaction 
RETURN
  TRUE if the input is an ITransaction, FALSE otherwise
*/
export function isITransaction(arg: any): arg is ITransaction {
  return arg
    && hasITransactionKeys(arg)
    && _.values(TransactionType).includes(arg.type)
    && _.isDate(arg.date)
    && typeof(arg.price) === 'number'
    && typeof(arg.quantity) === 'number'
}

/*
DESC
  Returns whether or not the input is an ITransaction[]
INPUT
  arg: An object that might be an ITransaction[] 
RETURN
  TRUE if the input is an ITransaction[], FALSE otherwise
*/
export function isITransactionArray(arg: any): arg is ITransaction[] {
  return arg
    && Array.isArray(arg)
    && _.every(arg.map((el: any) => {
      return isITransaction(el)
    }))
}