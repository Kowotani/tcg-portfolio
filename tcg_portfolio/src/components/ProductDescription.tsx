import { PropsWithChildren } from 'react'
import { 
  As,
  Box, 
  BoxProps, 
  Flex,
  Text 
} from '@chakra-ui/react'
import { IProduct, formatAsISO } from 'common'
import { 
  getProductNameWithLanguage, NonVisibileProductSubtypes 
} from '../utils/Product'


// ==============
// main component
// ==============

type TProductDescriptionProps = BoxProps & {
  product: IProduct,
  showHeader?: boolean,
  showLabels?: boolean,
  showReleaseDate?: boolean
}
export const ProductDescription = (
  props: PropsWithChildren<TProductDescriptionProps>
) => {

  // desctructure props
  const {
    product,
    fontSize = 'md',
    showHeader = false,
    showLabels = false,
    showReleaseDate = false,
    textAlign = 'left'
  } = props


  // =============
  // sub component
  // =============

  // -- TextWrapper
  type TTextWrapperProps = BoxProps & {
    asType?: As
  }
  const TextWrapper = (
    props: PropsWithChildren<TTextWrapperProps>
  ) => {
    return (
      <Text
        textAlign={textAlign}
        fontSize={fontSize}
        as={props.asType}
      >
        {props.children}
      </Text>
    )
  }

  type TLabelledTextProps = BoxProps & {
    label: string
  }
  const LabelledTextWrapper = (
    props: PropsWithChildren<TLabelledTextProps>
  ) => {
    return (
      <Flex direction='row' justify='flex-start'>
        <TextWrapper asType='b'>
          {`${props.label}:`}
        </TextWrapper>
        <Box width={2}/>
        <TextWrapper>
          {props.children}
        </TextWrapper>
      </Flex>  
    )
  }


  // ==============
  // main component
  // ==============

  return (
    <Box>

      {/* Name */}
      {showHeader && (
        <TextWrapper fontWeight='bold'>
          {getProductNameWithLanguage(product)}
        </TextWrapper>
      )}

      {/* TCG */}
      {showLabels 
        ? (
          <LabelledTextWrapper label='TCG'> 
            {product.tcg}
          </LabelledTextWrapper>
        ) : (
          <TextWrapper>
            {product.tcg}
          </TextWrapper>
        )
      }

      {/* Type */}
      {showLabels 
        ? (
          <LabelledTextWrapper label='Type'> 
            {product.type}
          </LabelledTextWrapper>
        ) : (
          <TextWrapper>
            {product.type}
          </TextWrapper>
        )
      }

      {/* Subtype */}
      {product.subtype 
        && !NonVisibileProductSubtypes.includes(product.subtype)
        && (
          showLabels
          ? (
            <LabelledTextWrapper label='Subtype'> 
              {product.subtype}
            </LabelledTextWrapper>
          ) : (
            <TextWrapper> 
              {product.subtype}
            </TextWrapper>
          )
        )
      }

      {/* Release Date */}
      {showReleaseDate && (
        showLabels
          ? (
            <LabelledTextWrapper label='Release Date'> 
              {formatAsISO(product.releaseDate)}
            </LabelledTextWrapper>
          ) : (
            <TextWrapper> 
              {formatAsISO(product.releaseDate)}
            </TextWrapper>
          )
        )
      }
    </Box>
  )
}
