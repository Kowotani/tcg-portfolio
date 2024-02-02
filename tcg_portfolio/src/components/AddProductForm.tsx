import { useContext, useRef, useState } from 'react'
import axios from 'axios'
import { 
  Button,
  Image,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  useToast,
  VStack, 
} from '@chakra-ui/react'
import {
  // data models 
  IProduct, ProductLanguage, ProductType, ProductSubtype, TCG, 
  TCGToProductType, 
  
  // api
  PostPriceStatus, PostProductStatus, TPostPriceReqBody, TPostProductReqBody, 

  PRICE_URL, PRODUCT_URL,

  // generic
  assert, formatAsISO, getProductSubtypes, isASCII
} from 'common'
import { Form, Formik } from 'formik'
import { InputErrorWrapper } from './InputField'
import { SectionHeader } from './Layout'
import * as _ from 'lodash'
import { SideBarNavContext } from '../state/SideBarNavContext'
import { TCProductCatalogue } from './TCProductCatalogue'
import { getProductImageUrl, isHttpUrl } from '../utils/generic'
import { ISideBarNavContext, SideBarNav } from '../utils/SideBar'


// ==========
// interfaces
// ==========

interface IBaseState {
  errorMessage?: string
  isInvalid?: boolean, 
}

interface IFormValueState<Type> extends IBaseState {
  value?: Type
}

interface IFormValueWithStringValuesState<Type> extends IFormValueState<Type> {
  stringValues: string[]
}

interface IFormDataState {
  imageUrl: IFormValueState<string>,
  language: IFormValueState<ProductLanguage>,
  msrp: IFormValueState<number>,
  name: IFormValueState<string>,
  releaseDate: IFormValueState<Date>,
  setCode: IFormValueState<string>,
  subtype: IFormValueWithStringValuesState<ProductSubtype>,
  tcg: IFormValueState<TCG>,
  tcgplayerId: IFormValueState<number>,
  type: IFormValueWithStringValuesState<ProductType>,
}


// ==============
// main component
// ==============

