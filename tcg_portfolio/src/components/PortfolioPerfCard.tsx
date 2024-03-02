import { useContext } from 'react'
import { 
  Box,
  Card,
  CardBody,
  HStack,
  StackDivider,
  Text,
  VStack
} from '@chakra-ui/react'
import { 
  IPopulatedPortfolio, formatAsISO, formatDateDiffAsYearsMonthsDays,
  
  getPortfolioFirstTransactionDate, getPortfolioHoldings, 
  getPortfolioMarketValue, getPortfolioPercentPnl, getPortfolioTotalCost, 
  getPortfolioTotalPnl, 
} from 'common'
import { MetricSummary, TMetricSummaryItem } from './MetricSummary'
import { LatestPricesContext } from '../state/LatestPricesContext'
import { 
  ILatestPricesContext, getIPriceDataMapFromIDatedPriceDataMap
} from '../utils/Price'


type TPortfolioPerfCardProps = {
  populatedPortfolio: IPopulatedPortfolio
}
export const PortfolioPerfCard = (props: TPortfolioPerfCardProps) => {

  const portfolio = props.populatedPortfolio

  // =====
  // state
  // =====

  const { latestPrices } 
    = useContext(LatestPricesContext) as ILatestPricesContext


  // =========
  // functions
  // =========


  // ===============
  // summary metrics
  // ===============

  const prices = getIPriceDataMapFromIDatedPriceDataMap(latestPrices)
  const portfolioPercentPnl = getPortfolioPercentPnl(portfolio, prices)

  // composition
  const compositionSummary: TMetricSummaryItem[] = [
    {
      title: 'Total Holdings:',
      value: getPortfolioHoldings(portfolio).length,
    },
  ]

  // temporal
  const temporalSummary: TMetricSummaryItem[] = [
    {
      title: 'First Purchase:',
      placeholder: formatAsISO(getPortfolioFirstTransactionDate(portfolio) as Date),
    },
    {
      title: 'Portfolio Age:',
      placeholder: formatDateDiffAsYearsMonthsDays(
        getPortfolioFirstTransactionDate(portfolio) as Date, 
        new Date()),
    },
  ]

  // value
  const valueSummary: TMetricSummaryItem[] = [
    {
      title: 'Total Cost:',
      value: getPortfolioTotalCost(portfolio),
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: ' -',
    },
    {
      title: 'Market Value:',
      value: getPortfolioMarketValue(portfolio, prices),
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: ' -',
    },
  ]

  // profit
  const profitSummary: TMetricSummaryItem[] = [
    {
      title: 'Profit:',
      value: getPortfolioTotalPnl(portfolio, prices),
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: ' -',
    },
    {
      title: 'Return:',
      value: portfolioPercentPnl
        ? portfolioPercentPnl
        : undefined,
      formattedPrecision: 2,
      formattedSuffix: '%',
      placeholder: '- ',
    },
  ]

  // =====
  // hooks
  // =====


  // ==============
  // Main Component
  // ==============

  return (
    <>
      {/* Portfolio Perf Card */}
      <Card>
        <CardBody>
          <HStack
            divider={<StackDivider color='gray.200'/>}
            spacing={4}
          >
            <VStack 
              display='flex' 
              alignItems='flex-start' 
              divider={<StackDivider color='gray.200'/>}
              spacing={2} 
              width='100%'
            >

              {/* Portfolio Name */}
              <Box display='flex' justifyContent='space-between' width='100%'>
                <Text align='left' fontWeight='bold'>
                  {props.populatedPortfolio.portfolioName}
                </Text>
              </Box>

              {/* Portfolio Description */}
              {props.populatedPortfolio.description && 
                <Box fontSize='large'>
                  <Text as='em' align='left' noOfLines={2}>
                    {props.populatedPortfolio.description}
                  </Text>
                </Box>
              }

              {/* Descriptive Metrics */}
              <HStack
                width='100%'
                divider={<StackDivider color='gray.200'/>}
                spacing={4}
              >

                {/* Temporal Metrics */}
                <Box fontSize='large'>
                  <MetricSummary 
                    summaryItems={temporalSummary}
                    variant='list'
                  />
                </Box>

                {/* Composition Metrics */}
                <Box fontSize='large'>
                  <MetricSummary 
                    summaryItems={compositionSummary}
                    variant='list'
                  />
                </Box>

              </HStack>

              {/* Performance Metrics */}
              <HStack
                width='100%'
                divider={<StackDivider color='gray.200'/>}
                spacing={4}
              >

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

            </VStack>

          </HStack>
        </CardBody>
      </Card>
    </>
  )

}