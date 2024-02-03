import { PropsWithChildren, useContext } from 'react'
import { 
  Card,
  CardBody,
  HStack,
  Text,
  VStack
} from '@chakra-ui/react'
import { IProduct, ITCProduct } from 'common'
import { ProductDescription } from './ProductDescription'
import { ProductImage } from './ProductImage'
import { LatestPricesContext } from '../state/LatestPricesContext'
import { formatAsPrice, ILatestPricesContext } from '../utils/Price'
import { getProductNameWithLanguage } from '../utils/Product'


type TProductCardProps = {
  product: IProduct,
  tcproduct?: ITCProduct,
  height?: string | number,
  width?: string | number,
  onClick: (product: IProduct) => void,
  onTCProductClick?: (tcproduct: ITCProduct) => void,
}
export const ProductCard = (
  props: PropsWithChildren<TProductCardProps>
) => {

  // =========
  // constants
  // =========

  const DEFAULT_CARD_HEIGHT = '220px'
  const DEFAULT_CARD_WIDTH = '350px'
  const DEFAULT_IMAGE_SIZE = '150px'

  const {
    product,
    tcproduct,
    height = DEFAULT_CARD_HEIGHT,
    width = DEFAULT_CARD_WIDTH,
    onClick,
    onTCProductClick
  } = props


  // =====
  // state
  // =====

  const { latestPrices } 
    = useContext(LatestPricesContext) as ILatestPricesContext

  const price = latestPrices.get(product.tcgplayerId)?.prices.marketPrice


  // ==============
  // main component
  // ==============

  return (
    <Card
      cursor='pointer'
      height={height}
      width={width}
      onClick={() => {tcproduct && onTCProductClick
        ? onTCProductClick(tcproduct)
        : onClick(product)}}
    >
      <CardBody>
        <HStack 
          alignItems='flex-start'
          justifyContent='flex-start' 
          spacing={4}
        >

          <VStack spacing={4}>

            {/* Product Image */}
            <ProductImage 
              boxSize={DEFAULT_IMAGE_SIZE} 
              product={product}
            />

            {/* Price */}
            <Text>
              {formatAsPrice(price as number)}
            </Text>
          </VStack>

          <VStack 
            alignItems='flex-start'
            spacing={4}
          >

            {/* Product Name */}
            <Text align='left' fontWeight='bold'>
              {getProductNameWithLanguage(product)}
            </Text>

            {/* Product Description */}
            <ProductDescription 
              product={product} 
            />

          </VStack>

        </HStack>
      </CardBody>
    </Card>
  )
}