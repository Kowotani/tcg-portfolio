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

  return numeral(value ?? placeholder).format(format)
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
    return 'black'

  // light, positive
  } else if (colorMode === 'light' && value >= 0) {
    return 'black'

  // light, negative
  } else if (colorMode === 'light' && value < 0) {
    return 'red.600'

  // dark, positive
  } else if (colorMode === 'dark' && value >= 0) {
      return 'white'

  // dark, negative
  } else if (colorMode === 'dark' && value < 0) {
    return 'red.300'

  // default
  } else {
    return 'black'
  }
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