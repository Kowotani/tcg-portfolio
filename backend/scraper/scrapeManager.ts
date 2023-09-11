// imports
import { getProductDocs, insertPrices } from '../mongo/mongoManager'
import { scrapeCurrent } from './scraper'
import { IPrice, IPriceData, TimeseriesGranularity } from 'common'


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
  const productDocs = await getProductDocs()
  console.log(`Retrieved prods: ${JSON.stringify(productDocs, null, 4)}`)

  // scrape price data
  const tcgplayerIds = productDocs.map( doc => doc.tcgplayerId )
  const scrapedPrices = await scrapeCurrent(tcgplayerIds)

  // set price date
  let priceDate = new Date()
  priceDate.setMinutes(0,0,0)

  let priceDocs: IPrice[] = []

  // iterate through each Product
  for (const productDoc of productDocs) {

    const tcgplayerId = productDoc.tcgplayerId

    // get price data
    const priceData = scrapedPrices.get(tcgplayerId)

    // handle products without price data
    if (priceData === undefined) {

      console.log(`No price data found for tcgplayerId: ${tcgplayerId}`)

    // exclude products with missing marketPrice
    } else if (priceData.marketPrice === undefined) {

      console.log(`No marketPrice data found for tcgplayerId: ${tcgplayerId}`)

    // create IPrice
    } else {

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
    }    
  }

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

  const numInserted = await loadCurrentPrices()
  console.log(`Inserted ${numInserted} docs`)
}

main()
  .then(console.log)
  .catch(console.error);