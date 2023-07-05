// =====
// enums
// =====

// -- mongodb

export enum TimeseriesGranularity {
    Seconds = 'seconds',
    Minutes = 'minutes',
    Hours = 'hours',
};

// -- scraper 

// TCG price types
export enum TCGPriceType {
    MarketPrice = 'Market Price',
    BuylistMarketPrice = 'Buylist Market Price',
    ListedMedianPrice = 'Listed Median Price',
}


// ==========
// interfaces
// ==========

// used with IProductPriceData for storing scraped price data
export interface IPriceData {
    marketPrice: Number;
    buylistMarketPrice: Number;
    listedMedianPrice: Number;
}

// used with IPriceData for storing scraped price data
export interface IProductPriceData {
    tcgplayerId: Number;
    priceData: IPriceData;
}


// =========
// functions
// =========

/*
DESC
    Converts a price string (determined by isPriceString()) to a number
INPUT
    A string to convert
RETURN
    The extracted price as a number from the string (eg. '$123.45' => 123.45)
    Will return NaN if the input is not a price string
*/
export function getPriceFromString(value: string): number {
    return isPriceString(value)
        ? parseFloat(value.substring(1))
        : NaN
}

/*
DESC
    Returns whether the input is a valid price string
INPUT
    A string to check
RETURN
    TRUE if the input follows the following regex (which roughtly corresponds
        to numbers like $123.45), FALSE otherwise
    regex = ^\$\d+\.\d{2}$
*/
export function isPriceString(value: string): boolean {
    const regexp = new RegExp('^\\$\\d+\\.\\d{2}$');
    return regexp.test(value);
}

/*
DESC
    Returns whether the input string matches a TCGPriceType value
INPUT
    A string to check
RETURN
    TRUE if the input matches a TCGPriceType value
*/
export function isTCGPriceTypeValue(value: string): boolean {
    const arr = Object.values(TCGPriceType).map(v => v.toString());
    return arr.includes(value);
}