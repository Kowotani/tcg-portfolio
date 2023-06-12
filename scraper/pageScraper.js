const scraperObject = {
	
	async scraper(browser, urls) {
		let page = await browser.newPage();
		for (const url of urls) {
		  
            console.log(`Navigating to ${url}...`);
            await page.goto(url);
            
            // wait for price guide to load
            await page.waitForSelector('.price-guide__points')
            
            // create price object
            const prices = await page.$$eval('.price-guide__points > table > tr:not(.price-points__header)', rows => {
                var data = {}
                for (const row of rows) {
                    const priceType = row.querySelector('.text').textContent.trim()
                    const price = row.querySelector('.price').textContent === '-' 
                        ? null
                        : parseFloat(row.querySelector('.price').textContent.substring(1))
                    data[priceType] = price
                }
                return data
            })
            console.log(prices)
            
        }
	}
}

module.exports = scraperObject;