import { 
  Box,
  Card,
  CardBody,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputLeftAddon,
  NumberInput,
  NumberInputField,
  Radio,
  RadioGroup,
  VStack
} from '@chakra-ui/react'
import {
  // data models 
  ITransaction, TransactionType,

  // generic
  assert, formatAsISO, getClampedDate, 
} from 'common'
import { 
  Field, FieldInputProps, Form, Formik, FormikHelpers, FormikProps 
} from 'formik'
import { AddButton } from './Layout'
import * as _ from 'lodash'


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
export const AddTransactionForm = (props: TAddTransactionFormProps) => {

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

                <AddButton 
                  colorScheme='green' 
                  isDisabled={!form.isValid 
                    || form.values.price === DEFAULT_PRICE}
                  isLoading={form.isSubmitting}
                  label='Add Transaction'
                  type='submit'
                />
              </VStack>
            </Form>

          )}
        </Formik>
      </CardBody>
    </Card>
  )
}