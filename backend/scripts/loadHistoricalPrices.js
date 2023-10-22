const scrapeManager = require('../dist/scraper/scrapeManager')
const utils = require("../dist/utils")

scrapeManager
  .loadHistoricalPrices(utils.TcgPlayerChartDateRange.ThreeMonths)
  .then(res => {
    console.log(`${res} price documents were loaded`) 
  })
  .catch(err => {
    console.log(err)
  })