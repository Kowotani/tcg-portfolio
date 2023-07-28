import { PropsWithChildren, useContext, useEffect } from 'react';
import { 
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
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
  StackDivider,
  Text,
  VStack
} from '@chakra-ui/react';
import { getAverageCost, getPurchaseQuantity, getTotalCost, IProduct, 
  ITransaction, TransactionType } from 'common';
import { Field, FieldInputProps, Form, Formik, FormikHelpers, 
  FormikProps } from 'formik';
import { ProductDescription } from './ProductDescription';
import { ProductImage } from './ProductImage';
import { getBrowserLocale, getFormattedPrice, IEditTransactionsContext
  } from '../utils';
import { createColumnHelper } from '@tanstack/react-table';
import { TransactionTable } from './TransactionTable';

import { EditTransactionsContext } from '../state/EditTransactionsContext';

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
const AddTransactionForm = () => {

  // contexts
  const { transactions, setTransactions } 
    = useContext(EditTransactionsContext) as IEditTransactionsContext

  // functions

  // -- validation functions

  function validateDate(value: Date): string | undefined {
    let error
    if (!value) { error = 'Required' }
    return error
  }

  function validatePrice(value: number): string | undefined {
    let error
    if (!value) {
      error = 'Price is required'
    } else if (value <= 0) {
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
    if (e.target.value) {
      form.setFieldValue('price', Math.max(Number(e.target.value), 1))
    } else {
      form.setErrors({'price': 'Price is required'})
      form.setFieldTouched('price')
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
    setTransactions([...transactions, txn])
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
            // console.log('Values: ' + JSON.stringify(values))
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
                      <HStack display='flex' justifyContent='space-between'>
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
                      <HStack display='flex' justifyContent='space-between'>
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
                      <HStack display='flex' justifyContent='space-between'>
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
                  isLoading={form.isSubmitting}
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


// ----------------------
// TransactionSummaryCard
// ----------------------

type TTransactionSummaryCardProps = {
  transactions: ITransaction[]
}
const TransactionSummaryCardProps = (
  props: PropsWithChildren<TTransactionSummaryCardProps>
) => {
 
  const quantity = getPurchaseQuantity(props.transactions)
  const totalCost = getTotalCost(props.transactions)
  const averageCost = getAverageCost(props.transactions)

  const locale = getBrowserLocale()

  return (
    <Card>
      <CardBody>
        <HStack 
          divider={<StackDivider color='gray.200'/>}
          spacing={4}
        >
          <Box>
            <Text align='center' fontWeight='bold'>Quantity</Text>
            <Text align='center'>
              {getFormattedPrice(quantity, locale, '', 0)}
            </Text>
          </Box>
          <Box>
            <Text align='center' fontWeight='bold'>Total Cost</Text>
            <Text align='center'>
              {getFormattedPrice(totalCost, locale, '$', 2)}
            </Text>
          </Box>
          <Box>
            <Text align='center' fontWeight='bold'>Average Cost</Text>
            <Text align='center'>{averageCost 
              ? getFormattedPrice(averageCost, locale, '$', 2)
              : ' -'}
            </Text>
          </Box>                    
        </HStack>
      </CardBody>
    </Card>
  )
}


// -----------------
// TransactionTable
// -----------------

const locale = getBrowserLocale()

const columnHelper = createColumnHelper<ITransaction>()

const columns = [
  columnHelper.accessor('date', {
    cell: (info) => info.getValue().toISOString().substring(0,10),
    header: 'Date'
  }),
  columnHelper.accessor('type', {
    cell: (info) => info.getValue() === TransactionType.Purchase ? 'P' : 'S',
    header: 'Type'
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
    }
  }),
  columnHelper.accessor('price', {
    cell: (info) => getFormattedPrice(info.getValue(), locale, '$', 2),
    header: 'Price',
    meta: {
      isNumeric: true
    }
  }),  
]


// ==============
// Main Component
// ==============

type TEditTransactionsModalProps = {
  isOpen: boolean,
  onClose: () => void,
  product: IProduct,
}
export const EditTransactionsModal = (
  props: PropsWithChildren<TEditTransactionsModalProps>
) => {

  // contexts
  const { transactions } 
    = useContext(EditTransactionsContext) as IEditTransactionsContext


  // --------------
  // Main Component
  // --------------

  return (
    <Modal 
      closeOnOverlayClick={false}
      isOpen={props.isOpen} 
      onClose={props.onClose} 
    >
      <ModalOverlay />
      <ModalContent >
        <ModalHeader textAlign='center'>{props.product.name}</ModalHeader>
        <ModalBody>
          <VStack>
            <ProductImage boxSize='200px' product={props.product} />
            <ProductDescription 
              align='center'
              product={props.product} 
              showHeader={false} 
            />
            <TransactionSummaryCardProps transactions={transactions}/>
            <AddTransactionForm />
            <Card>
              <CardBody>
                <TransactionTable 
                  columns={columns} 
                  data={transactions}
                />
              </CardBody>
            </Card>
          </VStack>
        </ModalBody>
        <ModalFooter display='flex' justifyContent='space-evenly'>
          <Button 
            variant='ghost' 
            onClick={props.onClose}
          >
              Exit Without Saving
          </Button>
          <Button colorScheme='blue'>Save</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}