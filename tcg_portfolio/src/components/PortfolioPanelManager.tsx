import { useContext, useEffect, useState, } from 'react'
import axios from 'axios'
import { 
  Breadcrumb,
  BreadcrumbItem,
  Spinner,
  Text
} from '@chakra-ui/react'
import { AllPortfolios } from './AllPortfolios'
import { 
  IPopulatedPortfolio,

  GET_LATEST_PRICES_URL,

  assert
} from 'common'
import { EditPortfolioForm } from './EditPortfolioForm'
import * as _ from 'lodash'
import { LatestPricesContext } from '../state/LatestPricesContext'
import { UserContext } from '../state/UserContext'
import { 
  ILatestPricesContext, IUserContext, PortfolioPanelNav,

  getPriceMapFromPriceAPIResponse
} from '../utils' 


export const PortfolioPanelManager = () => {

  // =====
  // state
  // =====

  const { latestPrices, setLatestPrices } 
    = useContext(LatestPricesContext) as ILatestPricesContext
  const { user } = useContext(UserContext) as IUserContext

  const [ nav, setNav ] = useState(PortfolioPanelNav.All)
  const [ activePortfolio, setActivePortfolio ] 
    = useState({} as IPopulatedPortfolio)

  const isLoadingLatestPrices = latestPrices.size === 0 

  // ----------
  // breadcrumb
  // ----------

  const breadcrumbTrail = 
    nav === PortfolioPanelNav.All
      ? ['Portfolio', 'All Portfolios']

      : nav === PortfolioPanelNav.Edit
        ? ['Portfolio', 'Edit']
        : ['Portfolio']


  // =========
  // functions
  // =========

  /*
  DESC
    Function to pass to children to navigate to All Portfolios
  */
  function handleOnEnterAllPortfolios(): void {
    setActivePortfolio({} as IPopulatedPortfolio)
    setNav(PortfolioPanelNav.All)
  }

/*
  DESC
    Function to pass to children to enter edit mode of a Portfolio
  INPUT
    portfolio: An IPopulatedPortfolio
  */
  function handleOnEnterEditMode(portfolio: IPopulatedPortfolio): void {
    setActivePortfolio(portfolio)
    setNav(PortfolioPanelNav.Edit)
  }

  // =====
  // hooks
  // =====

  // set latestPrices
  useEffect(() => {
    axios({
      method: 'get',
      url: GET_LATEST_PRICES_URL,
    })
    .then(res => {
       // TODO: type check
      const resData = res.data

      // success
      if (res.status === 200) {

        // data check
        const data = resData.data
        assert(
          typeof(data) === 'object',
          'Unexepcted data type in response body of GET_LATEST_PRICES_URL')
        
        const priceMap = getPriceMapFromPriceAPIResponse(data)
        setLatestPrices(priceMap)
    
      // error
      } else {
        const errMsg = `Error fetching from GET_LATEST_PRICES_URL: ${resData.message}`
        console.log(errMsg)
      }
    })
    .catch(err => {
      const errMsg = `Error fetching from GET_LATEST_PRICES_URL: ${err.message}`
      console.log(errMsg)
    })
  }, [])

  
  // ==============
  // main component
  // ==============

  return (
    <>
      {isLoadingLatestPrices
        ? (
          <Spinner 
            color='blue.500'
            emptyColor='gray.200'
            size='xl'
            speed='0.75s'
            thickness='6px'
          />
        ) : (
          <>
            {/* Breadcrumb */}
            <Breadcrumb spacing='8px'>
              {breadcrumbTrail.map((path: string) => {
                return (
                  <BreadcrumbItem key={path}>
                    <Text>{path}</Text>
                  </BreadcrumbItem>
                )
              })}
            </Breadcrumb>

            {/* Portfolio Overview */}
            {nav === PortfolioPanelNav.All 
              && (
                <AllPortfolios 
                  onEditClick={handleOnEnterEditMode}
                />
              )
            }

            {/* Add Portfolio */}

            {/* Edit Portfolio */}
            {nav === PortfolioPanelNav.Edit 
              && (
                <EditPortfolioForm 
                  portfolio={activePortfolio}
                  onExitEditMode={handleOnEnterAllPortfolios}
                />
              )
            }

            {/* Portfolio Performance */}
          </>
      )}
    </>
  )
}