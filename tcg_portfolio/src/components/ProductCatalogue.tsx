import { PropsWithChildren, useEffect, useState } from 'react'
import axios from 'axios'
import { 
  Flex,
  Spinner, 
} from '@chakra-ui/react'
import { 
  // data models
  IProduct, PerformanceMetric, TDatedValue,

  // api
  PRODUCT_PERFORMANCE_URL, PRODUCTS_URL, TGetProductPerformanceResBody
 } from 'common'
import { SectionHeader } from './Layout'
import * as _ from 'lodash'
import { ProductDetailsCard } from './ProductDetailsCard'
import { parseProductsEndpointResponse } from '../utils/api'


type TProductCatalogueProps = {}
export const ProductCatalogue = (
  props: PropsWithChildren<TProductCatalogueProps>
) => {

  // =========
  // constants
  // =========

  const PRODUCT_PERFORMANCE_METRIC = PerformanceMetric.MarketValue

  
  // =====
  // state
  // =====

  const [ allProducts, setAllProducts ] = useState([] as IProduct[])
  const [ marketValue, setMarketValue ] = useState([] as TDatedValue[])
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
      const data = res.data.data
      const products = parseProductsEndpointResponse(data)
      setAllProducts(products)

      // set product randomly
      const ix = Math.max(Math.floor(Math.random() * products.length - 1), 0)
      setProduct(products[ix])
    })
    .catch(err => {
      console.log('Error fetching all Products: ' + err)
    })
  }, [])

  // load Product market value data
  useEffect(() => {

    // call endpoint
    axios({
      method: 'get',
      url: PRODUCT_PERFORMANCE_URL,
      params: {
        tcgplayerId: product.tcgplayerId,
        metrics: [PRODUCT_PERFORMANCE_METRIC]
      }      
    })
    .then(res => {
      // set marketValue data
      const resData = res.data as TGetProductPerformanceResBody
      const values = resData.data[PRODUCT_PERFORMANCE_METRIC] as TDatedValue[]
      setMarketValue(values)
    })
    .catch(err => {
      console.log('Error fetching Product performance data: ' + err)
    })
  }, [product])

  
  // ==============
  // main component
  // ==============

  return (
    <>
      {/* Product Details */}
      <SectionHeader header='Product Details'/>

      {/* Details */}
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

      {/* Product Search */}
      <SectionHeader header='Product Search'/>
    </>
  )
}