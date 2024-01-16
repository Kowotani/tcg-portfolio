import { TDataResBody, TProductPostResBody, TResBody } from './api';
import { IDatedPriceData, IHolding, IPopulatedHolding, IPopulatedPortfolio, IPortfolio, IPrice, IPriceData, IProduct, ITCCategory, ITCGroup, ITCProduct, ITransaction, TDatedValue, TPerformanceData } from './dataModels';
export declare function isTResBody(arg: any): arg is TResBody;
export declare function isTDataResBody<Type>(arg: any): arg is TDataResBody<Type>;
export declare function isTProductPostResBody<Type>(arg: any): arg is TProductPostResBody<Type>;
export declare function hasIHoldingBaseKeys(arg: any): boolean;
export declare function hasIHoldingKeys(arg: any): boolean;
export declare function hasIPopulatedHoldingKeys(arg: any): boolean;
export declare function isIHolding(arg: any): arg is IHolding;
export declare function isIHoldingArray(arg: any): arg is IHolding[];
export declare function isIPopulatedHolding(arg: any): arg is IPopulatedHolding;
export declare function isIProduct(arg: any): arg is IProduct;
export declare function hasIPopulatedPortfolioKeys(arg: any): boolean;
export declare function hasIPortfolioBaseKeys(arg: any): boolean;
export declare function hasIPortfolioKeys(arg: any): boolean;
export declare function isIPopulatedPortfolio(arg: any): arg is IPopulatedPortfolio;
export declare function isIPopulatedPortfolioArray(arg: any): arg is IPopulatedPortfolio[];
export declare function isIPortfolio(arg: any): arg is IPortfolio;
export declare function isIPortfolioArray(arg: any): arg is IPortfolio[];
export declare function hasIDatedPriceDataKeys(arg: any): boolean;
export declare function isIDatedPriceData(arg: any): arg is IDatedPriceData;
export declare function isIPrice(arg: any): arg is IPrice;
export declare function isIPriceArray(arg: any): arg is IPrice;
export declare function isIPriceData(arg: any): arg is IPriceData;
export declare function isIPriceDataArray(arg: any): arg is IPriceData[];
export declare function hasIProductKeys(arg: any): boolean;
export declare function hasTCCategoryKeys(arg: any): boolean;
export declare function hasITCCategoryKeys(arg: any): boolean;
export declare function isITCCategory(arg: any): arg is ITCCategory;
export declare function hasITCGroupKeys(arg: any): boolean;
export declare function isITCGroup(arg: any): arg is ITCGroup;
export declare function hasITCProductKeys(arg: any): boolean;
export declare function isITCProduct(arg: any): arg is ITCProduct;
export declare function hasTDatedValueKeys(arg: any): boolean;
export declare function isTDatedvalue(arg: any): arg is TDatedValue;
export declare function isTDatedvalueArray(arg: any): arg is TDatedValue[];
export declare function hasTPerformanceDataKeys(arg: any): boolean;
export declare function isTPerformanceData(arg: any): arg is TPerformanceData;
export declare function hasITransactionKeys(arg: any): boolean;
export declare function isITransaction(arg: any): arg is ITransaction;
export declare function isITransactionArray(arg: any): arg is ITransaction[];
