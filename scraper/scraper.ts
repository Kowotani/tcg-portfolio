// imports
import { getBrowser } from './browser';
import { getPriceFromString, isPriceString, TCGPriceType } from '../utils'


/*
DESC
    Scrapes price data for the input tcgplayer_ids
INPUT
    Array of tcgplayer_ids
RETURN
    Array of ProductPriceData objects
*/
interface IPriceData {
    marketPrice: Number;
    buylistMarketPrice?: Number;
    listedMedianPrice?: Number;
}
interface IProductPriceData {
    tcgplayerId: Number;
    priceData: IPriceData;
}
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
    
        // create price object
        try {

            // variables
            const validText: string[] = Object.values(TCGPriceType);
            const headerPath = '.price-guide__points > table > tr:not(.price-points__header)';

            // scrape price from divs
            const prices = await page.$$eval(headerPath, rows => {
                let data: any = {};
                for (const row of rows) {
                    const divText = row?.querySelector('.text')?.textContent?.trim() ?? '';
                    const divPrice = row?.querySelector('.price')?.textContent?.trim() ?? '';
                    if (validText.includes(divText) && isPriceString(divPrice)) {
                        data[divText] = getPriceFromString(divPrice);
                    }
                }
                return data;
            })

            // create IPriceData
            
            // skip if market price does not exist
            if (!(Object.keys(prices).includes(TCGPriceType.MarketPrice))) {
                console.log(`Could not scrape Market Price for tcgplyer_id: ${id}`)
                break;
            }

            let priceData: IPriceData = {
                marketPrice: prices[TCGPriceType.MarketPrice],
            }

            if (Object.keys(prices).includes(TCGPriceType.BuylistMarketPrice)) {
                priceData['buylistMarketPrice'] = prices[TCGPriceType.BuylistMarketPrice];
            }

            if (Object.keys(prices).includes(TCGPriceType.ListedMedianPrice)) {
                priceData['listedMedianPrice'] = prices[TCGPriceType.ListedMedianPrice];
            }

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