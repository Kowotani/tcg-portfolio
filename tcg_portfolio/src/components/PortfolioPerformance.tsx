import { PropsWithChildren, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { 
  Box,
  Button,
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

  getHoldingTcgplayerId,

  // date helpers
  isDateAfter, isDateBefore
} from 'common'
import { SectionHeader } from './Layout'
import * as _ from 'lodash'
import { PnlChart, PriceChart } from './Charts'
import { HoldingPerfCard } from './HoldingPerfCard'
import { LatestPricesContext } from '../state/LatestPricesContext'
import { UserContext } from '../state/UserContext'
import { CascadingSlideFade } from './Transitions'
import { ChartDateRange, getStartDateFromChartDateRange } from '../utils/Chart'
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


// =========
// functions
// =========

/*
DESC
  Clamps the input datedValues to fall within the input dateRange
INPUT
  datedValues: A TDatedValue[]
  dateRange: A ChartDateRange
RETURN
  The dated values that are within the date range
*/
function clampDatedValues(
  datedValues: TDatedValue[], 
  dateRange: ChartDateRange
): TDatedValue[] {

  // return all if dateRange is all
  if (dateRange === ChartDateRange.All) {
    return datedValues
  }

  // get start and end dates
  const startDate = getStartDateFromChartDateRange(dateRange)
  const endDate = new Date()

  // return filtered values
  return datedValues.filter((dv: TDatedValue) => {
    const date = _.isDate(dv.date)
      ? dv.date
      : new Date(Date.parse(dv.date))
    return isDateAfter(date, startDate, true) 
      && isDateBefore(date, endDate, true)
  })
}


// ==============
// main component
// ==============

type TPortfolioPerformanceProps = {
  portfolio: IPopulatedPortfolio,
  onExit: () => void
}
export const PortfolioPerformance = (
  props: PropsWithChildren<TPortfolioPerformanceProps>
) => {
  

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
  const [ chartType, setChartType ] = useState(PerformanceMetric.MarketValue)

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
      {/* Overview */}
      <SectionHeader header='Overview'/>
      <Box display='flex' justifyContent='flex-end'>
        <Button 
          variant='ghost' 
          onClick={props.onExit}
        >
          Back to All Portfolios
        </Button>
      </Box>

      {/* TODO: Remove this */}
      <Box display='flex' justifyContent='center'>
        <Button 
          colorScheme='pink'
          onClick={() => setChartType(PerformanceMetric.MarketValue)}
        >
          {PerformanceMetric.MarketValue}
        </Button>
        <Box w={20} />
        <Button 
          colorScheme='pink'
          onClick={() => setChartType(PerformanceMetric.CumPnL)}
        >
          {PerformanceMetric.CumPnL}
        </Button>
      </Box>

      {/* Portfolio Chart */}
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
          height={300}
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
          height={300}
          minWidth={400}
          setParentDateRange={setChartDateRange}
        />
      }

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
          const holdingMarketValue = clampDatedValues(
            holdingData?.performanceData['Market Value'] as TDatedValue[],
            chartDateRange
          )
          const holdingTotalCost = clampDatedValues(
            holdingData?.performanceData['Total Cost'] as TDatedValue[],
            chartDateRange
          )
          const holdingDataMap = new Map<string, TDatedValue[]>([
            ['Market Value', holdingMarketValue],
            ['Total Cost', holdingTotalCost],
          ]) 

          return (
            <CascadingSlideFade
              key={holding.product.tcgplayerId}
              index={ix}
              initialDelay={0.1}
              delay={0.1}
              duration={0.5}
            >
              <Box m='16px 0px'>
                <HoldingPerfCard
                  marketPrice={marketPrice}    
                  populatedHolding={holding}
                  chartDataKeys={marketValueDataKeys}
                  chartDataMap={isLoaded ? holdingDataMap : undefined}
                  chartDateRange={chartDateRange}
                />
              </Box>
            </CascadingSlideFade>
          )
        })
      }
    </>
  )
}