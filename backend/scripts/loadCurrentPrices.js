const scrapeManager = require('../dist/scraper/scrapeManager')

scrapeManager
  .loadCurrentPrices()
  .then(res => {
    console.log(`${numInserted} price documents were loaded`) 
  })
  .catch(err => {
    console.log(err)
  })