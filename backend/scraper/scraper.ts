// imports
import {
  IDatedPriceData, IPriceData, TCGPriceType,

  getPriceFromString, isPriceString, isTCGPriceTypeValue
} from 'common'
import puppeteer, { Browser, Page } from 'puppeteer'

// =========
// constants
// =========

const URL_BASE = 'https://www.tcgplayer.com/product/'


// =========
// functions
// =========

// ----------------
// helper functions
// ----------------

async function getBrowser(): Promise<Browser>{

  console.log('Opening the browser ...')

	try {

    // initialize browser
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--disable-setuid-sandbox"], 'ignoreHTTPSErrors': true,
    })

    // success
    if (browser) {
      return browser

    // error
    } else {
      const msg = 'Could not create a browser instance'
      throw new Error(msg)
    }

	} catch (err) {

    const msg = `Error in getBrowser(): ${err}`
    throw new Error(msg)
	}
}

/*
DESC
  Returns a new Page from a Puppeteer Browser
RETURN
  A Puppeteer Page
*/
async function getPage(): Promise<Page> {

  try {

    // get browser
    const browser = await getBrowser()

    // success
    if (browser) {
      return await browser.newPage()

    // error
    } else {
      const msg = 'Could not instatiate Browser'
      throw new Error(msg)
    }

  } catch (err) {

    const msg = `Error in getNewPage(): ${err}`
    throw new Error(msg)
  }
}

/*
DESC
  Returns the input Page after navigating to the input URL
INPUT
  page: The Puppeteer Page
  url: The page URL
RETURN
  THe Puppeteer Page after navigating to the URL
*/
async function navigatePage(page: Page, url: string): Promise<Page> {

  try {

    // get HTTP response
    console.log(`Navigating to ${url} ...`)
    const res = await page.goto(url)

    // success
    if (res) {
      return page

    // error
    } else {
      const msg = `Could not navigate to ${url}`
      throw new Error(msg)
    } 

  } catch (err) {

    const msg = `Error in getPage(): ${err}`
    throw new Error(msg)
  }
}

// --------------
// main functions
// --------------

/*
DESC
  Scrapes current price data for the input tcgplayerIds
INPUT
  Array of tcgplayerIds
RETURN
  A Map of tcgplayerId -> IPriceData
*/
type TScrapedText = {
  text: string,
  price: string
}
export async function scrapeCurrent(
  tcgplayerIds: number[]
): Promise<Map<number, IPriceData>> {

  // store return data
  let scrapeData = new Map<number, IPriceData>()

  try {

    // get empty page
    const emptyPage = await getPage()

    // iterate through ids
    for (const tcgplayerId of tcgplayerIds) {

      // navigate to the url
      const url = URL_BASE + tcgplayerId + '/'
      const page = await navigatePage(emptyPage, url)

      // wait for price guide to render
      const selector = '.price-guide__points'
      const awaitRender = await page.waitForSelector(selector)
      if (!awaitRender) {
        const msg = `Path did not render: ${selector}`
        throw new Error(msg)
      }

      // set path for Current Price Points table
      const headerPath = '.price-guide__points > table > tr:not(.price-points__header)'

      // scrape text from divs
      const scrapedTexts = await page.$$eval(headerPath, rows => {
        let scrapedText: TScrapedText[] = []

        rows.forEach((row: HTMLTableRowElement) => {
          
          const divText = row?.querySelector('.text')?.textContent?.trim()
          const divPrice = row?.querySelector('.price')?.textContent?.trim()

          if (divText && divPrice) {
            scrapedText.push({
              text: divText, 
              price: divPrice
            })
          }
        })

        return scrapedText
      })
      
      // parse scraped text
      let data: {[text: string]: number} = {}
      scrapedTexts.forEach((st: TScrapedText) => {
        if (isTCGPriceTypeValue(st.text) && isPriceString(st.price)) {
          data[st.text] = getPriceFromString(st.price)
        }
      })

      // create IPriceData
      let priceData: IPriceData = {
        marketPrice: data[TCGPriceType.MarketPrice]
      }
      if (data[TCGPriceType.BuylistMarketPrice]) {
        priceData.buylistMarketPrice = data[TCGPriceType.BuylistMarketPrice]
      }
      if (data[TCGPriceType.ListedMedianPrice]) {
        priceData.listedMedianPrice = data[TCGPriceType.ListedMedianPrice]
      }

      scrapeData.set(tcgplayerId, priceData)           
    }

  } catch(err) {

    const msg = `Error in scrapeCurrent(): ${err}`
    throw new Error(msg)
  }

  return scrapeData
}