import { PropsWithChildren } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { IProduct } from 'common'


// ==============
// Main Component
// ==============

type TProductDescriptionProps = {
  product: IProduct,
  hideHeader?: boolean
}
export const ProductDescription = (
  props: PropsWithChildren<TProductDescriptionProps>
) => {

  // TOOD: use CSS for this
  
  return (
    <Box>
      {props.hideHeader
        ? undefined
        : (
          <Text align='left' fontWeight='bold'>
            {props.product.name}
          </Text>
        ) 
      }
      <Text align='left'>{props.product.tcg}</Text>
      <Text align='left'>{props.product.type}</Text>
      <Text align='left'>{props.product.subtype}</Text>   
    </Box>
  )
}
