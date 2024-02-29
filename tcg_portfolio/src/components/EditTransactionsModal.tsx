import { PropsWithChildren, useState } from 'react'
import { 
  Box,
  Button,
  Card,
  CardBody,
  CloseButton,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftAddon,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  Radio,
  RadioGroup,
  Text,
  useColorMode,
  useToast,
  VStack
} from '@chakra-ui/react'
import {
  // data models 
  IHolding, IReactTableTransaction, IProduct, ITransaction, TransactionType,

  // data model helpers
  getHoldingAverageCost, getHoldingAverageRevenue, getHoldingPurchaseQuantity, 
  getHoldingSaleQuantity, getHoldingTotalCost, getHoldingTotalRevenue,

  // typeguards
  isIProduct, isITransactionArray, 

  // generic
  assert, formatAsISO, getClampedDate, 
} from 'common'
import { 
  Field, FieldInputProps, Form, Formik, FormikHelpers, FormikProps 
} from 'formik'
import * as _ from 'lodash'
import { MetricSummary, TMetricSummaryItem } from './MetricSummary'
import { ProductDescription } from './ProductDescription'
import { ProductImage } from './ProductImage'
import { ProductSearchResult } from './ProductSearchResult'
import { SearchInput } from './SearchInput'
import { FiPlus } from 'react-icons/fi'
import { createColumnHelper } from '@tanstack/react-table'
import { TransactionTable } from './TransactionTable'
import { hasNonNegativeQuantity } from '../utils/Holding'
import { formatAsPrice } from '../utils/Price'
import { 
  filterFnProductSearchResult, getProductNameWithLanguage,
  sortFnProductSearchResults 
} from '../utils/Product'
import { formatNumber, getColorForNumber } from '../utils/generic'


// ==================
// AddTransactionForm
// ==================

interface IInputValues {
  date: Date,
  price: number,
  quantity: number,
  type: TransactionType.Purchase | TransactionType.Sale
}
type TAddTransactionFormProps = {
  releaseDate: Date,
  handleAddTransaction: (txn: ITransaction) => void
}
const AddTransactionForm = (
  props: PropsWithChildren<TAddTransactionFormProps>
) => {

  // =========
  // functions
  // =========

  // -- validation functions

  function validateDate(value: Date): string | undefined {
    let error
    const clampedDate = getClampedDate(
      new Date(value),
      new Date(props.releaseDate),
      new Date(DEFAULT_DATE)
    )
    if (!value) {
      error = 'Required'
    } else if ((new Date(value)).getTime() !== clampedDate.getTime()) (
      error = 'Invalid date'
    )
    return error
  }

  function validatePrice(value: number | string): string | undefined {
    let error
    if (!value) {
      return 'Price is required'
    } else if (!_.isFinite(Number(value))) {
      return 'Not a number'
    } 
    const numberValue = Number(value)
    assert(typeof numberValue === 'number')
    if (numberValue <= 0) {
      error = 'Must be positive'
    }
    return error
  }

  function validateQuantity(value: number): string | undefined {
    let error
    if (!value) {
      error = 'Quantity is required'
    } else if (value <= 0) {
      error = 'Must be positive'
    }
    return error
  }

  // -- handler functions

  function handleDateOnBlur(
    e: React.FocusEvent<HTMLInputElement, Element>,
    form: FormikProps<IInputValues>
  ): void {
    const valueDate = new Date(Date.parse(e.target.value))
    const error = validateDate(valueDate)
    if (error) {
      form.setFieldError('date', error)
      form.setFieldTouched('date')
    } else {
      form.setFieldValue('date', e.target.value)
    }
  }

  function handlePriceOnBlur(
    e: React.FocusEvent<HTMLInputElement, Element>,
    form: FormikProps<IInputValues>
  ): void {
    const error = validatePrice(e.target.value)
    if (error) {
      form.setFieldError('price', error)
      form.setFieldTouched('price')
    } else {
      form.setFieldValue('price', Math.max(Number(e.target.value), 1))
    }
  }

  function handleQuantityOnBlur(
    e: React.FocusEvent<HTMLInputElement, Element>,
    form: FormikProps<IInputValues>
  ): void {
    form.setFieldValue('quantity', Math.max(Number(e.target.value), 1))
  }
  
  function handleTypeOnChange(
    e: string,
    form: FormikProps<IInputValues>
  ): void {
    form.setFieldValue('type', e)
  }

  function handleAddTransaction(txn: ITransaction): void {
    props.handleAddTransaction(txn)
  }


  // ==============
  // main component
  // ==============

  // defaults
  const DEFAULT_DATE = new Date()
  const DEFAULT_PRICE = 0
  const DEFAULT_QUANTITY = 1
  const DEFAULT_TYPE = TransactionType.Purchase

  return (
    <Card>
      <CardBody>
        <Formik
          initialValues={{
            date: DEFAULT_DATE,
            price: DEFAULT_PRICE,
            quantity: DEFAULT_QUANTITY,
            type: DEFAULT_TYPE
          }}
          onSubmit={(values: IInputValues, actions: FormikHelpers<IInputValues>) => {
            actions.setSubmitting(false)
            handleAddTransaction({
              ...values,
              // TODO: figure out how to fix this
              date: typeof values.date === 'string'
                ? new Date(Date.parse(values.date))
                : values.date
            } as ITransaction)
          }}
          validateOnBlur={false}  // disable validation which overwrites setError
        >
          {(form: FormikProps<IInputValues>) => (

            <Form>
              <VStack spacing={4}>

                {/* Type */}
                <Field name='type' >
                  {(field: FieldInputProps<string>) => (
                    <RadioGroup
                      {...field}
                      onChange={(e) => handleTypeOnChange(e, form)}
                      defaultValue={TransactionType.Purchase}
                    >
                      <HStack spacing={8}>
                        <Radio value={TransactionType.Purchase}>Purchase</Radio>
                        <Radio value={TransactionType.Sale}>Sale</Radio>
                      </HStack>
                    </RadioGroup>
                  )}
                </Field>

                {/* Date */}
                <Field name='date' validate={validateDate}>
                  {(field: FieldInputProps<string>) => (
                    <FormControl 
                      isInvalid={form.errors?.date !== undefined
                        && form.touched?.date as boolean}
                      isRequired={true}
                    >
                      <HStack 
                        display='flex' 
                        alignItems='end' 
                        justifyContent='space-between'
                      >
                        <FormLabel>Date</FormLabel>
                        <Box>
                          <Input
                            {...field}
                            type='date'
                            defaultValue={
                              formatAsISO(DEFAULT_DATE)}
                            min={formatAsISO(props.releaseDate)}
                            max={formatAsISO(DEFAULT_DATE)}
                            onBlur={(e) => handleDateOnBlur(e, form)}                            
                          />
                          {form.errors?.date 
                            ? (
                              <FormErrorMessage>
                                {form.errors.date as string}
                              </FormErrorMessage>
                            ) : undefined
                          }    
                        </Box>    
                      </HStack>          
                    </FormControl>
                  )}
                </Field>

               {/* Quantity */}
               <Field name='quantity' validate={validateQuantity}>
                  {(field: FieldInputProps<number>) => (
                    <FormControl 
                      isInvalid={form.errors?.quantity !== undefined
                        && form.touched?.quantity as boolean}
                      isRequired={true}
                    >
                      <HStack 
                        display='flex' 
                        alignItems='end' 
                        justifyContent='space-between'
                      >
                        <FormLabel>Quantity</FormLabel>
                        <Box>
                          <NumberInput 
                            defaultValue={DEFAULT_QUANTITY}
                            min={1}
                            precision={0} 
                            width='165px'
                          >
                            <NumberInputField 
                              {...field}
                              onBlur={(e) => handleQuantityOnBlur(e, form)}
                              textAlign='right'
                            />
                          </NumberInput>
                          {form.errors?.quantity 
                            ? (
                              <FormErrorMessage>
                                {form.errors.quantity as string}
                              </FormErrorMessage>
                            ) : undefined
                          }    
                        </Box>   
                      </HStack>           
                    </FormControl>
                  )}
                </Field>

                {/* Price */}
                <Field name='price' validate={validatePrice}>
                  {(field: FieldInputProps<number>) => (
                    <FormControl 
                      isInvalid={form.errors?.price !== undefined
                        && form.touched?.price as boolean}
                      isRequired={true}
                    >
                      <HStack 
                        display='flex' 
                        alignItems='end' 
                        justifyContent='space-between'
                      >
                      <FormLabel>Price</FormLabel>
                        <Box>
                          <InputGroup>
                            <InputLeftAddon children='$' />
                            <NumberInput min={1} precision={2} width='123px'>                        
                              <NumberInputField 
                                {...field} 
                                onBlur={(e) => handlePriceOnBlur(e, form)}
                                textAlign='right'
                              />
                            </NumberInput>
                          </InputGroup>
                          {form.errors?.price 
                            ? (
                              <FormErrorMessage justifyContent='flex-end'>
                                {form.errors.price as string}
                              </FormErrorMessage>
                            ) : undefined
                          }    
                        </Box>   
                      </HStack>           
                    </FormControl>
                  )}
                </Field>

                <Button 
                  colorScheme='green' 
                  isDisabled={!form.isValid 
                    || form.values.price === DEFAULT_PRICE}
                  isLoading={form.isSubmitting}
                  leftIcon={<Icon as={FiPlus} />}
                  type='submit'
                >
                  Add Transaction
                </Button>
              </VStack>
            </Form>

          )}
        </Formik>
      </CardBody>
    </Card>
  )
}


