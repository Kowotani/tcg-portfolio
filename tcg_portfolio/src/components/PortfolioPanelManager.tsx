import { useContext, useEffect, useState, } from 'react'
import axios from 'axios'
import { 
  Breadcrumb,
  BreadcrumbItem,
  Progress,
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

  const breadcrumbBase = ['Portfolio']

  const breadcrumbTrailMap: Map<PortfolioPanelNav, string[]> = new Map([
    [ PortfolioPanelNav.Add, breadcrumbBase.concat(['Add']) ],
    [ PortfolioPanelNav.All, breadcrumbBase.concat(['All']) ],
    [ PortfolioPanelNav.Edit, breadcrumbBase.concat(['Edit']) ],
  ])

  const breadcrumbTrail = breadcrumbTrailMap.get(nav) ?? breadcrumbBase


  // =========
  // functions
  // =========

  /*
  DESC
    Function to pass to children to enter Add Mode of a Portfolio
  */
    function handleOnEnterAddMode(): void {
      setActivePortfolio({
        userId: user.userId,
        portfolioName: '',
        populatedHoldings: []
      } as IPopulatedPortfolio)
      setNav(PortfolioPanelNav.Add)
    }

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
          <Progress 
            height='24px'
            m='8px 0px'
            isIndeterminate
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
                  onAddClick={handleOnEnterAddMode}
                  onEditClick={handleOnEnterEditMode}
                />
              )
            }

            {/* Add / Edit Portfolio */}
            {_.includes([PortfolioPanelNav.Add, PortfolioPanelNav.Edit], nav)
              && (
                <EditPortfolioForm 
                  portfolio={activePortfolio}
                  mode={nav}
                  onExit={handleOnEnterAllPortfolios}
                />
              )
            }

            {/* Portfolio Performance */}
          </>
      )}
    </>
  )
}