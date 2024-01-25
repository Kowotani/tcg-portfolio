const scrapeManager = require('../dist/scraper/scrapeManager')
const tcgcsvUtils = require('../dist/utils/tcgcsv')
const commonUtils = require('common')

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
  })
  .catch(err => {
    console.log(err)  
  })

// load remaining TCGs and Products
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
    })
    .catch(err => {
      console.log(err)  
    })
})