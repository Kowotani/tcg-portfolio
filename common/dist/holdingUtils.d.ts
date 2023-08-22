import { IHolding, IPopulatedHolding, ITransaction } from './dataModels';
export declare function getHoldingAverageCost(holding: IHolding | IPopulatedHolding): number | undefined;
export declare function getHoldingAverageRevenue(holding: IHolding | IPopulatedHolding): number | undefined;
export declare function getHoldingPercentPnl(holding: IHolding | IPopulatedHolding, price: number): number | undefined;
export declare function getHoldingPurchases(holding: IHolding | IPopulatedHolding): ITransaction[];
export declare function getHoldingPurchaseQuantity(holding: IHolding | IPopulatedHolding): number;
export declare function getHoldingQuantity(holding: IHolding | IPopulatedHolding): number;
export declare function getHoldingRealizedPnl(holding: IHolding | IPopulatedHolding): number | undefined;
export declare function getHoldingSales(holding: IHolding | IPopulatedHolding): ITransaction[];
export declare function getHoldingSaleQuantity(holding: IHolding | IPopulatedHolding): number;
export declare function getHoldingTotalCost(holding: IHolding | IPopulatedHolding): number;
export declare function getHoldingTotalPnl(holding: IHolding | IPopulatedHolding, price: number): number | undefined;
export declare function getHoldingTotalRevenue(holding: IHolding | IPopulatedHolding): number;
export declare function getHoldingUnrealizedPnl(holding: IHolding | IPopulatedHolding, price: number): number | undefined;
