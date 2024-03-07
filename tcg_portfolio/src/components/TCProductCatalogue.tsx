import { useEffect, useState } from 'react'
import { 
  Box,
  Icon,
  Flex,
  Text
} from '@chakra-ui/react'
import { ITCProduct } from 'common'
import { FilterInput } from './FilterInput'
import * as _ from 'lodash'
import { Paginator } from './Paginator'
import { ProductCard } from './ProductCard'
import { FaSearch } from 'react-icons/fa'
import { 
  filterFnProductSearchResult, sortFnProductSearchResults 
} from '../utils/Product'


type TTCProductCatalogueProps = {
  products: ITCProduct[],
  onProductCardClick: (product: ITCProduct) => void
}
export const TCProductCatalogue = ({
  products, 
  onProductCardClick
}: TTCProductCatalogueProps) => {


  // =========
  // constants
  // =========

  const DEFAULT_CARD_HEIGHT = '220px'
  const DEFAULT_CARD_WIDTH = '350px'
  const DEFAULT_NUM_ITEMS_PER_PAGE = 12


  // =====
  // state
  // =====

  const [ filteredProducts, setFilteredProducts ] = useState([] as ITCProduct[])
  const [ paginatedProducts, setPaginatedProducts ] = useState([] as ITCProduct[])
  const [ filter, setFilter ] = useState('')


  // =========
  // functions
  // =========

  /*
  DESC
    Handles the FilterInput onFilterChange event
  INPUT
    input: The input from the FilterInput
  */
  function handleOnFilterChange(filter: string): void {
    const newFilteredProducts = products
      .filter(filterFnProductSearchResult(filter))
      .sort(sortFnProductSearchResults)
    setFilteredProducts(newFilteredProducts)
    updatePaginatedProducts(newFilteredProducts, 1)
    setFilter(filter)
  }

  /*
  DESC
    Handles the FilterInput filterClear event
  */
  function handleOnFilterClear(): void {
    setFilteredProducts(products)
    updatePaginatedProducts(products, 1)
    setFilter('')
  }

  /*
  DESC
    Handles the ProductCard onClick event
  INPUT
    product: The ITCProduct associated witht he ProductCard
  */
  function handleProductCardOnClick(product: ITCProduct): void {
    onProductCardClick(product)
  }

  /*
  DESC
    Updates paginatedProducts based on the input products and page number
  INPUT
    products: An ITCProduct[] of the products
    page: The active page number (the first page is 1)
  */
  function updatePaginatedProducts(
    filteredProducts: ITCProduct[], 
    page: number
  ): void {
    const startIx = (page - 1) * DEFAULT_NUM_ITEMS_PER_PAGE
    const endIx = Math.min(
      page * DEFAULT_NUM_ITEMS_PER_PAGE, 
      filteredProducts.length)
    setPaginatedProducts(_.slice(filteredProducts, startIx, endIx))
  }


  // =====
  // hooks
  // =====

  // TODO: See if this useEffect can be removed
  useEffect(() => {
    handleOnFilterChange(filter)
  }, [products])


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
        value={filter}
        clearFilter={() => handleOnFilterClear()}
      />

      {filter.length > 0 &&
        <Flex justifyContent='center' width='100%'>
          <Text as='em' fontSize='lg'>
            {filteredProducts.length}
            &nbsp;of&nbsp;
            {products.length} 
            &nbsp;product
            {products.length > 1 ? 's': ''}
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
                product={product}   // TODO: consider refactoring this
                tcproduct={product}
                width={DEFAULT_CARD_WIDTH}
                onClick={() => {}}  // TODO: consider refactoring this
                onTCProductClick={handleProductCardOnClick}
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
          onPageClick={_.curry(updatePaginatedProducts)(filteredProducts)}
        />
      </Flex>

    </>
  )
}