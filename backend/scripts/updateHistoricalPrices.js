const commonUtils = require('common')
const priceDbi = require('../dist/mongo/dbi/Price')

const main = async function() {

  // log TCGs
  Object.values(commonUtils.TCG).forEach((value) => {
    console.log(`Updating historical prices for ${value}...`)
  })

  // construct promises
  const promises = [...Object.values(commonUtils.TCG)].map((value) => {
    return priceDbi
      .updateHistoricalPrices(value)
      .then(res => {
          console.log(`Historical prices updated for ${value}`)
          return true
      })
      .catch(err => {
        console.error(err)
        process.exit(1)
      })
  })
    
  Promise.all(promises)
    .then(res => {
      console.log(`Updated historical prices for all TCGs`)
      process.exit(0)
    })
}

main()