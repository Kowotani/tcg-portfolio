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
import * as _ from 'lodash'
import { AddProductForm } from './AddProductForm'
import { SectionHeader } from './Layout'
import { TCProductCatalogue } from './TCProductCatalogue'
import { parseUnvalidatedTCProductsEndpointResponse } from '../utils/api'
import { 
  // interfaces
  IAddProductFormDataState, 

  // validators
  genEmptyState, genEmptyStringValuesState, genValidState, 
  genValidStringValuesState,
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
  
      setAddProductFormData({
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

  // -------------------
  // tcproduct catalogue
  // -------------------

  /*
  DESC
    Handles Ignore TCProduct button onClick event
  */
  function handleIgnoreTCProductOnClick(): void {

    // create new TCProduct
    const newTCProduct = {
      ...TCProduct,
      releaseDate: getUTCDateFromLocalDate(TCProduct.releaseDate),
      status: ParsingStatus.Ignored
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
          title: 'TCProduct Ignored',
          description: `${PutTCProductStatus.Success}: ${TCProduct.tcgplayerId}`,
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