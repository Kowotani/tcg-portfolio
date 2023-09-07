import { PropsWithChildren, useContext, useEffect, useState, } from 'react'
import axios from 'axios'
import { 
  Box,
  Button,
  Card,
  CardBody,
  HStack,
  Progress,
  Spacer,
  StackDivider
} from '@chakra-ui/react'
import { 
  IPopulatedPortfolio, 

  GET_PORTFOLIOS_URL,

  getAggPortfolioMarketValue, getAggPortfolioTotalCost,

  assert
} from 'common'
import { PortfolioCard } from './PortfolioCard'
import { SectionHeader } from './Layout'
import { MetricSummary, TMetricSummaryItem } from './MetricSummary'
import { LatestPricesContext } from '../state/LatestPricesContext'
import { UserContext } from '../state/UserContext'
import { 
  ILatestPricesContext, IUserContext, 
  
  getIPriceDataMapFromIDatedPriceDataMap 
} from '../utils' 
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

  const { latestPrices } 
  = useContext(LatestPricesContext) as ILatestPricesContext


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
      titleStyle: {},
    }
  ]

  const valueSummary: TMetricSummaryItem[] = [
    {
      title: 'Total Cost:',
      value: aggTotalCost,
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: '$ -',
      titleStyle: {},
    },
    {
      title: 'Market Value:',
      value: aggMarketValue,
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: '$ -',
      titleStyle: {},
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
      titleStyle: {},
    },
    {
      title: 'Return:',
      value: aggTotalCost 
        ? (aggMarketValue / aggTotalCost - 1) * 100
        : undefined,
      formattedPrecision: 2,
      formattedSuffix: '%',
      placeholder: '- %',
      titleStyle: {},
    },
  ]


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
      {isLoadingPortfolios
        ? (
          <Progress 
            height='24px'
            m='8px 0px'
            isIndeterminate
          />
        ) : (
          <>
            <Box display='flex' alignContent='flex-start' m='16px 0px'>
              <Button 
                colorScheme='blue'
                onClick={() => console.log('add portfolio')}
              >
                Add Portfolio
              </Button>
            </Box>

            {/* Portfolios */}
            {portfolios.map((portfolio: IPopulatedPortfolio) => {
              return (
                <Box key={portfolio.portfolioName}>
                  <PortfolioCard 
                    populatedPortfolio={portfolio}
                    onDeleteClick={onDeleteClick}
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