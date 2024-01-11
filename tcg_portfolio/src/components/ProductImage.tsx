import { PropsWithChildren } from 'react'
import { 
  BoxProps, 
  Image, 
  LinkBox,
  LinkOverlay,
} from '@chakra-ui/react'
import { IProduct, ProductSubtype, ProductType } from 'common'


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


  // ===============
  // image variables
  // ===============
  
  const tcgplayerId = props.product.tcgplayerId
  const imageUrl = 
    `https://tcgplayer-cdn.tcgplayer.com/product/${tcgplayerId}_200w.jpg`
  const secretLairImageUrl = 
    `https://tcgplayer-cdn.tcgplayer.com/product/${tcgplayerId}_1_200w.jpg`

  // isSecretLair
  const isSecretLairNonCommanderDeck = 
    props.product.type === ProductType.SecretLair
    && !(props.product.subtype === ProductSubtype.CommanderDeck)


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
        src={isSecretLairNonCommanderDeck ? secretLairImageUrl : imageUrl}
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
          <UrlWrapper tcgplayerId={tcgplayerId}>
            <ProductImage />  
          </UrlWrapper>
        ) : <ProductImage />
      }
    </>
  )
}
