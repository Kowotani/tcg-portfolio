const scrapeManager = require('../dist/scraper/scrapeManager')
const tcgcsvUtils = require('../dist/utils/tcgcsv')
const commonUtils = require('common')

// load non Secret Lair Products
tcgcsvUtils.TCG_TO_TCCATEGORY.forEach(async (value, key) => {
  console.log(`Scraping Products for TCG [${key}, ${value.categoryId}]...`)
  const releaseDate = commonUtils.getDateOneMonthAgo()
  const params = {
    categoryId: value.categoryId,
    releaseDate: releaseDate
  }
  await scrapeManager
    .loadTCProducts(params)
    .then(res => {
      console.log(`${res} TCProduct documents were loaded for: ${key}`)
      process.exit(0)
    })
    .catch(err => {
      console.error(err)
      process.exit(1)  
    })
})