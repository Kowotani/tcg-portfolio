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
import { getBrowserLocale } from '../utils';
import { createColumnHelper } from '@tanstack/react-table';
import { TransactionTable } from './TransactionTable';


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
            console.log('Values: ' + JSON.stringify(values))
            actions.setSubmitting(false)
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
            <Text align='center'>{quantity.toLocaleString(locale)}</Text>
          </Box>
          <Box>
            <Text align='center' fontWeight='bold'>Total Cost</Text>
            <Text align='center'>${totalCost.toLocaleString(locale)}</Text>
          </Box>
          <Box>
            <Text align='center' fontWeight='bold'>Average Cost</Text>
            <Text align='center'>${averageCost.toLocaleString(locale)}</Text>
          </Box>                    
        </HStack>
      </CardBody>
    </Card>
  )
}


// -----------------
// TransactionTable
// -----------------

/*
DESC
  Returns the input price formatted according to the locale and the number
  of decimal places
INPUT
  price: The price to format
  locale: The locale to format against
  decimal?: The number of decimals to format to, defaults to 0
  prefix?: Any prefix to pre-pend to the price
RETURN
  The price formatted to the locale with the prfeix and number of decimal places
*/
function getFormattedPrice(
  price: number, 
  locale: string,
  prefix?: string,
  decimals?: number,
): string {

  let formattedPrice = price.toLocaleString(locale)
  const decimalIx = formattedPrice.indexOf('.')
  const precision = decimalIx >= 0 ? price.toString().length - decimalIx : 0

  // precision required
  if (decimals !== undefined && decimals > 0) {
    
    // no existing precision
    if (precision === 0) {
      formattedPrice = formattedPrice + '.' + '0'.repeat(decimals)

    // existing precision too high
    } else if (precision > decimals) {
      formattedPrice = formattedPrice.substring(0, 
        formattedPrice.length - (precision - decimals))

    // existing precision too low
    } else if (precision < decimals) {
      formattedPrice = formattedPrice + '0'.repeat(decimals - precision)
    }
  
  // precision not required
  } else if (decimalIx >= 0) {
    formattedPrice = formattedPrice.substring(0, decimalIx)
  }

  return prefix ? prefix + formattedPrice : formattedPrice
}

const locale = getBrowserLocale()

const data: ITransaction[] = [
  {
    type: TransactionType.Purchase,
    date: new Date(),
    price: 1234.56,
    quantity: 123
  },
  {
    type: TransactionType.Purchase,
    date: new Date(2023, 7, 1),
    price: 9,
    quantity: 9876
  },
]

const columnHelper = createColumnHelper<ITransaction>()

const columns = [
  columnHelper.accessor('date', {
    cell: (info) => info.getValue().toISOString().substring(0,10),
    header: 'Date'
  }),
  columnHelper.accessor('type', {
    cell: (info) => info.getValue() === 'Purchase' ? 'Buy' : 'Sell',
    header: 'Type'
  }),
  columnHelper.accessor('quantity', {
    cell: (info) => info.getValue().toLocaleString(locale),
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

type TEditTransactionalModalProps = {
  isOpen: boolean,
  onClose: () => void,
  product: IProduct,
  transactions: ITransaction[]
}
export const EditTransactionModal = (
  props: PropsWithChildren<TEditTransactionalModalProps>
) => {

  // const [ transactions, setTransactions ] = useState()
  
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
            <TransactionSummaryCardProps transactions={props.transactions}/>
            <AddTransactionForm />
            <Card>
              <CardBody>
                <TransactionTable columns={columns} data={data}/>
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