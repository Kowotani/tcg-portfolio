const scrapeManager = require('../dist/scraper/scrapeManager')

function main() {
  return __awaiter(this, void 0, void 0, function* () {
    const numInserted = yield scrapeManager.loadCurrentPrices()
    return numInserted
  });
}
main()
  .then(console.log)
  .catch(console.error)