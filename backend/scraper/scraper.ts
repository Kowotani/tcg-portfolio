// imports
import {
  IDatedPriceData, IPriceData, TCGPriceType,

  getPriceFromString, isPriceString, isTCGPriceTypeValue, sleep
} from 'common'
import * as _ from 'lodash'
import puppeteer, { Browser, ElementHandle, Page } from 'puppeteer'
import { isTCGPlayerDateRange } from '../utils'


// =========
// constants
// =========

const URL_BASE = 'https://www.tcgplayer.com/product/'
const PRICE_CHART_RENDER_DELAY = 1500


// =====
// types
// =====

type TScrapedText = {
  text: string,
  price: string
}


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
  Returns a new Page from the input Puppeteer Browser, or a new Browser
INPUT
  browser?: An existing Puppeteer Browser
RETURN
  A Puppeteer Page
*/
async function getPage(browser?: Browser): Promise<Page> {

  try {

    // get browser
    const browserObj = browser ?? await getBrowser()

    // success
    if (browserObj) {
      return await browserObj.newPage()

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
      const selector = "//section[@class='price-points price-guide__points']"
      await page.waitForXPath(selector)

      // set path for Current Price Points table
      const headerPath = '.price-guide__points table tr:not(.price-points__header)'

      // scrape text from divs
      const scrapedTexts = await page.$$eval(headerPath, rows => {
        let scrapedText: TScrapedText[] = []

        rows.forEach((row: HTMLTableRowElement) => {
          
          const divText = row.querySelector('.text')?.textContent?.trim()
          const divPrice = row.querySelector('.price')?.textContent?.trim()

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

/*
DESC
  Scrapes historical price data for the input tcgplayerIds
INPUT
  Array of tcgplayerIds
RETURN
  A Map of tcgplayerId -> IDatedPriceData[]
*/
export async function scrapeHistorical(
  tcgplayerIds: number[]
): Promise<Map<number, IDatedPriceData[]>> {

  // store return data
  let scrapeData = new Map<number, IDatedPriceData[]>()

  try {

    // get browser
    const browser = await getBrowser()

    // iterate through ids
    for (const tcgplayerId of tcgplayerIds) {

      // get empty page
      const emptyPage = await getPage(browser)

      // navigate to the url
      const url = URL_BASE + tcgplayerId + '/'
      const page = await navigatePage(emptyPage, url)

      // wait for price chart to render
      const priceChartPath = "//div[@class='martech-charts-bottom-controls']//div[@class='charts-time-frame']"
      await page.waitForXPath(priceChartPath)
     
      // click the 1Y button
      const buttonPath = "//button[@class='charts-item' and contains(., '1Y')]"
      const [button] = await page.$x(buttonPath)
      if (button) {
        await (button as ElementHandle<Element>).click()
      } else {
        const msg = `Could not find button path: ${buttonPath}`
        throw new Error(msg)
      }

      // wait for past year to render
      await sleep(PRICE_CHART_RENDER_DELAY)
      const pastYearPath = "//div[@class='charts-timeframe' and contains(., 'Past Year')]"
      await page.waitForXPath(pastYearPath)

      // set path for Price History table
      const chartPath = '.chart-container table tbody tr'

      // scrape text from divs
      const scrapedTexts = await page.$$eval(chartPath, rows => {
        let scrapedText: TScrapedText[] = []

        rows.forEach((row: HTMLTableRowElement) => {
          if (row.cells.length === 2) {
            const divText = row.cells[0].textContent?.trim()
            const divPrice = row.cells[1].textContent?.trim()  

            if (divText && divPrice) {
              scrapedText.push({
                text: divText, 
                price: divPrice
              })
            }  
          }
        })

        return scrapedText
      })

      // parse scraped text
      let priceData: IDatedPriceData[] = []
      const today = new Date()
      const [curMonth, curDay] = [today.getMonth() + 1, today.getDate()]

      scrapedTexts.forEach((st: TScrapedText) => {
        if (isTCGPlayerDateRange(st.text) && isPriceString(st.price)
          && getPriceFromString(st.price) > 0) {

          // get the end date
          const monthDay = st.text.split(' ')[2].trim()
          const [strMonth, strDay] = monthDay.split('/')
            .map(el => el.padStart(2, '0'))
          const [month, day] = [Number(strMonth), Number(strDay)]
          const year 
            = (month > curMonth) || (month === curMonth && day > curDay)
              ? today.getFullYear() - 1
              : today.getFullYear()

          // create IDatedPriceData
          const datedPriceData: IDatedPriceData = {
            priceDate: new Date(Date.parse(`${year}-${strMonth}-${strDay}`)),
            prices: {
              marketPrice: getPriceFromString(st.price)
            }
          }

          // append if not a duplicate
          if (_.last(priceData)?.priceDate.getTime() 
            !== datedPriceData.priceDate.getTime()) {
            priceData.push(datedPriceData)
          }
        }
      })

      scrapeData.set(tcgplayerId, priceData)  

      // close page
      await page.close()
    }

  } catch(err) {

    const msg = `Error in scrapeHistorical(): ${err}`
    throw new Error(msg)
  }

  return scrapeData
}