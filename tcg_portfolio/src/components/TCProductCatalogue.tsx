import { useEffect, useState } from 'react'
import axios from 'axios'
import { 
  Box,
  Icon,
  Flex,
  Text
} from '@chakra-ui/react'
import { 
  // datamodels
  IProduct, ITCProduct,

  // api
  UNVALIDATED_TCPRODUCTS_URL
} from 'common'
import { FilterInput } from './FilterInput'
import * as _ from 'lodash'
import { Paginator } from './Paginator'
import { ProductCard } from './ProductCard'
import { FaSearch } from 'react-icons/fa'
import { parseUnvalidatedTCProductsEndpointResponse } from '../utils/api'
import { 
  filterFnProductSearchResult, sortFnProductSearchResults 
} from '../utils/Product'


type TTCProductCatalogueProps = {
  onProductCardClick: (product: IProduct) => void
}
export const TCProductCatalogue = (props: TTCProductCatalogueProps) => {

  // =========
  // constants
  // =========

  const DEFAULT_CARD_HEIGHT = '220px'
  const DEFAULT_CARD_WIDTH = '350px'
  const DEFAULT_NUM_ITEMS_PER_PAGE = 12


  // =====
  // state
  // =====

  const [ allProducts, setAllProducts ] = useState([] as ITCProduct[])
  const [ filteredProducts, setFilteredProducts ] = useState([] as ITCProduct[])
  const [ paginatedProducts, setPaginatedProducts ] = useState([] as ITCProduct[])
  const [ productFilter, setProductFilter ] = useState('')


  // =========
  // functions
  // =========

  /*
  DESC
    Handles the FilterInput onFilterChange event
  INPUT
    input: The input from the FilterInput
  */
  function handleOnFilterChange(query: string): void {
    const newFilteredProducts = allProducts
      .filter(filterFnProductSearchResult(query))
      .sort(sortFnProductSearchResults)
    setFilteredProducts(newFilteredProducts)
    updatePaginatedProducts(1)
    setProductFilter(query)
  }

  /*
  DESC
    Handles the FilterInput filterClear event
  */
  function handleOnFilterClear(): void {
    setFilteredProducts(allProducts)
    updatePaginatedProducts(1)
    setProductFilter('')
  }

  /*
  DESC
    Handles the ProductCard onClick event
  INPUT
    product: The IProduct associated witht he ProductCard
  */
  function handleProductCardOnClick(product: IProduct): void {
    props.onProductCardClick(product)
  }

  /*
  DESC
    Updates paginatedProducts based on the active page number
  INPUT
    page: The active page number (the first page is 1)
  */
  function updatePaginatedProducts(page: number): void {
    const startIx = (page - 1) * DEFAULT_NUM_ITEMS_PER_PAGE
    const endIx = Math.min(
      page * DEFAULT_NUM_ITEMS_PER_PAGE, 
      filteredProducts.length)
    setPaginatedProducts(_.slice(filteredProducts, startIx, endIx))
  }


  // =====
  // hooks
  // =====

  // initial load of all TCProducts
  useEffect(() => {

    // call endpoint
    axios({
      method: 'get',
      url: UNVALIDATED_TCPRODUCTS_URL
    })
    .then(res => {
      // set allProducts
      const data = res.data.data
      const products = parseUnvalidatedTCProductsEndpointResponse(data)
        .sort(sortFnProductSearchResults)
      setAllProducts(products)
      setFilteredProducts(products)
    })
    .catch(err => {
      console.log('Error fetching unvalidated TCProducts: ' + err)
    })
  }, [])


  // ==============
  // main component
  // ==============

  return (
    <>
      {/* Product Search */}
      <FilterInput 
        icon={<Icon as={FaSearch} color='gray.500'/>}
        placeholder='Search for a TCProduct'
        onFilterChange={e => handleOnFilterChange(e.target.value)}
        value={productFilter}
        clearFilter={() => handleOnFilterClear()}
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
        {_.slice(paginatedProducts).map((product: ITCProduct) => {
          return (
            <Box 
              key={product.tcgplayerId} 
              m={2} 
              width={DEFAULT_CARD_WIDTH}
            >
              <ProductCard 
                height={DEFAULT_CARD_HEIGHT}
                product={product}
                width={DEFAULT_CARD_WIDTH}
                onClick={handleProductCardOnClick}
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
          numItemsPerPage={DEFAULT_NUM_ITEMS_PER_PAGE}
          onPageClick={updatePaginatedProducts}
        />
      </Flex>

    </>
  )
}