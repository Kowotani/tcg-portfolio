const scrapeManager = require('../dist/scraper/scrapeManager')
const chartUtils = require('../dist/utils/Chart')

scrapeManager
  .loadTcgplayerHistoricalPrices(chartUtils.TcgPlayerChartDateRange.OneYear)
  .then(res => {
    console.log(`${res} price documents were loaded`) 
    process.exit(0)
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })