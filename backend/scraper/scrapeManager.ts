// imports
import { getProducts, insertPrices } from '../mongo/mongoManager';
import { IPrice } from '../mongo/models/priceSchema';
import { scrape } from './scraper';
import { TimeseriesGranularity } from 'common';


// ==============
// main functions
// ==============

/*
DESC
    Loads price data for all known products
*/
async function loadPrices(): Promise<number> {

    // get all Products
    const productDocs = await getProducts();
    console.log(`Retrieved prods: ${JSON.stringify(productDocs, null, 4)}`);

    // scrape price data
    const tcgplayerIds = productDocs.map( doc => doc.tcgplayerId );
    const prices = await scrape(tcgplayerIds);

    // insert price data
    let priceDate = new Date();
    priceDate.setMinutes(0,0,0);

    let priceDocs: IPrice[] = [];

    // iterate through each Product
    for (const productDoc of productDocs) {

        const tcgplayerId = productDoc.tcgplayerId;

        // get price data
        const priceData = prices.get(tcgplayerId)

        // handle products without price data
        if (priceData === undefined) {

            console.log(`No price data found for tcgplayerId: ${tcgplayerId}`);

        // construct IPrice object
        } else {

            let price: IPrice = {
                priceDate: priceDate,
                product: productDoc,
                granularity: TimeseriesGranularity.Hours,
                marketPrice: priceData.marketPrice
            }; 

            if (priceData.buylistMarketPrice !== null) {
                price.buylistMarketPrice = priceData.buylistMarketPrice;
            }

            if (priceData.listedMedianPrice !== null) {
                price.listedMedianPrice = priceData.listedMedianPrice;
            }

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