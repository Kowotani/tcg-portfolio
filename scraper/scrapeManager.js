// imports
const scraper = require('./scraper')
const mongoDB = require('./mongoManager')

async function main() {
    // get tcgplayer_ids for scraping
    let ids = await mongoDB.getProductIds()
    console.log(`Retrieved ids: ${ids}`)

    // scrape price data
    let prices = await scraper.scrape(ids)
    console.log(prices)

    return 'Done'
}

main()
    .then(console.log)
    .catch(console.error)