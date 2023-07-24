import { PropsWithChildren } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { IProduct } from 'common'


// ==============
// Main Component
// ==============

type TProductDescriptionProps = {
  product: IProduct,
  align?: 'left' | 'center' | 'right'
  showHeader?: boolean
}
export const ProductDescription = (
  props: PropsWithChildren<TProductDescriptionProps>
) => {

  // TOOD: use CSS for this
  const alignment = props.align ?? 'left'

  return (
    <Box>
      {props.showHeader ?? true 
        ? (
          <Text align={alignment} fontWeight='bold'>
            {props.product.name}
          </Text>
        )
        : undefined 
      }
      <Text align={alignment}>{props.product.tcg}</Text>
      <Text align={alignment}>{props.product.type}</Text>
      <Text align={alignment}>{props.product.subtype}</Text>   
    </Box>
  )
}
