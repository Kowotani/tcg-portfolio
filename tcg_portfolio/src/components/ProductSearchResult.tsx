import { 
  Box, 
  Highlight, 
  Text, 
  VStack 
} from '@chakra-ui/react'
import { IProduct, ProductLanguage } from 'common'
import { NonVisibileProductSubtypes } from '../utils/Product'

type TProductSearchResult = {
  product: IProduct,
  searchInput: string,
}
export const ProductSearchResult = (props: TProductSearchResult) => {

  const product = props.product
  const subtype = product.subtype 
    && !NonVisibileProductSubtypes.includes(product.subtype) 
      ? ` - (${product.subtype})` 
      : ''
  const language = product.language !== ProductLanguage.English
    ? ' [' + product.language + ']'
    : ''
  const header = `${product.name} - ${product.type}${subtype}${language}`  

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
            <Highlight 
              query={props.searchInput}
              styles={{py: 1, bg: 'yellow.200'}}
            >
              {header}
            </Highlight>
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
            <Highlight 
              query={props.searchInput}
              styles={{py: 1, bg: 'yellow.200'}}
            >
              {product.tcg}
            </Highlight>
          </Text>
        </Box>
      </VStack>
    </Box>
  )
}