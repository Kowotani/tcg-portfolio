import { useContext } from 'react'
import { 
  Card,
  CardBody,
  HStack,
  StackDivider,
  Text,
  VStack
} from '@chakra-ui/react'
import { 
  // data models
  IProduct, TDatedValue,

  // date helpers
  getDateOneMonthAgo, getDateOneYearAgo,

  // others
  getValueAtDate
} from 'common'
import * as _ from 'lodash'
import { MetricSummary, TMetricSummaryItem } from './MetricSummary'
import { ProductDescription } from './ProductDescription'
import { ProductImage } from './ProductImage'
import { LatestPricesContext } from '../state/LatestPricesContext'
import { ChartDateRange, getStartDateFromChartDateRange } from '../utils/Chart'
import { getReturn, ILatestPricesContext } from '../utils/Price'
import { getProductNameWithLanguage } from '../utils/Product'


// ==============
// main component
// ==============

type TProductCardProps = {
  chartDateRange: ChartDateRange,
  marketValue: TDatedValue[],
  product: IProduct,
}
export const ProductDetailsCard = (props: TProductCardProps) => {
  

  // =====
  // state
  // =====

  const { latestPrices } 
    = useContext(LatestPricesContext) as ILatestPricesContext


  // ==============
  // metric summary
  // ==============

  const price = latestPrices.get(props.product.tcgplayerId)?.prices.marketPrice

  const releaseSummary: TMetricSummaryItem[] = [
    {
      title: 'Release Date:',
      value: props.product.releaseDate.getTime(),
      formatAsDate: true
    },
    {
      title: 'MSRP:',
      value: props.product.msrp,
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: ' -',
    },
    {
      title: 'Price:',
      value: price,
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: ' -',
    },
  ]

  // const sortedMarketValue = sortDatedValues(props.marketValue)

  // 1-month return
  const oneMonthAgoPrice = 
    getValueAtDate(props.marketValue, getDateOneMonthAgo())
  const oneMonthReturn = oneMonthAgoPrice && price 
    ? getReturn(oneMonthAgoPrice, price)
    : undefined

  // 1-year return
  const oneYearAgoPrice = 
    getValueAtDate(props.marketValue, getDateOneYearAgo())
  const oneYearReturn = oneYearAgoPrice && price 
    ? getReturn(oneYearAgoPrice, price)
    : undefined

  // custom return
  const customDate = props.chartDateRange === ChartDateRange.All
    ? (_.head(props.marketValue) as TDatedValue).date
    : getStartDateFromChartDateRange(props.chartDateRange)
  const customPrice = getValueAtDate(props.marketValue, customDate)
  const customReturn = customPrice && price 
    ? getReturn(customPrice, price)
    : undefined
  const customTitle = 
    props.chartDateRange === ChartDateRange.OneMonth ? '1-Month Return:'
    : props.chartDateRange === ChartDateRange.ThreeMonths ? '3-Month Return:'
    : props.chartDateRange === ChartDateRange.SixMonths ? '6-Month Return:'
    : props.chartDateRange === ChartDateRange.OneYear ? '1-Year Return:'
    : 'All-Time Return:'

  const oneMonthItem: TMetricSummaryItem = {
    title: '1-Month Return:',
    value: oneMonthReturn,
    formattedPrecision: 2,
    formattedSuffix: '%',
    placeholder: ' -',
  }
  const oneYearItem: TMetricSummaryItem = {
    title: '1-Year Return:',
    value: oneYearReturn,
    formattedPrecision: 2,
    formattedSuffix: '%',
    placeholder: ' -',
  }
  const customItem: TMetricSummaryItem = {
    title: customTitle,
    value: customReturn,
    formattedPrecision: 2,
    formattedSuffix: '%',
    placeholder: '- ',
  }

  const perfSummary = [
    ChartDateRange.ThreeMonths, 
    ChartDateRange.SixMonths,
    ChartDateRange.All
  ].includes(props.chartDateRange)
    ? [oneMonthItem, oneYearItem, customItem]
    : [oneMonthItem, oneYearItem]


  // ==============
  // main component 
  // ==============

  return (
    <Card 
      direction='row'
      align='center'

    >
      <CardBody>
        <VStack spacing={4}>

          {/* Product Name */}
          <Text align='left' fontSize='xl' fontWeight='bold'>
            {getProductNameWithLanguage(props.product)}
          </Text>

          <HStack
            divider={<StackDivider borderColor='gray.200' />}
            spacing={4}
          >
            
            {/* Product Image */}
            <ProductImage 
              boxSize='200px'
              externalUrl={true}
              product={props.product}
            />
            
            {/* Product Description */}
            <ProductDescription 
              product={props.product}
              showLabels={true}
            />
            
            {/* Release Metrics */}
            <MetricSummary 
              summaryItems={releaseSummary}
              variant='list'
            />

            {/* Perf Metrics */}
            <MetricSummary 
              summaryItems={perfSummary}
              variant='list'
            />            
          
          </HStack>

        </VStack>
      </CardBody>
    </Card>
  )
}
