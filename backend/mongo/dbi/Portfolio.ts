// imports
import { 
  IHolding, IPopulatedHolding, IPopulatedPortfolio, IPortfolio, 
  IPortfolioMethods, 

  assert, getHoldingTcgplayerId, getPortfolioHoldings, isIPopulatedHolding
} from 'common'
import { 
  areValidHoldings, getIMHoldingsFromIHoldings 
} from '../../utils/Holding'
import * as _ from 'lodash'
import mongoose, { HydratedDocument} from 'mongoose'
import { IMPortfolio, Portfolio } from '../models/portfolioSchema'
import { 
  genPortfolioAlreadyExistsError, genPortfolioNotFoundError, isPortfolioDoc
} from '../../utils/Portfolio'


// =======
// globals
// =======

// get mongo client
const url = 'mongodb://localhost:27017/tcgPortfolio'


// =========
// functions
// =========

/*
DESC
  Adds a Portfolio based on the given inputs
INPUT
  portfolio: An IPortfolio
RETURN
  TRUE if the Portfolio was successfully created, FALSE otherwise
*/
export async function addPortfolio(portfolio: IPortfolio): Promise<boolean> {

  // connect to db
  await mongoose.connect(url)

  const userId = portfolio.userId
  const portfolioName = portfolio.portfolioName
  const description = portfolio.description

  try {

    // check if portfolioName exists for this userId
    const portfolioDoc = await getPortfolioDoc(portfolio)
    if (isPortfolioDoc(portfolioDoc)) {
      throw genPortfolioAlreadyExistsError(userId, portfolioName, 
        'addPortfolio()')
    } 

    // get IMHolding[]
    const holdings = await getIMHoldingsFromIHoldings(portfolio.holdings)

    // create IPortfolio
    let newPortfolio: IPortfolio = {
      userId: userId,
      portfolioName: portfolioName,
      holdings: holdings
    }
    if (description) {
      newPortfolio['description'] = portfolio.description
    }

    // create the portfolio  
    await Portfolio.create(newPortfolio)

    return true

  } catch(err) {

    const errMsg = `An error occurred in addPortfolio(): ${err}`
    throw new Error(errMsg)
  }
}

/*
DESC
  Deletes the Portfolio document by userId and portfolioName
INPUT
  userId: The associated userId
  portfolioName: The portfolio's name
RETURN
  TRUE if the Portfolio was successfully created, FALSE otherwise
*/
export async function deletePortfolio(portfolio: IPortfolio): Promise<boolean> {

  // connect to db
  await mongoose.connect(url)

  const userId = portfolio.userId
  const portfolioName = portfolio.portfolioName

  try {

    // check if portfolioName exists for this userId
    const portfolioDoc = await getPortfolioDoc(portfolio)
    if (!isPortfolioDoc(portfolioDoc)) {
      throw genPortfolioNotFoundError(userId, portfolioName, 
        'deletePortfolio()')
    }

    // delete the portfolio  
    const res = await Portfolio.deleteOne({
      'userId': userId,
      'portfolioName': portfolioName,
    })
    return res.deletedCount === 1

  } catch(err) {

    const errMsg = `An error occurred in deletePortfolio(): ${err}`
    throw new Error(errMsg)
  }
}

/*
DESC
  Retrieves the Portfolio document by userId and portfolioName
INPUT
  userId: The associated userId
  portfolioName: The portfolio's name
RETURN
  The document if found, else null
*/
export async function getPortfolioDoc(
  portfolio: IPortfolio
): Promise<HydratedDocument<IMPortfolio, IPortfolioMethods> | null> {

  // connect to db
  await mongoose.connect(url)

  try {

    const portfolioDoc = await Portfolio.findOne({
      'userId': portfolio.userId,
      'portfolioName': portfolio.portfolioName,
    })
    return portfolioDoc

  } catch(err) {

    const errMsg = `An error occurred in getPortfolioDoc(): ${err}`
    throw new Error(errMsg)
  } 
}

/*
DESC
  Retrieves all Portfolio documents for the input userId
INPUT
  userId: The associated userId
RETURN
  An array of Portfolio documents
*/
export async function getPortfolioDocs(
  userId: number
): Promise<HydratedDocument<IMPortfolio, IPortfolioMethods>[]> {

  // connect to db
  await mongoose.connect(url)

  try {

    const docs = await Portfolio.find({'userId': userId})
    return docs

  } catch(err) {

    const errMsg = `An error occurred in getPortfolioDocs(): ${err}`
    throw new Error(errMsg)
  } 
}



