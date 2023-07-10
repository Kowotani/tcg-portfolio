import { FunctionComponent, useEffect, useState, } from 'react';
import { 
    Input,
    NumberInput,
    NumberInputField,
    Select,
    VStack, 
} from '@chakra-ui/react';
import { getProductSubtypes, isASCII, ProductLanguage, ProductType, 
    ProductSubtype, TCG, TCGToProductType,
} from 'common';
import { InputErrorWrapper } from './InputField';


// ==============
// main component
// ==============

export const AddProductForm: FunctionComponent<{}> = () => {

    // =========
    // constants
    // =========

    const LANGUAGE_SELECT_DEFAULT = ProductLanguage.English
    const PRODUCT_SUBTYPE_DEFAULT_PLACEHOLDER = 'Select Type first'
    const PRODUCT_SUBTYPE_EMPTY_PLACEHOLDER = 'No Subtypes'
    const PRODUCT_TYPE_PLACEHOLDER = 'Select TCG first'
    const TCG_SELECT_DEFAULT = 'Select TCG'


    // ======
    // states
    // ======

    // TCGPlayerID state
    const [ TCGPlayerIDState, setTCGPlayerIDState ] = useState<{
        isInvalid?: boolean, 
        errorMessage?: string,
    }>({});

    // Name state
    const [ nameState, setNameState ] = useState<{
        isInvalid?: boolean, 
        errorMessage?: string,
    }>({});

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
        isInvalid?: boolean, 
        errorMessage?: string,
    }>({});

    // Set Code state
    const [ setCodeState, setSetCodeState ] = useState<{
        isInvalid: boolean, 
        errorMessage?: string,
    }>({
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
            setTCGPlayerIDState({
                isInvalid: true, 
                errorMessage: 'TCGPlayerID is required',
            })

        // TODO: check if TCGPlayer ID already exists

        // valid
        } else {
            setTCGPlayerIDState({ isInvalid: false })
        }
    }

    // validate Name
    function validateName(input: string): void {

        // empty state
        if (input.length === 0) {
            setNameState({
                isInvalid: true, 
                errorMessage: 'Name is required',
            })

        // non-ASCII characters
        } else if (!isASCII(input)) {
            setNameState({
                isInvalid: true, 
                errorMessage: 'Name must only contain ASCII characters',
            })

        // valid
        } else {
            setNameState({ isInvalid: false })
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
                isInvalid: true, 
                errorMessage: 'Release Date is required',
            })

        // valid
        } else {
            setReleaseDateState({ isInvalid: false })
        }
    }    

    // validate Set Code
    function validateSetCode(input: string): void {

     if (input.length > 0 && !isASCII(input)) {
            setSetCodeState({
                isInvalid: true, 
                errorMessage: 'Set Code must only contain ASCII characters',
            })

        // valid
        } else {
            setSetCodeState({ isInvalid: false })
        }
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


    // ==============
    // main component
    // ==============

    return (
        <VStack 
            align-items='stretch'
            display='flex'
            flex-direction='column'
            spacing={8}
        >
            {/* TCGPlayer ID */}
            <InputErrorWrapper 
                leftLabel='TCGPlayer ID'
                errorMessage={TCGPlayerIDState.errorMessage}
            >
                <NumberInput
                    isInvalid={TCGPlayerIDState.isInvalid || false}
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
                <Select defaultValue={LANGUAGE_SELECT_DEFAULT}>            
                    {Object.values(ProductLanguage).map(value => {
                        return (
                            <option key={value} value={value}>{value}</option>
                        )
                    })}
                </Select>                
            </InputErrorWrapper>

        </VStack>
    )
}