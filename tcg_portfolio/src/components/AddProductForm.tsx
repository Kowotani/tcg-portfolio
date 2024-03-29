import { useContext } from 'react'
import axios from 'axios'
import { 
  Image,
  Input,
  Link,
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
  assert, formatAsISO, getUTCDateFromLocalDate
} from 'common'
import { Form, Formik } from 'formik'
import { InputErrorWrapper } from './InputField'
import { PrimaryButton } from './Layout'
import * as _ from 'lodash'
import { SideBarNavContext } from '../state/SideBarNavContext'
import { 
  // interfaces
  IAddProductFormDataState,

  // validators
  genEmptyState, genEmptyStringValuesState, genValidState, 
  genValidStringValuesState,

  genImageUrlState, genMsrpState, genNameState, genProductSubtypeState,
  genProductTypeState, genReleaseDateState, genSetCodeState, 
  genTcgPlayerIdState, genTcgState,
} from '../utils/form'
import { ISideBarNavContext, SideBarNav } from '../utils/SideBar'


// ==============
// main component
// ==============

type TAddProductFormProps = {
  formData: IAddProductFormDataState,
  markTCProductAsValid: (tcgplayerId: number) => void,
  setFormData: (formData: IAddProductFormDataState) => void
}
export const AddProductForm = ({
  formData, 
  markTCProductAsValid, 
  setFormData
}: TAddProductFormProps) => {

  // =========
  // constants
  // =========

  const IMAGE_URL_PLACEHOLDER = 'https://picsum.photos/'
  const PRODUCT_SUBTYPE_DEFAULT_PLACEHOLDER = 'Select Type first'
  const PRODUCT_SUBTYPE_EMPTY_PLACEHOLDER = 'No Subtypes'
  const PRODUCT_TYPE_PLACEHOLDER = 'Select TCG first'
  const TCG_SELECT_DEFAULT = 'Select TCG'
  const TCGPLAYER_URL = 'https://www.tcgplayer.com/product'


  // =====
  // state
  // =====

  // load latest price loading state
  // const [ isLoadingLatestPrice, setIsLoadingLatestPrice] = useState(false)

  // SideBar context
  const { sideBarNav } = useContext(SideBarNavContext) as ISideBarNavContext
  const isProductManager = sideBarNav === SideBarNav.PRODUCT_MANAGER


  // =========
  // functions
  // =========

  // -------
  // helpers
  // -------

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
        releaseDate: getUTCDateFromLocalDate(
          formData.releaseDate.value as Date),
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
            duration: 2000,
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
            duration: 2000,
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

        // -- mark the TCProduct as valid
        markTCProductAsValid(body.formData.tcgplayerId)

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
      const response = res.response
                
      toast({
        title: 'Error Adding Product',
        description: `${response.statusText}: ${response.data.message}`,
        status: 'error',
        isClosable: true,
      })          
    })
  }


  // =====
  // hooks
  // =====

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
            errorMessage={formData.tcgplayerId.errorMessage}
            isErrorDisplayed={formData.tcgplayerId.isInvalid && isProductManager}
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
            isErrorDisplayed={formData.name.isInvalid && isProductManager}          
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
            isErrorDisplayed={formData.tcg.isInvalid && isProductManager}
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
            isErrorDisplayed={formData.releaseDate.isInvalid && isProductManager}
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
            isErrorDisplayed={formData.setCode.isInvalid && isProductManager}
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
            isErrorDisplayed={formData.msrp.isInvalid && isProductManager}
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
            isErrorDisplayed={formData.imageUrl.isInvalid && isProductManager}
          >
            <Input
              value={formData.imageUrl.value}
              placeholder={IMAGE_URL_PLACEHOLDER}
              isInvalid={formData.imageUrl.isInvalid}
              onChange={e => handleImageUrlOnChange(e.target.value)}
            />
          </InputErrorWrapper>

          {/* TCGPlayer URL */}
          <Link 
            color='blue.500'
            href={`${TCGPLAYER_URL}/${formData.tcgplayerId.value}`}
            isExternal
          >
            {`${TCGPLAYER_URL}/${formData.tcgplayerId.value}`}
          </Link>

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
          <PrimaryButton
            isDisabled={!isFormSubmitEnabled()}
            label='Submit'
            type='submit'
          />
        </VStack>
      </Form>
    </Formik>
  )
}