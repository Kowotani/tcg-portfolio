const browserObject = require('./browser');
const scraperController = require('./pageController');

//Start the browser and create a browser instance
let browserInstance = browserObject.startBrowser();

// Pass the browser instance to the scraper controller
const urls = [
    // 'https://www.tcgplayer.com/product/251641/',
    // 'https://www.tcgplayer.com/product/121527/',
    // 'https://www.tcgplayer.com/product/221312/',
    // 'https://www.tcgplayer.com/product/285223/',
    // 'https://www.tcgplayer.com/product/126443/',
    // 'https://www.tcgplayer.com/product/488275/',
    // 'https://www.tcgplayer.com/product/488726/',
    // 'https://www.tcgplayer.com/product/488271/',
    // 'https://www.tcgplayer.com/product/478278/',
    'https://www.tcgplayer.com/product/479432/',
    'https://www.tcgplayer.com/product/4351/',
    'https://www.tcgplayer.com/product/478532/'
]
scraperController(browserInstance, urls)