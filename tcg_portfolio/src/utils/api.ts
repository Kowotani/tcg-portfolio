import { 
  // data models
  IPopulatedHolding, IPopulatedPortfolio, IProduct, ITCProduct, ITransaction, 
  TDatedValue, TPerformanceData,

  // type guards
  hasIDatedPriceDataKeys, hasIPopulatedHoldingKeys, hasIPopulatedPortfolioKeys, 
  hasIProductKeys, hasITCProductKeys, hasITransactionKeys, hasTDatedValueKeys, 
  hasTPerformanceDataKeys,
  
  isIDatedPriceData, isIPopulatedHolding, isIPopulatedPortfolio, 
  isIPopulatedPortfolioArray, isIProduct, isITCProduct, isITransaction, 
  isTDatedvalue, isTDatedvalueArray, isTPerformanceData,

  // generic
  assert, getLocalDateFromISOString, IDatedPriceData, PerformanceMetric
} from 'common'
import * as _ from 'lodash'


// ========
// endpoint
// ========

/*
ENDPOINT
  GET:LATEST_PRICES_URL
DESC
  Parses the input response object from the endpoint and returns a 
  Map<number, IDatedPriceData>
INPUT
  response: The response corresponding to the return value
RETURN
  A map of tcgplayerId => IDatedPriceData
*/
export function parseLatestPricesEndpointResponse(
  response: any[]
): Map<number, IDatedPriceData> {

  const priceMap = new Map<number, IDatedPriceData>()

  Object.keys(response).forEach((key: any) => {

    // tcgplayerId check
    const tcgplayerId = Number(key)
    assert(
      _.isNumber(tcgplayerId), 
      'Key is not a number')

    // parse datedPriceData
    const datedPriceData = parseDatedPriceDataJSON(response[tcgplayerId])
    assert(
      isIDatedPriceData(datedPriceData),
      'Value is not an IDatedPriceData'
    )
    
    priceMap.set(tcgplayerId, datedPriceData)
  })
  return priceMap
}

/*
ENDPOINT
  GET:PORTFOLIOS_URL
DESC
  Parses the input response object from the endpoint and returns an
  IPopulatedPortfolio[]
INPUT
  response: The response corresponding to the return value
RETURN
  An IPopulatedPortfolio[]
*/
export function parsePortfoliosEndpointResponse(
  response: any[]
): IPopulatedPortfolio[] {

  // parse populatedPortfolio
  const portfolios = response.map((json: any) => {
    return parsePopulatedPortfolioJSON(json)
  }) 
  assert(isIPopulatedPortfolioArray(portfolios), 
    'Could not parse IPopulatedPortfolio[]')

  return portfolios
}

/*
ENDPOINT
  GET:PRODUCT_PERFORMANCE_URL
DESC
  Parses the input response object from the endpoint and returns 
    a TPerformanceData
INPUT
  response: The response corresponding to the return value
RETURN
  A TPerformanceData
*/
export function parseProductPerformanceEndpointResponse(
  response: any
): TPerformanceData {

  // parse TPerformanceData
  return parseTPerformanceDataJSON(response)
}

/*
ENDPOINT
  GET:PRODUCTS_URL
DESC
  Parses the input response object from the endpoint and returns an IProduct[]
INPUT
  response: The response corresponding to the return value
RETURN
  An IProduct[]
*/
export function parseProductsEndpointResponse(
  response: any[]
): IProduct[] {

  // parse Product
  const products = response.map((json: any) => {
    return parseProductJSON(json)
  })

  return products
}

/*
ENDPOINT
  GET:UNVALIDATED_TCPRODUCTS_URL
DESC
  Parses the input response object from the endpoint and returns an ITCProduct[]
INPUT
  response: The response corresponding to the return value
RETURN
  An ITCProduct[]
*/
export function parseUnvalidatedTCProductsEndpointResponse(
  response: any[]
): ITCProduct[] {

  // parse ITCProduct
  const products = response.map((json: any) => {
    return parseTCProductJSON(json)
  })

  return products
}


// =======
// generic
// =======

/*
DESC
  Returns a TDatedValue after parsing the input json
INPUT
  json: A JSON representation of a TDatedValue
RETURN
  An TDatedValue
*/
function parseTDatedValueJSON(json: any): TDatedValue {

  // verify keys exist
  assert(hasTDatedValueKeys(json), 'JSON is not TDatedValue shaped')

  // parse json
  const obj = {
    date: getLocalDateFromISOString(json.date),
    value: json.value as number
  }
  assert(isTDatedvalue(obj), 'Object is not a TDatedValue')
  return obj
}

