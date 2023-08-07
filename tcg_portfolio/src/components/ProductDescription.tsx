import { PropsWithChildren } from 'react';
import { Box, BoxProps, Text } from '@chakra-ui/react';
import { IProduct } from 'common'


// ==============
// Main Component
// ==============

type TProductDescriptionProps = BoxProps & {
  product: IProduct,
  showHeader?: boolean
}
export const ProductDescription = (
  props: PropsWithChildren<TProductDescriptionProps>
) => {

  return (
    <Box>
      {props.showHeader ?? true 
        ? (
          <Text 
            textAlign={props.textAlign} 
            fontWeight='bold'
          >
            {props.product.name}
          </Text>
        )
        : undefined 
      }
      <Text 
        textAlign={props.textAlign} 
        fontSize={props.fontSize}
      >
        {props.product.tcg}
      </Text>
      <Text 
        textAlign={props.textAlign} 
        fontSize={props.fontSize}
      >
        {props.product.type}
      </Text>
      <Text 
        textAlign={props.textAlign} 
        fontSize={props.fontSize}
      >
        {props.product.subtype}
      </Text>   
    </Box>
  )
}
