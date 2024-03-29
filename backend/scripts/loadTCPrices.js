const scrapeManager = require('../dist/scraper/scrapeManager')
const tcgcsvUtils = require('../dist/utils/tcgcsv')


const main = async function() {

  // log TCGroups
  tcgcsvUtils.TCG_TO_TCCATEGORY.forEach((value) => {
    console.log(`Scraping Prices for TCG [${value.name}, ${value.categoryId}]...`)
  })

  // construct promises
  const promises = [...tcgcsvUtils.TCG_TO_TCCATEGORY.values()].map((value) => {
    return scrapeManager
      .loadTcgcsvPrices(value.categoryId)
      .then(res => {
        console.log(`${res} Price documents from TCGCSV were loaded for ${value.name}`)
        return res
      })
      .catch(err => {
        console.error(err)
        process.exit(1)  
      })
  })

  Promise.all(promises)
    .then(res => {
      const total = res.reduce((acc, cur) => acc + cur, 0)
      console.log(`Loaded ${total} Price documents in total`)
      process.exit(0)
    })
}

main()
