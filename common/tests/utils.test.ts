import { expect, test } from '@jest/globals'
import { 
  genSequentialArray, getPriceFromString, isASCII, isPriceString
} from '../utils'


// -------
// generic
// -------


// -- genSequentialArray

test('genSequentialArray [1, 2, 3]', () => {
  expect(genSequentialArray(1, 3)).toEqual([1, 2, 3])
})

test('genSequentialArray [0]', () => {
  expect(genSequentialArray(0, 0)).toEqual([0])
})


// -- getPriceFromString

test('getPriceFromString $1,234.56', () => {
  expect(getPriceFromString('$1,234.56')).toBeCloseTo(1234.56)
})


// -- isASCII

test('asdf is ASCII', () => {
  expect(isASCII('asdf')).toBe(true)
})

test('âşđƒ is not ASCII', () => {
  expect(isASCII('âşđƒ')).toBe(false)
})


// -- isPriceString

test('isPriceString $1,234.56', () => {
  expect(isPriceString('$1,234.56')).toBe(true)
})

test('isPriceString €1.234,56', () => {
  expect(isPriceString('€1.234,56')).toBe(false)
})