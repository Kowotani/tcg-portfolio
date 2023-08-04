import { PropsWithChildren } from 'react'
import { Box, Text, VStack } from '@chakra-ui/react'
import { IProduct, ProductSubtype } from 'common'

type TProductSearchResult = {
  product: IProduct
}
export const ProductSearchResult = (
  props: PropsWithChildren<TProductSearchResult>
) => {
  const product = props.product
  const invalidSubtypes = [
    ProductSubtype.FABVersionTwo,
    ProductSubtype.NonFoil
  ]
  const subtype = product.subtype && !invalidSubtypes.includes(product.subtype) 
      ? ` (${product.subtype})` : ''
  const header = `${product.name} - ${product.type}${subtype}`  

  return (
    <Box p={0}>
      <VStack 
        display='flex' 
        justifyContent='flex-start'
        alignItems='flex-start'
        spacing={0}
      >
        <Box>
          <Text 
            fontSize='md' 
            noOfLines={1} 
            textAlign='left'
          >
            {header}
          </Text>
        </Box>
        <Box>
          <Text 
            as='em' 
            color='gray' 
            fontSize='md'
            noOfLines={1} 
            textAlign='left'
          >
            {product.tcg}
          </Text>
        </Box>
      </VStack>
    </Box>
  )
}