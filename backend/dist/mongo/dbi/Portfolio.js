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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPortfolio = exports.getPortfolios = exports.getPortfolioTotalCostAsDatedValues = exports.getPortfolioMarketValueAsDatedValues = exports.getPortfolioDocs = exports.getPortfolioDoc = exports.deletePortfolio = exports.addPortfolio = void 0;
// imports
const common_1 = require("common");
const Price_1 = require("./Price");
const Holding_1 = require("../../utils/Holding");
const mongoose_1 = __importDefault(require("mongoose"));
const portfolioSchema_1 = require("../models/portfolioSchema");
const dfu = __importStar(require("../../utils/danfo"));
const Portfolio_1 = require("../../utils/Portfolio");
// =======
// globals
// =======
// get mongo client
const url = 'mongodb://localhost:27017/tcgPortfolio';
// =========
// functions
// =========
/*
DESC
  Adds a Portfolio based on the given inputs
INPUT
  portfolio: An IPortfolio
RETURN
  TRUE if the Portfolio was successfully created, FALSE otherwise
*/
function addPortfolio(portfolio) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        const userId = portfolio.userId;
        const portfolioName = portfolio.portfolioName;
        const description = portfolio.description;
        try {
            // check if portfolioName exists for this userId
            const portfolioDoc = yield getPortfolioDoc(portfolio);
            if ((0, Portfolio_1.isPortfolioDoc)(portfolioDoc)) {
                throw (0, Portfolio_1.genPortfolioAlreadyExistsError)(userId, portfolioName, 'addPortfolio()');
            }
            // get IMHolding[]
            const holdings = yield (0, Holding_1.getIMHoldingsFromIHoldings)(portfolio.holdings);
            // create IPortfolio
            let newPortfolio = {
                userId: userId,
                portfolioName: portfolioName,
                holdings: holdings
            };
            if (description) {
                newPortfolio['description'] = portfolio.description;
            }
            // create the portfolio  
            yield portfolioSchema_1.Portfolio.create(newPortfolio);
            return true;
        }
        catch (err) {
            const errMsg = `An error occurred in addPortfolio(): ${err}`;
            throw new Error(errMsg);
        }
    });
}
exports.addPortfolio = addPortfolio;
/*
DESC
  Deletes the Portfolio document by userId and portfolioName
INPUT
  userId: The associated userId
  portfolioName: The portfolio's name
RETURN
  TRUE if the Portfolio was successfully created, FALSE otherwise
*/
function deletePortfolio(portfolio) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        const userId = portfolio.userId;
        const portfolioName = portfolio.portfolioName;
        try {
            // check if portfolioName exists for this userId
            const portfolioDoc = yield getPortfolioDoc(portfolio);
            if (!(0, Portfolio_1.isPortfolioDoc)(portfolioDoc)) {
                throw (0, Portfolio_1.genPortfolioNotFoundError)(userId, portfolioName, 'deletePortfolio()');
            }
            // delete the portfolio  
            const res = yield portfolioSchema_1.Portfolio.deleteOne({
                'userId': userId,
                'portfolioName': portfolioName,
            });
            return res.deletedCount === 1;
        }
        catch (err) {
            const errMsg = `An error occurred in deletePortfolio(): ${err}`;
            throw new Error(errMsg);
        }
    });
}
exports.deletePortfolio = deletePortfolio;
/*
DESC
  Retrieves the Portfolio document by userId and portfolioName
INPUT
  userId: The associated userId
  portfolioName: The portfolio's name
RETURN
  The document if found, else null
*/
function getPortfolioDoc(portfolio) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const portfolioDoc = yield portfolioSchema_1.Portfolio.findOne({
                'userId': portfolio.userId,
                'portfolioName': portfolio.portfolioName,
            });
            return portfolioDoc;
        }
        catch (err) {
            const errMsg = `An error occurred in getPortfolioDoc(): ${err}`;
            throw new Error(errMsg);
        }
    });
}
exports.getPortfolioDoc = getPortfolioDoc;
/*
DESC
  Retrieves all Portfolio documents for the input userId
INPUT
  userId: The associated userId
RETURN
  An array of Portfolio documents
*/
function getPortfolioDocs(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const docs = yield portfolioSchema_1.Portfolio.find({ 'userId': userId });
            return docs;
        }
        catch (err) {
            const errMsg = `An error occurred in getPortfolioDocs(): ${err}`;
            throw new Error(errMsg);
        }
    });
}
exports.getPortfolioDocs = getPortfolioDocs;
/*
DESC
  Returns the market value of the input Portfolio between the startDate and
  endDate
INPUT
  portfolio: An IPortfolio
  startDate: The start date for market value calculation
  endDate: The end date for market value calculation
*/
function getPortfolioMarketValueAsDatedValues(portfolio, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        // get price map
        const holdings = (0, common_1.getPortfolioHoldings)(portfolio);
        const tcgplayerIds = holdings.map((holding) => {
            return (0, common_1.getHoldingTcgplayerId)(holding);
        });
        const priceMap = yield (0, Price_1.getPriceMapOfSeries)(tcgplayerIds, startDate, endDate);
        // get market value
        const marketValueSeries = (0, Portfolio_1.getPortfolioMarketValueSeries)(portfolio, priceMap, startDate, endDate);
        return dfu.getDatedValuesFromSeries(marketValueSeries);
    });
}
exports.getPortfolioMarketValueAsDatedValues = getPortfolioMarketValueAsDatedValues;
/*
DESC
  Returns the total cost of the input Portfolio between the startDate and
  endDate
INPUT
  portfolio: An IPortfolio
  startDate: The start date for market value calculation
  endDate: The end date for market value calculation
*/
function getPortfolioTotalCostAsDatedValues(portfolio, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        // get total cost
        const totalCostSeries = (0, Portfolio_1.getPortfolioTotalCostSeries)(portfolio, startDate, endDate);
        return dfu.getDatedValuesFromSeries(totalCostSeries);
    });
}
exports.getPortfolioTotalCostAsDatedValues = getPortfolioTotalCostAsDatedValues;
/*
DESC
  Retrieves all IPopulatedPortfolios for the input userId
INPUT
  userId: The associated userId
RETURN
  An array of IPopulatedPortfolios
*/
function getPortfolios(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            const docs = yield portfolioSchema_1.Portfolio
                .find({ 'userId': userId })
                .populate({
                path: 'holdings',
                populate: { path: 'product' }
            })
                .select('-holdings.tcgplayerId');
            const portfolios = docs.map((portfolio) => {
                // create populatedHoldings
                const populatedHoldings = portfolio.holdings.map((el) => {
                    (0, common_1.assert)((0, common_1.isIPopulatedHolding)(el));
                    return el;
                });
                // create populatedPortfolio
                return {
                    userId: portfolio.userId,
                    portfolioName: portfolio.portfolioName,
                    description: portfolio.description,
                    populatedHoldings: populatedHoldings
                };
            });
            return portfolios;
        }
        catch (err) {
            const errMsg = `An error occurred in getPortfolios(): ${err}`;
            throw new Error(errMsg);
        }
    });
}
exports.getPortfolios = getPortfolios;
/*
DESC
  Sets an existing Portfolio to be equal to a new Portfolio
INPUT
  existingPortfolio: The Portfolio to update
  newPortfolio: The new state of the Portfolio
RETURN
  TRUE if the Portfolio was successfully set, FALSE otherwise
*/
function setPortfolio(existingPortfolio, newPortfolio) {
    return __awaiter(this, void 0, void 0, function* () {
        // connect to db
        yield mongoose_1.default.connect(url);
        try {
            // check that userIds match
            (0, common_1.assert)(existingPortfolio.userId === newPortfolio.userId, `Mismatched userIds provided to setPortfolio(${existingPortfolio.userId}, ${newPortfolio.userId})`);
            // check that new Portfolio Holdings are valid
            const hasValidHoldings = yield (0, Holding_1.areValidHoldings)(newPortfolio.holdings);
            if (!hasValidHoldings) {
                const errMsg = 'New portfolio has invalid holdings';
                throw new Error(errMsg);
            }
            // check if Portfolio exists
            const portfolioDoc = yield getPortfolioDoc(existingPortfolio);
            if (!(0, Portfolio_1.isPortfolioDoc)(portfolioDoc)) {
                const errMsg = `Portfolio not found (${existingPortfolio.userId}, ${existingPortfolio.portfolioName})`;
                throw new Error(errMsg);
            }
            (0, common_1.assert)((0, Portfolio_1.isPortfolioDoc)(portfolioDoc), (0, Portfolio_1.genPortfolioNotFoundError)(existingPortfolio.userId, existingPortfolio.portfolioName, 'setPortfolio()').toString());
            // create IMPortfolio for new Portfolio
            const newIMPortfolio = Object.assign(Object.assign({}, newPortfolio), { holdings: yield (0, Holding_1.getIMHoldingsFromIHoldings)(newPortfolio.holdings) });
            // overwrite existing Portfolio with new Portfolio
            portfolioDoc.overwrite(newIMPortfolio);
            yield portfolioDoc.save();
            return true;
        }
        catch (err) {
            const errMsg = `An error occurred in setPortfolio(): ${err}`;
            throw new Error(errMsg);
        }
    });
}
exports.setPortfolio = setPortfolio;
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
        // // -- Set Portfolio
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
        // const series = getHoldingMarketValueSeries(holding, priceSeries, startDate, endDate)
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
        // // -- Add portfolio holdings
        // res = await addPortfolioHoldings(portfolio, holdings)
        // if (res) {
        //   console.log('Portfolio holdings successfully added')
        // } else {
        //   console.log('Portfolio holdings not added')
        // }
        // -- Set portfolio holdings
        // res = await setPortfolioProperty(portfolio, 'description', 'Taco Bell')
        // if (res) {
        //   console.log('Portfolio holdings successfully set')
        // } else {
        //   console.log('Portfolio holdings not set')
        // }
        // // -- Get portfolios
        // res = await getPortfolioDocs(userId)
        // if (res) {
        //   console.log(res)
        // } else {
        //   console.log('Portfolios not retrieved')
        // }
        // res = await getPortfolios(userId)
        // if (res) {
        //   logObject(res)
        // } else {
        //   console.log('Portfolios not retrieved')
        // }
        // -- Add portfolio
        // res = await addPortfolio(portfolio)
        // if (res) {
        //   console.log('Portfolio successfully created')
        // } else {
        //   console.log('Portfolio not created')
        // }
        // // -- Delete portfolio
        // res = await deletePortfolio(userId, portfolioName)
        // if (res) {
        //   console.log('Portfolio successfully deleted')
        // } else {
        //   console.log('Portfolio not deleted')
        // }
        // // -- Add portfolio holding
        // const holdingA: IHolding = {
        //   tcgplayerId: 233232,
        //   transactions: [
        //     {
        //       type: TransactionType.Purchase,
        //       date: new Date('2023-09-01'),
        //       price: 240,
        //       quantity: 2
        //     },
        //     {
        //       type: TransactionType.Sale,
        //       date: new Date('2023-09-02'),
        //       price: 245,
        //       quantity: 1
        //     },
        //     {
        //       type: TransactionType.Purchase,
        //       date: new Date('2023-09-04'),
        //       price: 250,
        //       quantity: 1
        //     },
        //     {
        //       type: TransactionType.Purchase,
        //       date: new Date('2023-09-05'),
        //       price: 250,
        //       quantity: 1
        //     },
        //     {
        //       type: TransactionType.Sale,
        //       date: new Date('2023-09-06'),
        //       price: 255,
        //       quantity: 3
        //     }
        //   ]
        // } 
        // const holdingB: IHolding = {
        //   tcgplayerId: 121527,
        //   transactions: [
        //     {
        //       type: TransactionType.Purchase,
        //       date: new Date('2023-09-07'),
        //       price: 330,
        //       quantity: 5
        //     },
        //     {
        //       type: TransactionType.Sale,
        //       date: new Date('2023-09-08'),
        //       price: 325,
        //       quantity: 1
        //     },
        //     {
        //       type: TransactionType.Sale,
        //       date: new Date('2023-09-10'),
        //       price: 320,
        //       quantity: 4
        //     },
        //   ]
        // } 
        // const portfolio = {
        //   userId: 123,
        //   portfolioName: 'foo',
        //   holdings: [holdingA, holdingB]
        // }
        // const startDate = new Date('2023-09-01')
        // const endDate = new Date('2023-09-12')
        // const series = await getPortfolioMarketValueAsDatedValues(
        //   portfolio, 
        //   startDate,
        //   endDate
        // )
        // console.log(dfu.getSeriesFromDatedValues(series))
        // holdings = [
        //   holding,
        //   {
        //     tcgplayerId: 233232,
        //     transactions: [{
        //       type: TransactionType.Purchase,
        //       date: new Date(),
        //       price: 4.99,
        //       quantity: 100
        //     }]
        //   }    
        // ]
        // res = await addPortfolioHoldings(
        //   {
        //     userId: userId,
        //     portfolioName: portfolioName,
        //     holdings: holdings,
        //   },
        //   holdings
        // )
        // if (res) {
        //   console.log('Holding successfully added')
        // } else {
        //   console.log('Holding not added')
        // }
        // // -- Delete portfolio holding
        // res = await deletePortfolioHolding(
        //   {
        //     userId: userId,
        //     portfolioName: portfolioName,
        //     holdings: []
        //   },
        //   233232
        // )
        // if (res) {
        //   console.log('Holding successfully deleted')
        // } else {
        //   console.log('Holding not deleted')
        // }
        return 0;
    });
}
main()
    .then(console.log)
    .catch(console.error);
