import { PropsWithChildren, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { 
  Box,
  Icon,
  Flex,
  Spinner, 
  Text
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
import { FilterInput } from './FilterInput'
import { useWindowDimensions } from '../hooks/WindowDimensions'
import { SectionHeader } from './Layout'
import * as _ from 'lodash'
import { MobileModeContext } from '../state/MobileModeContext'
import { Paginator } from './Paginator'
import { ProductCard } from './ProductCard'
import { ProductDetailsCard } from './ProductDetailsCard'
import { FaSearch } from 'react-icons/fa'
import { 
  parseProductsEndpointResponse, parseProductPerformanceEndpointResponse 
} from '../utils/api'
import { ChartDateRange, clampDatedValues } from '../utils/Chart'
import { IMobileModeContext } from '../utils/mobile'
import { 
  filterFnProductSearchResult, sortFnProductSearchResults 
} from '../utils/Product'


type TProductCatalogueProps = {}
export const ProductCatalogue = (
  props: PropsWithChildren<TProductCatalogueProps>
) => {


  // =========
  // constants
  // =========

  const DEFAULT_CARD_HEIGHT = '220px'
  const DEFAULT_CARD_WIDTH = '350px'
  const DEFAULT_NUM_ITEMS_PER_PAGE = 12
  const PRODUCT_PERFORMANCE_METRIC = PerformanceMetric.MarketValue
  

  // =====
  // state
  // =====

  const [ allProducts, setAllProducts ] = useState([] as IProduct[])
  const [ cardWidth, setCardWidth ] = useState(DEFAULT_CARD_WIDTH)
  const [ chartDateRange, setChartDateRange ] = useState(ChartDateRange.All)
  const [ filteredProducts, setFilteredProducts ] = useState([] as IProduct[])
  const [ marketValue, setMarketValue ] = useState([] as TDatedValue[])
  const [ numItemsPerPage, setNumItemsPerPage ] = 
    useState(DEFAULT_NUM_ITEMS_PER_PAGE)
  const [ paginatedProducts, setPaginatedProducts ] = useState([] as IProduct[])
  const [ product, setProduct ] = useState({} as IProduct)
  const [ productFilter, setProductFilter ] = useState('')

  const { mobileMode } = useContext(MobileModeContext) as IMobileModeContext
  const { width } = useWindowDimensions()


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
      Updates paginatedProducts based on the active page number
    INPUT
      page: The active page number (the first page is 1)
  */
  function updatePaginatedProducts(page: number): void {
    const startIx = (page - 1) * numItemsPerPage
    const endIx = Math.min(
      page * numItemsPerPage, 
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
      const products = getReleasedProducts(
        parseProductsEndpointResponse(data))
        .sort(sortFnProductSearchResults)
      setAllProducts(products)
      setFilteredProducts(products)

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

  // update numItemsPerPage
  useEffect(() => {
    const newNumItemsPerPage = width > 1850 
      ? 30   // 5 or 6 columns
      : DEFAULT_NUM_ITEMS_PER_PAGE
    setNumItemsPerPage(newNumItemsPerPage)
  }, [width])

  // update cardWidth
  useEffect(() => {
    const newCardWidth = mobileMode.isActive 
      ? '100%' 
      : DEFAULT_CARD_WIDTH
    setCardWidth(newCardWidth)
  }, [mobileMode.isActive])

  // update filteredProducts
  useEffect(() => {
    const newFilteredProducts = allProducts
      .filter(filterFnProductSearchResult(productFilter))
      .sort(sortFnProductSearchResults)
      setFilteredProducts(newFilteredProducts)
  }, [productFilter, allProducts])

  // update paginatedProducts
  useEffect(() => {
    updatePaginatedProducts(1)
  }, [filteredProducts])


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
              minHeight={300}
              minWidth={300}
              setParentDateRange={setChartDateRange}
            />
          </Box>
        )
      }

      {/* Product Search */}
      <SectionHeader header='Product Search'/>

      <FilterInput 
        icon={<Icon as={FaSearch} color='gray.500'/>}
        placeholder='Search for a Product'
        onFilterChange={e => setProductFilter(e.target.value)}
        value={productFilter}
        clearFilter={() => setProductFilter('')}
      />

      {productFilter.length > 0 &&
        <Flex justifyContent='center' width='100%'>
          <Text as='em' fontSize='lg'>
            {filteredProducts.length}
            &nbsp;of&nbsp;
            {allProducts.length} 
            &nbsp;product
            {allProducts.length > 1 ? 's': ''}
            &nbsp;displayed
          </Text>
        </Flex>
      }

      {/* Paginated Products */}
      <Flex
        alignItems='flex-start'
        flexWrap='wrap'
        justifyContent='center'
      >
        {_.slice(paginatedProducts).map((product: IProduct) => {
          return (
            <Box 
              key={product.tcgplayerId} 
              m={2} 
              width={cardWidth}
            >
              <ProductCard 
                height={DEFAULT_CARD_HEIGHT}
                product={product}
                width={cardWidth}
                onClick={setProduct}
              />
            </Box>
          )
        })}
      </Flex>

      {/* Pagination UI */}
      <Flex
        justifyContent='center'
        m={4}
      >
        <Paginator 
          numItems={filteredProducts.length}
          numItemsPerPage={numItemsPerPage}
          onPageClick={updatePaginatedProducts}
        />
      </Flex>
    </>
  )
}