/*
DESC
  Retrieves all IPopulatedPortfolios for the input userId
INPUT
  userId: The associated userId
RETURN
  An array of IPopulatedPortfolios
*/
export async function getPortfolios(
  userId: number
): Promise<IPopulatedPortfolio[]> {

  // connect to db
  await mongoose.connect(url)

  try {

    const docs = await Portfolio
      .find({'userId': userId})
      .populate({
        path: 'holdings',
        populate: {path: 'product'}
      })
      .select('-holdings.tcgplayerId')
    const portfolios: IPopulatedPortfolio[] = docs.map(
      (portfolio: IMPortfolio) => {

        // create populatedHoldings
        const populatedHoldings: IPopulatedHolding[] = portfolio.holdings.map(
          (el: any) => {
            assert(isIPopulatedHolding(el), 
              'Element is not an IPopulatedHolding')
            return el
        })

        // create populatedPortfolio
        return {
          userId: portfolio.userId,
          portfolioName: portfolio.portfolioName,
          description: portfolio.description,
          populatedHoldings: populatedHoldings
        }
    })

    return portfolios

  } catch(err) {

    const errMsg = `An error occurred in getPortfolios(): ${err}`
    throw new Error(errMsg)
  } 
}

/*
DESC
  Returns the tcpglayerIds found in the input Portfolio
INPUT
  portfolio: An IPortfolio
RETURN
  A number[]
*/
export async function getPortfolioTcgplayerIds(
  portfolio: IPortfolio
): Promise<number[]> {
 
  // connect to db
  await mongoose.connect(url)

  try {

    const portfolioDoc = await getPortfolioDoc(portfolio)
    const holdings = getPortfolioHoldings(portfolioDoc as IMPortfolio)
    return holdings.map((holding: IHolding | IPopulatedHolding) => {
      return getHoldingTcgplayerId(holding)
    })

  } catch(err) {

    const errMsg = `An error occurred in getPortfolioTcgplayerIds(): ${err}`
    throw new Error(errMsg)
  } 
}

/*
DESC
  Sets an existing Portfolio to be equal to a new Portfolio
INPUT 
  existingPortfolio: The Portfolio to update
  newPortfolio: The new state of the Portfolio
RETURN
  TRUE if the Portfolio was successfully set, FALSE otherwise
*/
export async function setPortfolio(
  existingPortfolio: IPortfolio,
  newPortfolio: IPortfolio,
): Promise<boolean> {

  // connect to db
  await mongoose.connect(url)

  try {

    // check that userIds match
    assert(existingPortfolio.userId === newPortfolio.userId,
      `Mismatched userIds provided to setPortfolio(${existingPortfolio.userId}, ${newPortfolio.userId})`
    )

    // check that new Portfolio Holdings are valid
    const hasValidHoldings = await areValidHoldings(newPortfolio.holdings)
    if (!hasValidHoldings) {
      const errMsg = 'New portfolio has invalid holdings'
      throw new Error(errMsg)
    }

    // check if Portfolio exists
    const portfolioDoc = await getPortfolioDoc(existingPortfolio)
    if (!isPortfolioDoc(portfolioDoc)) {
      const errMsg = `Portfolio not found (${existingPortfolio.userId}, ${existingPortfolio.portfolioName})`
      throw new Error(errMsg)
    }
    assert(isPortfolioDoc(portfolioDoc),
      genPortfolioNotFoundError(existingPortfolio.userId, 
        existingPortfolio.portfolioName, 'setPortfolio()').toString()
    )

    // create IMPortfolio for new Portfolio
    const newIMPortfolio = {
      ...newPortfolio,
      holdings: await getIMHoldingsFromIHoldings(newPortfolio.holdings)
    }

    // overwrite existing Portfolio with new Portfolio
    portfolioDoc.overwrite(newIMPortfolio)
    await portfolioDoc.save()
    return true

  } catch(err) {

    const errMsg = `An error occurred in setPortfolio(): ${err}`
    throw new Error(errMsg)
  }
}

async function main(): Promise<number> {  
  return 0
}

main()
  .then(console.log)
  .catch(console.error)