import { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { 
  Box,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Text,
  useDisclosure,
  useToast,
  VStack
} from '@chakra-ui/react'
import { 
  // data models
  IPopulatedHolding, IPopulatedPortfolio, IProduct, ITransaction,

  // api
  PORTFOLIO_URL, PRODUCTS_URL, TPostPortfolioReqBody, TPutPortfolioReqBody,

  // others
  assert, getIPortfoliosFromIPopulatedPortfolios, getReleasedProducts, isASCII, 
  isIPortfolio, isTResBody
} from 'common'
import { FilterInput } from './FilterInput'
import { Field, FieldInputProps, Form, Formik, FormikHelpers, 
  FormikProps } from 'formik'
import { HoldingEditCard } from './HoldingEditCard'
import { 
  AddButton, PrimaryButton, SecondaryButton, SectionHeader 
} from './Layout'
import * as _ from 'lodash'
import { LatestPricesContext } from '../state/LatestPricesContext'
import { 
  TransactionsModal, TransactionsModalMode 
} from './TransactionsModal'
import { CascadingSlideFade } from './Transitions'
import { parseProductsEndpointResponse } from '../utils/api'
import { 
  filterFnHoldingCard, sortFnPopulatedHoldingAsc 
} from '../utils/Holding'
import { PortfolioPanelNav } from '../utils/PortfolioPanel'
import { 
  ILatestPricesContext, getIPriceDataMapFromIDatedPriceDataMap 
} from '../utils/Price'


type TEditPortfolioProps = {
  existingPortfolioNames: string[],
  mode: PortfolioPanelNav,
  portfolio: IPopulatedPortfolio,
  onExit: () => void,
}
export const EditPortfolioForm = (props: TEditPortfolioProps) => {

  // modal
  const { isOpen, onOpen, onClose } = useDisclosure() 

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

  // ------------------------------------------
  // Product search (for TransactionsModal)
  // ------------------------------------------

  // Searchable products (that can be added)
  const [ searchableProducts, setSearchableProducts ] =
    useState([] as IProduct[])

  // -----
  // Price
  // -----

  const { latestPrices } 
    = useContext(LatestPricesContext) as ILatestPricesContext
  const prices = getIPriceDataMapFromIDatedPriceDataMap(latestPrices)


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

    // check if there are Holdings
    if (portfolio.populatedHoldings.length === 0) {
      actions.setSubmitting(false)
      toast({
        title: `No Holdings Found`,
        description: `Please add non-empty Holdings`,
        status: 'error',
        variant: 'subtle',
        isClosable: true,
      })                 
      return   
    }

    // check if all Holdings have Transactions
    const emptyHolding 
      = getHoldingWithoutTransactions(portfolio.populatedHoldings)
    if (emptyHolding) {
      actions.setSubmitting(false)
      toast({
        title: `Error: ${emptyHolding.product.name}`,
        description: `Please add Transactions to this Holding`,
        status: 'error',
        variant: 'subtle',
        isClosable: true,
      })                 
      return     
    }

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

    // -----------------
    // add new Portfolio
    // -----------------

    if (props.mode === PortfolioPanelNav.Add) {

      // create request body
      const body: TPostPortfolioReqBody = {
        portfolio: newPortfolio
      }

      // submit
      axios({
        method: 'post',
        url: PORTFOLIO_URL,
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
          'Unexpected response from PORTFOLIO_URL')

        // Portoflio was updated
        if (res.status === 200) {
          toast({
            title: 'Portfolio Created',
            description: `${newPortfolio.portfolioName} was created`,
            duration: 3000,
            status: 'success',
            isClosable: true,
          })        

        // exit Edit Mode
        props.onExit()

        // Portoflio was not updated
        } else if (res.status === 500) {
          toast({
            title: 'Could Not Create Portfolio',
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

        toast({
          title: 'Could Not Create Portfolio',
          description: 'Please try again later',
          status: 'error',
          isClosable: true,
        })                        
      })     

    // --------------------------
    // updated existing Portfolio
    // --------------------------

    } else if (props.mode === PortfolioPanelNav.Edit) {

      // create existingPortfolio IPortfolio
      const existingPortfolio 
        = _.head(getIPortfoliosFromIPopulatedPortfolios([props.portfolio]))
      assert(isIPortfolio(existingPortfolio),
        'Error converting existing Portfolio to IPortfolio')

      // create request body
      const body: TPutPortfolioReqBody = {
        existingPortfolio: existingPortfolio,
        newPortfolio: newPortfolio
      }

      // submit
      axios({
        method: 'put',
        url: PORTFOLIO_URL,
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
          'Unexpected response from PORTFOLIO_URL')

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
        props.onExit()

        // Portoflio was not updated
        } else if (res.status === 500) {
          toast({
            title: 'Could not update Portfolio',
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

        toast({
          title: 'Could not update Portfolio',
          description: 'Please try again later',
          status: 'error',
          isClosable: true,
        })                        
      })     

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
    } else if (props.portfolio.portfolioName !== value 
        &&_.includes(props.existingPortfolioNames, value)) {
      error = 'Portfolio Name already exists'
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

  // -------
  // Holding 
  // -------

  /*
  DESC
    Handler function to add an IPopulatedHOlding to the Portfolio, primarily 
    used via the Add Holding flow
  INPUT
    product: The Product of the Holding
    transactions: The Transactions of the Holding
  */
  function onAddHolding(
    product: IProduct, 
    transactions: ITransaction[]
  ): void {
    // update searchable products
    const newSearchableProducts = searchableProducts.filter((p: IProduct) => {
      return p.tcgplayerId !== product.tcgplayerId
    })
    setSearchableProducts(newSearchableProducts)

    // create new Holding
    const newHolding = {
      product: product, 
      transactions: transactions
    } as IPopulatedHolding 
    const newHoldings = portfolio.populatedHoldings
    newHoldings.push(newHolding)

    // set new Holdings
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
  function onDeleteHolding(holding: IPopulatedHolding): void {
    // update searchable products
    setSearchableProducts([...searchableProducts, holding.product])

    // update portfolio
    const newHoldings = portfolio.populatedHoldings.filter(
      (h: IPopulatedHolding) => {
        return h.product.tcgplayerId !== holding.product.tcgplayerId 
    })
    setPortfolio({
      ...portfolio,
      populatedHoldings: newHoldings
    })
  }
  
  /*
  DESC
    Handler function to update the Portfolio when one of its Holdings is updated
    but not deleted (see onDeleteHolding()), such as when the underlying 
    Transactions change
  INPUT
    holding: The updated IPopulatedHolding
  */
  function onUpdateHolding(holding: IPopulatedHolding): void {
    // replace Holding
    const newHoldings = portfolio.populatedHoldings.filter(
      (h: IPopulatedHolding) => {
        return h.product.tcgplayerId !== holding.product.tcgplayerId
    })
    newHoldings.push(holding)

    // set new Holdings
    setPortfolio({
      ...portfolio,
      populatedHoldings: newHoldings
    })
  }


  // =====
  // hooks
  // =====

  // get initial products 
  useEffect(() => {
    axios({
      method: 'get',
      url: PRODUCTS_URL,
    })
    .then(res => {
      const data = res.data.data
      const products = getReleasedProducts(parseProductsEndpointResponse(data))
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
      <SectionHeader header={'Details'} />

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
              <SecondaryButton 
                label='Back'
                variant='ghost' 
                onClick={props.onExit}
              />
              <Box w='16px' />
              <PrimaryButton 
                colorScheme='blue'
                isDisabled={!form.isValid}
                isLoading={form.isSubmitting}
                label='Save'
                type='submit'
              />
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
                        <Box display='flex' alignItems='flex-start'>
                          <FormLabel m='8px 16px 8px 0px'>
                            Portfolio Name
                          </FormLabel>
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
                        <Box display='flex' alignItems='flex-start'>
                          <FormLabel m='8px 16px 8px 0px'>
                            Description
                          </FormLabel>
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
      <SectionHeader header={'Holdings'}/>

      {/* Add Holding */}
      <Flex my={4}>
        <AddButton 
          label='Add Holding'
          onClick={onOpen}
        />
      </Flex>

      {/* Filter Holdings */}
      <FilterInput 
        placeholder='Search for a Holding'
        onFilterChange={e => setHoldingFilter(e.target.value)}
        value={holdingFilter}
        clearFilter={() => setHoldingFilter('')}
      />

      {holdingFilter.length > 0 &&
        <Flex justifyContent='center' width='100%'>
          <Text as='em' fontSize='lg'>
            {portfolio.populatedHoldings
              .filter(filterFnHoldingCard(holdingFilter)).length}
            &nbsp;of&nbsp;
            {portfolio.populatedHoldings.length} 
            &nbsp;holding
            {portfolio.populatedHoldings.length > 1 ? 's': ''}
            &nbsp;displayed
          </Text>
        </Flex>
      }

      {/* Holding Cards */}
      {portfolio.populatedHoldings
        .filter(filterFnHoldingCard(holdingFilter))
        .sort(sortFnPopulatedHoldingAsc)
        .map((holding: IPopulatedHolding, ix: number) => {

          const marketPrice 
            = Number(prices.get(holding.product.tcgplayerId)?.marketPrice)

          return (
            <CascadingSlideFade
              key={holding.product.tcgplayerId}
              index={ix}
              enterDelay={0.1}
              duration={0.5}
              itemDelay={0.1}
            >
              <Box m='16px 0px'>
                <HoldingEditCard
                  marketPrice={marketPrice}    
                  populatedHolding={holding}
                  onDeleteHolding={onDeleteHolding}
                  onUpdateHolding={onUpdateHolding}
                />
              </Box>
            </CascadingSlideFade>
          )
        })
      }

      {/* Modal */}
      {searchableProducts.length > 0 &&
        <TransactionsModal 
          isOpen={isOpen} 
          mode={TransactionsModalMode.Add}
          searchableProducts={searchableProducts}
          onAddHolding={onAddHolding}
          onClose={onClose} 
        />
      }
    </>
  )
}