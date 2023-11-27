import { 
  IPopulatedHolding, PerformanceMetric, TDatedValue,

  getHoldingMarketValue, getHoldingPercentPnl, getHoldingTotalCost, 
  getHoldingTotalPnl
} from 'common'
import { PropsWithChildren } from 'react'
import { 
  Box,
  Card,
  CardBody,
  HStack,
  Spinner,
  StackDivider,
  Text,
  VStack
} from '@chakra-ui/react'
import { PnlChart, PriceChart } from './Charts'
import { MetricSummary, TMetricSummaryItem } from './MetricSummary'
import { ProductDescription } from './ProductDescription'
import { ProductImage } from './ProductImage'
import { ChartDateRange } from '../utils/Chart'
import { formatAsPrice } from '../utils/Price'
import { getProductNameWithLanguage } from '../utils/Product'


type THoldingPerformanceCardProps = {
  marketPrice: number,
  populatedHolding: IPopulatedHolding,
  chartDataKeys?: {[key: string]: string}
  chartDataMap?: Map<string, TDatedValue[]>
  chartDateRange?: ChartDateRange,
  chartType?: PerformanceMetric
}
export const HoldingPerfCard = (
  props: PropsWithChildren<THoldingPerformanceCardProps>
) => {


  // =========
  // functions
  // =========

  // Holding Summary
  const holdingPercentPnl 
    = getHoldingPercentPnl(props.populatedHolding, props.marketPrice)

  const valueSummary: TMetricSummaryItem[] = [
    {
      title: 'Book Value:',
      value: getHoldingTotalCost(props.populatedHolding),
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: ' -',
      titleStyle: {},
    },
    {
      title: 'Market Value:',
      value: getHoldingMarketValue(props.populatedHolding, props.marketPrice),
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: ' -',
      titleStyle: {},
    },
    {
      title: 'Profit:',
      value: getHoldingTotalPnl(props.populatedHolding, props.marketPrice),
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: ' -',
      titleStyle: {},
    },  
  ]

  const returnSummary: TMetricSummaryItem[] = [
    {
      title: 'MWR:',
      value: holdingPercentPnl
        ? holdingPercentPnl
        : undefined,
      formattedPrecision: 2,
      formattedSuffix: '%',
      placeholder: '- ',
      titleStyle: {},
    },
    {
      title: 'TWR:',
      value: holdingPercentPnl
        ? holdingPercentPnl
        : undefined,
      formattedPrecision: 2,
      formattedSuffix: '%',
      placeholder: '- ',
      titleStyle: {},
    },    
  ]


  // ==============
  // main component
  // ==============

  return (
    <Card>
      <CardBody>
        <HStack
          divider={<StackDivider color='gray.200'/>}
          spacing={4}
        >
          <VStack minWidth='100px'>

            {/* Product Image */}
            <ProductImage 
              product={props.populatedHolding.product} 
              boxSize='100px'
              externalUrl={true}
            />

            {/* Market Price */}
            <Text>
              {formatAsPrice(props.marketPrice)}
            </Text>
          </VStack>
          <VStack spacing={0} width='100%'>
            <Box display='flex' justifyContent='space-between' width='100%'>

              {/* Product Name */}
              <Text align='left' fontWeight='bold'>
                {getProductNameWithLanguage(props.populatedHolding.product)}
              </Text>
            </Box>

            <HStack
              width='100%'
              divider={<StackDivider color='gray.200'/>}
              spacing={4}
            >
              {/* Product Desc */}
              <ProductDescription 
                product={props.populatedHolding.product} 
                showHeader={false} 
                fontSize='large'
                textAlign='left'
                width='fit-content'
              />

              {/* Value */}
              <Box fontSize='large'>
                <MetricSummary 
                  summaryItems={valueSummary}
                  variant='list'
                />
              </Box>

              {/* Return */}
              <Box fontSize='large'>
                <MetricSummary 
                  summaryItems={returnSummary}
                  variant='list'
                />
              </Box>

              {/* Spinner */}
              {!props.chartDataMap &&
                <Box display='flex' alignItems='center' justifyContent='center' height='100%' width='100%'>
                  <Spinner 
                    color='blue.500'
                    height={75}
                    width={75}
                    thickness='7px'
                  />
                </Box>
              }

              {/* Holding Market Value Chart */}
              {props.chartDataKeys && props.chartDataMap && props.chartDateRange 
                && props.chartType === PerformanceMetric.MarketValue 
                && <PriceChart
                  data={props.chartDataMap}
                  dataKeys={props.chartDataKeys}
                  dateRange={props.chartDateRange}
                  isControlled={true}
                  height={200}
                  minWidth={200}
                />
              }

              {/* Cum Pnl Chart */}
              {props.chartDataKeys && props.chartDataMap && props.chartDateRange 
                && props.chartType === PerformanceMetric.CumPnL 
                && <PnlChart
                  data={props.chartDataMap}
                  dataKeys={props.chartDataKeys}
                  dateRange={props.chartDateRange}
                  isControlled={true}
                  height={200}
                  minWidth={200}
                />
              }
            </HStack>
          </VStack>
        </HStack>
      </CardBody>
    </Card>    
  )
}