const scrapeManager = require('../dist/scraper/scrapeManager')

scrapeManager
  .loadCurrentPrices()
  .then(res => {
    console.log(`${res} price documents were loaded`) 
  })
  .catch(err => {
    console.log(err)
  })