export const AddProductForm = () => {


  // =========
  // constants
  // =========

  const IMAGE_URL_PLACEHOLDER = 'https://picsum.photos/'
  const PRODUCT_SUBTYPE_DEFAULT_PLACEHOLDER = 'Select Type first'
  const PRODUCT_SUBTYPE_EMPTY_PLACEHOLDER = 'No Subtypes'
  const PRODUCT_TYPE_PLACEHOLDER = 'Select TCG first'
  const TCG_SELECT_DEFAULT = 'Select TCG'


  // =====
  // state
  // =====

  const [ formData, setFormData ] = useState<IFormDataState>({
    imageUrl: { value: undefined },
    language: { value: ProductLanguage.English},
    msrp: { value: undefined },
    name: { value: undefined },
    releaseDate: { value: undefined },
    setCode: { value: undefined },
    subtype: { stringValues: [], value: undefined },
    tcg: { value: undefined },
    tcgplayerId: { value: undefined },
    type: { stringValues: [], value: undefined }
  })

  // load latest price loading state
  // const [ isLoadingLatestPrice, setIsLoadingLatestPrice] = useState(false)

  // SideBar context
  const { sideBarNav } = useContext(SideBarNavContext) as ISideBarNavContext
  const isAddProductForm = sideBarNav === SideBarNav.ADD_PRODUCT


  // =========
  // functions
  // =========

  // -------
  // helpers
  // -------

  /*
  DESC
    Helper to generate an IFormValueState for various empty states during
    form validation
  */
  function genEmptyState<Type>(): IFormValueState<Type> {
    return {
      isInvalid: undefined,
      value: undefined
    } as IFormValueState<Type>
  }

  /*
  DESC
    Helper to generate an IFormValueWithStringValuesState for various 
    empty states during form validation
  */
  function genEmptyStringValuesState<Type>(
  ): IFormValueWithStringValuesState<Type> {
    return {
      isInvalid: undefined,
      stringValues: [],
      value: undefined
    } as IFormValueWithStringValuesState<Type>
  }

  /*
  DESC
    Helper to generate an IFormValueState for various error states during
    form validation
  INPUT
    error: The error message for the error state
  */
  function genErrorState<Type>(errorMessage: string): IFormValueState<Type> {
    return {
      errorMessage: errorMessage,
      isInvalid: true,
      value: undefined
    } as IFormValueState<Type>
  }

  /*
  DESC
    Helper to generate an IFormValueState for various valid states during
    form validation
  INPUT
    value: The valid value to set
  */
  function genValidState<Type>(value: Type): IFormValueState<Type> {
    return {
      isInvalid: false,
      value: value
    } as IFormValueState<Type>
  }

  /*
  DESC
    Helper to generate an IFormValueWithStringValuesState for various 
    valid states during form validation
  INPUT
    value: The valid value to set
    stringValues: The valid string values to set
  */
  function genValidStringValuesState<Type>(
    value: Type,
    stringValues: string[]
  ): IFormValueWithStringValuesState<Type> {
    return {
      isInvalid: false,
      stringValues: stringValues,
      value: value
    } as IFormValueWithStringValuesState<Type>
  }

  /*
  DESC
    Returns whether or not the form submit button should be enabled
  RETURN
    TRUE if the form submit button should be enabled, FALSE otherwise
  */
  function isFormSubmitEnabled(): boolean {
    return _.every([

      // required
      !(formData.msrp.isInvalid ?? true),
      !(formData.name.isInvalid ?? true),
      !(formData.releaseDate.isInvalid ?? true),
      !(formData.tcg.isInvalid ?? true),
      !(formData.tcgplayerId.isInvalid ?? true),
      !(formData.type.isInvalid ?? true),

      //optional
      !(formData.setCode.isInvalid ?? false),
      !(formData.subtype.isInvalid ?? false)
    ], Boolean)
  }

  // -------------
  // form handlers
  // -------------

  function handleImageUrlOnChange(value: string): void {
    setFormData({
      ...formData,
      imageUrl: genImageUrlState(value)
    })
  }

  function handleMsrpOnChange(value: string): void {
    setFormData({
      ...formData,
      msrp: genMsrpState(value)
    })
  }

  function handleNameOnChange(value: string): void {
    setFormData({
      ...formData,
      name: genNameState(value)
    })
  }

  function handleReleaseDateOnChange(value: string): void {
    setFormData({
      ...formData,
      releaseDate: genReleaseDateState(value)
    })
  }

  function handleProductSubtypeOnChange(value: string): void {

    // validate input value
    assert(Object.values(ProductSubtype).includes(value as ProductSubtype),
      'Input value is not a ProductSubtype')
    const subtype = value as ProductSubtype
    const subtypes = formData.subtype.stringValues

    setFormData({
      ...formData,
      subtype: genValidStringValuesState<ProductSubtype>(subtype, subtypes)
    })
  }

  function handleProductTypeOnChange(value: string): void {
  
    // validate input value
    assert(Object.values(ProductType).includes(value as ProductType),
      'Input value is not a ProductType')  
    const type = value as ProductType

    // get TCG
    const tcg = formData.tcg.value
    assert(tcg, 'TCG is undefined')

    setFormData({
      ...formData,
      type: genProductTypeState(tcg),
      subtype: genProductSubtypeState(tcg, type)
    })
  }

  function handleSetCodeOnChange(value: string): void {
    setFormData({
      ...formData,
      setCode: genSetCodeState(value)
    })
  }

  function handleTcgOnChange(value: string): void {

    // validate input value
    const tcgState = genTcgState(value)

    // invalid TCG
    if (tcgState.isInvalid) {

      setFormData({
        ...formData,
        tcg: genEmptyState<TCG>(),
        type: genEmptyStringValuesState<ProductType>(),
        subtype: genEmptyStringValuesState<ProductSubtype>()
      })

    // valid TCG
    } else {

      const tcg = tcgState.value
      assert(tcg, 'TCG is undefined in valid TCG state')

      // get ProductTypes
      const types = TCGToProductType[tcg]
      const defaultType = _.head(types)
      assert(defaultType, 'defaultType is undefined in valid TCG state')

      setFormData({
        ...formData,
        tcg: tcgState,
        type: genProductTypeState(tcg),
        subtype: genProductSubtypeState(tcg, defaultType)
      })
    }
  }

  function handleTcgPlayerIdOnChange(value: string): void {
    setFormData({
      ...formData,
      tcgplayerId: genTcgPlayerIdState(value)
    })
  }

  // -------------
  // form populate
  // -------------

  /*
  DESC
    Handles the TCProduct card onClick event
  INPUT
    product: An IProduct[]
  */
  function handleTCProductCardOnClick(product: IProduct): void {
    setFormDataFromProduct(product)
    submitButtonRef.current?.scrollIntoView({behavior: 'smooth'})
  }

  /*
  DESC
    Sets the form data to match that of the input IProduct
  INPUT
    product: The IProduct whose data will be set in the form
  */
  function setFormDataFromProduct(product: IProduct): void {

    // image URL
    const imageUrl = getProductImageUrl(product.tcgplayerId, product.type, 
      200, product.subtype)

    // ProductType
    const typeState = genValidStringValuesState<ProductType>(
      product.type, TCGToProductType[product.tcg])

    // ProductSubtype
    const subtypeState = product.subtype
      ? genValidStringValuesState<ProductSubtype>(
          product.subtype, getProductSubtypes(product.tcg, product.type))
      : genEmptyStringValuesState<ProductSubtype>()

    // Set Code
    const setCodeState = product.setCode 
      ? genValidState<string>(product.setCode)
      : genEmptyState<string>()

    setFormData({
      imageUrl: genValidState<string>(imageUrl),
      language: genValidState<ProductLanguage>(ProductLanguage.English),
      msrp: genValidState<number>(product.msrp),
      name: genValidState<string>(product.name),
      releaseDate: genValidState<Date>(product.releaseDate),
      setCode: setCodeState,
      subtype: subtypeState,
      tcg: genValidState<TCG>(product.tcg),
      tcgplayerId: genValidState<number>(product.tcgplayerId),
      type: typeState
    })   
  }

  // -----------
  // form submit
  // -----------

  /*
  DESC
    Creates the body for the POST request to add a new Product
  RETURN
    A TPostFormData with the Product data
  */
    function getPostFormData(): IProduct {
      let data: IProduct = {
        tcgplayerId: formData.tcgplayerId.value as number,
        name: formData.name.value as string,
        tcg: formData.tcg.value as TCG,
        type: formData.type.value as ProductType,
        releaseDate: formData.releaseDate.value as Date,
        language: formData.language.value as ProductLanguage,
        msrp: formData.msrp.value as number
      }
      if (formData.subtype.value) 
        data.subtype = formData.subtype.value
      if (formData.setCode.value) 
        data.setCode = formData.setCode.value
  
      return data
    }

  /*
  DESC
    Handles the form submission
  */
  function handleFormOnSubmit(): void {

    // create POST body         
    let body: TPostProductReqBody = {
      formData: getPostFormData(),
    }

    // submit
    axios({
      method: 'post',
      url: PRODUCT_URL,
      data: body,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    // success
    .then(res => {

      // TODO: type check
      const resData = res.data

      // product was added
      if (res.status === 201) {

        // added (without image, as intended)
        if (resData.message === PostProductStatus.Added) {
          toast({
            title: 'Product Added',
            description: `${PostProductStatus.Added}: ${resData.tcgplayerId}`,
            status: 'success',
            isClosable: true,
          })        
        }

        // -- insert MSRP into Prices

        // create POST body
        const priceBody: TPostPriceReqBody = {
          tcgplayerId: body.formData.tcgplayerId,
          priceDate: body.formData.releaseDate,
          marketPrice: body.formData.msrp
        }

        // submit
        axios({
          method: 'post',
          url: PRICE_URL,
          data: priceBody,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        // success
        .then(res => {

          // TODO: type check
          const resData = res.data.data
          
          toast({
            title: 'MSRP Price Loaded',
            description: `${PostPriceStatus.Success}: ${resData.prices.marketPrice}`,
            status: 'success',
            isClosable: true,
          })
        })

        // error
        .catch(res => {

          // TODO: type check
          const resData = res.data

          toast({
            title: 'Error Loading MSRP',
            description: `${res.statusText}: ${resData}`,
            status: 'error',
            isClosable: true,
          })
        })

      // product already exists
      } else if (res.status === 202) {
        toast({
          title: 'Product Already Exists',
          description: `${PostProductStatus.AlreadyExists}: ${resData.tcgplayerId}`,
          status: 'warning',
          isClosable: true,
        })  
      }

    })
    // error
    .catch(res => {

      // TODO: type check
      const resData = res.data
                
      toast({
        title: 'Error Adding Product',
        description: `${res.statusText}: ${resData}`,
        status: 'error',
        isClosable: true,
      })          
    })
  }

  // ---------------
  // form validation
  // ---------------

  // validate Image URL
  function genImageUrlState(input: string): IFormValueState<string> {
    return (
      // non-ASCII
      input.length && !isASCII(input) 
        ? genErrorState<string>('Image URL must only contain ASCII characters')

      // non-URL format
      : !isHttpUrl(input)
        ? genErrorState<string>('Image URL is not a valid URL format')
      
      // valid
      : genValidState<string>(input)
    )
  }

  // validate MSRP
  function genMsrpState(input: string): IFormValueState<number> {
    return (
      // empty
      input.length === 0 
        ? genErrorState<number>('MSRP is required')

      // numeric format
      : !_.isNumber(Number(input))
        ? genErrorState<number>('MSRP is not numeric')

      // valid
      : genValidState<number>(Number(input))
    )
  }  

  // validate Name
  function genNameState(input: string): IFormValueState<string> {
    return ( 
      // empty
      input.length === 0 
        ? genErrorState<string>('Name is required')

      // non-ASCII
      : !isASCII(input) 
        ? genErrorState<string>('Name must only contain ASCII characters')

      // valid
      : genValidState<string>(input)
    )
  }

  // ProductType state from TCG
  function genProductTypeState(
    tcg: TCG
  ): IFormValueWithStringValuesState<ProductType> {
    const types = TCGToProductType[tcg]
    const defaultType = _.head(types)

    assert(defaultType, `defaultType is undefined for valid TCG: ${tcg}`)
    return genValidStringValuesState<ProductType>(defaultType, types)    
  }

  // ProductSubtype state from TCG, ProductType
  function genProductSubtypeState(
    tcg: TCG, 
    type: ProductType
  ): IFormValueWithStringValuesState<ProductSubtype> {
    const subtypes = getProductSubtypes(tcg, type)
    const defaultSubtype = _.head(subtypes)
    
    return defaultSubtype
      ? genValidStringValuesState<ProductSubtype>(defaultSubtype, subtypes)
      : genEmptyStringValuesState<ProductSubtype>()   
  }

  // validate Release Date
  function genReleaseDateState(input: string): IFormValueState<Date> {
    return (
      // empty
      input.length === 0
        ? genErrorState<Date>('Release Date is required')

      // valid
      : genValidState<Date>(new Date(Date.parse(input)))
    )
  }  

  // validate Set Code
  function genSetCodeState(input: string): IFormValueState<string> {
    return (
      // non-ASCII
      input.length && !isASCII(input) 
        ? genErrorState<string>('Set Code must only contain ASCII characters')

      // valid
      : genValidState<string>(input)
    )
  }

  // validate TCG
  function genTcgState(input: string): IFormValueState<TCG> {
    return (
      // empty
      input.length === 0
        ? genErrorState<TCG>('TCG is required')

      // unrecognized TCG
      : (!Object.values(TCG).includes(input as TCG)) 
        ? genErrorState<TCG>('Unrecognized TCG')

      // valid
      : genValidState<TCG>(input as TCG)
    )
  }

  // validate TCGPlayerID
  function genTcgPlayerIdState(input: string): IFormValueState<number>  {
    // TODO: check if TCGPlayer ID already exists
    return (
      // empty
      input.length === 0 
        ? genErrorState<number>('TCGPlayerID is required')

      // valid
      : genValidState<number>(parseInt(input))
    )
  }

  // -----------------
  // load latest price
  // -----------------

  // function handleLoadLatestPriceOnClick(tcgplayerId: number) {

  //   // set loading state
  //   setIsLoadingLatestPrice(true)

  //   // create body
  //   const body: TPostLatestPriceReqBody = {
  //     tcgplayerId: tcgplayerId
  //   }

  //   // submit
  //   axios({
  //     method: 'post',
  //     url: LATEST_PRICE_URL,
  //     data: body,
  //     headers: {
  //       'Content-Type': 'multipart/form-data',
  //     },
  //   })

  //   // success
  //   .then(res => {
      
  //     toast({
  //       title: 'Latest Price Loaded',
  //       description: `${PostLatestPriceStatus.Success}`,
  //       status: 'success',
  //       isClosable: true,
  //     })
  //   })

  //   // error
  //   .catch(res => {

  //     // TODO: type check
  //     const resData = res.data

  //     toast({
  //       title: 'Error Loading Latest Price',
  //       description: `${res.statusText}: ${resData}`,
  //       status: 'error',
  //       isClosable: true,
  //     })
  //   })

  //   // unset loading state
  //   setIsLoadingLatestPrice(false)
  // }


  // =====
  // hooks
  // =====

  // Axios response toast
  const toast = useToast()

  const submitButtonRef = useRef<HTMLButtonElement>(null)


  // ==============
  // main component
  // ==============

  return (

    <>
      {/* TC Products */}
      <SectionHeader header='Products to Validate' />
      
      <TCProductCatalogue onProductCardClick={handleTCProductCardOnClick}/>

      {/* Add Product */}
      <SectionHeader header='Add Product' />

      <Formik
        initialValues={{}}
        onSubmit={handleFormOnSubmit}
      >
        <Form>
          <VStack 
            align-items='stretch'
            display='flex'
            flex-direction='column'
            spacing={8}
            paddingBottom={8}
          >
            {/* TCGPlayer ID */}
            <InputErrorWrapper 
              leftLabel='TCGPlayer ID'
              errorMessage={formData.tcgplayerId.errorMessage}
              isErrorDisplayed={formData.tcgplayerId.isInvalid && isAddProductForm}
            >
              <NumberInput
                value={formData.tcgplayerId.value}
                isInvalid={formData.tcgplayerId.isInvalid}
                isRequired={true} 
                min={1}
                precision={0}
                onChange={valueAsString => handleTcgPlayerIdOnChange(valueAsString)}
                width='100%'
              >
                <NumberInputField />
              </NumberInput>
            </InputErrorWrapper>

            {/* Name */}
            <InputErrorWrapper 
              leftLabel='Name'
              errorMessage={formData.name.errorMessage}
              isErrorDisplayed={formData.name.isInvalid && isAddProductForm}          
            >
              <Input 
                value={formData.name.value}
                isInvalid={formData.name.isInvalid}
                isRequired={true}
                placeholder='Kaladesh'
                onChange={e => handleNameOnChange(e.target.value)}
              />
            </InputErrorWrapper>

            {/* TCG */}
            <InputErrorWrapper 
              leftLabel='TCG'
              errorMessage={formData.tcg.errorMessage}
              isErrorDisplayed={formData.tcg.isInvalid && isAddProductForm}
            >
              <Select
                value={formData.tcg.value}
                isInvalid={formData.tcg.isInvalid}
                isRequired={true} 
                placeholder={TCG_SELECT_DEFAULT}
                onChange={e => handleTcgOnChange(e.target.value)}
              >      
                {Object.values(TCG).map(value => {
                  return (
                    <option key={value} value={value}>{value}</option>
                  )
                })}
              </Select>        
            </InputErrorWrapper>

            {/* Product Type */}
            <InputErrorWrapper 
              leftLabel='Type'
            >
              <Select
                value={formData.type.value}
                isDisabled={formData.type.value === undefined}
                isRequired={true} 
                placeholder={formData.type.value === undefined 
                  ? PRODUCT_TYPE_PLACEHOLDER
                  : undefined}
                onChange={e => handleProductTypeOnChange(e.target.value)}
              >      
                {formData.type.stringValues.map(value => {
                  return (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  )
                })}
              </Select>        
            </InputErrorWrapper>

            {/* Product Subtype */}
            <InputErrorWrapper 
              leftLabel='Subtype'
            >
              <Select
                value={formData.subtype.value}
                isDisabled={formData.subtype.value === undefined}
                placeholder={formData.subtype.value === undefined
                  ? formData.type.value === undefined 
                    ? PRODUCT_SUBTYPE_DEFAULT_PLACEHOLDER
                    : PRODUCT_SUBTYPE_EMPTY_PLACEHOLDER
                  : undefined}
                  onChange={e => handleProductSubtypeOnChange(e.target.value)}              
              >      
                {formData.subtype.stringValues.map(value => {
                  return (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  )
                })}
              </Select>        
            </InputErrorWrapper>

            {/* Release Date */}
            <InputErrorWrapper 
              leftLabel='Release Date'
              errorMessage={formData.releaseDate.errorMessage}
              isErrorDisplayed={formData.releaseDate.isInvalid && isAddProductForm}
            >
              <Input
                value={formData.releaseDate.value 
                  ? formatAsISO(formData.releaseDate.value)
                  : undefined}
                type='date'
                isInvalid={formData.releaseDate.isInvalid}
                isRequired={true} 
                onChange={e => handleReleaseDateOnChange(e.target.value)}
              />       
            </InputErrorWrapper>

            {/* Set Code */}
            <InputErrorWrapper 
              leftLabel='Set Code'
              errorMessage={formData.setCode.errorMessage}
              isErrorDisplayed={formData.setCode.isInvalid && isAddProductForm}
            >
              <Input 
                value={formData.setCode.value}
                isInvalid={formData.setCode.isInvalid}
                onChange={e => handleSetCodeOnChange(e.target.value)}
              />
            </InputErrorWrapper>

            {/* Product Language */}
            <InputErrorWrapper 
              leftLabel='Language'
            >
              <Select 
                value={formData.language.value}
                onChange={e => setFormData({
                  ...formData,
                  language: genValidState<ProductLanguage>(
                    e.target.value as ProductLanguage)
                })}
              >      
                {Object.values(ProductLanguage).map(value => {
                  return (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  )
                })}
              </Select>        
            </InputErrorWrapper>

            {/* MSRP */}
            <InputErrorWrapper 
              leftLabel='MSRP'
              errorMessage={formData.msrp.errorMessage}
              isErrorDisplayed={formData.msrp.isInvalid && isAddProductForm}
            >
              <NumberInput
                value={formData.msrp.value}
                isInvalid={formData.msrp.isInvalid}
                min={1}
                precision={2}
                width='100%'
                onChange={valueAsString => handleMsrpOnChange(valueAsString)}
              >
                <NumberInputField />
              </NumberInput>
            </InputErrorWrapper>

            {/* Image URL */}
            <InputErrorWrapper 
              leftLabel='Image URL'
              errorMessage={formData.imageUrl.errorMessage}
              isErrorDisplayed={formData.imageUrl.isInvalid && isAddProductForm}
            >
              <Input
                value={formData.imageUrl.value}
                placeholder={IMAGE_URL_PLACEHOLDER}
                isInvalid={formData.imageUrl.isInvalid}
                onChange={e => handleImageUrlOnChange(e.target.value)}
              />
            </InputErrorWrapper>

            {/* Image */}
            {formData.imageUrl.value && !formData.imageUrl.isInvalid
              ? (
                <Image 
                  boxSize='200px'
                  src={formData.imageUrl.value}
                />
              ) : undefined
            }

          </VStack>
          
          <VStack spacing={4}>
            <Button
              colorScheme='teal'
              ref={submitButtonRef}
              type='submit'
              isDisabled={!isFormSubmitEnabled()}
            >
              Submit
            </Button>
            {/*<Button
              colorScheme='purple'
              onClick={() => handleLoadLatestPriceOnClick(
                Number(formData.tcgplayerId.value))}
              isDisabled={formData.tcgplayerId.isInvalid ?? true}
              isLoading={isLoadingLatestPrice}
            >
              Load Latest Price
            </Button>*/}
          </VStack>
        </Form>
      </Formik>
    </>
  )
}