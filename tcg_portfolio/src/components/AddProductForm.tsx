import { useContext, useEffect, useState, } from 'react'
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
  IProduct, ProductLanguage, ProductType, ProductSubtype, TCG, 
  TCGToProductType, 
  
  getProductSubtypes, isASCII,

  PostLatestPriceStatus, PostPriceStatus, PostProductStatus, 
  TPostLatestPriceReqBody, TPostPriceReqBody, TPostProductReqBody, 

  LATEST_PRICE_URL, PRICE_URL, PRODUCT_URL
} from 'common'
import { Form, Formik } from 'formik'
import { InputErrorWrapper } from './InputField'
import * as _ from 'lodash'
import { SideBarNavContext } from '../state/SideBarNavContext'
import { isHttpUrl } from '../utils/generic'
import { ISideBarNavContext, SideBarNav } from '../utils/SideBar'


// ==============
// main component
// ==============

export const AddProductForm = () => {


  // =========
  // constants
  // =========

  const IMAGE_URL_PLACEHOLDER = 'https://picsum.photos/'
  const LANGUAGE_SELECT_DEFAULT = ProductLanguage.English
  const PRODUCT_SUBTYPE_DEFAULT_PLACEHOLDER = 'Select Type first'
  const PRODUCT_SUBTYPE_EMPTY_PLACEHOLDER = 'No Subtypes'
  const PRODUCT_TYPE_PLACEHOLDER = 'Select TCG first'
  const TCG_SELECT_DEFAULT = 'Select TCG'


  // ======
  // states
  // ======

  // TCGPlayerID state
  const [ TCGPlayerIdState, setTCGPlayerIdState ] = useState<{
    tcgPlayerId: number | undefined,
    isInvalid?: boolean, 
    errorMessage?: string,
  }>({
    tcgPlayerId: undefined,
  })

  // Name state
  const [ nameState, setNameState ] = useState<{
    name: string,
    isInvalid?: boolean, 
    errorMessage?: string,
  }>({
    name: '',
  })

  // TCG state
  const [ TCGState, setTCGState ] = useState<{
    tcg: TCG | '',
    isInvalid?: boolean, 
    errorMessage?: string,
  }>({
    tcg: '',
  })

  // ProductType state
  const [ productTypeState, setProductTypeState ] = useState<{
    productType: ProductType | ''
    isDisabled: boolean,
    values: string[],
  }>({
    productType: '',
    isDisabled: true,
    values: [],
  })

  // ProductSubtype state
  const [ productSubtypeState, setProductSubtypeState ] = useState<{
    productSubtype: ProductSubtype | '',
    isDisabled: boolean,
    values: string[],
  }>({
    productSubtype: '',
    isDisabled: true,
    values: [],
  })

  // Release Date state
  const [ releaseDateState, setReleaseDateState ] = useState<{
    releaseDate: Date | undefined,
    isInvalid?: boolean, 
    errorMessage?: string,
  }>({
    releaseDate: undefined,
  })

  // Set Code state
  const [ setCodeState, setSetCodeState ] = useState<{
    setCode: string,
    isInvalid: boolean, 
    errorMessage?: string,
  }>({
    setCode: '',
    isInvalid: false,
  })

  // Language state
  const [ languageState, setLanguageState ] = useState<{
    language: ProductLanguage,
  }>({
    language: LANGUAGE_SELECT_DEFAULT,
  })

  // MSRP state
  const [ msrpState, setMsrpState ] = useState<{
    msrp: number | undefined,
    isInvalid?: boolean, 
    errorMessage?: string,
  }>({
    msrp: undefined
  })

  // Image URL state
  const [ imageUrlState, setImageURLState ] = useState<{
    imageUrl: string,
    isInvalid: boolean,
    errorMessage?: string,
  }>({
    imageUrl: '',
    isInvalid: false,
  })

  // load latest price loading state
  const [ isLoadingLatestPrice, setIsLoadingLatestPrice] = useState(false)

  // SideBar context
  const { sideBarNav } = useContext(SideBarNavContext) as ISideBarNavContext
  const isAddProductForm = sideBarNav === SideBarNav.ADD_PRODUCT

  // =========
  // functions
  // =========

  // ------------
  // form control
  // ------------

  /*
  DESC
    Update Product Type state based on the input, which is a TCG enum 
    or empty string
  INPUT
    input: TCG enum or empty string
  */
  
  function updateProductTypeInput(input: string): void {
    
    // default
    if (input.length === 0) {
      setProductTypeState({
        productType: '',
        isDisabled: true,
        values: []
      })

    // tcg
    } else {
      setProductTypeState({
        productType: TCGToProductType[input as TCG][0],
        isDisabled: false,
        values: TCGToProductType[input as TCG]
      })
    }
  }

  /*
  DESC
    Update Product Subtype state based on the input, which is a TCG enum 
    or empty string and a ProductType or empty string
  INPUT
    tcg_input: TCG enum or empty string
    product_input: ProductType enum or empty string
  */

  // update Product Subtype after Product Type is selected
  function updateProductSubypeInput(tcg_input: string, product_input: string): void {

    // empty tcg or product
    if (tcg_input.length === 0 || product_input.length === 0) {
      setProductSubtypeState({
        productSubtype: '',
        isDisabled: true,
        values: []
      })

    // tcg and product 
    } else {
      const productSubtypes = getProductSubtypes(
        tcg_input as TCG, 
        product_input as ProductType)
      
      // no product subtypes
      if (productSubtypes.length === 0) {
        setProductSubtypeState({
          productSubtype: '',
          isDisabled: true,
          values: []
        })

      // has product subtypes
      } else {
        setProductSubtypeState({
          productSubtype: productSubtypes[0],
          isDisabled: false,
          values: productSubtypes
        })
      }
    }
  }

  // -----------
  // form submit
  // -----------

  function handleFormOnSubmit(): void {

    // create POST body         
    let body: TPostProductReqBody = {
      formData: getPostFormData(),
    }

    // add imageUrl, if exists
    if (!imageUrlState.isInvalid) {
      body.imageUrl = imageUrlState.imageUrl
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

        // added with image
        if (resData.message === PostProductStatus.Added) {
          toast({
            title: 'Product Added with Image',
            description: `${PostProductStatus.Added}: ${resData.tcgplayerId}`,
            status: 'success',
            isClosable: true,
          })        

        // added without image
        } else if (resData.message === PostProductStatus.AddedWithoutImage) {
          toast({
            title: 'Product Added without Image',
            description: `${PostProductStatus.AddedWithoutImage}: ${resData.tcgplayerId}`,
            status: 'info',
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

  // validate TCGplayerID
  function validateTCGPlayerID(input: string): void {

    // empty state
    if (input.length === 0) {
      setTCGPlayerIdState({
        tcgPlayerId: undefined,
        isInvalid: true, 
        errorMessage: 'TCGPlayerID is required',
      })

    // TODO: check if TCGPlayer ID already exists

    // valid
    } else {
      setTCGPlayerIdState({ 
        tcgPlayerId: parseInt(input),
        isInvalid: false 
      })
    }
  }

  // validate Name
  function validateName(input: string): void {

    // empty state
    if (input.length === 0) {
      setNameState({
        name: '',
        isInvalid: true, 
        errorMessage: 'Name is required',
      })

    // non-ASCII characters
    } else if (!isASCII(input)) {
      setNameState({
        name: '',
        isInvalid: true, 
        errorMessage: 'Name must only contain ASCII characters',
      })

    // valid
    } else {
      setNameState({ 
        name: input,
        isInvalid: false 
      })
    }
  }

  // validate TCG
  function validateTCG(input: string): void {

    // default
    if (input.length === 0) {
      setTCGState({
        tcg: '',
        isInvalid: true, 
        errorMessage: 'TCG is required',
      })

    // unrecognized TCG
    } else if (!Object.values(TCG).includes(input as TCG)) {
      setTCGState({
        tcg: '',
        isInvalid: true, 
        errorMessage: 'Invalid TCG',
      })

    // valid
    } else {
      setTCGState({ 
        tcg: input as TCG,
        isInvalid: false 
      })
    }
  }

  // validate Release Date
  function validateReleaseDate(input: string): void {

    // default
    if (input.length === 0) {
      setReleaseDateState({
        releaseDate: undefined, 
        isInvalid: true, 
        errorMessage: 'Release Date is required',
      })

    // valid
    } else {
      setReleaseDateState({ 
        releaseDate: new Date(Date.parse(input)), 
        isInvalid: false 
      })
    }
  }  

  // validate Set Code
  function validateSetCode(input: string): void {

    // ASCII only
    if (input.length > 0 && !isASCII(input)) {
      setSetCodeState({
        setCode: '',
        isInvalid: true, 
        errorMessage: 'Set Code must only contain ASCII characters',
      })

    // valid
    } else {
      setSetCodeState({ 
        setCode: input,
        isInvalid: false 
      })
    }
  }

  // validate MSRP
  function validateMSRP(input: string): void {

    // default
    if (input.length === 0) {
      setMsrpState({
        msrp: undefined, 
        isInvalid: true, 
        errorMessage: 'MSRP is required',
      })

    // numeric format
    } else if (!_.isNumber(Number(input))) {
      setMsrpState({
        msrp: undefined, 
        isInvalid: true, 
        errorMessage: 'Input is not numeric',
      })
    
    // valid
    } else {
      setMsrpState({ 
        msrp: Number(input), 
        isInvalid: false 
      })
    }
  }  

  // validate Image URL
  function validateImageURL(input: string): void {

    // ASCII only
    if (input.length > 0 && !isASCII(input)) {
      setImageURLState({
        imageUrl: '',
        isInvalid: true, 
        errorMessage: 'Image URL must only contain ASCII characters',
      })

    // URL format
    } else if (input.length > 0 && !isHttpUrl(input)) {
      setImageURLState({
        imageUrl: '',
        isInvalid: true, 
        errorMessage: 'URL incorrectly formatted',
      })

    // valid
    } else {
      setImageURLState({ 
        imageUrl: input,
        isInvalid: false 
      })
    }
  }

  // -----------------
  // load latest price
  // -----------------

  function handleLoadLatestPriceOnClick(tcgplayerId: number) {

    // set loading state
    setIsLoadingLatestPrice(true)

    // create body
    const body: TPostLatestPriceReqBody = {
      tcgplayerId: tcgplayerId
    }

    // submit
    axios({
      method: 'post',
      url: LATEST_PRICE_URL,
      data: body,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    // success
    .then(res => {
      
      toast({
        title: 'Latest Price Loaded',
        description: `${PostLatestPriceStatus.Success}`,
        status: 'success',
        isClosable: true,
      })
    })

    // error
    .catch(res => {

      // TODO: type check
      const resData = res.data

      toast({
        title: 'Error Loading Latest Price',
        description: `${res.statusText}: ${resData}`,
        status: 'error',
        isClosable: true,
      })
    })

    // unset loading state
    setIsLoadingLatestPrice(false)
  }

  /*
  DESC
    Creates the body for the POST request to add a new Product
  RETURN
    A TPostFormData with the Product data
  */
  function getPostFormData(): IProduct {

    let data: IProduct = {
      tcgplayerId: TCGPlayerIdState.tcgPlayerId as number,
      name: nameState.name,
      tcg: TCGState.tcg as TCG,
      type: productTypeState.productType as ProductType,
      releaseDate: releaseDateState.releaseDate as Date,
      language: languageState.language,
      msrp: msrpState.msrp as number
    }
    if (productSubtypeState.productSubtype.length > 0) {
      data.subtype = productSubtypeState.productSubtype as ProductSubtype
    }
    if (setCodeState.setCode.length > 0) {
      data.setCode = setCodeState.setCode
    }

    return data
  }


  // =====
  // hooks
  // =====

  // handle TCG changes
  useEffect(() => {

    // update Product Type
    updateProductTypeInput(TCGState.tcg)

    // update Product Subtype
    updateProductSubypeInput(TCGState.tcg, productTypeState.productType)

  }, [TCGState.tcg])

  // handle Product Type changes
  useEffect(() => {

    // update Product Subtype
    updateProductSubypeInput(TCGState.tcg, productTypeState.productType)

  }, [productTypeState.productType])

  // Axios response toast
  const toast = useToast()


  // ==============
  // main component
  // ==============

  return (
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
            errorMessage={TCGPlayerIdState.errorMessage}
            isErrorDisplayed={TCGPlayerIdState.isInvalid && isAddProductForm}
          >
            <NumberInput
              isInvalid={TCGPlayerIdState.isInvalid || false}
              isRequired={true} 
              min={1}
              precision={0}
              onBlur={e => validateTCGPlayerID(e.target.value)}
              width='100%'
            >
              <NumberInputField />
            </NumberInput>
          </InputErrorWrapper>

          {/* Name */}
          <InputErrorWrapper 
            leftLabel='Name'
            errorMessage={nameState.errorMessage}
            isErrorDisplayed={nameState.isInvalid && isAddProductForm}          
          >
            <Input 
              isInvalid={nameState.isInvalid || false}
              isRequired={true}
              placeholder='Kaladesh'
              onBlur={e => validateName(e.target.value)}
            />
          </InputErrorWrapper>

          {/* TCG */}
          <InputErrorWrapper 
            leftLabel='TCG'
            errorMessage={TCGState.errorMessage}
            isErrorDisplayed={TCGState.isInvalid && isAddProductForm}
          >
            <Select
              value={TCGState.tcg.length === 0
                ? undefined
                : TCGState.tcg}
              isInvalid={TCGState.isInvalid || false}
              isRequired={true} 
              placeholder={TCG_SELECT_DEFAULT}
              onBlur={e => validateTCG(e.target.value)}
              onChange={e => setTCGState({
                tcg: e.target.value as TCG,
                isInvalid: TCGState.isInvalid,
                errorMessage: TCGState.errorMessage,
              })}
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
              value={productTypeState.productType.length === 0
                ? undefined
                : productTypeState.productType}
              isDisabled={productTypeState.isDisabled}
              isRequired={true} 
              placeholder={productTypeState.isDisabled 
                ? PRODUCT_TYPE_PLACEHOLDER
                : undefined}
                onChange={e => setProductTypeState({
                  productType: e.target.value as ProductType,
                  isDisabled: productTypeState.isDisabled,
                  values: productTypeState.values,
                })}            
            >      
              {productTypeState.values.map(value => {
                return (
                  <option key={value} value={value}>{value}</option>
                )
              })}
            </Select>        
          </InputErrorWrapper>

          {/* Product Subtype */}
          <InputErrorWrapper 
            leftLabel='Subtype'
          >
            <Select
              value={productSubtypeState.productSubtype.length === 0
                ? undefined
                : productSubtypeState.productSubtype}
              isDisabled={productSubtypeState.isDisabled}
              placeholder={productSubtypeState.isDisabled
                ? productTypeState.isDisabled 
                  ? PRODUCT_SUBTYPE_DEFAULT_PLACEHOLDER
                  : PRODUCT_SUBTYPE_EMPTY_PLACEHOLDER
                : undefined}
                onChange={e => setProductSubtypeState({
                  productSubtype: e.target.value as ProductSubtype,
                  isDisabled: productSubtypeState.isDisabled,
                  values: productSubtypeState.values,
                })}              
            >      
              {productSubtypeState.values.map(value => {
                return (
                  <option key={value} value={value}>{value}</option>
                )
              })}
            </Select>        
          </InputErrorWrapper>

          {/* Release Date */}
          <InputErrorWrapper 
            leftLabel='Release Date'
            errorMessage={releaseDateState.errorMessage}
            isErrorDisplayed={releaseDateState.isInvalid && isAddProductForm}
          >
            <Input
              type='date'
              isInvalid={releaseDateState.isInvalid || false}
              isRequired={true} 
              onBlur={e => validateReleaseDate(e.target.value)}
            />       
          </InputErrorWrapper>

          {/* Set Code */}
          <InputErrorWrapper 
            leftLabel='Set Code'
            errorMessage={setCodeState.errorMessage}
            isErrorDisplayed={setCodeState.isInvalid && isAddProductForm}
          >
            <Input 
              isInvalid={setCodeState.isInvalid}
              onBlur={e => validateSetCode(e.target.value)}
            />
          </InputErrorWrapper>

          {/* Product Language */}
          <InputErrorWrapper 
            leftLabel='Language'
          >
            <Select 
              value={languageState.language}
              onChange={e => setLanguageState({
                language: e.target.value as ProductLanguage
              })}
            >      
              {Object.values(ProductLanguage).map(value => {
                return (
                  <option key={value} value={value}>{value}</option>
                )
              })}
            </Select>        
          </InputErrorWrapper>

          {/* MSRP */}
          <InputErrorWrapper 
            leftLabel='MSRP'
            errorMessage={msrpState.errorMessage}
            isErrorDisplayed={msrpState.isInvalid && isAddProductForm}
          >
            <NumberInput
              isInvalid={msrpState.isInvalid}
              min={1}
              precision={2}
              width='100%'
              onBlur={e => validateMSRP(e.target.value)}
            >
              <NumberInputField />
            </NumberInput>
          </InputErrorWrapper>

          {/* Image URL */}
          <InputErrorWrapper 
            leftLabel='Image URL'
            errorMessage={imageUrlState.errorMessage}
            isErrorDisplayed={imageUrlState.isInvalid && isAddProductForm}
          >
            <Input
              placeholder={IMAGE_URL_PLACEHOLDER}
              isInvalid={imageUrlState.isInvalid}
              onBlur={e => validateImageURL(e.target.value)}
            />
          </InputErrorWrapper>

          {/* Image */}
          { imageUrlState.imageUrl.length > 0 && !imageUrlState.isInvalid
            ? (
              <Image 
                boxSize='200px'
                src={imageUrlState.imageUrl}
              />
            ) : undefined
          }

        </VStack>
        
        <VStack spacing={4}>
          <Button
            colorScheme='teal'
            type='submit'
            isDisabled={
              (TCGPlayerIdState.isInvalid ?? true)
              || (nameState.isInvalid ?? true)
              || (TCGState.isInvalid ?? true)
              || (releaseDateState.isInvalid ?? true)
              || (setCodeState.isInvalid ?? true)
              || (imageUrlState.isInvalid ?? true)
            }
          >
            Submit
          </Button>
          <Button
            colorScheme='purple'
            onClick={() => handleLoadLatestPriceOnClick(
              Number(TCGPlayerIdState.tcgPlayerId)
            )}
            isDisabled={TCGPlayerIdState.isInvalid ?? true}
            isLoading={isLoadingLatestPrice}
          >
            Load Latest Price
          </Button>        
        </VStack>
      </Form>
    </Formik>
  )
}