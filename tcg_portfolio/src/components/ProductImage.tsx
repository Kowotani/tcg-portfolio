import { PropsWithChildren } from 'react';
import { Image } from '@chakra-ui/react';
import { IProduct } from 'common'


// ==============
// Main Component
// ==============

type TProductImageProps = {
  boxSize: string,
  product: IProduct
}
export const ProductImage = (props: PropsWithChildren<TProductImageProps>) => {

  // TODO: Get image filename with extension
  // const imageUrl = `${props.product.tcgplayerId}.webp`
  const imageUrl = '/foo.webp'

  return (
    <Image 
      boxSize={props.boxSize}
      src={imageUrl}
    />
  )
}
