import { PropsWithChildren, useContext, useEffect, useState, } from 'react'
import axios from 'axios'
import { 
  Box,
  Input,
  Spacer,
} from '@chakra-ui/react'
import { 
  IHydratedHolding, IHydratedPortfolio, IProduct, 
  ITransaction, ProductLanguage, ProductSubtype, ProductType, TCG, 
  TransactionType,

  isIHydratedHolding,

  assert, GET_PRODUCTS_URL, isASCII,
} from 'common'
import * as _ from 'lodash'
import { HoldingCard } from './Holding'
import { InputErrorWrapper } from './InputField'
import { ProductSearchResult } from './ProductSearchResult';
import { SearchInput } from './SearchInput'
import { SideBarNavContext } from '../state/SideBarNavContext'
import { 
  ISideBarNavContext, NonVisibileProductSubtypes, SideBarNav, 
  sortFnHydratedHoldingAsc
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

  const fooHolding: IHydratedHolding = {
    product: fooProduct,
    transactions: fooTransactions
  }
  const fooPortfolio: IHydratedPortfolio = {
    userId: 1234,
    portfolioName: 'Alpha Investments',
    hydratedHoldings: [fooHolding].sort(sortFnHydratedHoldingAsc)
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
  // Product search
  // --------------

  function onSearchResultClick(product: IProduct):void {
    // clear search 
    setSearchInput('')

    // update searchable products
    const newSearchableProducts = searchableProducts.filter((p: IProduct) => {
        return p.tcgplayerId !== product.tcgplayerId
    })
    setSearchableProducts(newSearchableProducts)

    // update portfolio
    const newHoldings = portfolio.hydratedHoldings
      .concat([{
        product: product,
        transactions: []
      }])
      .sort(sortFnHydratedHoldingAsc)
    setPortfolio({
      ...portfolio, 
      hydratedHoldings: newHoldings
    })
  }

  function onHoldingDeleteClick(holding: IHydratedHolding): void {
    // update searchable products
    const matchingHolding = portfolio.hydratedHoldings.find(
      (h: IHydratedHolding) => {
        return h.product.tcgplayerId === holding.product.tcgplayerId
    })
    assert(isIHydratedHolding(matchingHolding))
    setSearchableProducts([...searchableProducts, matchingHolding.product])

    // update portfolio
    const newHoldings = portfolio.hydratedHoldings.filter(
      (h: IHydratedHolding) => {
        return h.product.tcgplayerId !== holding.product.tcgplayerId 
    })
    setPortfolio({
      ...portfolio,
      hydratedHoldings: newHoldings
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
      const existingTCGPlayerIds = portfolio.hydratedHoldings.map(
        (holding: IHydratedHolding) => holding.product.tcgplayerId
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
      .filter(product => {    
        return (
          // name
          _.toLower(product.name).match(_.toLower(searchInput)) !== null

          // TCG
          || _.toLower(product.tcg).match(_.toLower(searchInput)) !== null

          // ProductType
          || _.toLower(product.type).match(_.toLower(searchInput)) !== null

          // ProductSubtype
          || (_.toLower(product.subtype).match(_.toLower(searchInput)) !== null
            && !NonVisibileProductSubtypes.includes(
              product.subtype as ProductSubtype)
            )
        )
      })
      .sort((pA: IProduct, pB: IProduct): number => {
        const valA = `${pA.name} ${pA.type} ${pA.subtype} ${pA.language}`
        const valB = `${pB.name} ${pB.type} ${pB.subtype} ${pB.language}`
        return valA > valB ? 1 : -1
      })
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
        placeholder='Product to Add'
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

      {/* Holding Cards */}
      {portfolio.hydratedHoldings.map((holding: IHydratedHolding) => {
        return (
          <>
            <HoldingCard 
              key={holding.product.tcgplayerId}
              hydratedHolding={holding}
              onHoldingDeleteClick={onHoldingDeleteClick}
            />
            <Spacer h='8px'/>
          </>
        )
      })}
      
      {/* Footer */}
    </>
  )
}