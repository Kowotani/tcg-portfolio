// imports
import { getBrowser } from './browser';
import { getPriceFromString, IPriceData, IProductPriceData, isPriceString, 
    isTCGPriceTypeValue, TCGPriceType } from '../utils'


/*
DESC
    Scrapes price data for the input tcgplayerIds
INPUT
    Array of tcgplayerIds
RETURN
    Array of IProductPriceData objects
*/
export async function scrape(ids: Number[]): Promise<IProductPriceData[]> {

    // create browser instance and page
    const browser = await getBrowser();
    if (browser === undefined) {
        console.log('Browser not instantiated. Returning empty array')
        return [];
    }
    const page = await browser.newPage();

    // store return data
    let scrapeData: IProductPriceData[] = [];

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

            // create IProductPriceData
            const productPriceData: IProductPriceData = {
                tcgplayerId: id,
                priceData: priceData
            }
            scrapeData.push(productPriceData);               

        } 
        catch(err) {

            console.log(`Error scraping from ${url}: ${err}`);
        }
    }

    return scrapeData;
}