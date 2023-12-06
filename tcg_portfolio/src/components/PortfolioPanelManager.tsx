import { useContext, useEffect, useState, } from 'react'
import axios from 'axios'
import { 
  Breadcrumb,
  BreadcrumbItem,
  Progress,
  Text
} from '@chakra-ui/react'
import * as _ from 'lodash'
import { AllPortfolios } from './AllPortfolios'
import { 
  IPopulatedPortfolio,

  LATEST_PRICES_URL
} from 'common'
import { EditPortfolioForm } from './EditPortfolioForm'
import { PortfolioPerformance } from './PortfolioPerformance'
import { LatestPricesContext } from '../state/LatestPricesContext'
import { UserContext } from '../state/UserContext'
import { parseLatestPricesEndpointResponse } from '../utils/api'
import { PortfolioPanelNav } from '../utils/PortfolioPanel'
import { ILatestPricesContext } from '../utils/Price'
import { IUserContext } from '../utils/User'



export const PortfolioPanelManager = () => {

  // =====
  // state
  // =====

  // ---
  // nav
  // ---

  const [ nav, setNav ] = useState(PortfolioPanelNav.All)

  // ---------
  // Portfolio
  // ---------

  const [ activePortfolio, setActivePortfolio ] 
    = useState({} as IPopulatedPortfolio)
  const [ portfolioNames, setPortfolioNames ] = useState([] as string[])

  // -----
  // Price
  // -----

  const { latestPrices, setLatestPrices } 
    = useContext(LatestPricesContext) as ILatestPricesContext

  const isLoadingLatestPrices = latestPrices.size === 0 

  // ----
  // User
  // ----

  const { user } = useContext(UserContext) as IUserContext

  
  // ==========
  // breadcrumb
  // ==========

  const breadcrumbBase = ['Portfolio']

  const breadcrumbTrailMap: Map<PortfolioPanelNav, string[]> = new Map([
    [ PortfolioPanelNav.Add, breadcrumbBase.concat(['Add']) ],
    [ PortfolioPanelNav.All, breadcrumbBase.concat(['All']) ],
    [ PortfolioPanelNav.Edit, breadcrumbBase.concat(['Edit']) ],
    [ PortfolioPanelNav.Performance, breadcrumbBase.concat(['Performance']) ],
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
  function handleOnEnterEditMode(
    portfolioNames: string[],
    portfolio: IPopulatedPortfolio
  ): void {
    setActivePortfolio(portfolio)
    setPortfolioNames(portfolioNames)
    setNav(PortfolioPanelNav.Edit)
  }

  /*
  DESC
    Function to pass to children to view performance of a Portfolio
  INPUT
    portfolio: An IPopulatedPortfolio
  */
  function handleOnEnterViewPerformance(
    portfolio: IPopulatedPortfolio
  ): void {
    setActivePortfolio(portfolio)
    setNav(PortfolioPanelNav.Performance)
  }

  const curriedHandleOnEnterEditMode = _.curry(handleOnEnterEditMode)


  // =====
  // hooks
  // =====

  // set latestPrices
  useEffect(() => {
    axios({
      method: 'get',
      url: LATEST_PRICES_URL,
    })
    .then(res => {
       // TODO: type check
      const resData = res.data

      // success
      if (res.status === 200) {

        // parse response
        const priceMap = parseLatestPricesEndpointResponse(res.data.data)
        setLatestPrices(priceMap)
    
      // error
      } else {
        const errMsg = `Error fetching from LATEST_PRICES_URL: ${resData.message}`
        console.log(errMsg)
      }
    })
    .catch(err => {
      const errMsg = `Error fetching from LATEST_PRICES_URL: ${err.message}`
      console.log(errMsg)
    })
  }, [])

  
  // ==============
  // main component
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
      
      {isLoadingLatestPrices
        ? (
          <Progress 
            height='24px'
            m='8px 0px'
            isIndeterminate
          />
        ) : (
          <>
            {/* Portfolio Overview */}
            {nav === PortfolioPanelNav.All 
              && (
                <AllPortfolios 
                  onAddClick={handleOnEnterAddMode}
                  onEditClick={curriedHandleOnEnterEditMode}
                  onViewPerformanceClick={handleOnEnterViewPerformance}
                />
              )
            }

            {/* Add / Edit Portfolio */}
            {_.includes([PortfolioPanelNav.Add, PortfolioPanelNav.Edit], nav)
              && (
                <EditPortfolioForm
                  existingPortfolioNames={portfolioNames}
                  mode={nav}
                  portfolio={activePortfolio}
                  onExit={handleOnEnterAllPortfolios}
                />
              )
            }

            {/* Portfolio Performance */}
            {nav === PortfolioPanelNav.Performance
              && (
                <PortfolioPerformance 
                  portfolio={activePortfolio}
                  onExit={handleOnEnterAllPortfolios}
                />
              )
            }
          </>
      )}
    </>
  )
}