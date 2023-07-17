// imports
import { getBrowser } from './browser';
import { getPriceFromString, IPriceData, isPriceString, 
    isTCGPriceTypeValue, TCGPriceType } from 'common'


/*
DESC
    Scrapes price data for the input tcgplayerIds
INPUT
    Array of tcgplayerIds
RETURN
    Array of IProductPriceData objects
*/
export async function scrape(ids: number[]): Promise<Map<number, IPriceData>> {

    // create browser instance and page
    const browser = await getBrowser();
    if (browser === undefined) {
        console.log('Browser not instantiated. Returning empty map')
        return new Map<number, IPriceData>();
    }
    const page = await browser.newPage();

    // store return data
    let scrapeData: Map<number, IPriceData> = new Map<number, IPriceData>();

    // iterate through ids
    const baseUrl = 'https://www.tcgplayer.com/product/';
    for (const id of ids) {
        const url = baseUrl + id + '/';

        // navigate to the url
        console.log(`Navigating to ${url} ...`);
        try {
            await page.goto(url);
        } catch(err) {
            console.log(`Error navigating to ${url}: ${err}`);
        }

        // wait for price guide to load
        await page.waitForSelector('.price-guide__points');

        // const validText: string[] = Object.values(TCGPriceType);
        const headerPath = '.price-guide__points > table > tr:not(.price-points__header)';

        // create price object
        try {

            // scrape text from divs
            const scrapedTexts = await page.$$eval(headerPath, rows => {
                let scrapedText: {text: string, price: string}[] = [];
                for (const row of rows) {
                    const divText = row?.querySelector('.text')?.textContent?.trim() ?? '';
                    const divPrice = row?.querySelector('.price')?.textContent?.trim() ?? '';
                    if (divText.length > 0 && divPrice.length > 0) {
                        scrapedText.push({text: divText, price: divPrice});
                    }
                }
                return scrapedText;
            })
            
            // parse scraped text
            let data: any = {};
            for (const st of scrapedTexts) {
                if (isTCGPriceTypeValue(st.text) && isPriceString(st.price)) {
                    data[st.text] = getPriceFromString(st.price);
                }
            }

            // create IPriceData
            let priceData: IPriceData = {
                marketPrice: data[TCGPriceType.MarketPrice] || null,
                buylistMarketPrice: data[TCGPriceType.BuylistMarketPrice] || null,
                listedMedianPrice: data[TCGPriceType.ListedMedianPrice] || null,
            };

            scrapeData.set(id, priceData);               

        } 
        catch(err) {

            console.log(`Error scraping from ${url}: ${err}`);
        }
    }

    return scrapeData;
}