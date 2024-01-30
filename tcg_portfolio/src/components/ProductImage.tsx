import { PropsWithChildren } from 'react'
import { 
  BoxProps, 
  Image, 
  LinkBox,
  LinkOverlay,
} from '@chakra-ui/react'
import { IProduct } from 'common'
import { getProductImageUrl } from '../utils/generic'


// =============
// Sub Component
// =============

type TUrlWrapperProps = {
  tcgplayerId: number
}
export const UrlWrapper = (props: PropsWithChildren<TUrlWrapperProps>) => {

  const TCGPLAYER_URL = `https://www.tcgplayer.com/product/${props.tcgplayerId}/`

  return (
    <LinkBox>
      <LinkOverlay href={TCGPLAYER_URL} isExternal={true}>
        {props.children}
      </LinkOverlay>
    </LinkBox>
  )
}


// ==============
// Main Component
// ==============

type TProductImageProps = BoxProps & {
  product: IProduct,
  externalUrl?: boolean
}
export const ProductImage = (props: PropsWithChildren<TProductImageProps>) => {


  // =========
  // constants
  // =========

  const IMG_SIZE = 200


  // =============
  // sub component
  // =============
  
  const ProductImage = () => {
    return (
      <Image 
        backgroundColor='white'
        borderRadius={12} 
        boxSize={props.boxSize}
        fallbackStrategy='onError'
        fit='contain'
        src={getProductImageUrl(props.product.tcgplayerId, props.product.type, 
          IMG_SIZE, props.product.subtype)}
      />
    )
  }


  // ==============
  // main component
  // ==============

  return (
    <>
      {props.externalUrl
        ? (
          <UrlWrapper tcgplayerId={props.product.tcgplayerId}>
            <ProductImage />  
          </UrlWrapper>
        ) : <ProductImage />
      }
    </>
  )
}
