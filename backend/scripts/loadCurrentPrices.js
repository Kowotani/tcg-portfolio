const scrapeManager = require('../dist/scraper/scrapeManager')

scrapeManager
  .loadTcgplayerCurrentPrices()
  .then(res => {
    console.log(`${res} price documents were loaded`)
    process.exit(0) 
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })