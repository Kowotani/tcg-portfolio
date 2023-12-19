import { PropsWithChildren, useContext } from 'react'
import { 
  Card,
  CardBody,
  HStack,
  StackDivider,
  Text,
  VStack
} from '@chakra-ui/react'
import { IProduct } from 'common'
import { MetricSummary, TMetricSummaryItem } from './MetricSummary'
import { ProductDescription } from './ProductDescription'
import { ProductImage } from './ProductImage'
import { LatestPricesContext } from '../state/LatestPricesContext'
import { ILatestPricesContext } from '../utils/Price'
import { getProductNameWithLanguage } from '../utils/Product'


// ==============
// main component
// ==============

type TProductCardProps = {
  product: IProduct
}
export const ProductDetailsCard = (
  props: PropsWithChildren<TProductCardProps>
) => {


  // =====
  // state
  // =====

  const { latestPrices } 
    = useContext(LatestPricesContext) as ILatestPricesContext


  // ==============
  // metric summary
  // ==============

  const price = latestPrices.get(props.product.tcgplayerId)?.prices.marketPrice

  const perfSummary: TMetricSummaryItem[] = [
    {
      title: 'MSRP:',
      value: props.product.msrp,
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: ' -',
      titleStyle: {},
    },
    {
      title: 'Price:',
      value: price,
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: ' -',
      titleStyle: {},
    },
  ]


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
              showReleaseDate={true}
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
