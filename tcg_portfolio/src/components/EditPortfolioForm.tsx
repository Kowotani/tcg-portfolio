import { PropsWithChildren, useContext, useEffect, useState, } from 'react'
import axios from 'axios'
import { 
  Box,
  Input,
} from '@chakra-ui/react'
import { GET_PRODUCTS_URL, IHolding,  IPortfolio, IProduct, 
  isASCII, ITransaction, ProductLanguage, ProductSubtype, ProductType, TCG, 
  TransactionType } from 'common'
import { Field, FieldInputProps, Form, Formik, FormikHelpers, 
    FormikProps } from 'formik';
import * as _ from 'lodash'
import { HoldingCard } from './Holding'
import { InputErrorWrapper } from './InputField'
import { ProductSearchResult } from './ProductSearchResult';
import { SearchInput } from './SearchInput'
import { SideBarNavContext } from '../state/SideBarNavContext'
import { ISideBarNavContext, NonVisibileProductSubtypes, 
  SideBarNav } from '../utils'


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

  const fooHolding: IHolding = {
    tcgplayerId: 121527,
    transactions: fooTransactions
  }
  const fooPortfolio: IPortfolio = {
    userId: 1234,
    portfolioName: 'Alpha Investments',
    holdings: [fooHolding]
  }

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

  function handleSearchChange(value: string): void {
    _.debounce(() => setSearchInput(value), 300)
  }

  // get initial products 
  useEffect(() => {
    axios({
      method: 'get',
      url: GET_PRODUCTS_URL,
    })
    .then(res => {
      const data: IProduct[] = res.data.data
      const existingTCGPlayerIds = portfolio.holdings.map(
        holding => holding.tcgplayerId
      )
      const unheldProducts = data.filter(product => {
        return !existingTCGPlayerIds.includes(product.tcgplayerId)
      })
      setSearchableProducts(unheldProducts)
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
  }, [searchInput])


  // ==============
  // Main Component
  // ==============

  return (
    <>
      {/* Portfolio */}
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

      {/* Holdings */}
      <Box bg='teal.500' color='white' fontWeight='medium' p='8px' m='16px 0px'>
        Holdings
      </Box>      

      {/* Search Product to Add */}
      <SearchInput 
        placeholder='Product to Add'
        maxSearchResults={5}
        onSearchChange={e => setSearchInput(e.target.value)}
        onSearchResultSelect={e => console.log(e)}
        searchResultRenderer={(res: IProduct) => (
          <ProductSearchResult 
            product={res} 
            searchInput={searchInput}
          />
        )}
        searchResults={searchResults}
        searchResultKey='tcgplayerId'
        value={searchInput}
      />

      <HoldingCard 
        product={fooProduct}
        holding={fooHolding}
      />

      {/* Footer */}
    </>
  )
}