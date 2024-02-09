const scrapeManager = require('../dist/scraper/scrapeManager')
const tcgcsvUtils = require('../dist/utils/tcgcsv')


const main = async function() {

  // log TCGroups
  tcgcsvUtils.TCG_TO_TCCATEGORY.forEach((value) => {
    console.log(`Scraping Groups for TCG [${value.name}, ${value.categoryId}]...`)
  })

  // construct promises
  const promises = [...tcgcsvUtils.TCG_TO_TCCATEGORY.values()].map((value) => {
    return scrapeManager
      .loadTCGroups(value.categoryId)
      .then(res => {
        console.log(`${res} TCGroup documents were loaded for ${value.name}`)
      })
      .catch(err => {
        console.error(err)  
      })
  })

  const res = await Promise.all(promises)
  process.exit(0)
}

main()