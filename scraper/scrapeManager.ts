// imports
import { getProductIds, insertDocs } from '../backend/mongoManager';
import { IPrice, IPriceProduct } from '../backend/models/priceSchema';
import { scrape } from './scraper';
import { TCGPriceType } from '../utils';


/*
DESC
    Loads price data for all known products
*/
async function loadPrices(): Promise<void> {

    // get tcgplayer_ids for scraping
    const ids = await getProductIds();
    // console.log(`Retrieved ids: ${JSON.stringify(ids, null, 4)}`);

    // scrape price data
    const tcgplayerIds = ids.map( id => id.tcgplayerId );
    const prices = await scrape(tcgplayerIds);
    // console.log(prices);

    // insert price data
    let priceDate = new Date();
    priceDate.setMinutes(0,0,0);
    const docs = ids.map(
        doc => {
            
            const priceProduct: IPriceProduct = {
                id: doc.id,
                tcgplayerId: doc.tcgplayerId
            }

            let price: IPrice = {
                priceDate: priceDate,
                product: priceProduct,
                granularity: 'hourly',
                marketPrice: 123
            } 

            return {
                'price_date': priceDate,
                'product': {
                    'id': doc.id,
                    'tcgplayer_id': doc.tcgplayer_id
                },
                'market_price': prices[doc.tcgplayer_id]['Market Price'],
                'buylist_market_price': prices[doc.tcgplayer_id]['Buylist Market Price'],
                'listed_median_price': prices[doc.tcgplayer_id]['Listed Median Price']
            }
        }
    );
    console.log(JSON.stringify(docs, null, 4));
    let numInserted = await insertDocs('prices', docs);
}

loadPrices()
    .then(console.log)
    .catch(console.error);