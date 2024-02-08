const scrapeManager = require('../dist/scraper/scrapeManager')

// scrape MTG Secret Lairs
console.log(`Scraping Products for [Secret Lair]...`)
const slParams = {
  categoryId: 1,
  groupId: 2576
}
scrapeManager
  .loadTCProducts(slParams)
  .then(res => {
    console.log(`${res} TCProduct documents were loaded for: Secret Lair`)
    process.exit(0)
  })
  .catch(err => {
    console.error(err)
    process.exit(1)  
  })