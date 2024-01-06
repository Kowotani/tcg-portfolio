import { PropsWithChildren, useEffect, useState } from 'react'
import axios from 'axios'
import { 
  Box,
  Flex,
  Spinner, 
} from '@chakra-ui/react'
import { PriceChart } from './Charts'
import { 
  // data models
  IProduct, PerformanceMetric, TDatedValue,

  // api
  PRODUCT_PERFORMANCE_URL, PRODUCTS_URL, TGetProductPerformanceResBody,

  // others
  getReleasedProducts
 } from 'common'
import { SectionHeader } from './Layout'
import * as _ from 'lodash'
import { ProductCatalogueCard } from './ProductCatalogueCard'
import { ProductDetailsCard } from './ProductDetailsCard'
import ReactPaginate from 'react-paginate'
import { 
  parseProductsEndpointResponse, parseProductPerformanceEndpointResponse 
} from '../utils/api'
import { ChartDateRange, clampDatedValues } from '../utils/Chart'


type TProductCatalogueProps = {}
export const ProductCatalogue = (
  props: PropsWithChildren<TProductCatalogueProps>
) => {


  // =========
  // constants
  // =========

  const PRODUCT_PERFORMANCE_METRIC = PerformanceMetric.MarketValue
  const NUM_PAGINATED_RESULTS = 10
   

  // =====
  // state
  // =====

  const [ allProducts, setAllProducts ] = useState([] as IProduct[])
  const [ chartDateRange, setChartDateRange ] = useState(ChartDateRange.All)
  const [ filteredProducts, setFilteredProducts ] = useState([] as IProduct[])
  const [ paginatedProducts, setPaginatedProducts ] = useState([] as IProduct[])
  const [ marketValue, setMarketValue ] = useState([] as TDatedValue[])
  const [ product, setProduct ] = useState({} as IProduct)


  // ===============
  // chart variables
  // ===============

  const productMarketValues = clampDatedValues(marketValue, chartDateRange)
  const productMsrpValues = productMarketValues.map((dv: TDatedValue) => {
    return {
      date: dv.date,
      value: product.msrp ?? 0
    } as TDatedValue
  })
  const chartData = new Map<string, TDatedValue[]>([
    ['Price', productMarketValues],
    ['MSRP', productMsrpValues]
  ])

  const dataKeys = {
    primaryKey: 'Price',
    referenceKey: 'MSRP'
  }


  // =========
  // functions
  // =========

  /*
    DESC
      Handles the click event from the ReactPaginate page component and
      updates paginatedProducts
    INPUT
      event: The current page object
  */
  function handlePageChange(event: any): void {
    const startIx = event.selected * NUM_PAGINATED_RESULTS
    const endIx = Math.min(
      (event.selected + 1) * NUM_PAGINATED_RESULTS, 
      filteredProducts.length)
    setPaginatedProducts(_.slice(filteredProducts, startIx, endIx))
  }


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
      const products = getReleasedProducts(parseProductsEndpointResponse(data))
      setAllProducts(products)
      // TODO: fix this
      setFilteredProducts(products)
      setPaginatedProducts(_.slice(products, 0, NUM_PAGINATED_RESULTS))

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

    // only call endpoint if a Product is set
    if (!_.isEmpty(product)) {

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
        const perfData = parseProductPerformanceEndpointResponse(resData.data)
        const values = perfData[PRODUCT_PERFORMANCE_METRIC] as TDatedValue[]
        setMarketValue(values)
        window.scrollTo({top: 0, behavior: 'smooth'}) // scroll to the top
      })
      .catch(err => {
        console.log('Error fetching Product performance data: ' + err)
      })
    }
  }, [product])


  // ==============
  // main component
  // ==============

  return (
    <>
      {/* Product Details */}
      <SectionHeader header='Product Details'/>

      {/* Details */}
      {_.isEmpty(product) || _.isEmpty(marketValue)
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
        ) : (
          <ProductDetailsCard 
            chartDateRange={chartDateRange}
            marketValue={marketValue} 
            product={product}
          />
        )
      }

      {/* Price Chart */}
      {_.isEmpty(product) || _.isEmpty(marketValue)
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
        ) : (
          <Box marginTop={4}>
            <PriceChart 
              data={chartData}
              dataKeys={dataKeys}
              dateRange={chartDateRange}
              isControlled={false}
              height={300}
              minWidth={300}
              setParentDateRange={setChartDateRange}
            />
          </Box>
        )
      }

      {/* Product Search */}
      <SectionHeader header='Product Search'/>

      {/* Paginated Products */}
      <Flex
        alignItems='flex-start'
        flexWrap='wrap'
        justifyContent='center'
      >
        {_.slice(paginatedProducts).map((product: IProduct) => {
          return (
            <Box key={product.tcgplayerId} m={2}>
              <ProductCatalogueCard 
                product={product}
                setCatalogueProduct={setProduct}
              />
            </Box>
          )
        })}
      </Flex>

      {/* Pagination UI */}
      <ReactPaginate 
        breakLabel='...'
        marginPagesDisplayed={1}
        nextLabel='>'
        onPageChange={handlePageChange}
        pageCount={Math.ceil(allProducts.length / NUM_PAGINATED_RESULTS)}
        pageRangeDisplayed={3}
        previousLabel='<'
        renderOnZeroPageCount={null}
      />
    </>
  )
}