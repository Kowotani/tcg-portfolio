import { TDataResBody, TProductPostResBody, TResBody } from './api';
import { IHolding, IPopulatedHolding, IPopulatedPortfolio, IPortfolio, IPrice, IPriceData, IProduct, ITransaction, ProductSubtype, ProductType, TCG, IDatedPriceData } from './dataModels';
export declare const DAYS_PER_YEAR = 365;
export declare const MILLISECONDS_PER_SECOND = 1000;
export declare const SECONDS_PER_DAY = 86400;
export declare function assert(condition: any, msg?: string): asserts condition;
export declare function getPriceFromString(value: string): number;
export declare function getProductSubtypes(tcg: TCG, productType: ProductType): ProductSubtype[];
export declare function isASCII(value: string): boolean;
export declare function isNumeric(value: any): boolean;
export declare function isPriceString(value: string): boolean;
export declare function isTCGPriceTypeValue(value: string): boolean;
export declare function logObject(arg: Object): void;
export declare function sleep(ms: number): Promise<any>;
export declare function sortFnDateAsc(a: Date, b: Date): number;
export declare function sortFnDateDesc(a: Date, b: Date): number;
export declare function hasIHoldingBaseKeys(arg: any): boolean;
export declare function hasIHoldingKeys(arg: any): boolean;
export declare function hasIPopulatedHoldingKeys(arg: any): boolean;
export declare function hasIPopulatedPortfolioKeys(arg: any): boolean;
export declare function hasIPortfolioBaseKeys(arg: any): boolean;
export declare function hasIPortfolioKeys(arg: any): boolean;
export declare function isDate(arg: any): arg is Date;
export declare function isIDatedPriceData(arg: any): arg is IDatedPriceData;
export declare function isIHolding(arg: any): arg is IHolding;
export declare function isIHoldingArray(arg: any): arg is IHolding[];
export declare function isIPopulatedHolding(arg: any): arg is IPopulatedHolding;
export declare function isIPopulatedPortfolio(arg: any): arg is IPopulatedPortfolio;
export declare function isIPopulatedPortfolioArray(arg: any): arg is IPopulatedPortfolio[];
export declare function isIPortfolio(arg: any): arg is IPortfolio;
export declare function isIPortfolioArray(arg: any): arg is IPortfolio[];
export declare function isIPrice(arg: any): arg is IPrice;
export declare function isIPriceArray(arg: any): arg is IPrice;
export declare function isIPriceData(arg: any): arg is IPriceData;
export declare function isIPriceDataArray(arg: any): arg is IPriceData[];
export declare function isIProduct(arg: any): arg is IProduct;
export declare function isITransaction(arg: any): arg is ITransaction;
export declare function isITransactionArray(arg: any): arg is ITransaction[];
export declare function isTResBody(arg: any): arg is TResBody;
export declare function isTDataResBody<Type>(arg: any): arg is TDataResBody<Type>;
export declare function isTProductPostResBody<Type>(arg: any): arg is TProductPostResBody<Type>;
