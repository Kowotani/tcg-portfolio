import { PropsWithChildren, useContext, useEffect, useState, } from 'react'
import axios from 'axios'
import { 
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Spacer,
  Text,
  VStack
} from '@chakra-ui/react'
import { 
  IPopulatedHolding, IPopulatedPortfolio, IProduct, 

  assert, GET_PRODUCTS_URL, isASCII, isIPopulatedHolding
} from 'common'
import { Field, FieldInputProps, Form, Formik, FormikHelpers, 
  FormikProps } from 'formik'
import { HoldingCard } from './HoldingCard'
import { FilterInput } from './FilterInput'
import { ProductSearchResult } from './ProductSearchResult';
import { SearchInput } from './SearchInput'
import { SideBarNavContext } from '../state/SideBarNavContext'
import { 
  ISideBarNavContext, SideBarNav, 

  filterFnHoldingCard, filterFnProductSearchResult, sortFnPopulatedHoldingAsc, 
  sortFnProductSearchResults
} from '../utils' 
import { isAsExpression } from 'typescript'


type TEditPortfolioProps = {
  portfolio: IPopulatedPortfolio,
  onExitEditMode: () => void,
}
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

  const [ portfolio, setPortfolio ] = useState(props.portfolio)

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

  // -------------------
  // form input handlers
  // -------------------

  function handleDescriptionOnBlur(
    e: React.FocusEvent<HTMLInputElement, Element>,
    form: FormikProps<IInputValues>
  ): void {
    form.setFieldValue('description', e.target.value)
    form.setFieldTouched('description')
    const error = validateDescription(e.target.value)
    if (error) {
      form.setFieldError('description', error)  
    }
  }

    function handlePortfolioNameOnBlur(
    e: React.FocusEvent<HTMLInputElement, Element>,
    form: FormikProps<IInputValues>
  ): void {
    form.setFieldValue('portfolioName', e.target.value)
    form.setFieldTouched('portfolioName')
    const error = validatePortfolioName(e.target.value)
    if (error) {
      form.setFieldError('portfolioName', error)
    }
  }

  // ---------------
  // form validation
  // ---------------

  // validate description
  function validateDescription(value: string): string | undefined {
    let error
    if (!isASCII(value)) {
      error = 'Description must only contain ASCII characters'
    }
    return error
  }

  // validate portfolio name
  function validatePortfolioName(value: string): string | undefined {
    let error
    if (value.length === 0) {
      error = 'Portfolio Name is required'
    } else if (!isASCII(value)) {
      error = 'Portfolio Name must only contain ASCII characters'
    }
    return error
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


  // ====================
  // PortfolioDetailsForm
  // ====================

  // input interface
  interface IInputValues {
    portfolioName: string,
    description: string
  }

  // defaults
  const DEFAULT_PORTFOLIO_NAME = props.portfolio.portfolioName
  const DEFAULT_DESCRIPTION = props.portfolio.description ?? ''

  // ==============
  // main component
  // ==============

  return (
    <>
      {/* Portfolio Header */}
      <Box bg='teal.500' color='white' fontWeight='medium' p='8px' m='16px 0px'>
        Portfolio Details
      </Box>

      {/* Portfolio Details Form */}
      <Formik
        initialValues={{
          portfolioName: DEFAULT_PORTFOLIO_NAME,
          description: DEFAULT_DESCRIPTION,
        }}
        onSubmit={(values: IInputValues, actions: FormikHelpers<IInputValues>) => {
          actions.setSubmitting(false)
          console.log(values)
        }}
        validateOnBlur={false}  // disable validation which overwrites setError
      >
        {(form: FormikProps<IInputValues>) => (

          <Form>

            {/* Exit and Save Buttons */}
            <Box display='flex' justifyContent='flex-end'>
              <Button 
                variant='ghost' 
                onClick={props.onExitEditMode}
              >
                  Exit Edit Mode
              </Button>
              <Box w='16px' />
              <Button 
                colorScheme='blue'
                isDisabled={!form.isValid}
                isLoading={form.isSubmitting}
                type='submit'
              >
                Save Changes
              </Button>
            </Box>

            <VStack spacing={4} m='16px 0px'>

              {/* Portfolio Name */}
              <Field name='portfolioName' validate={validatePortfolioName}>
                  {(field: FieldInputProps<string>) => (
                    <VStack alignItems='flex-end' spacing={4} width='100%'>
                      <FormControl 
                        isInvalid={form.errors?.portfolioName !== undefined
                          && form.touched?.portfolioName as boolean}
                        isRequired={true}
                      >
                        <Box display='flex' alignItems='end'>
                          <FormLabel>Portfolio Name</FormLabel>
                          <Box flexGrow={10}>
                            <Input
                              {...field}
                              type='text'
                              defaultValue={DEFAULT_PORTFOLIO_NAME}
                              onBlur={(e) => handlePortfolioNameOnBlur(e, form)}
                            />
                            {form.errors?.portfolioName 
                              ? (
                                <FormErrorMessage>
                                  {form.errors.portfolioName as string}
                                </FormErrorMessage>
                              ) : undefined
                            }    
                          </Box>   
                        </Box>       
                      </FormControl>
                    </VStack>
                  )}
                </Field>

              {/* Description */}
              <Field name='description' validate={validateDescription}>
                  {(field: FieldInputProps<string>) => (
                    <VStack alignItems='flex-end' spacing={4} width='100%'>
                      <FormControl 
                        isInvalid={form.errors?.description !== undefined
                          && form.touched?.description as boolean}
                      >
                        <Box display='flex' alignItems='end'>
                          <FormLabel>Description</FormLabel>
                          <Box flexGrow={10}>
                            <Input
                              {...field}
                              type='text'
                              defaultValue={DEFAULT_DESCRIPTION}
                              onBlur={(e) => handleDescriptionOnBlur(e, form)}
                            />
                            {form.errors?.description 
                              ? (
                                <FormErrorMessage>
                                  {form.errors.description as string}
                                </FormErrorMessage>
                              ) : undefined
                            }    
                          </Box>   
                        </Box>       
                      </FormControl>
                    </VStack>
                  )}
                </Field>

            </VStack>
          </Form>
        )}
      </Formik>


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
              <Spacer h='16px'/>
            </Box>
          )
        })
      }
      
      {/* Footer */}
    </>
  )
}