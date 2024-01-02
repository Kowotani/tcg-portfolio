import { PropsWithChildren, useContext } from 'react'
import { 
  Card,
  CardBody,
  HStack,
  Text,
  VStack
} from '@chakra-ui/react'
import { 
  // data models
  IProduct
 } from 'common'
import { ProductDescription } from './ProductDescription'
import { ProductImage } from './ProductImage'
import { LatestPricesContext } from '../state/LatestPricesContext'
import { formatAsPrice, ILatestPricesContext } from '../utils/Price'
import { getProductNameWithLanguage } from '../utils/Product'


type TProductCatalogueCardProps = {
  product: IProduct,
  setCatalogueProduct: (product: IProduct) => void
}
export const ProductCatalogueCard = (
  props: PropsWithChildren<TProductCatalogueCardProps>
) => {

  // =====
  // state
  // =====

  const { latestPrices } 
    = useContext(LatestPricesContext) as ILatestPricesContext

  const price = latestPrices.get(props.product.tcgplayerId)?.prices.marketPrice

  // ==============
  // main component
  // ==============

  return (
    <Card
      cursor='pointer'
      height='220px'
      width='350px'
      onClick={() => props.setCatalogueProduct(props.product)}
    >
      <CardBody>
        <HStack 
          alignItems='flex-start'
          justifyContent='flex-start' 
          spacing={4}
        >

          <VStack spacing={4}>

            {/* Product Image */}
            <ProductImage boxSize='150px' product={props.product}/>

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
              {getProductNameWithLanguage(props.product)}
            </Text>

            {/* Product Description */}
            <ProductDescription 
              product={props.product} 
            />

          </VStack>

        </HStack>
      </CardBody>
    </Card>
  )
}