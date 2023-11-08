const priceDbi = require('../dist/mongo/dbi/Price')

priceDbi
  .updateHistoricalPrices()
  .then(res => {
    if (res) {
      console.log('Historical prices updated successfully')
    } else {
      console.log('Historical prices were not updated')
    }
  })
  .catch(err => {
    console.log(err)
  })