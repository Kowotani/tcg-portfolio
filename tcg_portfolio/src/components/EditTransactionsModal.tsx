import { PropsWithChildren, useState } from 'react';
import { 
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Icon,
  IconButton,
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
  useToast,
  VStack
} from '@chakra-ui/react'
import { 
  IHolding, IReactTableTransaction, IProduct, ITransaction, TransactionType,

  getHoldingAverageCost, getHoldingAverageRevenue, getHoldingPurchaseQuantity, 
  getHoldingSaleQuantity, getHoldingTotalCost, getHoldingTotalRevenue,
  getISOStringFromDate,

  assert, isNumeric
} from 'common'
import { Field, FieldInputProps, Form, Formik, FormikHelpers, 
  FormikProps } from 'formik'
import { ProductDescription } from './ProductDescription'
import { ProductImage } from './ProductImage'
import { FiMinusCircle, FiPlus } from 'react-icons/fi'
import { createColumnHelper } from '@tanstack/react-table'
import { MetricSummary, TMetricSummaryItem 
  } from './MetricSummary'
import { TransactionTable } from './TransactionTable'
import { getBrowserLocale, getFormattedPrice, getProductNameWithLanguage 
} from '../utils'


// ==============
// Sub Components
// ==============

// ------------------
// AddTransactionForm
// ------------------

interface IInputValues {
  date: Date,
  price: number,
  quantity: number,
  type: TransactionType.Purchase | TransactionType.Sale
}
type TAddTransactionFormProps = {
  handleAddTransaction: (txn: ITransaction) => void;
}
const AddTransactionForm = (
  props: PropsWithChildren<TAddTransactionFormProps>
) => {

  // functions

  // -- validation functions

  function validateDate(value: Date): string | undefined {
    let error
    if (!value) { error = 'Required' }
    return error
  }

  function validatePrice(value: number | string): string | undefined {
    let error
    if (!value) {
      return 'Price is required'
    } else if (!isNumeric(value)) {
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
    form.setFieldValue('date', e.target.value)
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

  // component

  // defaults
  const DEFAULT_DATE = new Date()
  const DEFAULT_QUANTITY = 1
  const DEFAULT_TYPE = TransactionType.Purchase

  return (
    <Card>
      <CardBody>
        <Formik
          initialValues={{
            date: DEFAULT_DATE,
            price: 0,
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
                              DEFAULT_DATE.toISOString().substring(0,10)}
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
                  isDisabled={!form.isValid}
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


// ==============
// Main Component
// ==============

type TEditTransactionsModalProps = {
  isOpen: boolean,
  onClose: () => void,
  product: IProduct,
  setTransactions: (txns: ITransaction[]) => void,
  transactions: ITransaction[],
}
export const EditTransactionsModal = (
  props: PropsWithChildren<TEditTransactionsModalProps>
) => {

  // state
  const [ transactions, setTransactions ] = useState(props.transactions)

  // -------------------------
  // transaction summary items
  // -------------------------

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

  // ---------
  // functions
  // ---------

  // add transaction to local state only
  function handleAddTransaction(txn: ITransaction): void {
    setTransactions([...transactions, txn])
  }

  // exit without save
  function handleOnExit(): void {
    // reset local transactions
    setTransactions(props.transactions)
    props.onClose()
  }

  // exit and save 
  function handleOnSave(): void {

    // check that purchaes >= sales
    if (hasNonNegativeQuantity()) {

      // update parent transactions
      props.setTransactions(transactions)
      props.onClose()

    // alert via toast
    } else {
      
      toast({
        title: 'Error',
        description: 'Sales cannot be greater than Purchases',
        status: 'error',
        variant: 'subtle',
        isClosable: true,
      })          
    }
  }

  // validate that purchases >= sales
  function hasNonNegativeQuantity(): boolean {
    return getHoldingPurchaseQuantity(holding) 
      >= getHoldingSaleQuantity(holding)
  }

  // ----------------
  // TransactionTable
  // ----------------

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

  const locale = getBrowserLocale()

  const columnHelper = createColumnHelper<IReactTableTransaction>()

  const columns = [
    columnHelper.accessor('date', {
      cell: (info) => getISOStringFromDate(info.getValue()),
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
        const sign = info.row.getValue('type') === TransactionType.Sale ? '-' : ''
        const strQuantity = sign.concat(info.getValue().toLocaleString(locale))
        return strQuantity
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
      cell: (info) => getFormattedPrice(info.getValue(), locale, '$', 2),
      header: 'Price',
      meta: {
        isNumeric: true
      }
    }),  
    columnHelper.accessor('delete', {
      cell: (info) => {
        return (
          <IconButton 
            aria-label='Delete transaction'
            colorScheme='red'
            fontSize='24px'
            icon={<FiMinusCircle />}
            isRound={true}
            onClick={() => handleDeleteTransaction({
              date: info.row.getValue('date'),
              price: info.row.getValue('price'),
              quantity: info.row.getValue('quantity'),              
              type: info.row.getValue('type')
            })}
            variant='ghost'
          />
        )
      },
      header: '',
      enableSorting: false,
    }),  
  ]

  // -- hidden columns
  const hiddenColumns = ['type']

  // toast for validation alerts
  const toast = useToast()


  // ==============
  // Main Component
  // ==============

  return (
    <Modal 
      closeOnOverlayClick={false}
      isOpen={props.isOpen} 
      onClose={props.onClose}
    >
      <ModalOverlay />
      {/* Set modal z-index to be higher than the error tooltip (1800)*/}
      <Box zIndex={1850}>
        <ModalContent>
          <ModalHeader textAlign='center'
          >
            {getProductNameWithLanguage(props.product)}
          </ModalHeader>
          <ModalBody>
            <VStack>

              {/* Description */}
              <ProductDescription 
                product={props.product} 
                showHeader={false}
                fontSize='large' 
                textAlign='center'
              />
              <ProductImage boxSize='200px' product={props.product} />

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
              {
                getHoldingSaleQuantity(holding) > 0 
                  ? (
                    <Card>
                      <CardBody>
                        <MetricSummary 
                          summaryItems={saleSummaryItems}
                          variant='hcard'
                        />
                      </CardBody>
                    </Card>
                  ) : undefined
              }

              {/* Add Transaction Form */}
              <AddTransactionForm 
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
          </ModalBody>
          <ModalFooter display='flex' justifyContent='space-evenly'>
            <Button 
              variant='ghost' 
              onClick={handleOnExit}
            >
                Exit Without Saving
            </Button>
            <Button 
              colorScheme='blue'
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