// imports
import { getProducts, insertPrices } from '../backend/mongoManager';
import { IPrice } from '../backend/models/priceSchema';
import { scrape } from './scraper';
import { IPriceData, IProductPriceData, TimeseriesGranularity } from '../utils';


// ================
// helper functions
// ================

/*
DESC
    Returns the IPriceData associated with a tcgplayerId, if exists
INPUT
    tcgplayerId: The tcgplayerId to search for
    priceData: The array of IProductPriceData to search
RETURN
    The IPriceData associated with the tcgplayerID, null otherwise
*/
function getPriceData(tcgplayerId: Number, priceData: IProductPriceData[]): IPriceData | null {

    for (const data of priceData) {
        if (data.tcgplayerId === tcgplayerId) {
            return data.priceData;
        }
        break;
    }

    return null;
}


// ==============
// main functions
// ==============

/*
DESC
    Loads price data for all known products
*/
async function loadPrices(): Promise<Number> {

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
        const priceData = getPriceData(tcgplayerId, prices);

        // handle products without price data
        if (priceData === null) {

            console.log(`No price data found for tcgplayerId: ${tcgplayerId}`);

        // handle products without 

        // construct IPrice object
        } else {

            let price: IPrice = {
                priceDate: priceDate,
                product: productDoc,
                granularity: TimeseriesGranularity.Hours,
                marketPrice: priceData.marketPrice
            }; 

            if (priceData.buylistMarketPrice !== null) {
                price['buylistMarketPrice'] = priceData.buylistMarketPrice;
            }

            if (priceData.listedMedianPrice !== null) {
                price['listedMedianPrice'] = priceData.listedMedianPrice;
            }

            priceDocs.push(price);
        }        
    }
    // console.log(JSON.stringify(priceDocs, null, 4));
    const numInserted = await insertPrices(priceDocs);
    return numInserted;
}

loadPrices()
    .then(console.log)
    .catch(console.error);