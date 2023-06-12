const pageScraper = require('./pageScraper');
async function scrapeAll(browserInstance, urls){
	
	let browser;
	try {
		browser = await browserInstance;
		await pageScraper.scraper(browser, urls);	
		
	}
	catch(err) {
		console.log("Could not resolve the browser instance => ", err);
	}
}

module.exports = (browserInstance, urls) => scrapeAll(browserInstance, urls)