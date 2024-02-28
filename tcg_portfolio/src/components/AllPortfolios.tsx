import { PropsWithChildren, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { 
  Box,
  Button,
  Card,
  CardBody,
  HStack,
  Icon,
  Progress,
  StackDivider
} from '@chakra-ui/react'
import { 
  IPopulatedPortfolio, 

  PORTFOLIOS_URL,

  getAggPortfolioMarketValue, getAggPortfolioTotalCost, getPortfolioNames
} from 'common'
import { FiPlus } from 'react-icons/fi'
import { PortfolioCard } from './PortfolioCard'
import { AddButton, SectionHeader } from './Layout'
import * as _ from 'lodash'
import { MetricSummary, TMetricSummaryItem } from './MetricSummary'
import { LatestPricesContext } from '../state/LatestPricesContext'
import { SideBarNavContext } from '../state/SideBarNavContext'
import { UserContext } from '../state/UserContext'
import { CascadingSlideFade } from './Transitions'
import { parsePortfoliosEndpointResponse } from '../utils/api'
import { 
  ILatestPricesContext, getIPriceDataMapFromIDatedPriceDataMap 
} from '../utils/Price'
import { ISideBarNavContext, SideBarNav } from '../utils/SideBar' 
import { IUserContext } from '../utils/User'



type TAllPortfoliosProps = {
  onAddClick: () => void,
  onEditClick: _.CurriedFunction2<string[], IPopulatedPortfolio, void>,
  onViewPerformanceClick: (portfolio: IPopulatedPortfolio) => void
}
export const AllPortfolios = (
  props: PropsWithChildren<TAllPortfoliosProps>
) => {

  // =====
  // state
  // =====

  const [ portfolios, setPortfolios ] = useState([] as IPopulatedPortfolio[])
  const [ isLoading, setIsLoading ] = useState(false)

  const { user } = useContext(UserContext) as IUserContext
  const { latestPrices } 
    = useContext(LatestPricesContext) as ILatestPricesContext
  const { sideBarNav } = useContext(SideBarNavContext) as ISideBarNavContext


  // =========
  // functions
  // =========

  /*
  DESC
    Removes the input Portfolio from the portfolios state
  INPUT
    portfolio: An IPopulatedPortfolio
  */
  function onDeleteClick(portfolio: IPopulatedPortfolio): void {
    const newPortfolios = portfolios.filter((p: IPopulatedPortfolio) => {
      return p.portfolioName !== portfolio.portfolioName
    })
    setPortfolios(newPortfolios)
  }


  // ===============
  // summary metrics
  // ===============

  const prices = getIPriceDataMapFromIDatedPriceDataMap(latestPrices)
  const aggMarketValue = getAggPortfolioMarketValue(portfolios, prices)
  const aggTotalCost = getAggPortfolioTotalCost(portfolios)

  const overallSummary: TMetricSummaryItem[] = [
    {
      title: 'Total Portfolios:',
      value: portfolios.length,
      formattedPrefix: '',
      formattedPrecision: 0,
      placeholder: '-',
    }
  ]

  const valueSummary: TMetricSummaryItem[] = [
    {
      title: 'Total Cost:',
      value: aggTotalCost,
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: '$ -',
    },
    {
      title: 'Market Value:',
      value: aggMarketValue,
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: '$ -',
    }
  ]

  const profitSummary: TMetricSummaryItem[] = [
    {
      title: 'Profit:',
      value: aggTotalCost 
        ? aggMarketValue - aggTotalCost
        : undefined,
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: '$ -',
    },
    {
      title: 'Return:',
      value: aggTotalCost 
        ? (aggMarketValue / aggTotalCost - 1) * 100
        : undefined,
      formattedPrecision: 2,
      formattedSuffix: '%',
      placeholder: '- %',
    },
  ]


  // =====
  // hooks
  // =====

  // initial load of user Portfolios
  useEffect(() => {

    // set isLoading
    setIsLoading(true)

    // call endpoint
    axios({
      method: 'get',
      url: PORTFOLIOS_URL,
      params: {
        userId: user.userId
      }
    })
    .then(res => {
      // parse response
      const portfolios = parsePortfoliosEndpointResponse(res.data.data)
      setPortfolios(portfolios)
    })
    .catch(err => {
      console.log('Error fetching Portfolios: ' + err)
    })

    // unset isLoading
    setIsLoading(false)
  }, [])


  // ==============
  // main component
  // ==============

  return (
    <>
      {/* Portfolios Header */}
      <SectionHeader header={'Summary'}/>

      {/* Summary Metrics */}
      <Card>
        <CardBody>
          <HStack 
            divider={<StackDivider color='gray.200'/>}
            spacing={4}
          >

            {/* Overall */}
            <Box fontSize='large'>
              <MetricSummary 
                summaryItems={overallSummary}
                variant='list'
              />
            </Box>

            {/* Value */}
            <Box fontSize='large'>
              <MetricSummary 
                summaryItems={valueSummary}
                variant='list'
              />
            </Box>

            {/* Profit */}
            <Box fontSize='large'>
              <MetricSummary 
                summaryItems={profitSummary}
                variant='list'
              />
            </Box>

          </HStack>
        </CardBody>
      </Card>

      {/* Portfolios Header */}
      <SectionHeader header={'Portfolios'}/>

      {/* Add Portfolio Button */}
      <Box display='flex' alignContent='flex-start' m='16px 0px'>
        <AddButton 
          label='Add Portfolio'
          onClick={props.onAddClick}
        />
      </Box>

      {isLoading
        ? (
          <Progress 
            height='24px'
            m='16px 0px'
            isIndeterminate
          />
        ) : (
          <>
            {/* Portfolios */}
            {sideBarNav === SideBarNav.PORTFOLIO 
              && portfolios.map((portfolio: IPopulatedPortfolio, ix: number) => {
                return (
                  <CascadingSlideFade
                    key={portfolio.portfolioName}
                    index={ix}
                    duration={0.5}
                    enterDelay={0.1}
                    itemDelay={0.075}
                  >
                    <Box m='16px 0px'>
                      <PortfolioCard 
                        populatedPortfolio={portfolio}
                        onDeleteClick={onDeleteClick}
                        onEditClick={props.onEditClick(getPortfolioNames(portfolios))}
                        onViewPerformanceClick={props.onViewPerformanceClick}
                      />
                    </Box>
                  </CascadingSlideFade>
                )
            })}
          </>
      )}
    </>
  )
}