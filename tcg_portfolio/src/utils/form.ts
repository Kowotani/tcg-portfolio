import { ProductLanguage, ProductSubtype, ProductType, TCG } from 'common'

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