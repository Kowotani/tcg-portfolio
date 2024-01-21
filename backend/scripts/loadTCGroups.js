const scrapeManager = require('../dist/scraper/scrapeManager')
const tcgcsvUtils = require('../dist/utils/tcgcsv')

tcgcsvUtils.TCG_TO_TCCATEGORY.forEach(async (value, key) => {
  console.log(`Scraping TCG [${key}, ${value.categoryId}]...`)
  await scrapeManager
    .loadTCGroups(value.categoryId)
    .then(res => {
      console.log(`${res} Group documents were loaded for ${key}`)
    })
    .catch(err => {
      console.log(err)  
    })
})