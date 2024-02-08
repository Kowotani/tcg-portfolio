const priceDbi = require('../dist/mongo/dbi/Price')

priceDbi
  .updateHistoricalPrices()
  .then(res => {
    if (res) {
      console.log('Historical prices updated successfully')
    } else {
      console.log('Historical prices were not updated')
    }
    process.exit(0)
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })