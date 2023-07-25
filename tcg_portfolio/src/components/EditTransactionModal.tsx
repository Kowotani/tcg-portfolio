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
  SimpleGrid,
  StackDivider,
  Text,
  VStack
} from '@chakra-ui/react';
import { getPurchaseQuantity, getAverageCost, getTotalCost, IProduct, 
  ITransaction } from 'common';
import { Field, FieldInputProps, Form, Formik, FormikProps } from 'formik';
import { ProductDescription } from './ProductDescription';
import { ProductImage } from './ProductImage';
import { getBrowserLocale } from '../utils';


// ==============
// Sub Components
// ==============

// ------------------
// AddTransactionForm
// ------------------

interface IInputValues {
  date: Date,
  price: number,
  quantity: number
}
const AddTransactionForm = () => {

  // -- validation functions

  function validateDate(value: Date): string | undefined {
    return !value ? 'Required' : undefined
  }

  function validatePrice(value: number): string | undefined {
    return value === 0 ? 'Required' : undefined
  }

  function validateQuantity(value: number): string | undefined {
    return value === 0 ? 'Required' : undefined
  }

  // -- component

  const defaultDate = (new Date()).toISOString().substring(0,10)

  return (
    <Card>
      <CardBody>
        <Formik
          initialValues={{
            date: new Date(),
            price: 0,
            quantity: 0,
          }}
          onSubmit={(values: IInputValues, actions) => {
            console.log(values)
          }}
        >
          <Form>
            <VStack spacing={4}>

              {/* Date */}
              <Field name='date' validate={validateDate}>
                {(form: FormikProps<IInputValues>) => (
                  <FormControl 
                    isInvalid={form.errors?.date !== undefined
                      && form.touched?.date as boolean}
                    isRequired={true}
                  >
                    <HStack display='flex' justifyContent='space-between'>
                      <FormLabel>Date</FormLabel>
                      <Box>
                        <Input
                          type='date' 
                          defaultValue={defaultDate}
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
                {(form: FormikProps<IInputValues>) => (
                  <FormControl 
                    isInvalid={form.errors?.quantity !== undefined
                      && form.touched?.quantity as boolean}
                    isRequired={true}
                  >
                    <HStack display='flex' justifyContent='space-between'>
                      <FormLabel>Quantity</FormLabel>
                      <Box>
                        <NumberInput min={1} precision={0} width='165px'>
                          <NumberInputField />
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
                {(form: FormikProps<IInputValues>) => (
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
                            <NumberInputField />
                          </NumberInput>
                        </InputGroup>
                        {form.errors?.price 
                          ? (
                            <FormErrorMessage>
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
                type='submit'
              >
                Add Transaction
              </Button>
            </VStack>
          </Form>
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

  const [ transactions, setTransactions ] = useState()

  // --------------------
  // Add Transaction Form
  // --------------------

  // -- validation functions

  function validateDate(value: Date): string | undefined {
    return !value ? 'Required' : undefined
  }

  function validateQuantity(value: number): string | undefined {
    let error
    if (value === 0) {
      error = 'Required'
    }
    if (value < 0) {
      error = 'Must be positive'
    }
    return error
  }

  // -- component

  

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