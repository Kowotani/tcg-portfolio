// imports
import { getProductDocs, insertPrices } from '../mongo/mongoManager';
import { scrape } from './scraper';
import { IPrice, IPriceData, TimeseriesGranularity } from 'common';


// ==============
// main functions
// ==============

/*
DESC
  Loads price data for all known products
RETURN
  The number of Price documents inserted
*/
async function loadPrices(): Promise<number> {

  // get all Products
  const productDocs = await getProductDocs();
  console.log(`Retrieved prods: ${JSON.stringify(productDocs, null, 4)}`);

  // scrape price data
  const tcgplayerIds = productDocs.map( doc => doc.tcgplayerId );
  const scrapedPrices = await scrape(tcgplayerIds);

  // insert price data
  let priceDate = new Date();
  priceDate.setMinutes(0,0,0);

  let priceDocs: IPrice[] = [];

  // iterate through each Product
  for (const productDoc of productDocs) {

    const tcgplayerId = productDoc.tcgplayerId;

    // get price data
    const priceData = scrapedPrices.get(tcgplayerId)

    // handle products without price data
    if (priceData === undefined) {

      console.log(`No price data found for tcgplayerId: ${tcgplayerId}`);

    // construct IPrice object
    } else {

      let prices: IPriceData = {
        marketPrice: priceData.marketPrice
      }

      if (priceData.buylistMarketPrice !== null) {
        prices.buylistMarketPrice = priceData.buylistMarketPrice;
      }

      if (priceData.listedMedianPrice !== null) {
        prices.listedMedianPrice = priceData.listedMedianPrice;
      }

      const price: IPrice = {
        priceDate: priceDate,
        tcgplayerId: tcgplayerId,
        granularity: TimeseriesGranularity.Hours,
        prices: prices
      }; 

      priceDocs.push(price);
    }    
  }
  // console.log(JSON.stringify(priceDocs, null, 4));
  const numInserted = await insertPrices(priceDocs);
  return numInserted;
}

async function main() {
  const numInserted = await loadPrices();
  console.log(`Inserted ${numInserted} docs`);
}

main()
  .then(console.log)
  .catch(console.error);