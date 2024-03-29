import { 
  IPopulatedHolding, PerformanceMetric, TDatedValue,

  getHoldingMarketValue, getHoldingPercentPnl, getHoldingTotalCost, 
  getHoldingTotalPnl
} from 'common'
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


type THoldingPerfCardProps = {
  marketPrice: number,
  populatedHolding: IPopulatedHolding,
  chartDataKeys?: {[key: string]: string}
  chartDataMap?: Map<string, TDatedValue[]>
  chartDateRange?: ChartDateRange,
  chartType?: PerformanceMetric
}
export const HoldingPerfCard = (props: THoldingPerfCardProps) => {


  // =========
  // functions
  // =========

  // Holding Summary
  const holdingPercentPnl 
    = getHoldingPercentPnl(props.populatedHolding, props.marketPrice)

  const valueSummary: TMetricSummaryItem[] = [
    {
      title: 'Market Value:',
      value: getHoldingMarketValue(props.populatedHolding, props.marketPrice),
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: ' -',
      titleStyle: {},
    },
    {
      title: 'Book Value:',
      value: getHoldingTotalCost(props.populatedHolding),
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: ' -',
      titleStyle: {},
    },
    {
      title: '',
      isListSpacer: true
    },
    {
      title: 'Profit:',
      value: getHoldingTotalPnl(props.populatedHolding, props.marketPrice),
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: ' -',
      titleStyle: {},
    },  
    {
      title: 'Return:',
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

            {/* Header */}
            <Box display='flex' justifyContent='space-between' width='100%'>

              {/* Product Name */}
              <Text align='left' fontWeight='bold'>
                {getProductNameWithLanguage(props.populatedHolding.product)}
              </Text>
            </Box>

            {/* Content */}
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

              <Box fontSize='large'>
                <MetricSummary 
                  summaryItems={valueSummary}
                  variant='list'
                />
              </Box>

              { /* Chart */ }
              <Box width='50%'>
                {props.chartDataKeys && props.chartDataMap && props.chartDateRange
                  ? (props.chartType === PerformanceMetric.MarketValue 
                    ? (
                      <PriceChart
                        data={props.chartDataMap}
                        dataKeys={props.chartDataKeys}
                        dateRange={props.chartDateRange}
                        isControlled={true}
                        minHeight={200}
                        minWidth={200}
                      />
                    ) : (
                      props.chartType === PerformanceMetric.CumPnL
                        ? (
                          <PnlChart
                            data={props.chartDataMap}
                            dataKeys={props.chartDataKeys}
                            dateRange={props.chartDateRange}
                            isControlled={true}
                            minHeight={200}
                            minWidth={200}
                          />
                        ) 
                        : undefined
                    )
                  ) : (                  
                    <Box 
                      display='flex' 
                      alignItems='center' 
                      justifyContent='center' 
                      height='100%' 
                      width='100%'
                    >
                      <Spinner 
                        color='blue.500'
                        height={75}
                        width={75}
                        thickness='7px'
                      />
                    </Box>
                )}  
              </Box>
            </HStack>
          </VStack>
        </HStack>
      </CardBody>
    </Card>    
  )
}