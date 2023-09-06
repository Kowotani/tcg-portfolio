import { PropsWithChildren, useContext, useEffect, useState, } from 'react'
import axios from 'axios'
import { 
  Box,
  Progress,
  Spacer,
} from '@chakra-ui/react'
import { 
  IPopulatedPortfolio, 

  GET_PORTFOLIOS_URL,

  assert
} from 'common'
import { PortfolioCard } from './PortfolioCard'
import { SectionHeader } from './Layout'
import { UserContext } from '../state/UserContext'
import { IUserContext } from '../utils' 
import { isIPopulatedPortfolioArray } from 'common'

type TAllPortfoliosProps = {
  onEditClick: (portfolio: IPopulatedPortfolio) => void
}
export const AllPortfolios = (
  props: PropsWithChildren<TAllPortfoliosProps>
) => {

  // =====
  // state
  // =====

  const [ portfolios, setPortfolios ] = useState([] as IPopulatedPortfolio[])
  const { user } = useContext(UserContext) as IUserContext

  const isLoadingPortfolios = portfolios.length === 0

  // =====
  // hooks
  // =====

  // initial load of user Portfolios
  useEffect(() => {
    axios({
      method: 'get',
      url: GET_PORTFOLIOS_URL,
      params: {
        userId: user.userId
      }
    })
    .then(res => {
      const portfolios = res.data.data
      assert(isIPopulatedPortfolioArray(portfolios))
      setPortfolios(portfolios)
    })
    .catch(err => {
      console.log('Error fetching Portfolios: ' + err)
    })
  }, [user.userId])


  // ==============
  // main component
  // ==============

  return (
    <>
      {/* Portfolios Header */}
      <SectionHeader header={'Portfolios'}/>
        {isLoadingPortfolios
          ? (
            <Progress 
              height='24px'
              m='8px 0px'
              isIndeterminate
            />
          ) : (
            <>
              {/* Portfolios */}
              {portfolios.map((portfolio: IPopulatedPortfolio) => {
                return (
                  <Box key={portfolio.portfolioName}>
                    <PortfolioCard 
                      populatedPortfolio={portfolio}
                      onPortfolioDelete={() => console.log('deleted portfolio')}
                      onEditClick={props.onEditClick}
                    />
                    <Spacer h='16px' />
                  </Box>
                )
              })}
            </>
        )}
    </>
  )
}