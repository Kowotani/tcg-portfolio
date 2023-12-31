import { IHolding, IHoldingMethods, IPortfolio, IPortfolioMethods, ITransaction } from './dataModels';
export declare class Holding implements IHolding, IHoldingMethods {
    tcgplayerId: number;
    transactions: ITransaction[];
    constructor(tcgplayerId: number, transactions: ITransaction[]);
    addTransactions(txnInput: ITransaction | ITransaction[]): void;
    deleteTransaction(txn: ITransaction): void;
    deleteTransactions(): void;
    getAnnualizedReturn(price: number): number | undefined;
    getAverageCost(): number | undefined;
    getAverageRevenue(): number | undefined;
    getDollarReturn(price: number): number | undefined;
    getFirstPurchaseDate(): Date | undefined;
    getLastPurchaseDate(): Date | undefined;
    getMarketValue(price: number): number | undefined;
    getPercentageReturn(price: number): number | undefined;
    getProfit(): number | undefined;
    getPurchases(): ITransaction[];
    getPurchaseQuantity(): number;
    getQuantity(): number;
    getSales(): ITransaction[];
    getSaleQuantity(): number;
    getTcgplayerId(): number;
    getTotalCost(): number | undefined;
    getTotalRevenue(): number;
    getTransactions(): ITransaction[];
    hasPurchases(): boolean;
    hasSales(): boolean;
}
export declare class Portfolio implements IPortfolio, IPortfolioMethods {
    userId: number;
    portfolioName: string;
    holdings: Holding[];
    description?: string;
    constructor(userId: number, portfolioName: string, holdings: Holding[], description?: string);
    addHoldings(holdingInput: Holding | Holding[]): void;
    deleteHolding(tcgplayerId: number): void;
    deleteHoldings(): void;
    getDescription(): string | undefined;
    getDollarReturn(prices: Map<number, number>): number | undefined;
    getHoldings(): Holding[];
    getMarketValue(prices: Map<number, number>): number | undefined;
    getPercentageReturn(prices: Map<number, number>): number | undefined;
    getProfit(): number | undefined;
    getPortfolioName(): string;
    getTotalCost(): number | undefined;
    getTotalRevenue(): number | undefined;
    getUserId(): number;
    hasHolding(tcgplayerId: number): boolean;
    hasHoldings(): boolean;
    hasPurchases(): boolean;
    hasSales(): boolean;
}
