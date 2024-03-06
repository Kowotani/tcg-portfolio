import { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { 
  Box,
  Flex,
  HStack,
  Radio,
  RadioGroup,
  Spinner
} from '@chakra-ui/react'
import { 
  // data models
  IPopulatedHolding, IPopulatedPortfolio, TDatedValue, THoldingPerformanceData,
  TPerformanceData, PerformanceMetric,

  // request / response data models
  TGetPortfolioHoldingsPerformanceResBody, TGetPortfolioPerformanceResBody,

  // endpoint URLs
  PORTFOLIO_HOLDINGS_PERFORMANCE_URL, PORTFOLIO_PERFORMANCE_URL,

  // rest
  getHoldingTcgplayerId
} from 'common'
import { Breadcrumbs, SecondaryButton, SectionHeader } from './Layout'
import * as _ from 'lodash'
import { PnlChart, PriceChart } from './Charts'
import { HoldingPerfCard } from './HoldingPerfCard'
import { useWindowDimensions } from '../hooks/WindowDimensions'
import { PortfolioPerfCard } from './PortfolioPerfCard'
import { LatestPricesContext } from '../state/LatestPricesContext'
import { UserContext } from '../state/UserContext'
import { CascadingSlideFade } from './Transitions'
import { clampDatedValues, ChartDateRange } from '../utils/Chart'
import { 
  ILatestPricesContext, getIPriceDataMapFromIDatedPriceDataMap 
} from '../utils/Price'
import { IUserContext } from '../utils/User'


// =========
// constants
// =========

const DEFAULT_METRICS = [
  PerformanceMetric.MarketValue,
  PerformanceMetric.TotalCost,
  PerformanceMetric.CumPnL
]


// ==============
// main component
// ==============

type TPortfolioPerformanceProps = {
  portfolio: IPopulatedPortfolio,
  onExit: () => void
}
export const PortfolioPerformance = (props: TPortfolioPerformanceProps) => {
  

  // =========
  // constants
  // =========

  // breadcrumbs
  const BREADCRUMB_PATH = [
    'Portfolios', 
    props.portfolio.portfolioName, 
    'Performance'
  ]

  // breadcrumbs and nav layout
  const BREADCRUMB_NAV_WIDTH_BREAKPOINT = 400


  // =====
  // state
  // =====

  // ----------------
  // performance data
  // ----------------

  const [ holdingsData, setHoldingsData ] = useState([] as THoldingPerformanceData[])
  const [ portfolioData, setPortfolioData ] = useState({} as TPerformanceData)
  const [ isLoaded, setIsLoaded ] = useState(false)
  const [ chartDateRange, setChartDateRange ] = useState(ChartDateRange.All)
  const [ chartType, setChartType ] = useState(PerformanceMetric.CumPnL)

  // -----
  // Price
  // -----

  const { latestPrices } 
    = useContext(LatestPricesContext) as ILatestPricesContext
  const prices = getIPriceDataMapFromIDatedPriceDataMap(latestPrices)

  // ----
  // User
  // ----

  const { user } = useContext(UserContext) as IUserContext


  // =====
  // hooks
  // =====

  // set Holdings performance data
  useEffect(() => {
    axios({
      method: 'get',
      url: PORTFOLIO_HOLDINGS_PERFORMANCE_URL,
      params: {
        userId: user.userId,
        portfolioName: props.portfolio.portfolioName,
        metrics: DEFAULT_METRICS
      }
    })
    .then(res => {
       // TODO: type check
      const resData: TGetPortfolioHoldingsPerformanceResBody = res.data

      // success
      if (res.status === 200) {

        // set performance data
        const data = resData.data
        setHoldingsData(data)
    
      // error
      } else {
        const errMsg = `Error fetching from PORTFOLIO_HOLDINGS_PERFORMANCE_URL: ${resData.message}`
        console.log(errMsg)
      }
    })
    .catch(err => {
      const errMsg = `Error fetching from PORTFOLIO_HOLDINGS_PERFORMANCE_URL: ${err.message}`
      console.log(errMsg)
    })
  }, [user, props.portfolio])

  // set Portfolio performance data
  useEffect(() => {

    axios({
      method: 'get',
      url: PORTFOLIO_PERFORMANCE_URL,
      params: {
        userId: user.userId,
        portfolioName: props.portfolio.portfolioName,
        metrics: DEFAULT_METRICS
      }
    })
    .then(res => {
       // TODO: type check
      const resData: TGetPortfolioPerformanceResBody = res.data

      // success
      if (res.status === 200) {

        // set performance data
        const data = resData.data
        setPortfolioData(data)
    
      // error
      } else {
        const errMsg = `Error fetching from PORTFOLIO_PERFORMANCE_URL: ${resData.message}`
        console.log(errMsg)
      }
    })
    .catch(err => {
      const errMsg = `Error fetching from PORTFOLIO_PERFORMANCE_URL: ${err.message}`
      console.log(errMsg)
    })
  }, [user, props.portfolio])

  // update isLoaded state
  useEffect(() => {
    setIsLoaded(!_.isEmpty(portfolioData) && !_.isEmpty(holdingsData))
  }, [portfolioData, holdingsData])

  // window width
  const { width } = useWindowDimensions()


  // =========
  // functions
  // =========

  /*
    DESC
      Handles the onChange event to update the chart type
    INPUT
      value: The onChange event value
  */
  function onRadioChange(value: string): void {
    switch (value) {
      case PerformanceMetric.MarketValue:
        setChartType(PerformanceMetric.MarketValue)
        break
      case PerformanceMetric.CumPnL:
        setChartType(PerformanceMetric.CumPnL)
        break
    }
  }


  // ==================
  // performance charts
  // ==================

  // -----------
  // data series
  // -----------

  const portfolioMarketValue = clampDatedValues(
    portfolioData[PerformanceMetric.MarketValue] as TDatedValue[], 
    chartDateRange
  )
  const portfolioTotalCost = clampDatedValues(
    portfolioData[PerformanceMetric.TotalCost] as TDatedValue[],
    chartDateRange
  )
  const portfolioCumPnl = clampDatedValues(
    portfolioData[PerformanceMetric.CumPnL] as TDatedValue[], 
    chartDateRange
  )

  const portfolioDataMap = new Map<string, TDatedValue[]>([
    [PerformanceMetric.MarketValue, portfolioMarketValue],
    [PerformanceMetric.TotalCost, portfolioTotalCost],
    [PerformanceMetric.CumPnL, portfolioCumPnl]
  ])

  // ---------
  // data keys
  // ---------

  const marketValueDataKeys = {
    primaryKey: PerformanceMetric.MarketValue,
    referenceKey: PerformanceMetric.TotalCost
  }

  const cumPnlDataKeys = {
    primaryKey: PerformanceMetric.CumPnL,
    referenceKey: PerformanceMetric.TotalCost
  }


  // ==============
  // main component
  // ==============

  return (
    <>
      {/* Breadcrumbs and Nav */}
      {width < BREADCRUMB_NAV_WIDTH_BREAKPOINT
        ? <>
          <Flex justifyContent='flex-start'>
            <Breadcrumbs path={BREADCRUMB_PATH}/>
          </Flex>
          <Flex justifyContent='flex-end'>
            <SecondaryButton 
                label='Back'
                onClick={props.onExit}
              />
          </Flex>
        </> : <>
          <Flex justifyContent='space-between'>
            <Breadcrumbs path={BREADCRUMB_PATH}/>
            <SecondaryButton 
              label='Back'
              onClick={props.onExit}
            />
          </Flex>
        </>
      }
      
      {/* Overview */}
      <SectionHeader header='Overview'/>
      <Box display='flex' justifyContent='flex-end'>
        
      </Box>

      {/* Portfolio Summary and Chart */}
      <HStack display='flex' alignItems='flex-start' height='100%' width='100%'>

        {/* Portfolio Summary */}
        <Box width='50%'>
          <PortfolioPerfCard populatedPortfolio={props.portfolio}/>
        </Box>

        {/* Portfolio Chart */}
        <Box display='flex' flexDirection='column' width='50%'>
          {!isLoaded && 
            <Box 
              display='flex'
              alignItems='center'
              justifyContent='center'
              height={300} 
              width='100%' 
            >
              <Spinner 
                color='blue.500'
                height={100}
                width={100}
                thickness='10px'
              />
            </Box>
          }
          {isLoaded && chartType === PerformanceMetric.MarketValue &&
            <PriceChart
              data={portfolioDataMap}
              dataKeys={marketValueDataKeys}
              dateRange={chartDateRange}
              isControlled={false}
              minHeight={300}
              minWidth={400}
              setParentDateRange={setChartDateRange}
            />
          }
          {isLoaded && chartType === PerformanceMetric.CumPnL &&
            <PnlChart
              data={portfolioDataMap}
              dataKeys={cumPnlDataKeys}
              dateRange={chartDateRange}
              isControlled={false}
              minHeight={300}
              minWidth={400}
              setParentDateRange={setChartDateRange}
            />
          }
          {/* Portoflio Chart Radio */}
          <Box width='100%' paddingTop={4}>
            <RadioGroup onChange={onRadioChange} value={chartType}>
              <Box display='flex' justifyContent='space-evenly'>
                <Radio size='lg' value={PerformanceMetric.CumPnL}>
                  Profit and Loss
                </Radio>
                <Radio size='lg' value={PerformanceMetric.MarketValue}>
                  Market Value
                </Radio>
              </Box>
            </RadioGroup>
          </Box>
        </Box>
      </HStack>

      {/* Holdings */}
      <SectionHeader header='Holdings'/>

      {/* Holding Cards */}
      {props.portfolio.populatedHoldings
        .map((holding: IPopulatedHolding, ix: number) => {

          // get Holding market price
          const marketPrice 
            = Number(prices.get(holding.product.tcgplayerId)?.marketPrice)

          // get Holding chart data
          const tcgplayerId = getHoldingTcgplayerId(holding)
          const holdingData = _.head(
            holdingsData.filter((data: THoldingPerformanceData) => {
              return data.tcgplayerId === tcgplayerId
          }))

          const perfData = isLoaded && holdingData 
            ? holdingData.performanceData
            : {} as TPerformanceData
          const holdingMarketValue = clampDatedValues(
            perfData[PerformanceMetric.MarketValue] as TDatedValue[],
            chartDateRange
          )
          const holdingTotalCost = clampDatedValues(
            perfData[PerformanceMetric.TotalCost] as TDatedValue[],
            chartDateRange
          )
          const holdingCumPnl = clampDatedValues(
            perfData[PerformanceMetric.CumPnL] as TDatedValue[],
            chartDateRange
          )
          const holdingDataMap = new Map<string, TDatedValue[]>([
            [PerformanceMetric.MarketValue, holdingMarketValue],
            [PerformanceMetric.TotalCost, holdingTotalCost],
            [PerformanceMetric.CumPnL, holdingCumPnl],
          ]) 

          // chart type dependent props
          const chartDataKeys = chartType === PerformanceMetric.MarketValue
            ? marketValueDataKeys
            : cumPnlDataKeys

          return (
            <CascadingSlideFade
              key={holding.product.tcgplayerId}
              index={ix}
              duration={0.5}
              enterDelay={0.1}
              itemDelay={0.1}
            >
              <Box m='16px 0px'>
                <HoldingPerfCard
                  marketPrice={marketPrice}    
                  populatedHolding={holding}
                  chartDataKeys={chartDataKeys}
                  chartDataMap={isLoaded ? holdingDataMap : undefined}
                  chartDateRange={chartDateRange}
                  chartType={chartType}
                />
              </Box>
            </CascadingSlideFade>
          )
        })
      }
    </>
  )
}