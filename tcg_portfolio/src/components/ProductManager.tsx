import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Button, Flex, useToast } from '@chakra-ui/react'
import { 
  // data models
  IProduct, ITCProduct, ParsingStatus, ProductLanguage, ProductSubtype, 
  ProductType, TCG,

  // api
  TCPRODUCT_URL, UNVALIDATED_TCPRODUCTS_URL, 

  PutTCProductStatus, TPutTCProductReqBody, TResBody, 

  // generic
  getProductSubtypes, getUTCDateFromLocalDate, TCGToProductType
} from 'common'
import { AddProductForm } from './AddProductForm'
import { SectionHeader } from './Layout'
import { TCProductCatalogue } from './TCProductCatalogue'
import { parseUnvalidatedTCProductsEndpointResponse } from '../utils/api'
import { 
  // interfaces
  IAddProductFormDataState, 

  // validators
  genEmptyState, genEmptyStringValuesState, genErrorState, genValidState, 
  genValidStringValuesState
} from '../utils/form'
import { getProductImageUrl } from '../utils/generic'
import { sortFnProductSearchResults } from '../utils/Product'


export const ProductManager = () => {

  // =====
  // state
  // =====

  const [ TCProduct, setTCProduct ] = useState({} as ITCProduct)
  const [ TCProducts, setTCProducts ] = useState([] as ITCProduct[])
  const [ addProductFormData, setAddProductFormData ] = 
    useState<IAddProductFormDataState>({
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


  // =========
  // functions
  // =========

  // ----
  // form
  // ----

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

    // Release Date for SL Products
    const releaseDateState = product.type === ProductType.SecretLair
      ? addProductFormData.releaseDate.value === undefined
        ? genErrorState<Date>('Secret Lair')
        : addProductFormData.releaseDate
      : genValidState<Date>(product.releaseDate)

    setAddProductFormData({
      imageUrl: genValidState<string>(imageUrl),
      language: genValidState<ProductLanguage>(ProductLanguage.English),
      msrp: genValidState<number>(product.msrp),
      name: genValidState<string>(product.name),
      releaseDate: releaseDateState,
      setCode: setCodeState,
      subtype: subtypeState,
      tcg: genValidState<TCG>(product.tcg),
      tcgplayerId: genValidState<number>(product.tcgplayerId),
      type: typeState
    })   
  }

  // -------------------
  // tcproduct catalogue
  // -------------------

  /*
  DESC
    Handles Ignore TCProduct button onClick event
  */
  function handleIgnoreTCProductOnClick(): void {
    updateTCProductStatus(ParsingStatus.Ignored, 'TCProduct Ignored')
  }

  /*
  DESC
    Handles the TCProduct card onClick event
  INPUT
    product: An ITCProduct
  */
  function handleTCProductCardOnClick(product: ITCProduct): void {
    setFormDataFromProduct(product)
    setTCProduct(product)
    bottomAnchorRef.current?.scrollIntoView({behavior: 'smooth'})
  }

  /*
  DESC
    Handles marking the TCProduct as valid given the tcgplayerId
  INPUT
    tcgplayerId: The TCGPlayerID of the TCProduct
  */
  function handleMarkTCProductAsValid(tcgplayerId: number): void {

    // check if tcgplayerID corresponds to a TCProduct
    if (TCProducts.filter((tcproduct: ITCProduct) => {
      return tcproduct.tcgplayerId === tcgplayerId
    }).length) {

      // update TCProduct
      updateTCProductStatus(ParsingStatus.Validated, 'TCProduct Validated')
    }
  }

  /*
  DESC
    Removes the input TCProduct from the catalogue. To be used after the 
    TCProduct has been validated or ignored
  INPUT
    product: The ITCProduct to remove
  */
  function removeTCProductFromCatalogue(product: ITCProduct): void {
    const newTCProducts = TCProducts.filter((tcproduct: ITCProduct) => {
      return tcproduct.tcgplayerId !== product.tcgplayerId
    })
    setTCProducts(newTCProducts)
    setTCProduct({} as ITCProduct)
  }

  /*
  DESC
    Removes the input TCProduct from the catalogue. To be used after the 
    TCProduct has been validated or ignored
  INPUT
    status: The new ParsingStatus to set
    toastTitle: The title for the toast popup
  */
  function updateTCProductStatus(
    status: ParsingStatus, 
    toastTitle: string
  ): void {

    // create new TCProduct
    const newTCProduct = {
      ...TCProduct,
      releaseDate: getUTCDateFromLocalDate(TCProduct.releaseDate),
      status: status
    }

    const body: TPutTCProductReqBody = {
      existingTCProduct: TCProduct,
      newTCProduct: newTCProduct
    }

    // call endpoint
    axios({
      method: 'put',
      url: TCPRODUCT_URL,
      data: body,
      headers: {
        'Content-Type': 'multipart/form-data',
      }      
    })
    .then(res => {
      const data: TResBody = res.data

      // success
      if (data.message === PutTCProductStatus.Success) {

        toast({
          title: toastTitle,
          description: `${PutTCProductStatus.Success}: ${TCProduct.tcgplayerId}`,
          duration: 2000,
          status: 'success',
          isClosable: true,
        })   

        // update TCProductCatalogue
        removeTCProductFromCatalogue(TCProduct)    

        topAnchorRef.current?.scrollIntoView({behavior: 'smooth'})

      // error
      } else {
        console.log('Error updating unvalidated TCProduct')  
      }
    })
    .catch(err => {
      console.log('Error updating unvalidated TCProduct: ' + err)
    })    
  }


  // =====
  // hooks
  // =====

  // initial load of all TCProducts
  useEffect(() => {

    // call endpoint
    axios({
      method: 'get',
      url: UNVALIDATED_TCPRODUCTS_URL
    })
    .then(res => {
      // initialize all product states
      const data = res.data.data
      const products = parseUnvalidatedTCProductsEndpointResponse(data)
        .sort(sortFnProductSearchResults)
        setTCProducts(products)
    })
    .catch(err => {
      console.log('Error fetching unvalidated TCProducts: ' + err)
    })
  }, [])

  const bottomAnchorRef = useRef<HTMLDivElement>(null)
  const topAnchorRef = useRef<HTMLDivElement>(null)

  // Axios response toast
  const toast = useToast()


  // ==============
  // main component
  // ==============

  return (
    <>
      {/* Top Anchor */}
      <Flex ref={topAnchorRef}/>

      {/* TC Product Catalogue */}
      <SectionHeader header='Products to Validate' />
      
      <TCProductCatalogue 
        products={TCProducts}
        onProductCardClick={handleTCProductCardOnClick}
      />

      {/* Add Product Form */}
      <SectionHeader header='Add Product' />
      
      <AddProductForm 
        formData={addProductFormData}
        markTCProductAsValid={handleMarkTCProductAsValid}
        setFormData={setAddProductFormData}
      />

      <Flex justifyContent='center' p={4}>
        <Button
          colorScheme='orange'
          isDisabled={Object.keys(TCProduct).length === 0}
          onClick={() => handleIgnoreTCProductOnClick()}
        >
          Ignore TCProduct
        </Button>
      </Flex>

      {/* Bottom Anchor */}
      <Flex ref={bottomAnchorRef}/>
    </>
  )
}