import { useContext, useEffect, useState, } from 'react'
import axios from 'axios'
import { 
  Box,
  Breadcrumb,
  BreadcrumbItem,
  Text
} from '@chakra-ui/react'
import { AllPortfolios } from './AllPortfolios'
import { 
  GET_LATEST_PRICES_URL, logObject,

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

  const { setLatestPrices } 
    = useContext(LatestPricesContext) as ILatestPricesContext
  const { user } = useContext(UserContext) as IUserContext
  const [ nav, setNav ] = useState(PortfolioPanelNav.All)

  // ----------
  // breadcrumb
  // ----------

  const breadcrumbTrail = 
    nav === PortfolioPanelNav.All
      ? ['Portfolio', 'All Portfolios']

      : nav === PortfolioPanelNav.Edit
        ? ['Portfolio', 'Edit']
        : ['Portfolio']


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
  // Main Component
  // ==============

  return (
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
        && <AllPortfolios />
      }

      {/* Add Portfolio */}

      {/* Edit Portfolio */}
      {nav === PortfolioPanelNav.Edit 
        && <EditPortfolioForm />
      }

      {/* Portfolio Performance */}
    </>
  )
}