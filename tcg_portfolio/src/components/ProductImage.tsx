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


  // ===============
  // image variables
  // ===============
  
  const tcgplayerId = props.product.tcgplayerId
  const imageUrl = 
    `https://tcgplayer-cdn.tcgplayer.com/product/${tcgplayerId}_200w.jpg`
  const secretLairImageUrl = 
  `https://tcgplayer-cdn.tcgplayer.com/product/${tcgplayerId}_1_200w.jpg`

  // isSecretLair
  const isSecretLair = props.product.type === 'Secret Lair'


  // =============
  // sub component
  // =============
  
  const ProductImage = () => {
    return (
      <Image 
        backgroundColor='white'
        borderRadius={12} 
        boxSize={props.boxSize}
        fallbackSrc={isSecretLair ? imageUrl : undefined}
        fit='contain'
        src={isSecretLair ? secretLairImageUrl : imageUrl}
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
