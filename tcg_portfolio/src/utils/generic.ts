// =========
// functions
// =========

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
  Checks if the input is a valid HTTP URL
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