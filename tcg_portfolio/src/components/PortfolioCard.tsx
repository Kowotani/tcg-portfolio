import { PropsWithChildren, useContext, useState } from 'react'
import { 
  Box,
  Button,
  Card,
  CardBody,
  CloseButton,
  HStack,
  StackDivider,
  Text,
  VStack
} from '@chakra-ui/react'
import { 
  IPopulatedPortfolio, 
  
  getPortfolioMarketValue, getPortfolioPercentPnl, getPortfolioTotalCost, 
  getPortfolioTotalPnl
} from 'common'
import * as _ from 'lodash'
import { MetricSummary, TMetricSummaryItem } from './MetricSummary'
import { LatestPricesContext } from '../state/LatestPricesContext'
import { 
  ILatestPricesContext, 

  getIPriceDataMapFromIDatedPriceDataMap
} from '../utils'


type TPortfolioCardProps = {
  populatedPortfolio: IPopulatedPortfolio,
  onPortfolioDelete: (portfolio: IPopulatedPortfolio) => void,
  onPortfolioUpdate: (portfolio: IPopulatedPortfolio) => void,
}
export const PortfolioCard = (
  props: PropsWithChildren<TPortfolioCardProps>
) => {

  // =====
  // state
  // =====

  const [ portfolio, setPortfolio ] = useState(props.populatedPortfolio)
  const { latestPrices } 
    = useContext(LatestPricesContext) as ILatestPricesContext


  // =========
  // functions
  // =========
  

  // PortfolioSummary

  const prices = getIPriceDataMapFromIDatedPriceDataMap(latestPrices)
  const portfolioPercentPnl = getPortfolioPercentPnl(portfolio, prices)

  const valueSummary: TMetricSummaryItem[] = [
    {
      title: 'Total Cost:',
      value: getPortfolioTotalCost(portfolio),
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: '$ -',
      titleStyle: {},
    },
    {
      title: 'Market Value:',
      value: getPortfolioMarketValue(portfolio, prices),
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: '$ -',
      titleStyle: {},
    }
  ]

  const profitSummary: TMetricSummaryItem[] = [
    {
      title: 'Profit:',
      value: getPortfolioTotalPnl(portfolio, prices),
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: '$ -',
      titleStyle: {},
    },
    {
      title: 'Return:',
      value: portfolioPercentPnl
        ? portfolioPercentPnl * 100
        : undefined,
      formattedPrecision: 2,
      formattedSuffix: '%',
      placeholder: '- %',
      titleStyle: {},
    }
  ]

  // =====
  // hooks
  // =====


  // ==============
  // Main Component
  // ==============

  return (
    <>
      <Card>
        <CardBody>
          <HStack
            divider={<StackDivider color='gray.200'/>}
            spacing={4}
          >
            <VStack spacing={0} width='100%'>
              <Box display='flex' justifyContent='space-between' width='100%'>
                <Text align='left' fontWeight='bold'>
                  {props.populatedPortfolio.portfolioName}
                </Text>
                <CloseButton 
                  onClick={
                    () => props.onPortfolioDelete(props.populatedPortfolio)
                  }
                />
              </Box>

              <HStack
                width='100%'
                divider={<StackDivider color='gray.200'/>}
                spacing={4}
              >
                {/* Description */}
                <Box fontSize='large' maxW='20%'>
                  <Text as='em' align='left' noOfLines={2}>
                    {props.populatedPortfolio.description}
                  </Text>
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

                {/* Edit */}
                <Button 
                  colorScheme='blue' 
                  onClick={() => console.log('opened portfolio')}
                >
                  Edit
                </Button>
              </HStack>
            </VStack>
          </HStack>
        </CardBody>
      </Card>
    </>
  )

}