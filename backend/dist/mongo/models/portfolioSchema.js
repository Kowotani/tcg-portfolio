"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.portfolioSchema = void 0;
const mongoose_1 = require("mongoose");
const holdingSchema_1 = require("./holdingSchema");
// ==========
// properties
// ==========
exports.portfolioSchema = new mongoose_1.Schema({
    userId: {
        type: Number,
        required: true
    },
    portfolioName: {
        type: String,
        required: true
    },
    holdings: {
        type: [holdingSchema_1.holdingSchema],
        required: true
    },
    description: {
        type: String,
    }
});
// =======
// methods
// =======
// // -- holdings
// // add holdings
// portfolioSchema.method('addHoldings', 
//   function addHoldings(holdingInput: IMHolding | IMHolding[]): void {
//     Array.isArray(holdingInput)
//       ? this.holdings = this.holdings.concat(holdingInput)
//       : this.holdings.push(holdingInput)
//     this.save()
// });
// // delete holding
// portfolioSchema.method('deleteHolding',
//   function deleteHolding(tcgplayerId: number): void {
//     this.holdings = this.holdings.filter((holding: IMHolding) => {
//       return holding.tcgplayerId !== tcgplayerId
//     })
//     this.save()
// });
// // delete holdings
// portfolioSchema.method('deleteHoldings',
//   function deleteHoldings(): void {
//     this.holdings = []
//     this.save()
// });
// // -- getters
// /* 
//   TODO:
//   getTotalRevenue
//   getProfit
//   account for profit in returns
// */ 
// // get user ID
// portfolioSchema.method('getUserId', 
//   function getUserId(): number {
//     return this.userId
// });
// // get portfolio name
// portfolioSchema.method('getPortfolioName', 
//   function getPortfolioName(): string {
//     return this.portfolioName
// });
// // get description
// portfolioSchema.method('getDescription', 
//   function getDescription(): string | undefined {
//     return this.description
// });
// // get holdings
// portfolioSchema.method('getHoldings', 
//   function getHoldings(): IMHolding[] {
//     return this.holdings
// });
// // -- checkers
// // holding exists
// portfolioSchema.method('hasHolding',
//   function hasHolding(tcgplayerId: number): boolean {
//     return this.holdings.filter((holding: IMHolding) => {
//       return holding.tcgplayerId === tcgplayerId
//     }).length > 0
//   }
// )
// // -- return inputs
// // get total cost
// portfolioSchema.method('getTotalCost', 
//   function getTotalCost(): number | undefined {
//     return this.getHoldings().length > 0
//       ? _.sum(this.getHoldings().map(
//         (holding: typeof holdingSchema) => {
//           return holding.methods.getTotalCost()
//         }))
//       : undefined
// });
// // get market value
// portfolioSchema.method('getMarketValue', 
//   function getMarketValue(prices: Map<number, number>): number | undefined {
//     return this.getHoldings().length > 0
//       ? _.sum(this.getHoldings().map(
//         (holding: typeof holdingSchema) => {
//           const price = prices.get(
//             holding.methods.getProduct().tcgplayerId) ?? 0
//           return holding.methods.getMarketValue(price)
//         }))
//       : undefined
// });
// // -- returns
// // get dollar return
// portfolioSchema.method('getDollarReturn', 
//   function getDollarReturn(prices: Map<number, number>): number | undefined {
//     return this.getPurchases().length > 0
//       ? this.getMarketValue(prices) - this.getTotalCost()
//       : undefined
// });
// // get percentage return
// portfolioSchema.method('getPercentageReturn', 
//   function getPercentageReturn(prices: Map<number, number>): number | undefined {
//     return this.getPurchases().length > 0
//       ? this.getMarketValue(prices) / this.getTotalCost() - 1
//       : undefined
// });
