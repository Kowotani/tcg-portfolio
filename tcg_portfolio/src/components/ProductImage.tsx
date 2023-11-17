import { PropsWithChildren } from 'react'
import { 
  BoxProps, 
  Image, 
  LinkBox,
  LinkOverlay,
} from '@chakra-ui/react'
import { IProduct } from 'common'


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

  // TODO: Get image filename with extension
  const imageUrl = `${props.product.tcgplayerId}.jpeg`
  const placeholderUrl = 'placeholder.jpeg'

  return (
    <>
      {props.externalUrl
        ? (
          <UrlWrapper tcgplayerId={props.product.tcgplayerId}>
            <Image 
              boxSize={props.boxSize}
              src={imageUrl}
              fallbackSrc={placeholderUrl}
            />            
          </UrlWrapper>
        ) : (
          <Image 
            boxSize={props.boxSize}
            src={imageUrl}
            fallbackSrc={placeholderUrl}
          />       
      )}
    </>
  )
}
