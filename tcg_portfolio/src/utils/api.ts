import { 
  // data models
  IPopulatedHolding, IPopulatedPortfolio, IProduct, ITransaction, 

  // type guards
  hasIPopulatedHoldingKeys, hasIPopulatedPortfolioKeys, hasIProductKeys, 
  hasITransactionKeys, 
  
  isIPopulatedHolding, isIPopulatedPortfolio, isIPopulatedPortfolioArray, 
  isIProduct, isITransaction,

  // generic
  assert, getLocalDateFromISOString
} from 'common'


// ========
// endpoint
// ========

/*
DESC
  Parses the input response object from PORTFOLIOS_URL and returns an
  IPopulatedPortfolio[]
INPUT
  portfolios: The response corresponding to an IPopulatedPortfolio[]
RETURN
  An IPopulatedPortfolio[]
*/
export function parsePortfoliosEndpointResponse(
  response: any[]
): IPopulatedPortfolio[] {

  // parse populatedPortfolio
  const portfolios = response.map((portfolio: any) => {
    return parsePopulatedPortfolioJSON(portfolio)
  }) 
  assert(isIPopulatedPortfolioArray(portfolios), 
    'Could not parse IPopulatedPortfolio[]')

  return portfolios
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