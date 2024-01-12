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
  noOfHeaderLines?: number,
  noOfDescriptionLines?: number,
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
    noOfHeaderLines = undefined,
    noOfDescriptionLines = undefined,
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
    asType?: As,
    noOfLines?: number
  }
  const TextWrapper = (
    props: PropsWithChildren<TTextWrapperProps>
  ) => {
    return (
      <Text
        fontSize={fontSize}
        textAlign={textAlign}
        as={props.asType}
        noOfLines={props.noOfLines}
      >
        {props.children}
      </Text>
    )
  }

  type TLabelledTextProps = BoxProps & {
    label: string,
    noOfLines?: number
  }
  const LabelledTextWrapper = (
    props: PropsWithChildren<TLabelledTextProps>
  ) => {
    return (
      <Flex direction='row' justify='flex-start'>
        <TextWrapper 
          asType='b'
          noOfLines={props.noOfLines}
        >
          {`${props.label}:`}
        </TextWrapper>
        <Box width={2}/>
        <TextWrapper noOfLines={props.noOfLines}>
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
        <TextWrapper 
          fontWeight='bold' 
          noOfLines={noOfHeaderLines}
        >
          {getProductNameWithLanguage(product)}
        </TextWrapper>
      )}

      {/* TCG */}
      {showLabels 
        ? (
          <LabelledTextWrapper 
            label='TCG' 
            noOfLines={noOfDescriptionLines}
          > 
            {product.tcg}
          </LabelledTextWrapper>
        ) : (
          <TextWrapper noOfLines={noOfDescriptionLines}>
            {product.tcg}
          </TextWrapper>
        )
      }

      {/* Type */}
      {showLabels 
        ? (
          <LabelledTextWrapper 
            label='Type' 
            noOfLines={noOfDescriptionLines}
          > 
            {product.type}
          </LabelledTextWrapper>
        ) : (
          <TextWrapper noOfLines={noOfDescriptionLines}>
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
            <LabelledTextWrapper 
              label='Subtype'
              noOfLines={noOfDescriptionLines}
            > 
              {product.subtype}
            </LabelledTextWrapper>
          ) : (
            <TextWrapper noOfLines={noOfDescriptionLines}> 
              {product.subtype}
            </TextWrapper>
          )
        )
      }

      {/* Release Date */}
      {showReleaseDate && (
        showLabels
          ? (
            <LabelledTextWrapper 
              label='Release Date'
              noOfLines={noOfDescriptionLines}
            > 
              {formatAsISO(product.releaseDate)}
            </LabelledTextWrapper>
          ) : (
            <TextWrapper noOfLines={noOfDescriptionLines}> 
              {formatAsISO(product.releaseDate)}
            </TextWrapper>
          )
        )
      }
    </Box>
  )
}
