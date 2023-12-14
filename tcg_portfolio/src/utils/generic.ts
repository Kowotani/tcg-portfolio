import * as _ from 'lodash'
import numeral from 'numeral'


// =========
// functions
// =========

/*
DESC
  Formats the input number according to the input parameters
INPUT
  value?: The value to format
  prefix?: Any prefix to pre-pend to the number
  suffix?: Any suffix to post-pend to the number
  precision?: The number of desired decimal places (default: 0)
  placeholder?: The placeholder to use if value is undefined
RETURN
  The formatted number
*/
export function formatNumber(
  {value, prefix, suffix, precision, placeholder}: IFormattedNumber
): string {

  // base format
  const baseFormat = '0,0'

  // precision
  const decimals = precision ? `.${_.repeat('0', precision)}` : ''

  // final format
  const format = `(${prefix ?? ''}${baseFormat}${decimals}${suffix ?? ''})`

  return value 
    ? numeral(value).format(format)
    : placeholder ?? ''
}

/*
DESC
  Returns the first locale detected from the browser (ie. navigator.languages). 
  Defaults to 'en-US' if none are found
RETURN
  The first locale detected from the browser
REF
  https://phrase.com/blog/posts/detecting-a-users-locale/
*/
export function getBrowserLocale(): string {
  
  const DEFAULT_LOCALE = 'en-US'

  const browserLocales = navigator.languages === undefined
    ? [navigator.language]
    : navigator.languages

  if (!browserLocales || browserLocales.length === 0) {
    return DEFAULT_LOCALE
  }

  return browserLocales[0].trim()
}

/*
DESC
  Get the appropriate color to style backgrounds based on the app colorMode
INPUT
  colorMode: Either light or dark
RETURN
  The Chakra color to style the background
*/
export function getColorForBackground(
  colorMode: 'light' | 'dark'
): 'white' | 'gray.700' {
  return colorMode === 'light' ? 'white' : 'gray.700'
}

/*
DESC
  Get the appropriate color to style backgrounds when hovered based on the 
  app colorMode
INPUT
  colorMode: Either light or dark
RETURN
  The Chakra color to style the background when hovered
*/
export function getColorForBackgroundHover(
  colorMode: 'light' | 'dark'
): 'gray.200' | 'gray.600' {
  return colorMode === 'light' ? 'gray.200' : 'gray.600'
}

/*
DESC
  Get the appropriate color to style the input number based on the app colorMode
  and the sign of the input
INPUT
  colorMode: Either light or dark
  value: The value to be styled
RETURN
  The Chakra color to style the value
*/
export function getColorForNumber(
  colorMode: 'light' | 'dark',
  value: number | undefined
): 'black' | 'white' | 'red.600' | 'red.300' {

  // undefined value
  if (value === undefined) {
    return colorMode === 'light' ? 'black' : 'white'

  // positive value
  } else if (value >= 0) {
    return colorMode === 'light' ? 'black' : 'white'

  // negative value
  } else if (value < 0) {
    return colorMode === 'light' ? 'red.600' : 'red.300'

  // default
  } else {
    return 'black'
  }
}

/*
DESC
  Get the appropriate color to style text based on the app colorMode
INPUT
  colorMode: Either light or dark
RETURN
  The Chakra color to style the text
*/
export function getColorForText(
  colorMode: 'light' | 'dark'
): 'black' | 'white' {
  return colorMode === 'light' ? 'black' : 'white'
}

/*
DESC
  Check if the input is a valid HTTP URL
INPUT
  input: a string that may be a URL
RETURN
  TRUE if the input is a valid HTTP URL, FALSE otherwise
REF
  https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
*/
export function isHttpUrl(input: string): boolean {
  let url
  
  try {
    url = new URL(input)
  } catch (_) {
    return false; 
  }
  
  return url.protocol === "http:" || url.protocol === "https:"
}


// ==========
// interfaces
// ==========

interface IFormattedNumber {
  value?: number,
  prefix?: string,
  suffix?: string,
  precision?: number,
  placeholder?: string
}