// =====================
// EditTransactionsModal
// =====================

export enum TransactionsModalMode {
  Add = 'ADD',
  Edit = 'EDIT'
}

type TEditTransactionsModalProps = {
  isOpen: boolean,
  mode: TransactionsModalMode,
  marketPrice?: number,
  product?: IProduct,
  searchableProducts?: IProduct[],
  transactions?: ITransaction[],
  onClose: () => void,
  onAddHolding?: (product: IProduct, transactions: ITransaction[]) => void,
  onSetTransactions?: (txns: ITransaction[]) => void
}
export const EditTransactionsModal = (
  props: PropsWithChildren<TEditTransactionsModalProps>
) => {

  // =====
  // state
  // =====

  const [ transactions, setTransactions ] = 
    useState(props.transactions ?? [] as ITransaction[])
  const [ product, setProduct ] = useState(props.product)

  // --------------
  // product search
  // --------------

  // search input
  const [ searchInput, setSearchInput ] = useState('')

  // searchable products (that can be added)
  // const [ searchableProducts, setSearchableProducts ] =
  //   useState(props.searchableProducts ?? [] as IProduct[])

  // search results
  const [ searchResults, setSearchResults ] = useState([] as IProduct[])


  // ===================
  // transaction summary
  // ===================

  const holding: IHolding = {
    tcgplayerId: 0,
    transactions: transactions
  }

  const purchaseSummaryItems: TMetricSummaryItem[] = [
    {
      title: 'Purchases',
      value: getHoldingPurchaseQuantity(holding),
      placeholder: '-',
    },
    {
      title: 'Total Cost',
      value: getHoldingTotalCost(holding),
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: '$ -',
    },
    {
      title: 'Avg Cost',
      value: getHoldingAverageCost(holding),
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: '$ -',
    },
  ]

  const saleSummaryItems: TMetricSummaryItem[] = [
    {
      title: 'Sales',
      value: getHoldingSaleQuantity(holding),
      placeholder: '-',
    },
    {
      title: 'Total Rev',
      value: getHoldingTotalRevenue(holding),
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: '$ -',
    },
    {
      title: 'Avg Rev',
      value: getHoldingAverageRevenue(holding),
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: '$ -',
    },
  ]


  // =========
  // functions
  // =========

  // ----------------
  // add transactions
  // ----------------

  /*
  DESC 
    Handle Add Transaction button onclick
  */
  function handleAddTransaction(txn: ITransaction): void {
    setTransactions([...transactions, txn])
  }

  // -----
  // modal
  // ----- 

  /*
  DESC 
    Handle Cancel button onclick
  */
  function handleOnExit(): void {
    if (props.mode === TransactionsModalMode.Add) {
      resetState()
    } else if (props.mode === TransactionsModalMode.Edit) {
      setTransactions(props.transactions as ITransaction[])
    }
    props.onClose()
  }

  /*
  DESC 
    Handle Save button onclick
  */
  function handleOnSave(): void {

    // check that purchaes >= sales
    if (hasNonNegativeQuantity(holding)) {

      // Add mode - add new Holding
      if (props.mode === TransactionsModalMode.Add) {
        assert(isIProduct(product), 'Product is undefined')
        assert(props.onAddHolding, 'onAddHolding() is undefined')
        props.onAddHolding(product, transactions)
        resetState()

      // Edit mode - update parent transactions
      } else if (props.mode === TransactionsModalMode.Edit) {
        assert(props.onSetTransactions, 'onSetTransactions() is undefined')
        props.onSetTransactions(transactions)
      }
      props.onClose()

      const description = props.mode === TransactionsModalMode.Add 
        ? 'Holding was added'
        : 'Transactions were updated'

      toast({
        title: `${product ? product.name : ''}`,
        description: description,
        status: 'success',
        isClosable: true,
      })   

    // alert via toast that Sales < Purchases
    } else {
      
      toast({
        title: 'Error',
        description: 'Sales exceed Purchases',
        status: 'error',
        variant: 'subtle',
        isClosable: true,
      })          
    }
  }

  /*
  DESC
    Returns whether the data is valid to save for the Holding
  RETURN
    TRUE if the data is valid, FALSE otherwise
  */
  function isDataValid(): boolean {
    return isIProduct(product) 
      && isITransactionArray(transactions) 
      && transactions.length > 0
  }

  /*
  DESC
    Resets state to initial values
  */
  function resetState(): void {
    setProduct(undefined)
    setTransactions([] as ITransaction[])
    setSearchInput('')
    setSearchResults([] as IProduct[])
  }

  // --------------
  // product search
  // --------------

  /*
  DESC
    Get Products that are searchable from the search input
  */
  function getSearchableProducts(): IProduct[] {
    const searchableProducts = props.searchableProducts ?? [] as IProduct[]
    return product
      ? searchableProducts.filter((p: IProduct) => {
        return p.tcgplayerId !== product.tcgplayerId
      }) : searchableProducts
  }

  /*
  DESC
    Handler function for search input changes
  */
  function onSearchChange(query: string): void {
    setSearchInput(query)
    const results = getSearchableProducts()
      .filter(filterFnProductSearchResult(query))
      .sort(sortFnProductSearchResults)
    setSearchResults(results)
  }

  /*
  DESC
    Handler function to update various states after the user selects a Product
    from the search results to add to the Portfolio
  INPUT
    product: The IProduct that was clicked from the search results
  */
  function onSearchResultClick(product: IProduct): void {
    setSearchInput('')
    setProduct(product)
  }


  // =================
  // transaction table
  // =================

  const { colorMode } = useColorMode()

  function handleDeleteTransaction(txn: ITransaction): void {
    const ix = transactions.findIndex((t: ITransaction) => (
        t.date === txn.date 
        && t.price === txn.price 
        && t.quantity === txn.quantity
        && t.type === txn.type
    ))
    if (ix >= 0) {
      const newTransactions = [...transactions]
      newTransactions.splice(ix, 1)
      setTransactions(newTransactions)
    }
  }

  const columnHelper = createColumnHelper<IReactTableTransaction>()

  const columns = [
    columnHelper.accessor('date', {
      cell: (info) => formatAsISO(info.getValue()),
      header: 'Date',
      sortingFn: 'datetime'
    }),
    columnHelper.accessor('type', {
      cell: (info) => info.getValue() === TransactionType.Purchase ? 'P' : 'S',
      header: 'Type',
      enableHiding: true,
    }),
    columnHelper.accessor('quantity', {
      cell: (info) => {
        const sign: number = 
          info.row.getValue('type') === TransactionType.Sale ? -1 : 1
        const quantity = sign * info.getValue()
        const strQuantity = formatNumber({value: quantity}) 
        const color = getColorForNumber(colorMode, quantity)
        return <Text color={color}>{strQuantity}</Text>
      },
      header: 'Quantity',
      meta: {
        isNumeric: true
      },
      sortingFn: (rowA, rowB, columnId) => {
        const valueA = Number(rowA.getValue(columnId))
          * (rowA.getValue('type') === TransactionType.Purchase ? 1 : -1)
        const valueB = Number(rowB.getValue(columnId))
        * (rowB.getValue('type') === TransactionType.Purchase ? 1 : -1)
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0
      }      
    }),
    columnHelper.accessor('price', {
      cell: (info) => formatAsPrice(info.getValue()),
      header: 'Price',
      meta: {
        isNumeric: true
      }
    }),  
    columnHelper.accessor('delete', {
      cell: (info) => {
        return (
          <CloseButton 
            onClick={() => handleDeleteTransaction({
              date: info.row.getValue('date'),
              price: info.row.getValue('price'),
              quantity: info.row.getValue('quantity'),              
              type: info.row.getValue('type')
            })}
          />
        )
      },
      header: '',
      enableSorting: false,
    }),  
  ]

  // -- hidden columns
  const hiddenColumns = ['type']


  // =====
  // hooks
  // =====

  // toast for validation alerts
  const toast = useToast()


  // ==============
  // main component
  // ==============

  return (
    <Modal 
      closeOnEsc={false}
      closeOnOverlayClick={false}
      isOpen={props.isOpen} 
      size='3xl'
      onClose={props.onClose}
    >
      <ModalOverlay />
      {/* Set modal z-index to be higher than the error tooltip (1800)*/}
      <Box zIndex={1850}>
        <ModalContent>
          <ModalHeader textAlign='center'>
            {props.mode === TransactionsModalMode.Add &&
                <SearchInput 
                placeholder='Search for a Product'
                maxSearchResults={5}
                onSearchChange={e => onSearchChange(e.target.value)}
                onSearchResultSelect={
                  e => onSearchResultClick(e as IProduct)
                }
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
            }
            {product && getProductNameWithLanguage(product)}
          </ModalHeader>
          <ModalBody>
            {product && 
              <VStack>
                {/* Description */}
                <ProductDescription 
                  product={product} 
                  showHeader={false}
                  fontSize='large' 
                  textAlign='center'
                />

                {/* Market price */}
                <Text fontSize='large'>
                  {props.marketPrice && formatAsPrice(props.marketPrice)}
                </Text>

                {/* Product Image */}
                <ProductImage boxSize='200px' product={product} />

                {/* Purchases */}
                <Card>
                  <CardBody>
                    <MetricSummary 
                      summaryItems={purchaseSummaryItems}
                      variant='hcard'
                    />
                  </CardBody>
                </Card>
                
                {/* Sales */}
                {getHoldingSaleQuantity(holding) &&  
                  <Card>
                    <CardBody>
                      <MetricSummary 
                        summaryItems={saleSummaryItems}
                        variant='hcard'
                      />
                    </CardBody>
                  </Card>
                }

                {/* Add Transaction Form */}
                <AddTransactionForm
                  releaseDate={product.releaseDate} 
                  handleAddTransaction={handleAddTransaction}
                />
                <Card>
                  <CardBody>
                    <TransactionTable 
                      columns={columns} 
                      data={transactions}
                      hiddenColumns={hiddenColumns}
                    />
                  </CardBody>
                </Card>
              </VStack>
            }
          </ModalBody>
          <ModalFooter display='flex' justifyContent='space-evenly'>
            <Button 
              variant='ghost' 
              onClick={handleOnExit}
            >
              Cancel
            </Button>
            <Button 
              colorScheme='blue'
              isDisabled={!isDataValid()}
              onClick={handleOnSave}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Box>
    </Modal>
  )
}