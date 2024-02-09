const scrapeManager = require('../dist/scraper/scrapeManager')
const tcgcsvUtils = require('../dist/utils/tcgcsv')
const commonUtils = require('common')


// load non Secret Lair Products
const main = async function() {

  // log TCGroups
  tcgcsvUtils.TCG_TO_TCCATEGORY.forEach((value) => {
    console.log(`Scraping Products for TCG [${value.name}, ${value.categoryId}]...`)
  })

  // get releaseDate cutoff
  const releaseDate = commonUtils.getDateOneMonthAgo()

  // construct promises
  const promises = [...tcgcsvUtils.TCG_TO_TCCATEGORY.values()].map((value) => {
    const params = {
      categoryId: value.categoryId,
      releaseDate: releaseDate
    }

    return scrapeManager
      .loadTCProducts(params)
      .then(res => {
        console.log(`${res} TCProduct documents were loaded for ${value.name}`)
      })
      .catch(err => {
        console.error(err)  
      })
  })

  const res = await Promise.all(promises)
  process.exit(0)
}

main()