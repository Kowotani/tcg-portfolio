import { PropsWithChildren, useContext, useEffect, useState, } from 'react'
import axios from 'axios'
import { 
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Spacer,
  Text,
  useToast,
  VStack
} from '@chakra-ui/react'
import { 
  IPopulatedHolding, IPopulatedPortfolio, IProduct, 

  getIPortfoliosFromIPopulatedPortfolios,

  GET_PRODUCTS_URL, UPDATE_PORTFOLIO_URL, 
  
  TPutPortfolioReqBody,

  assert, isASCII, isIPopulatedHolding, isIPortfolio, isTResBody
} from 'common'
import { FilterInput } from './FilterInput'
import { Field, FieldInputProps, Form, Formik, FormikHelpers, 
  FormikProps } from 'formik'
import { HoldingCard } from './HoldingCard'
import * as _ from 'lodash'
import { ProductSearchResult } from './ProductSearchResult';
import { SearchInput } from './SearchInput'
import { SideBarNavContext } from '../state/SideBarNavContext'
import { 
  ISideBarNavContext, 

  filterFnHoldingCard, filterFnProductSearchResult, sortFnPopulatedHoldingAsc, 
  sortFnProductSearchResults
} from '../utils' 


type TEditPortfolioProps = {
  portfolio: IPopulatedPortfolio,
  onExitEditMode: () => void,
}
export const EditPortfolioForm = (
  props: PropsWithChildren<TEditPortfolioProps>
) => {

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

  // -----------
  // form submit
  // -----------
  
  function handleFormOnSubmit(
    values: IInputValues, 
    actions: FormikHelpers<IInputValues>
  ): void {

    // check if all Holdings have Transactions
    const emptyHolding 
      = getHoldingWithoutTransactions(portfolio.populatedHoldings)
    if (emptyHolding) {
      actions.setSubmitting(false)
      toast({
        title: `Error: ${emptyHolding.product.name}`,
        description: `Holding has no Transactions`,
        status: 'error',
        variant: 'subtle',
        isClosable: true,
      })                 
      return     
    }

    // create existingPortfolio IPortfolio
    const existingPortfolio 
      = _.head(getIPortfoliosFromIPopulatedPortfolios([props.portfolio]))
    assert(isIPortfolio(existingPortfolio),
      'Error converting existing Portfolio to IPortfolio')

    // create newPortfolio IPortfolio
    let portfolioTemplate: IPopulatedPortfolio = {
      userId: props.portfolio.userId,
      portfolioName: values.portfolioName,
      populatedHoldings: portfolio.populatedHoldings
    }
    if (values.description.length > 0) {
      portfolioTemplate['description'] = values.description
    }
    const newPortfolio 
      = _.head(getIPortfoliosFromIPopulatedPortfolios([portfolioTemplate]))
    assert(isIPortfolio(newPortfolio),
      'Error converting new Portfolio to IPortfolio')              

    // create request body
    const body: TPutPortfolioReqBody = {
      existingPortfolio: existingPortfolio,
      newPortfolio: newPortfolio
    }

    // submit
    axios({
      method: 'put',
      url: UPDATE_PORTFOLIO_URL,
      data: body,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    // success
    .then(res => {
      actions.setSubmitting(false)

      const resData = res.data
      assert(isTResBody(resData),
        'Unexpected response from UPDATE_PORTFOLIO_URL')

      // Portoflio was updated
      if (res.status === 200) {
        toast({
          title: 'Portfolio Updated',
          description: `${existingPortfolio.portfolioName} was updated`,
          duration: 3000,
          status: 'success',
          isClosable: true,
        })        

      // exit Edit Mode
      props.onExitEditMode()

      // Portoflio was not updated
      } else if (res.status === 500) {
        toast({
          title: 'Error',
          description: `${resData.message}`,
          duration: 3000,
          status: 'error',
          isClosable: true,
        })    
      }

    })

    // error
    .catch(res => {
      actions.setSubmitting(false)

      // TODO: type check
      const resData = res.data  

      toast({
        title: 'Error',
        description: 'Please try again later',
        status: 'error',
        isClosable: true,
      })                        
    })            
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

  // NOTE: This is a custom validator that is not used for Formik
  /*
    DESC
      Returns any Holding that does not have any Transactions
    INPUT
      holdings: An IPopulatedHolding[]
    RETURN
      An IPopulatedHolding, or undefined if all Holdings have Transactions
  */
  function getHoldingWithoutTransactions(
    holdings: IPopulatedHolding[]
  ): IPopulatedHolding | undefined {
    const emptyHolding = holdings.reduce(
      (acc: IPopulatedHolding | undefined, cur: IPopulatedHolding) => {
        if (cur.transactions.length === 0) {
          acc = cur
        }
        return acc
    }, undefined)
    return emptyHolding
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

  // Axios response toast
  const toast = useToast()

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
        onSubmit={
          (values: IInputValues, actions: FormikHelpers<IInputValues>) => {
            handleFormOnSubmit(values, actions)
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