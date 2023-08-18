import { PropsWithChildren, useContext, useEffect, useState, } from 'react'
import axios from 'axios'
import { 
  Box,
  Input,
  Spacer,
  Text
} from '@chakra-ui/react'
import { 
  IPopulatedHolding, IPopulatedPortfolio, IProduct, 
  ITransaction, ProductLanguage, ProductSubtype, ProductType, TCG, 
  TransactionType,

  isIPopulatedHolding,

  assert, GET_PRODUCTS_URL, isASCII
} from 'common'
import { HoldingCard } from './HoldingCard'
import { InputErrorWrapper } from './InputField'
import { FilterInput } from './FilterInput'
import { ProductSearchResult } from './ProductSearchResult';
import { SearchInput } from './SearchInput'
import { SideBarNavContext } from '../state/SideBarNavContext'
import { 
  ISideBarNavContext, SideBarNav, 

  filterFnHoldingCard, filterFnProductSearchResult, sortFnPopulatedHoldingAsc, 
  sortFnProductSearchResults
} from '../utils' 


type TEditPortfolioProps = {}
export const EditPortfolioForm = (
  props: PropsWithChildren<TEditPortfolioProps>
) => {

  // contexts
  const { sideBarNav } = useContext(SideBarNavContext) as ISideBarNavContext
  const isEditPortfolioForm = sideBarNav === SideBarNav.PORTFOLIO


  // ======
  // states
  // ======

  // -------
  // Holding
  // -------

  const [ holdingFilter, setHoldingFilter ] = useState('')

  // ---------
  // Portfolio
  // ---------

  // ====================================
  // dummy data start

  const fooTransactions: ITransaction[] = [
    {
      type: TransactionType.Purchase,
      date: new Date(),
      quantity: 123,
      price: 5.67
    }
  ]

  const fooProduct: IProduct = {
    tcgplayerId: 121527,
    tcg: TCG.MagicTheGathering,
    releaseDate: new Date(),
    name: 'Kaladesh',
    type: ProductType.BoosterBox,
    language: ProductLanguage.English,
    subtype: ProductSubtype.Draft,
    setCode: 'KLD',
  }

  const fooHolding: IPopulatedHolding = {
    product: fooProduct,
    transactions: fooTransactions
  }
  const fooPortfolio: IPopulatedPortfolio = {
    userId: 1234,
    portfolioName: 'Alpha Investments',
    populatedHoldings: [fooHolding].sort(sortFnPopulatedHoldingAsc)
  }


  // dummy data end
  // ====================================

  const [ portfolio, setPortfolio ] = useState(fooPortfolio)

  // PortfolioName state
  const [ portfolioNameState, setPortfolioNameState ] = useState<{
    portfolioName: string | undefined,
    isInvalid?: boolean, 
    errorMessage?: string,
  }>({
    portfolioName: undefined,
  })

  // --------------
  // Product search
  // --------------

  // Search input
  const [ searchInput, setSearchInput ] = useState('')

  // Searchable products (that can be added)
  const [ searchableProducts, setSearchableProducts ] =
    useState([] as IProduct[])

  // Search results
  const [ searchResults, setSearchResults ] = useState([] as IProduct[])


  // =========
  // functions
  // =========

  // ---------------
  // form validation
  // ---------------

  // validate PortfolioName
  function validatePortfolioName(input: string): void {

    // empty state
    if (input.length === 0) {
      setPortfolioNameState({
        portfolioName: '',
        isInvalid: true, 
        errorMessage: 'Portfolio Name is required',
      })

    // non-ASCII characters
    } else if (!isASCII(input)) {
      setPortfolioNameState({
        portfolioName: '',
        isInvalid: true, 
        errorMessage: 'Portfolio Name must only contain ASCII characters',
      })

    // valid
    } else {
      setPortfolioNameState({ 
        portfolioName: input,
        isInvalid: false 
      })
    }
  }

  // --------------
  // Holding change
  // --------------

  /*
  DESC
    Handler function to update the Portfolio when one of its Holdings is updated
    but not deleted (see onHoldingDelete()), such as when the underlying 
    Transactions change
  INPUT
    holding: The updated IPopulatedHolding
  */
  function onHoldingUpdate(holding: IPopulatedHolding): void {
    // create new holdings
    const ix = portfolio.populatedHoldings.findIndex((h: IPopulatedHolding) => {
      return h.product.tcgplayerId === holding.product.tcgplayerId
    })
    assert(ix >= 0 && ix < portfolio.populatedHoldings.length)
    const newHoldings = portfolio.populatedHoldings
    newHoldings.splice(ix, 1, holding)

    // set new holdings
    setPortfolio({
      ...portfolio,
      populatedHoldings: newHoldings
    })
  }

  // --------------
  // Product search
  // --------------

  /*
  DESC
    Handler function to update various states after the user selects a Product
    from the search results to add to the Portfolio
  INPUT
    product: The IProduct that was clicked from the search results
  */
  function onSearchResultClick(product: IProduct): void {
    // clear search 
    setSearchInput('')

    // update searchable products
    const newSearchableProducts = searchableProducts.filter((p: IProduct) => {
        return p.tcgplayerId !== product.tcgplayerId
    })
    setSearchableProducts(newSearchableProducts)

    // update portfolio
    const newHoldings = portfolio.populatedHoldings
      .concat([{
        product: product,
        transactions: []
      }])
      .sort(sortFnPopulatedHoldingAsc)
    setPortfolio({
      ...portfolio, 
      populatedHoldings: newHoldings
    })
  }

  /*
  DESC
    Handler function to update various states after the user deletes a Holding
    from the Portfolio
  INPUT
    holding: The IPopulatedHolding to delete
  */
  function onHoldingDelete(holding: IPopulatedHolding): void {
    // update searchable products
    const matchingHolding = portfolio.populatedHoldings.find(
      (h: IPopulatedHolding) => {
        return h.product.tcgplayerId === holding.product.tcgplayerId
    })
    assert(isIPopulatedHolding(matchingHolding))
    setSearchableProducts([...searchableProducts, matchingHolding.product])

    // update portfolio
    const newHoldings = portfolio.populatedHoldings.filter(
      (h: IPopulatedHolding) => {
        return h.product.tcgplayerId !== holding.product.tcgplayerId 
    })
    setPortfolio({
      ...portfolio,
      populatedHoldings: newHoldings
    })

    // clear search 
    setSearchInput('')
  }
  

  // =====
  // hooks
  // =====

  // get initial products 
  useEffect(() => {
    axios({
      method: 'get',
      url: GET_PRODUCTS_URL,
    })
    .then(res => {
      const products: IProduct[] = res.data.data
      const existingTCGPlayerIds = portfolio.populatedHoldings.map(
        (holding: IPopulatedHolding) => holding.product.tcgplayerId
      )
      const searchableProducts = products.filter((product: IProduct) => {
        return !existingTCGPlayerIds.includes(product.tcgplayerId)
      })
      setSearchableProducts(searchableProducts)
      
    })
    .catch(err => {
      console.log('Error fetching products: ' + err)
    })
  }, [])

  // update Product seach results
  useEffect(() => {
    const productResults = searchableProducts
      .filter(filterFnProductSearchResult(searchInput))
      .sort(sortFnProductSearchResults)
    setSearchResults(productResults)
  }, [searchInput, searchableProducts])


  // ==============
  // Main Component
  // ==============

  return (
    <>
      {/* Portfolio Header */}
      <Box bg='teal.500' color='white' fontWeight='medium' p='8px' m='16px 0px'>
        Portfolio Details
      </Box>

      {/* Name */}
      <Box m='32px 0px'>
        <InputErrorWrapper 
          leftLabel='Portfolio Name'
          errorMessage={portfolioNameState.errorMessage}
          isErrorDisplayed={portfolioNameState.isInvalid && isEditPortfolioForm}
        >
          <Input 
            isInvalid={portfolioNameState.isInvalid}
            onBlur={e => validatePortfolioName(e.target.value)}
            defaultValue={portfolio.portfolioName}
            width='50%'
          />
        </InputErrorWrapper>
      </Box>

      {/* Holdings Header */}
      <Box bg='teal.500' color='white' fontWeight='medium' p='8px' m='16px 0px'>
        Holdings
      </Box>      

      {/* Search Product to Add */}
      <SearchInput 
        placeholder='Search for a Product'
        maxSearchResults={5}
        onSearchChange={e => setSearchInput(e.target.value)}
        onSearchResultSelect={e => onSearchResultClick(e as IProduct)}
        searchResultRenderer={(res: IProduct) => (
          <ProductSearchResult 
            product={res} 
            searchInput={searchInput}
          />
        )}
        searchResults={searchResults}
        searchResultKey='tcgplayerId'
        value={searchInput}
        clearSearch={() => setSearchInput('')}
      />

      {/* Filter Holdings */}
      <FilterInput 
        placeholder='Filter for a Holding'
        onFilterChange={e => setHoldingFilter(e.target.value)}
        value={holdingFilter}
        clearFilter={() => setHoldingFilter('')}
      />

      {holdingFilter.length > 0 &&
        <Box width='100%'>
          <Text fontSize='lg' as='em'>
          {portfolio.populatedHoldings.filter(filterFnHoldingCard(holdingFilter)).length}
          &nbsp;of&nbsp;
          {portfolio.populatedHoldings.length} 
          &nbsp;holding
          {portfolio.populatedHoldings.length > 1 ? 's': ''}
          &nbsp;displayed
          </Text>
        </Box>
      }

      {/* Holding Cards */}
      {portfolio.populatedHoldings
        .filter(filterFnHoldingCard(holdingFilter))
        .map((holding: IPopulatedHolding) => {
          return (
            <Box key={holding.product.tcgplayerId}>
              <HoldingCard 
                
                populatedHolding={holding}
                onHoldingDelete={onHoldingDelete}
                onHoldingUpdate={onHoldingUpdate}
              />
              <Spacer h='8px'/>
            </Box>
          )
        })
      }
      
      {/* Footer */}
    </>
  )
}