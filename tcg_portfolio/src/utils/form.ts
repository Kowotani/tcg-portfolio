import { 
  // data models
  ProductLanguage, ProductSubtype, ProductType, TCG, TCGToProductType,
  
  // generic
  assert, isASCII, getProductSubtypes
} from 'common'
import { isHttpUrl } from './generic'
import * as _ from 'lodash'


// ==========
// interfaces
// ==========

export interface IBaseState {
  errorMessage?: string
  isInvalid?: boolean, 
}

export interface IFormValueState<Type> extends IBaseState {
  value?: Type
}

export interface IFormValueWithStringValuesState<Type> 
extends IFormValueState<Type> {
  stringValues: string[]
}

export interface IAddProductFormDataState {
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


// =========
// functions
// =========

// -------------
// state helpers
// -------------

/*
DESC
  Helper to generate an IFormValueState for various empty states during
  form validation
*/
export function genEmptyState<Type>(): IFormValueState<Type> {
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
export function genEmptyStringValuesState<Type>(
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
export function genErrorState<Type>(errorMessage: string): IFormValueState<Type> {
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
export function genValidState<Type>(value: Type): IFormValueState<Type> {
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
export function genValidStringValuesState<Type>(
  value: Type,
  stringValues: string[]
): IFormValueWithStringValuesState<Type> {
  return {
    isInvalid: false,
    stringValues: stringValues,
    value: value
  } as IFormValueWithStringValuesState<Type>
}


// -----------------
// validation states
// -----------------

// validate Image URL
export function genImageUrlState(input: string): IFormValueState<string> {
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
export function genMsrpState(input: string): IFormValueState<number> {
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
export function genNameState(input: string): IFormValueState<string> {
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
export function genProductTypeState(
  tcg: TCG
): IFormValueWithStringValuesState<ProductType> {
  const types = TCGToProductType[tcg]
  const defaultType = _.head(types)

  assert(defaultType, `defaultType is undefined for valid TCG: ${tcg}`)
  return genValidStringValuesState<ProductType>(defaultType, types)    
}

// ProductSubtype state from TCG, ProductType
export function genProductSubtypeState(
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
export function genReleaseDateState(input: string): IFormValueState<Date> {
  return (
    // empty
    input.length === 0
      ? genErrorState<Date>('Release Date is required')

    // valid
    : genValidState<Date>(new Date(Date.parse(input)))
  )
}  

// validate Set Code
export function genSetCodeState(input: string): IFormValueState<string> {
  return (
    // non-ASCII
    input.length && !isASCII(input) 
      ? genErrorState<string>('Set Code must only contain ASCII characters')

    // valid
    : genValidState<string>(input)
  )
}

// validate TCG
export function genTcgState(input: string): IFormValueState<TCG> {
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
export function genTcgPlayerIdState(input: string): IFormValueState<number>  {
  // TODO: check if TCGPlayer ID already exists
  return (
    // empty
    input.length === 0 
      ? genErrorState<number>('TCGPlayerID is required')

    // valid
    : genValidState<number>(parseInt(input))
  )
}