/*
DESC
  Returns a TDatedValue[] after parsing the input json
INPUT
  json: A JSON representation of a TDatedValue[]
RETURN
  An TDatedValue[]
*/
function parseTDatedValueArrayJSON(json: any): TDatedValue[] {

  // verify JSON shape
  assert(_.isArray(json), 'JSON is not array shaped')

  // parse json
  const obj = json.map((el: any) => {
    return parseTDatedValueJSON(el)
  })
  assert(isTDatedvalueArray(obj), 'Object is not a TDatedValue[]')
  return obj
}

/*
DESC
  Returns a TPerformanceData after parsing the input json
INPUT
  json: A JSON representation of a TPerformanceData
RETURN
  An TPerformanceData
*/
function parseTPerformanceDataJSON(json: any): TPerformanceData {

  // verify keys exist
  assert(hasTPerformanceDataKeys(json), 'JSON is not TPerformanceData shaped')

  // parse json
  const obj = {} as TPerformanceData
  Object.keys(json).forEach((key: string) => {
    obj[key as PerformanceMetric] = parseTDatedValueArrayJSON(json[key])
  })
  assert(isTPerformanceData(obj), 'Object is not a TPerformanceData')
  return obj
}


// =======
// holding
// =======

/*
DESC
  Returns an IPopulatedHolding after parsing the input json
INPUT
  json: A JSON representation of an IPopulatedHolding
RETURN
  An IPopulatedHolding
*/
function parsePopulatedHoldingJSON(json: any): IPopulatedHolding {

  // verify keys exist
  assert(hasIPopulatedHoldingKeys(json), 'JSON is not IPopulatedHolding shaped')

  // parse json
  const obj = {
    product: parseProductJSON(json.product),
    transactions: json.transactions.map((transaction: any) => {
      return parseTransactionJSON(transaction)
    })
  }
  assert(isIPopulatedHolding(obj), 'Object is not an IPopulatedHolding')
  return obj
}


// =========
// portfolio
// =========

/*
DESC
  Returns an IPopulatedPortfolio after parsing the input json
INPUT
  json: A JSON representation of an IPopulatedPortfolio
RETURN
  An IPopulatedPortfolio
*/
function parsePopulatedPortfolioJSON(json: any): IPopulatedPortfolio {

  // verify keys exist
  assert(hasIPopulatedPortfolioKeys(json), 
    'JSON is not IPopulatedPortfolio shaped')

  // parse json
  const obj = {
    ...json,
    populatedHoldings: json.populatedHoldings.map((holding: any) => {
      return parsePopulatedHoldingJSON(holding)
    })

  }
  assert(isIPopulatedPortfolio(obj), 'Object is not an IPopulatedPortfolio')
  return obj
}


// =====
// price
// =====

/*
DESC
  Returns an IDatedPriceData after parsing the input json
INPUT
  json: A JSON representation of an IDatedPriceData
RETURN
  An IDatedPriceData
*/
function parseDatedPriceDataJSON(json: any): IDatedPriceData {

  // verify keys exist
  assert(hasIDatedPriceDataKeys(json), 
    'JSON is not IDatedPriceData shaped')

  // parse json
  const obj = {
    ...json,
    priceDate: getLocalDateFromISOString(json.priceDate)
  }
  assert(isIDatedPriceData(obj), 'Object is not an IDatedPriceData')
  return obj
}


// =======
// product
// =======

/*
DESC
  Returns an IProduct after parsing the input json
INPUT
  json: A JSON representation of an IProduct
RETURN
  An IProduct
*/
function parseProductJSON(json: any): IProduct {

  // verify keys exist
  assert(hasIProductKeys(json), 'JSON is not IProduct shaped')

  // parse json
  const obj = {
    ...json,
    releaseDate: getLocalDateFromISOString(json.releaseDate)
  }
  assert(isIProduct(obj), 'Object is not an IProduct')
  return obj
}


// =========
// tcproduct
// =========

/*
DESC
  Returns an ITCProduct after parsing the input json
INPUT
  json: A JSON representation of an ITCProduct
RETURN
  An ITCProduct
*/
function parseTCProductJSON(json: any): ITCProduct {

  // verify keys exist
  assert(hasITCProductKeys(json), 'JSON is not ITCProduct shaped')

  // parse json
  const obj = {
    ...json,
    releaseDate: getLocalDateFromISOString(json.releaseDate)
  }
  assert(isITCProduct(obj), 'Object is not an ITCProduct')
  return obj
}


// ===========
// transaction
// ===========

/*
DESC
  Returns an ITransaction after parsing the input json
INPUT
  json: A JSON representation of an ITransaction
RETURN
  An ITransaction
*/
function parseTransactionJSON(json: any): ITransaction {

  // verify keys exist
  assert(hasITransactionKeys(json), 'JSON is not ITransaction shaped')

  // parse json
  const obj = {
    ...json,
    date: getLocalDateFromISOString(json.date)
  }
  assert(isITransaction(obj), 'Object is not an ITransaction')
  return obj
}