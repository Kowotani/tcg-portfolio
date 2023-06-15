// imports
const browserObj = require('./browser');

/*
DESC: Scrapes price data for the input ids
INPUT; Array of ids
RETURN: Array of objects containing price data
    for each of the input ids
*/
async function scrape(ids) {

    // create browser instance and page
    const browser = await browserObj.getBrowser()
    const page = await browser.newPage();

    // store return data
    let scrapeData = {}

    for (const id of ids) {
        const url = 'https://www.tcgplayer.com/product/' + id + '/'

        // navigate to the url
        console.log(`Navigating to ${url} ...`);
        try {
            await page.goto(url);
        } catch(err) {
            console.log(`Error navigating to ${url}: ${err}`)
        }

        // wait for price guide to load
        await page.waitForSelector('.price-guide__points')
    
        // create price object
        try {
            const prices = await page.$$eval('.price-guide__points > table > tr:not(.price-points__header)', rows => {
                let data = {}
                for (const row of rows) {
                    const priceType = row.querySelector('.text').textContent.trim()
                    const price = row.querySelector('.price').textContent === '-' 
                        ? null
                        : parseFloat(row.querySelector('.price').textContent.substring(1))
                    data[priceType] = price
                }
                return data
            })
            scrapeData[id] = prices
        } 
        catch(err) {
            console.log(`Error scraping from ${url}: ${err}`)
        }
    }
    return scrapeData
}

module.exports = { scrape }