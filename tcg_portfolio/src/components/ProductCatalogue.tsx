import { PropsWithChildren, useState } from 'react'
import { 
  Box, 
  BoxProps, 
  Flex,
  Text 
} from '@chakra-ui/react'
import { IProduct } from 'common'
import { SectionHeader } from './Layout'
import { ProductDetailsCard } from './ProductDetailsCard'


type TProductCatalogueProps = {}
export const ProductCatalogue = (
  props: PropsWithChildren<TProductCatalogueProps>
) => {

  const fooProduct = {
    tcgplayerId: 208279,
    tcg: 'Magic: The Gathering',
    releaseDate: new Date(Date.parse('2022-05-15T00:00:00.000Z')),
    name: 'Ikoria: Lair of Behemoths',
    type: 'Booster Box',
    subtype: 'Collector',
    language: 'ENG',
    setCode: 'IKO',
    msrp: 225

  } as IProduct

  
  // =====
  // state
  // =====

  const [ product, setProduct ] = useState(fooProduct)


  // ==============
  // main component
  // ==============

  return (
    <>
      <SectionHeader header='Product Details'/>
      <ProductDetailsCard product={product}/>
    </>
  )
}