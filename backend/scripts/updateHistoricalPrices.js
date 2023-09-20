const mongoManager = require('../dist/mongo/mongoManager')

mongoManager
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