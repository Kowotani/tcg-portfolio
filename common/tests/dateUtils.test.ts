import { expect, test } from '@jest/globals'
import { isDateAfter, isDateBefore, isDateBetween } from '../dateUtils'


// =========
// constants
// =========

const EARLIER_DATE = new Date(Date.parse('2020-01-01'))
const LATER_DATE = new Date(Date.parse('2020-01-31'))


// ==========
// comparison
// ==========


// -- isDateAfter

test('isDateAfter (later > earlier)', () => {
  expect(isDateAfter(LATER_DATE, EARLIER_DATE)).toBe(true)
})

test('isDateAfter (earlier > earlier)', () => {
  expect(isDateAfter(EARLIER_DATE, EARLIER_DATE)).toBe(false)
})

test('isDateAfter (earlier >= earlier)', () => {
  expect(isDateAfter(EARLIER_DATE, EARLIER_DATE, true)).toBe(true)
})

test('isDateAfter (earlier < later)', () => {
  expect(isDateAfter(EARLIER_DATE, LATER_DATE)).toBe(false)
})

test('isDateAfter (earlier <= later)', () => {
  expect(isDateAfter(EARLIER_DATE, LATER_DATE, true)).toBe(false)
})


// -- isDateBefore

test('isDateBefore (later < earlier)', () => {
  expect(isDateBefore(LATER_DATE, EARLIER_DATE)).toBe(false)
})

test('isDateBefore (earlier < earlier)', () => {
  expect(isDateBefore(EARLIER_DATE, EARLIER_DATE)).toBe(false)
})

test('isDateBefore (earlier <= earlier)', () => {
  expect(isDateBefore(EARLIER_DATE, EARLIER_DATE, true)).toBe(true)
})

test('isDateBefore (earlier < later)', () => {
  expect(isDateBefore(EARLIER_DATE, LATER_DATE)).toBe(true)
})

test('isDateBefore (earlier <= later)', () => {
  expect(isDateBefore(EARLIER_DATE, LATER_DATE, true)).toBe(true)
})