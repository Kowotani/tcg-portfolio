import { FunctionComponent, useEffect, useState, } from 'react';
import axios from 'axios';
import { 
    Button,
    Image,
    Input,
    NumberInput,
    NumberInputField,
    Select,
    useToast,
    VStack, 
} from '@chakra-ui/react';
import { getProductSubtypes, isASCII, ProductLanguage, ProductType, 
    ProductSubtype, TCG, TCGToProductType, TPostFormData, TPostBody,
} from 'common';
import { Form, Formik } from 'formik'
import { InputErrorWrapper } from './InputField';


// ==============
// main component
// ==============

export const AddProductForm: FunctionComponent<{}> = () => {

    // =========
    // constants
    // =========

    const IMAGE_URL_PLACEHOLDER = 'https://picsum.photos/'
    const LANGUAGE_SELECT_DEFAULT = ProductLanguage.English
    const PRODUCT_SUBTYPE_DEFAULT_PLACEHOLDER = 'Select Type first'
    const PRODUCT_SUBTYPE_EMPTY_PLACEHOLDER = 'No Subtypes'
    const PRODUCT_TYPE_PLACEHOLDER = 'Select TCG first'
    const TCG_SELECT_DEFAULT = 'Select TCG'
    
    const ADD_PRODUCT_URL = '/product'  


    // =====
    // types
    // =====




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
    });

    // Name state
    const [ nameState, setNameState ] = useState<{
        name: string,
        isInvalid?: boolean, 
        errorMessage?: string,
    }>({
        name: '',
    });

    // TCG state
    const [ TCGState, setTCGState ] = useState<{
        tcg: TCG | '',
        isInvalid?: boolean, 
        errorMessage?: string,
    }>({
        tcg: '',
    });

    // ProductType state
    const [ productTypeState, setProductTypeState ] = useState<{
        productType: ProductType | ''
        isDisabled: boolean,
        values: string[],
    }>({
        productType: '',
        isDisabled: true,
        values: [],
    });

    // ProductSubtype state
    const [ productSubtypeState, setProductSubtypeState ] = useState<{
        productSubtype: ProductSubtype | '',
        isDisabled: boolean,
        values: string[],
    }>({
        productSubtype: '',
        isDisabled: true,
        values: [],
    });

    // Release Date state
    const [ releaseDateState, setReleaseDateState ] = useState<{
        releaseDate: Date | undefined,
        isInvalid?: boolean, 
        errorMessage?: string,
    }>({
        releaseDate: undefined,
    });

    // Set Code state
    const [ setCodeState, setSetCodeState ] = useState<{
        setCode: string,
        isInvalid: boolean, 
        errorMessage?: string,
    }>({
        setCode: '',
        isInvalid: false,
    });

    // Language state
    const [ languageState, setLanguageState ] = useState<{
        language: ProductLanguage,
    }>({
        language: LANGUAGE_SELECT_DEFAULT,
    });

    // Image URL state
    const [ imageUrlState, setImageURLState ] = useState<{
        imageUrl: string,
        isInvalid: boolean,
        errorMessage?: string,
    }>({
        imageUrl: '',
        isInvalid: false,
    });


    // =========
    // functions
    // =========

    // form control

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


    // validation

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


    /*
    DESC
        Checks if the input is a valid HTTP URL
    INPUT
        input: a string that may be a URL
    RETURN
        TRUE if the input is a valid HTTP URL, FALSE otherwise
    REF
        https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
    */
    function isHttpUrl(input: string): boolean {
        let url;
        
        try {
          url = new URL(input);
        } catch (_) {
          return false;  
        }
      
        return url.protocol === "http:" || url.protocol === "https:";
      }

    /*
    DESC
        Creates the body for the POST request to add a new Product
    RETURN
        A TPostFormData with the Product data
    */
    function getPostFormData(): TPostFormData {

        let data: TPostFormData = {
            tcgplayerId: TCGPlayerIdState.tcgPlayerId as number,
            name: nameState.name,
            tcg: TCGState.tcg as TCG,
            type: productTypeState.productType as ProductType,
            releaseDate: (releaseDateState.releaseDate?.toISOString() as string).substring(0,10),
            language: languageState.language,
        }
        if (productSubtypeState.productSubtype.length > 0) {
            data.subtype = productSubtypeState.productSubtype as ProductSubtype
        }
        if (setCodeState.setCode.length > 0) {
            data.setCode = setCodeState.setCode
        }

        return data
    }


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
            onSubmit={() => {

                // create POST body               
                let body: TPostBody = {
                    formData: getPostFormData(),
                }

                // add imageUrl, if exists
                if (!imageUrlState.isInvalid) {
                    body.imageUrl = imageUrlState.imageUrl
                }

                // submit
                axios({
                    method: 'post',
                    url: ADD_PRODUCT_URL,
                    data: body,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                })
                // success
                .then(res => {

                    // product was added
                    if (res.status === 201) {
                        toast({
                            title: 'Success!',
                            description: `tcgplayerId was added: ${res.data.tcgplayerId}`,
                            status: 'success',
                            isClosable: true,
                        })                   

                    // product already exists
                    } else if (res.status === 202) {
                        toast({
                            title: 'Notice',
                            description: `tcgplayerId already exists: ${res.data.tcgplayerId}`,
                            status: 'info',
                            isClosable: true,
                        })  
                    }

                })
                // error
                .catch(res => {
                    toast({
                        title: 'Error!',
                        description: `${res.statusText}: ${res.data}`,
                        status: 'error',
                        isClosable: true,
                    })                    
                })
            }}
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
                    >
                        <NumberInput
                            isInvalid={TCGPlayerIdState.isInvalid || false}
                            isRequired={true} 
                            min={1}
                            precision={0}
                            onBlur={e => validateTCGPlayerID(e.target.value)}
                        >
                            <NumberInputField />
                        </NumberInput>
                    </InputErrorWrapper>

                    {/* Name */}
                    <InputErrorWrapper 
                        leftLabel='Name'
                        errorMessage={nameState.errorMessage}
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

                    {/* Image URL */}
                    <InputErrorWrapper 
                        leftLabel='Image URL'
                        errorMessage={imageUrlState.errorMessage}
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
            </Form>
        </Formik>
    )
}