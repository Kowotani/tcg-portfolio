import { PropsWithChildren, useEffect, useState } from 'react'
import axios from 'axios'
import { 
  Flex,
  Spinner, 
} from '@chakra-ui/react'
import { 
  // data models
  IProduct,

  // api
  PRODUCTS_URL
 } from 'common'
import { SectionHeader } from './Layout'
import * as _ from 'lodash'
import { ProductDetailsCard } from './ProductDetailsCard'


type TProductCatalogueProps = {}
export const ProductCatalogue = (
  props: PropsWithChildren<TProductCatalogueProps>
) => {

  
  // =====
  // state
  // =====

  const [ allProducts, setAllProducts ] = useState([] as IProduct[])
  const [ product, setProduct ] = useState({} as IProduct)


  // =====
  // hooks
  // =====

  // initial load of all Products
  useEffect(() => {

    // call endpoint
    axios({
      method: 'get',
      url: PRODUCTS_URL
    })
    .then(res => {
      // set allProducts
      const products = res.data.data
      setAllProducts(products)

      // set product randomly
      const ix = Math.max(Math.floor(Math.random() * products.length - 1), 0)
      setProduct(products[ix])
    })
    .catch(err => {
      console.log('Error fetching all Products: ' + err)
    })
  }, [])

  
  // ==============
  // main component
  // ==============

  return (
    <>
      <SectionHeader header='Product Details'/>
      {_.isEmpty(product)
        ? (
          <Flex 
            alignItems='center' 
            justifyContent='center' 
            width='100%'
          >
            <Spinner 
              color='blue.500'
              height={75}
              width={75}
              thickness='7px'
            />
          </Flex>
        ) : <ProductDetailsCard product={product}/>
      }
    </>
  )
}