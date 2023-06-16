// imports
const scraper = require('./scraper');
const mongoDB = require('./mongoManager');

async function main() {
    // get tcgplayer_ids for scraping
    let ids = await mongoDB.getProductIds();
    console.log(`Retrieved ids: ${ids}`);

    // scrape price data
    let prices = await scraper.scrape(ids);
    console.log(prices);

    // insert price data
    let docs = [
        {
            'price_date': new Date('2023-06-15T19:00:00.000Z'),
            'product': {
                'id': '123',
                'tcgplayer_id': 999,
            },
            'market_price': 299.12,
            'buylist_market_price': null,
            'listed_median_price': 399.25
        },
        {
            'price_date': '123',
            'product': {
                'id': '456',
                'tcgplayer_id': 999,
            },
            'market_price': 299.12,
            'buylist_market_price': null,
            'listed_median_price': 399.25
        },        
    ];
    let inserted = await mongoDB.insertDocs('prices', docs);

    return 'Done';
}

main()
    .then(console.log)
    .catch(console.error);