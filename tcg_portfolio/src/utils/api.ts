import { 
  IPopulatedHolding, IPopulatedPortfolio, IProduct, ITransaction, 

  assert, getLocalDateFromISOString
} from 'common'


// =======
// holding
// =======


// =========
// portfolio
// =========

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

    // parse populatedHoldings
    const holdings = portfolio.populatedHoldings.map((holding: any) => {

      // parse product
      const product = {
        ...holding.product,
        releaseDate: getLocalDateFromISOString(holding.product.releaseDate)
      } as IProduct

      // parse transactions
      const transactions = holding.transactions.map((transaction: any) => {
        return {
          ...transaction,
          date: getLocalDateFromISOString(transaction.date)
        } as ITransaction
      })

      return {
        product: product,
        transactions: transactions
      } as IPopulatedHolding
    })

    return {
      ...portfolio,
      populatedHoldings: holdings
    } as IPopulatedPortfolio
  }) 

  return portfolios as IPopulatedPortfolio[]
}


// =======
// product
// =======