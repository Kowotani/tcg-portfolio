import { PropsWithChildren } from 'react';
import { BoxProps, Image } from '@chakra-ui/react';
import { IProduct } from 'common'


// ==============
// Main Component
// ==============

type TProductImageProps = BoxProps & {
  product: IProduct
}
export const ProductImage = (props: PropsWithChildren<TProductImageProps>) => {

  // TODO: Get image filename with extension
  const imageUrl = `${props.product.tcgplayerId}.jpeg`
  const placeholderUrl = 'placeholder.jpeg'

  return (
    <Image 
      boxSize={props.boxSize}
      src={imageUrl}
      fallbackSrc={placeholderUrl}
    />
  )
}
