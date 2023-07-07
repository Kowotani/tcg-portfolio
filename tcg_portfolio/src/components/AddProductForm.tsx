import { FunctionComponent, useState } from 'react';
import { 
    Input,
    NumberInput,
    NumberInputField,
    Select,
    VStack 
} from '@chakra-ui/react';
import { isASCII, ProductLanguage, ProductType, ProductSubtype, TCG, 
    TCGToProductSubtype, TCGToProductType 
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
    const PRODUCT_SUBTYPE_SELECT_DEFAULT = 'Select Subtype'
    const PRODUCT_TYPE_SELECT_DEFAULT = 'Select Type'
    const TCG_SELECT_DEFAULT = 'Select TCG'


    // ======
    // states
    // ======

    // TCGPlayerID state
    const [ TCGPlayerIDState, setTCGPlayerIDState ] = useState<{
        isInvalid?: boolean, 
        errorMessage?: string
    }>({});

    // Name state
    const [ nameState, setNameState ] = useState<{
        isInvalid?: boolean, 
        errorMessage?: string
    }>({});

    // TCG state
    const [ TCGState, setTCGState ] = useState<{
        isInvalid?: boolean, 
        errorMessage?: string
    }>({});

    // ProductType state
    const [ productTypetState, setProductTypeState ] = useState<{
        isDisabled: boolean,
        isInvalid?: boolean,
        errorMessage?: string
    }>({
        isDisabled: true,
    });

    // ProductSubtype state
    const [ productSubtypeState, setProductSubtypeState ] = useState<{
        isDisabled: boolean,
    }>({
        isDisabled: true,
    });

    // Release Date state
    const [ releaseDateState, setReleaseDateState ] = useState<{
        isInvalid?: boolean, 
        errorMessage?: string
    }>({});

    // Set Code state
    const [ setCodeState, setSetCodeState ] = useState<{
        isInvalid: boolean, 
        errorMessage?: string
    }>({
        isInvalid: false,
    });


    // =========
    // functions
    // =========

    // validate TCGplayerID
    function validateTCGPlayerID(input: string) {

        // empty state
        if (input === '') {
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
    function validateName(input: string) {

        // empty state
        if (input === '') {
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
    function validateTCG(input: string) {

        // default
        if (input === '') {
            setTCGState({
                isInvalid: true, 
                errorMessage: 'TCG is required',
            })

        // valid
        } else {
            setTCGState({ isInvalid: false })
        }
    }

    // validate Product Type
    function validateProductType(input: string) {

        // default
        if (input === '') {
            setProductTypeState({
                isInvalid: true, 
                errorMessage: 'Product Type is required',
                ...productTypetState,
            })

        // valid
        } else {
            setProductTypeState({ 
                isDisabled: false,
                isInvalid: false, 
            })
        }
    }    

    // validate Release Date
    function validateReleaseDate(input: string) {

        // default
        if (input === '') {
            setReleaseDateState({
                isInvalid: true, 
                errorMessage: 'Release Date is required',
            })

        // valid
        } else {
            setReleaseDateState({ 
                isInvalid: false, 
            })
        }
    }    

    // validate Set Code
    function validateSetCode(input: string) {

     if (input.length > 0 && !isASCII(input)) {
            setSetCodeState({
                isInvalid: true, 
                errorMessage: 'Set Code must only contain ASCII characters',
            })

        // valid
        } else {
            setNameState({ isInvalid: false })
        }
    }


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
                    isInvalid={TCGState.isInvalid || false}
                    isRequired={true} 
                    placeholder={TCG_SELECT_DEFAULT}
                    onBlur={e => validateTCG(e.target.value)}
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
                errorMessage={productTypetState.errorMessage}
            >
                <Select
                    isInvalid={productTypetState.isInvalid || false}
                    isRequired={true} 
                    placeholder={PRODUCT_TYPE_SELECT_DEFAULT}
                    onBlur={e => validateProductType(e.target.value)}
                >            
                    {Object.values(ProductType).map(value => {
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
                    placeholder={PRODUCT_SUBTYPE_SELECT_DEFAULT}
                >            
                    {Object.values(ProductSubtype).map(value => {
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