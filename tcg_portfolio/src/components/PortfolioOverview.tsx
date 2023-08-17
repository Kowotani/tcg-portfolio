import { PropsWithChildren, useContext, useEffect, useState, } from 'react'
import axios from 'axios'
import { 
  Box,
  Input,
  Spacer,
  Text
} from '@chakra-ui/react'
import { 
  IHydratedHolding, IHydratedPortfolio, IProduct, 
  ITransaction, ProductLanguage, ProductSubtype, ProductType, TCG, 
  TransactionType,

  isIHydratedHolding,

  assert, GET_PRODUCTS_URL, isASCII
} from 'common'
import { PortfolioCard } from './PortfolioCard'
import { InputErrorWrapper } from './InputField'
import { FilterInput } from './FilterInput'
import { UserContext } from '../state/UserContext'
import { 
  IUserContext,

  filterFnHoldingCard, filterFnProductSearchResult, sortFnHydratedHoldingAsc, 
  sortFnProductSearchResults
} from '../utils' 


export const PortfolioOverview = () => {

  // =====
  // state
  // =====

  const [ portfolios, setPortfolios ] = useState('')
  const { user } = useContext(UserContext) as IUserContext


  // ==============
  // Main Component
  // ==============

  // ====================================
  // dummy data start

  const fooTransactions: ITransaction[] = [
    {
      type: TransactionType.Purchase,
      date: new Date(),
      quantity: 123,
      price: 5.67
    }
  ]

  const fooProduct: IProduct = {
    tcgplayerId: 121527,
    tcg: TCG.MagicTheGathering,
    releaseDate: new Date(),
    name: 'Kaladesh',
    type: ProductType.BoosterBox,
    language: ProductLanguage.English,
    subtype: ProductSubtype.Draft,
    setCode: 'KLD',
  }

  const fooHolding: IHydratedHolding = {
    product: fooProduct,
    transactions: fooTransactions
  }
  const fooPortfolio: IHydratedPortfolio = {
    userId: 1234,
    portfolioName: 'Alpha Investments',
    hydratedHoldings: [fooHolding].sort(sortFnHydratedHoldingAsc),
    description: 'The floppiest tacos this side of Florida'
  }


  // dummy data end
  // ====================================

  return (
    <>
      {/* Header */}
      <Box bg='teal.500' color='white' fontWeight='medium' p='8px' m='16px 0px'>
        Portfolios
      </Box>

      {/* Portfolios */}
      <PortfolioCard 
        hydratedPortfolio={fooPortfolio}
        onPortfolioDelete={(fooPortfolio) => console.log('deleted portfolio')}
        onPortfolioUpdate={(fooPortfolio) => console.log('updated portfolio')}
      />
    </>
  )
}