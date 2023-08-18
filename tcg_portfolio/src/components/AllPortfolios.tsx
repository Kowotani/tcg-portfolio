import { PropsWithChildren, useContext, useEffect, useState, } from 'react'
import axios from 'axios'
import { 
  Box,
  Input,
  Spacer,
  Text
} from '@chakra-ui/react'
import { 
  IPopulatedHolding, IPopulatedPortfolio, IProduct, 
  ITransaction, ProductLanguage, ProductSubtype, ProductType, TCG, 
  TransactionType,

  GET_PORTFOLIOS_URL,

  TDataResBody
} from 'common'
import { PortfolioCard } from './PortfolioCard'
import { InputErrorWrapper } from './InputField'
import { FilterInput } from './FilterInput'
import { UserContext } from '../state/UserContext'
import { 
  IUserContext,

  sortFnPopulatedHoldingAsc, 
} from '../utils' 


export const AllPortfolios = () => {

  // =====
  // state
  // =====

  const [ portfolios, setPortfolios ] = useState('')
  const { user } = useContext(UserContext) as IUserContext


  // =====
  // hooks
  // =====

  // // initial load of user Portfolios
  // useEffect(() => {
  //   axios({
  //     method: 'get',
  //     url: GET_PORTFOLIOS_URL,
  //     params: {
  //       userId: user.userId
  //     }
  //   })
  //   .then(res => {
  //     const resData = res.data
  //     assert(resData )
  //     const portfolios: IPortfolio[] = res.data.data
  //     const existingTCGPlayerIds = portfolio.hydratedHoldings.map(
  //       (holding: IPopulatedHolding) => holding.product.tcgplayerId
  //     )
  //     const searchableProducts = products.filter((product: IProduct) => {
  //       return !existingTCGPlayerIds.includes(product.tcgplayerId)
  //     })
      
  //   })
  //   .catch(err => {
  //     console.log('Error fetching Portfolios: ' + err)
  //   })
  // }, [])

  // ==============
  // main component
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

  const fooHolding: IPopulatedHolding = {
    product: fooProduct,
    transactions: fooTransactions
  }
  const fooPortfolio: IPopulatedPortfolio = {
    userId: 1234,
    portfolioName: 'Alpha Investments',
    populatedHoldings: [fooHolding].sort(sortFnPopulatedHoldingAsc),
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
        populatedPortfolio={fooPortfolio}
        onPortfolioDelete={(fooPortfolio) => console.log('deleted portfolio')}
        onPortfolioUpdate={(fooPortfolio) => console.log('updated portfolio')}
      />
    </>
  )
}