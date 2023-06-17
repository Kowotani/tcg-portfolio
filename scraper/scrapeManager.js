// imports
const scraper = require('./scraper');
const mongoDB = require('./mongoManager');


async function loadPrices() {

    // get tcgplayer_ids for scraping
    const ids = await mongoDB.getProductIds();
    // console.log(`Retrieved ids: ${JSON.stringify(ids, null, 4)}`);

    // scrape price data
    const tcgplayerIds = ids.map( id => id.tcgplayer_id );
    const prices = await scraper.scrape(tcgplayerIds);
    // console.log(prices);

    // insert price data
    let priceDate = new Date();
    priceDate.setMinutes(0,0,0);
    const docs = ids.map(
        doc => {
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
    let numInserted = await mongoDB.insertDocs('prices', docs);

    return 0;
}

loadPrices()
    .then(console.log)
    .catch(console.error);