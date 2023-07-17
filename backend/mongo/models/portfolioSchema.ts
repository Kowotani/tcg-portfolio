import { Model, Schema } from 'mongoose';
import { holdingSchema } from './holdingSchema';
import * as _ from 'lodash';
import { IHolding, IPortfolio, IPortfolioMethods } from 'common';
// https://mongoosejs.com/docs/typescript/statics-and-methods.html

export type TPortfolioModel = Model<IPortfolio, {}, IPortfolioMethods>


// ==========
// properties
// ==========

export const portfolioSchema = new Schema<IPortfolio, TPortfolioModel, IPortfolioMethods>({
    userId: {
        type: Number,
        required: true
    },
    portfolioName: {
        type: String,
        required: true
    },
    holdings: {
        type: [holdingSchema],
        ref: 'Holding',
        required: true
    },
});


// =======
// methods
// =======

// -- holdings

// add holding
portfolioSchema.method('addHolding', 
    function addHolding(holding: IHolding): void {
        this.holdings.push(holding)
});

// TODO: should this be ObjectId or tcgplayerId?
// delete holding
portfolioSchema.method('deleteHolding',
    function deleteHolding(tcgplayerId: number): void {
        this.holdings.filter((holding: typeof holdingSchema) => {
            return holding.methods.getProduct().tcgplayerId !== tcgplayerId
        })
});

// -- getters

// get holdings
portfolioSchema.method('getHoldings', 
    function getHoldings(): IHolding[] {
        return this.holdings
});

// get first purchase date
portfolioSchema.method('getFirstPurchaseDate', 
    function getFirstPurchaseDate(): Date | undefined {
        return this.getHoldings().length > 0 
            ? _.min(this.getHoldings().map(
                (holding: typeof holdingSchema) => { 
                    return holding.methods.getFirstPurchaseDate()
                }))
            : undefined
});

// get last purchase date
portfolioSchema.method('getLastPurchaseDate', 
    function getLastPurchaseDate(): Date | undefined {
        return this.getHoldings().length > 0 
            ? _.max(this.getHoldings().map(
                (holding: typeof holdingSchema) => { 
                    return holding.methods.getFirstPurchaseDate()
                }))
            : undefined
});

// -- return inputs

// get total cost
holdingSchema.method('getTotalCost', 
    function getTotalCost(): number | undefined {
        return this.getHoldings().length > 0
            ? _.sum(this.getHoldings().map(
                (holding: typeof holdingSchema) => {
                    return holding.methods.getTotalCost()
                }))
            : undefined
});

// get market value
holdingSchema.method('getMarketValue', 
    function getMarketValue(prices: Map<number, number>): number | undefined {
        return this.getHoldings().length > 0
            ? _.sum(this.getHoldings().map(
                (holding: typeof holdingSchema) => {
                    const price = prices.get(
                        holding.methods.getProduct().tcgplayerId) ?? 0
                    return holding.methods.getMarketValue(price)
                }))
            : undefined
});

// -- returns

// get dollar return
holdingSchema.method('getDollarReturn', 
    function getDollarReturn(prices: Map<number, number>): number | undefined {
        return this.getPurchases().length > 0
            ? this.getMarketValue(prices) - this.getTotalCost()
            : undefined
});

// get percentage return
holdingSchema.method('getPercentageReturn', 
    function getPercentageReturn(prices: Map<number, number>): number | undefined {
        return this.getPurchases().length > 0
            ? this.getMarketValue(prices) / this.getTotalCost() - 1
            : undefined
});

// get annualized return
holdingSchema.method('getAnnualizedReturn', 
    function getAnnualizedReturn(prices: Map<number, number>): number | undefined {

        if (this.getPurchases().legnth === 0) {
            return undefined
        }

        const elapsedDays = (new Date().getTime() 
            - this.getFirstPurchaseDate().getTime()) / 86400 / 1000

        return Math.pow(1 + this.getPercentageReturn(prices), 365 / elapsedDays) - 1
});