"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHoldingTotalCostAsDatedValues = exports.getHoldingMarketValueAsDatedValues = void 0;
// imports
const common_1 = require("common");
const Price_1 = require("./Price");
const dfu = __importStar(require("../../utils/danfo"));
const Holding_1 = require("../../utils/Holding");
// =========
// functions
// =========
/*
DESC
  Returns the market value of the input Portfolio between the startDate and
  endDate
INPUT
  holding: A IHolding
  startDate: The start date for market value calculation
  endDate: The end date for market value calculation
*/
function getHoldingMarketValueAsDatedValues(holding, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        // get price map
        const tcgplayerId = (0, common_1.getHoldingTcgplayerId)(holding);
        const priceMap = yield (0, Price_1.getPriceMapOfSeries)([tcgplayerId], startDate, endDate);
        const priceSeries = priceMap.get(tcgplayerId);
        // get market value
        const marketValueSeries = (0, Holding_1.getHoldingMarketValueSeries)(holding, priceSeries, startDate, endDate);
        return dfu.getDatedValuesFromSeries(marketValueSeries);
    });
}
exports.getHoldingMarketValueAsDatedValues = getHoldingMarketValueAsDatedValues;
/*
DESC
  Returns the total cost of the input Holding between the startDate and
  endDate
INPUT
  holding: An IHolding
  startDate: The start date for market value calculation
  endDate: The end date for market value calculation
*/
function getHoldingTotalCostAsDatedValues(holding, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        // get total cost
        const totalCostSeries = (0, Holding_1.getHoldingTotalCostSeries)(holding, startDate, endDate);
        return dfu.getDatedValuesFromSeries(totalCostSeries);
    });
}
exports.getHoldingTotalCostAsDatedValues = getHoldingTotalCostAsDatedValues;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let res;
        // const userId = 1234
        // const portfolioName = 'Delta'
        // const tcgplayerId = 121527
        // const description = 'Washer dryer mechanic'
        // let holdings: IHolding[] = [
        //   {
        //     tcgplayerId: 233232,
        //     transactions: [
        //       {
        //         type: TransactionType.Purchase,
        //         date: new Date(),
        //         price: 99,
        //         quantity: 1,
        //       },
        //       {
        //         type: TransactionType.Sale,
        //         date: new Date(),
        //         price: 99,
        //         quantity: 2,
        //       },        
        //     ],
        //   },
        // ]
        // const portfolio: IPortfolio = {
        //   userId: userId, 
        //   portfolioName: portfolioName,
        //   holdings: [],
        // }
        // const portfolioDoc = await getPortfolioDoc(portfolio) as IPortfolio
        // const holding = getPortfolioHolding(portfolioDoc, tcgplayerId) as IHolding
        // const startDate = new Date(Date.parse('2023-09-01'))
        // const endDate = new Date(Date.parse('2023-09-14'))
        // const priceMap = await getPriceMapOfSeries([tcgplayerId])
        // const priceSeries = priceMap.get(tcgplayerId) as df.Series
        // const series = await getHoldingTotalCostAsDatedValues(holding, startDate, endDate)
        // console.log(series)
        // const twr = dfu.getHoldingTimeWeightedReturn(holding, priceSeries, startDate, endDate)
        // console.log(twr)
        // const newPortfolio: IPortfolio = {
        //   userId: userId, 
        //   portfolioName: portfolioName,
        //   holdings: holdings,
        // }
        // res = await setPortfolio(portfolio, newPortfolio)
        // if (res) {
        //   console.log('Portfolio successfully set')
        // } else {
        //   console.log('Portfolio not set')
        // }
        return 0;
    });
}
main()
    .then(console.log)
    .catch(console.error);
