// imports
import { Browser } from 'puppeteer';
import puppeteer from 'puppeteer';

export async function getBrowser(): Promise<Browser | undefined>{
	try {

        console.log("Opening the browser ...");
        const browser = await puppeteer.launch({
            headless: "new",
            args: ["--disable-setuid-sandbox"],
            'ignoreHTTPSErrors': true,
        });
        return browser;

	} catch (err) {

		console.log("Could not create a browser instance: ", err);
	}
}