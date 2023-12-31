import { 
  IDatedPriceData, IPrice, IPriceData, TimeseriesGranularity, 

  formatAsISO
} from 'common'
import * as _ from 'lodash'
import { IMProduct } from '../mongo/models/productSchema'
import { insertPrices } from '../mongo/dbi/Price'
import { 
  getProductDocs, getTcgplayerIdsForHistoricalScrape 
} from '../mongo/dbi/Product'
import { scrapeCurrent, scrapeHistorical } from './scraper'
import { TcgPlayerChartDateRange } from '../utils/Chart'


// =========
// functions
// =========

/*
DESC
  Loads current price data for the Product specified by the input tcgplayerId
INPUT
  tcgplayerId: The tcgplayerId of the Product
RETURN
  TRUE if the price data was successfully loaded, FALSE otherwise
*/
export async function loadCurrentPrice(tcgplayerId: number): Promise<boolean> {

  // scrape price data
  const scrapedPrices = await scrapeCurrent([tcgplayerId])
  const priceData = scrapedPrices.get(tcgplayerId)

  // check if data was retrieved
  if (priceData === undefined) {
    const errMsg = `Could not scrape price data for tcgplayerId: ${tcgplayerId}`
    throw new Error(errMsg)
  }
  
  // set price date
  let priceDate = new Date()
  priceDate.setMinutes(0,0,0)  

  // create IPrice
  const price: IPrice = {
    tcgplayerId: tcgplayerId,
    priceDate: priceDate,
    prices: priceData,
    granularity: TimeseriesGranularity.Hours
  }

  // load price
  const numInserted = await insertPrices([price])
  return numInserted === 1
}

/*
DESC
  Loads current price data for all known products
RETURN
  The number of Price documents inserted
*/
export async function loadCurrentPrices(): Promise<number> {

  // get all Products
  const allProductDocs = await getProductDocs()

  // exclude unreleased Products
  const productDocs = allProductDocs.filter((product: IMProduct) => {
    return formatAsISO(product.releaseDate) <= formatAsISO(new Date())
  })

  // scrape price data
  const tcgplayerIds = productDocs.map((productDoc: IMProduct) => {
    return productDoc.tcgplayerId
  })

  const scrapedPrices = await scrapeCurrent(tcgplayerIds)

  // set price date
  let priceDate = new Date()
  priceDate.setMinutes(0,0,0)

  let priceDocs: IPrice[] = []

  // iterate through each Product
  productDocs.forEach((productDoc: IMProduct) => {

    const tcgplayerId = productDoc.tcgplayerId

    // get price data
    const priceData = scrapedPrices.get(tcgplayerId)

    // create IPrice
    if (priceData?.marketPrice) {

      let prices: IPriceData = {
        marketPrice: priceData.marketPrice
      }

      if (priceData.buylistMarketPrice) {
        prices.buylistMarketPrice = priceData.buylistMarketPrice
      }

      if (priceData.listedMedianPrice) {
        prices.listedMedianPrice = priceData.listedMedianPrice
      }

      const price: IPrice = {
        priceDate: priceDate,
        tcgplayerId: tcgplayerId,
        granularity: TimeseriesGranularity.Hours,
        prices: prices
      }

      priceDocs.push(price)

    // exclude products with missing data
    } else {

      console.log(`No price data found for tcgplayerId: ${tcgplayerId}`)
    } 
  })

  const numInserted = await insertPrices(priceDocs)
  return numInserted
}

/*
DESC
  Loads historical price data for all known products
INPUT
  dateRange: A TcgPlayerChartDateRange specifying the date range
RETURN
  The number of Price documents inserted
*/
export async function loadHistoricalPrices(
  dateRange: TcgPlayerChartDateRange
): Promise<number> {

  // get TcgplayerIds that are missing data
  const tcgplayerIds = await getTcgplayerIdsForHistoricalScrape(dateRange)

  // get Product docs for relevant TcgplayerIds
  const allProductDocs = await getProductDocs()
  const productDocs = allProductDocs.filter((productDoc: IMProduct) => {
    return tcgplayerIds.includes(productDoc.tcgplayerId)
  })

  // scrape historical data
  const scrapedPrices = await scrapeHistorical(tcgplayerIds, dateRange)

  let priceDocs: IPrice[] = []

  // iterate through each Product
  productDocs.forEach(productDoc => {

    const tcgplayerId = productDoc.tcgplayerId

    // get price data
    const datedPriceData = scrapedPrices.get(tcgplayerId)

    // create IPrices
    if (datedPriceData) {

      datedPriceData.forEach((priceData: IDatedPriceData) => {

        const price: IPrice = {
          priceDate: priceData.priceDate,
          tcgplayerId: tcgplayerId,
          granularity: TimeseriesGranularity.Hours,
          prices: priceData.prices
        }

        priceDocs.push(price)
      })

    // exclude products with missing data
    } else {

      console.log(`No price data found for tcgplayerId: ${tcgplayerId}`)
    } 
  })

  const numInserted = await insertPrices(priceDocs)
  return numInserted
}

async function main() {

  // const tcgplayerId = 224721
  // const inserted = await loadCurrentPrice(tcgplayerId)
  // const res = inserted
  //   ? `Inserted price for tcgplayerId: ${tcgplayerId}`
  //   : `Could not insert price for tcgplayerId: ${tcgplayerId}`
  // console.log(res)

  // const numInserted = await loadCurrentPrices()
  // console.log(`Inserted ${numInserted} docs`)

  // const numInserted = await loadHistoricalPrices(TcgPlayerChartDateRange.OneYear)
  // console.log(`Inserted ${numInserted} docs`)
}

main()
  .then(console.log)
  .catch(console.error)