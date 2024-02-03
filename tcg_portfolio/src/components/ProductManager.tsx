import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Box } from '@chakra-ui/react'
import { 
  // data models
  IProduct, ITCProduct, ParsingStatus, ProductLanguage, ProductSubtype, 
  ProductType, TCG,

  // api
  UNVALIDATED_TCPRODUCTS_URL,

  // generic
  getProductSubtypes, TCGToProductType
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
    Handles the TCProduct card onClick event
  INPUT
    product: An ITCProduct
  */
  function handleTCProductCardOnClick(product: ITCProduct): void {
    setFormDataFromProduct(product)
    setTCProduct(product)
    anchorRef.current?.scrollIntoView({behavior: 'smooth'})
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

  const anchorRef = useRef<HTMLDivElement>(null)


  // ==============
  // main component
  // ==============

  return (
    <>
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

      {/* Anchor */}
      <Box ref={anchorRef}/>
    </>
  )
}