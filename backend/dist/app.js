"use strict";
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
const common_1 = require("common");
const express_1 = __importDefault(require("express"));
const Portfolio_1 = require("./mongo/dbi/Portfolio");
const Product_1 = require("./mongo/dbi/Product");
const Price_1 = require("./mongo/dbi/Price");
const TCProduct_1 = require("./mongo/dbi/TCProduct");
const multer_1 = __importDefault(require("multer"));
const scrapeManager_1 = require("./scraper/scrapeManager");
const Holding_1 = require("./utils/Holding");
const Portfolio_2 = require("./utils/Portfolio");
const Product_2 = require("./utils/Product");
const upload = (0, multer_1.default)();
const app = (0, express_1.default)();
const port = 3030;
// =========
// portfolio
// =========
/*
DESC
  Handle DELETE request to delete a Portfolio
INPUT
  Request body in multipart/form-data containing a TDeletePortfolioReqBody
RETURN
  TResBody response with status codes

  Status Code
    200: The Portfolio was successfully deleted
    204: The Portfolio does not exist
    500: An error occurred
*/
app.delete(common_1.PORTFOLIO_URL, upload.none(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // variables
    const body = req.body;
    const portfolio = {
        userId: body.userId,
        portfolioName: body.portfolioName,
        holdings: []
    };
    try {
        // check if Portfolio exists
        const portfolioDoc = yield (0, Portfolio_1.getPortfolioDoc)(portfolio);
        if (!(0, Portfolio_2.isPortfolioDoc)(portfolioDoc)) {
            res.status(204);
            const body = {
                message: common_1.DeletePortfolioStatus.DoesNotExist
            };
            res.send(body);
        }
        else {
            // delete portfolio
            const isDeleted = yield (0, Portfolio_1.deletePortfolio)(portfolio);
            // success
            if (isDeleted) {
                res.status(200);
                const body = {
                    message: common_1.DeletePortfolioStatus.Success
                };
                res.send(body);
                // error
            }
            else {
                res.status(500);
                const body = {
                    message: common_1.DeletePortfolioStatus.Error
                };
                res.send(body);
            }
        }
        // error
    }
    catch (err) {
        res.status(500);
        const body = {
            message: `${common_1.DeletePortfolioStatus.Error}: ${err}`
        };
        res.send(body);
    }
}));
/*
DESC
  Handle POST request to add a Portfolio
INPUT
  Request body in multipart/form-data containing a TPostPortfolioReqBody
RETURN
  TResBody response with status codes

  Status Code
    200: The Portfolio was successfully created
    500: An error occurred
*/
app.post(common_1.PORTFOLIO_URL, upload.none(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // variables
    const body = req.body;
    const portfolio = body.portfolio;
    try {
        // create Portfolio
        const isCreated = yield (0, Portfolio_1.addPortfolio)(portfolio);
        // success
        if (isCreated) {
            res.status(200);
            const body = {
                message: common_1.PostPortfolioStatus.Success
            };
            res.send(body);
            // error
        }
        else {
            res.status(500);
            const body = {
                message: common_1.PostPortfolioStatus.Error
            };
            res.send(body);
        }
        // error
    }
    catch (err) {
        res.status(500);
        const body = {
            message: `${common_1.PostPortfolioStatus.Error}: ${err}`
        };
        res.send(body);
    }
}));
/*
DESC
  Handle PUT request to update a Portfolio
INPUT
  Request body in multipart/form-data containing a TPutPortfolioReqBody
RETURN
  TResBody response with status codes

  Status Code
    200: The Portfolio was successfully updated
    500: An error occurred
*/
app.put(common_1.PORTFOLIO_URL, upload.none(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // variables
    const body = req.body;
    try {
        // update Portfolio
        const isUpdated = yield (0, Portfolio_1.setPortfolio)(body.existingPortfolio, body.newPortfolio);
        // success
        if (isUpdated) {
            res.status(200);
            const body = {
                message: common_1.PutPortfolioStatus.Success
            };
            res.send(body);
            // error
        }
        else {
            res.status(500);
            const body = {
                message: common_1.PutPortfolioStatus.Error
            };
            res.send(body);
        }
        // error
    }
    catch (err) {
        res.status(500);
        const body = {
            message: `${common_1.PutPortfolioStatus.Error}: ${err}`
        };
        res.send(body);
    }
}));
/*
DESC
  Handle GET request to retrieve performance data for the input Portfolio
  Holdings and date range
INPUT
  Request query parameters:
    userId: The userId who owns the Portfolio
    portfolioName: The name of the Portfolio
    metrics: An array of PerformanceMetrics
    startDate?: The start date for performance calculation (default: first
      transaction date)
    endDate?: The end date for performance calculation (default: T-1)
RETURN
  TGetPortfolioHoldingsPerformanceResBody response with status codes

  Status Code
    200: The Portfolio Holdings performance data was retrieved successfully
    500: An error occurred
*/
app.get(common_1.PORTFOLIO_HOLDINGS_PERFORMANCE_URL, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // get portfolio
        const portfolioDoc = yield (0, Portfolio_1.getPortfolioDoc)({
            userId: req.query.userId,
            portfolioName: req.query.portfolioName,
            holdings: []
        });
        (0, common_1.assert)((0, Portfolio_2.isPortfolioDoc)(portfolioDoc), 'Could not find Portfolio');
        const startDate = req.query.startDate
            ? new Date(Date.parse(req.query.startDate))
            : undefined;
        const endDate = req.query.endDate
            ? new Date(Date.parse(req.query.endDate))
            : undefined;
        const metrics = String(req.query.metrics).split(',');
        // create performance data object
        let holdingPerformanceData = [];
        // iterate through each Holding
        for (const holding of (0, common_1.getPortfolioHoldings)(portfolioDoc)) {
            let performanceData = {};
            // calculate each metric
            for (const metric of metrics) {
                let fn;
                switch (metric) {
                    case common_1.PerformanceMetric.CumPnL:
                        fn = Holding_1.getHoldingCumPnLAsDatedValues;
                        break;
                    case common_1.PerformanceMetric.MarketValue:
                        fn = Holding_1.getHoldingMarketValueAsDatedValues;
                        break;
                    case common_1.PerformanceMetric.TotalCost:
                        fn = Holding_1.getHoldingTotalCostAsDatedValues;
                        break;
                    default:
                        const err = `Unknown metric: ${metric}`;
                        throw new Error(err);
                }
                const values = yield fn(holding, startDate, endDate);
                performanceData[metric] = values;
            }
            // append performance data
            holdingPerformanceData.push({
                tcgplayerId: (0, common_1.getHoldingTcgplayerId)(holding),
                performanceData: performanceData
            });
        }
        // return performance data
        res.status(200);
        const body = {
            data: holdingPerformanceData,
            message: common_1.GetPortfolioHoldingsPerformanceStatus.Success
        };
        res.send(body);
        // error
    }
    catch (err) {
        res.status(500);
        const body = {
            message: `${common_1.GetPortfolioHoldingsPerformanceStatus.Error}: ${err}`
        };
        res.send(body);
    }
}));
/*
DESC
  Handle GET request to retrieve performance data for the input Portfolio and
  date range
INPUT
  Request query parameters:
    userId: The userId who owns the Portfolio
    portfolioName: The name of the Portfolio
    metrics: An array of PerformanceMetrics
    startDate?: The start date for performance calculation (default: first
      transaction date)
    endDate?: The end date for performance calculation (default: T-1)
RETURN
  TGetPortfolioPerformanceResBody response with status codes

  Status Code
    200: The Portfolio performance data was retrieved successfully
    500: An error occurred
*/
app.get(common_1.PORTFOLIO_PERFORMANCE_URL, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // get portfolio
        const portfolioDoc = yield (0, Portfolio_1.getPortfolioDoc)({
            userId: req.query.userId,
            portfolioName: req.query.portfolioName,
            holdings: []
        });
        (0, common_1.assert)((0, Portfolio_2.isPortfolioDoc)(portfolioDoc), 'Could not find Portfolio');
        const startDate = req.query.startDate
            ? new Date(Date.parse(req.query.startDate))
            : undefined;
        const endDate = req.query.endDate
            ? new Date(Date.parse(req.query.endDate))
            : undefined;
        const metrics = String(req.query.metrics).split(',');
        // create performance data object
        let performanceData = {};
        for (const metric of metrics) {
            let fn;
            switch (metric) {
                case common_1.PerformanceMetric.CumPnL:
                    fn = Portfolio_2.getPortfolioCumPnLAsDatedValues;
                    break;
                case common_1.PerformanceMetric.MarketValue:
                    fn = Portfolio_2.getPortfolioMarketValueAsDatedValues;
                    break;
                case common_1.PerformanceMetric.TotalCost:
                    fn = Portfolio_2.getPortfolioTotalCostAsDatedValues;
                    break;
                default:
                    const err = `Unknown metric: ${metric}`;
                    throw new Error(err);
            }
            const values = yield fn(portfolioDoc, startDate, endDate);
            performanceData[metric] = values;
        }
        // return performance data
        res.status(200);
        const body = {
            data: performanceData,
            message: common_1.GetPortfolioPerformanceStatus.Success
        };
        res.send(body);
        // error
    }
    catch (err) {
        res.status(500);
        const body = {
            message: `${common_1.GetPortfolioPerformanceStatus.Error}: ${err}`
        };
        res.send(body);
    }
}));
/*
DESC
  Handle GET request for all IPopulatedPortfolios for the input userId
INPUT
  Request query parameters:
    userId: The userId who owns the Portfolios
RETURN
  Response body with status codes and messages

  Status Code
    200: The Portfolio documents were retrieved successfully
    500: An error occurred
*/
app.get(common_1.PORTFOLIOS_URL, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // query Portfolios
        const userId = req.query.userId;
        const data = yield (0, Portfolio_1.getPortfolios)(userId);
        // return Portfolios
        res.status(200);
        const body = {
            data: data,
            message: common_1.GetPortfoliosStatus.Success
        };
        res.send(body);
        // error
    }
    catch (err) {
        res.status(500);
        const body = {
            message: `${common_1.GetPortfoliosStatus.Error}: ${err}`
        };
        res.send(body);
    }
}));
// ======
// prices
// ======
/*
DESC
  Handle GET request for latest Prices of all Products
RETURN
  Response body with status codes and messages

  Status Code
    200: The Prices were returned successfully
    500: An error occurred
*/
app.get(common_1.LATEST_PRICES_URL, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // query Prices
        const latestPrices = yield (0, Price_1.getLatestPrices)();
        // return Prices
        res.status(200);
        const body = {
            data: Object.fromEntries(latestPrices),
            message: common_1.GetPricesStatus.Success
        };
        res.send(body);
        // error
    }
    catch (err) {
        res.status(500);
        const body = {
            message: `${common_1.GetPricesStatus.Error}: ${err}`
        };
        res.send(body);
    }
}));
/*
DESC
  Handle POST request to load the current Price for a tcgplayerId
INPUT
  Request body in multipart/form-data containing a TPostLatestPriceReqBody
RETURN
  Response body with status codes and messages

  Status Code
    201: The Price was loaded successfully
    500: An error occurred
*/
app.post(common_1.LATEST_PRICES_URL, upload.none(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // get tcgplayerId
        const body = req.body;
        const tcgplayerId = body.tcgplayerId;
        // check if Product exists
        const productDoc = yield (0, Product_1.getProductDoc)({ tcgplayerId: tcgplayerId });
        if (!(0, Product_2.isProductDoc)(productDoc)) {
            const errMsg = `Product not found for tcgplayerId: ${tcgplayerId}`;
            throw new Error(errMsg);
        }
        // load latest Price
        const isLoaded = yield (0, scrapeManager_1.loadCurrentPrice)(tcgplayerId);
        if (isLoaded) {
            res.status(201);
            const body = {
                message: common_1.PostLatestPriceStatus.Success
            };
            res.send(body);
            // error
        }
        else {
            res.status(500);
            const body = {
                message: common_1.PostLatestPriceStatus.Error
            };
            res.send(body);
        }
        // error
    }
    catch (err) {
        res.status(500);
        const body = {
            message: `${common_1.PostPriceStatus.Error}: ${err}`
        };
        res.send(body);
    }
}));
/*
DESC
  Handle POST request to add a Price
INPUT
  Request body in multipart/form-data containing a TPostPriceReqBody
RETURN
  Response body with status codes and messages

  Status Code
    201: The Price was added successfully
    500: An error occurred
*/
app.post(common_1.PRICE_URL, upload.none(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // create IPrice
        const body = req.body;
        let priceData = {
            marketPrice: body.marketPrice
        };
        if (body.buylistMarketPrice) {
            priceData['buylistMarketPrice'] = body.buylistMarketPrice;
        }
        if (body.listedMedianPrice) {
            priceData['listedMedianPrice'] = body.listedMedianPrice;
        }
        const price = {
            tcgplayerId: body.tcgplayerId,
            priceDate: body.priceDate,
            prices: priceData,
            granularity: common_1.TimeseriesGranularity.Hours
        };
        // check if Product exists
        const productDoc = yield (0, Product_1.getProductDoc)({ tcgplayerId: price.tcgplayerId });
        if (!(0, Product_2.isProductDoc)(productDoc)) {
            const errMsg = `Product not found for tcgplayerId: ${price.tcgplayerId}`;
            throw new Error(errMsg);
        }
        // add Price
        const numInserted = yield (0, Price_1.insertPrices)([price]);
        // success
        if (numInserted === 1) {
            res.status(201);
            const body = {
                data: price,
                message: common_1.PostPriceStatus.Success
            };
            res.send(body);
            // error
        }
        else {
            res.status(500);
            const body = {
                message: common_1.PostPriceStatus.Error
            };
            res.send(body);
        }
        // error
    }
    catch (err) {
        res.status(500);
        const body = {
            message: `${common_1.PostPriceStatus.Error}: ${err}`
        };
        res.send(body);
    }
}));
// =======
// product
// =======
/*
DESC
  Handle POST request to add a Product
INPUT
    Request body in multipart/form-data containing a TPostProductReqBody
RETURN
  TProductPostResBody response with status codes

  Status Code
    201: The Product was successfully added
    202: The Product already exists
    500: An error occurred
*/
app.post(common_1.PRODUCT_URL, upload.none(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // variables
    const body = req.body;
    const data = body.formData;
    const tcgplayerId = data.tcgplayerId;
    // check if product already exists (via tcgplayerId)
    const productDoc = yield (0, Product_1.getProductDoc)({ tcgplayerId: tcgplayerId });
    if ((0, Product_2.isProductDoc)(productDoc)) {
        res.status(202);
        const body = {
            tcgplayerId: data.tcgplayerId,
            message: common_1.PostProductStatus.AlreadyExists,
            data: undefined,
        };
        res.send(body);
    }
    else {
        try {
            // add product
            const numInserted = yield (0, Product_1.insertProducts)([data]);
            // success
            if (numInserted > 0) {
                res.status(201);
                const body = {
                    tcgplayerId: data.tcgplayerId,
                    message: common_1.PostProductStatus.Added,
                    data: data,
                };
                res.send(body);
                // error
            }
            else {
                res.status(500);
                const body = {
                    tcgplayerId: data.tcgplayerId,
                    message: common_1.PostProductStatus.Error,
                    data: undefined,
                };
                res.send(body);
            }
            // error
        }
        catch (err) {
            res.status(500);
            const body = {
                tcgplayerId: data.tcgplayerId,
                message: `${common_1.PostProductStatus.Error}: ${err}`,
                data: undefined,
            };
            res.send(body);
        }
    }
}));
/*
DESC
  Handle GET request to retrieve performance data for the input Product and
  date range. The performance will be calculated as having purchased 1 unit
  at MSRP on the release date
INPUT
  Request query parameters:
    tcgplayerId: The Product's tcgplayerId
    metrics: An array of PerformanceMetrics
RETURN
  TGetProductPerformanceResBody response with status codes

  Status Code
    200: The Product performance data was retrieved successfully
    500: An error occurred
*/
app.get(common_1.PRODUCT_PERFORMANCE_URL, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // parse query params
        const tcgplayerId = req.query.tcgplayerId;
        const productDoc = yield (0, Product_1.getProductDoc)({ tcgplayerId: tcgplayerId });
        const startDate = productDoc.releaseDate;
        const endDate = new Date();
        const metrics = String(req.query.metrics).split(',');
        // create Holding for a purchase of 1 unit at MSRP on release date 
        const holding = yield (0, Holding_1.genReleaseDateProductHolding)(tcgplayerId);
        // create performance data object
        let performanceData = {};
        for (const metric of metrics) {
            let fn;
            switch (metric) {
                case common_1.PerformanceMetric.CumPnL:
                    fn = Holding_1.getHoldingCumPnLAsDatedValues;
                    break;
                case common_1.PerformanceMetric.MarketValue:
                    fn = Holding_1.getHoldingMarketValueAsDatedValues;
                    break;
                default:
                    const err = `Unknown metric: ${metric}`;
                    throw new Error(err);
            }
            const values = yield fn(holding, startDate, endDate);
            performanceData[metric] = values;
        }
        // return performance data
        res.status(200);
        const body = {
            data: performanceData,
            message: common_1.GetProductPerformanceStatus.Success
        };
        res.send(body);
    }
    catch (err) {
        res.status(500);
        const body = {
            message: `${common_1.GetProductPerformanceStatus.Error}: ${err}`
        };
        res.send(body);
    }
}));
/*
DESC
  Handle GET request for all Product documents
RETURN
  Response body with status codes and messages

  Status Code
    200: The Product documents were returned successfully
    500: An error occurred
*/
app.get(common_1.PRODUCTS_URL, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // query Products
        const data = yield (0, Product_1.getProductDocs)();
        // return Products
        res.status(200);
        const body = {
            data: data,
            message: common_1.GetProductsStatus.Success
        };
        res.send(body);
        // error
    }
    catch (err) {
        res.status(500);
        const body = {
            message: `${common_1.GetProductsStatus.Error}: ${err}`
        };
        res.send(body);
    }
}));
// =========
// tcproduct
// =========
/*
DESC
  Handle GET request for unvalidated TCProduct documents
RETURN
  Response body with status codes and messages

  Status Code
    200: The TCProduct documents were returned successfully
    500: An error occurred
*/
app.get(common_1.UNVALIDATED_TCPRODUCTS_URL, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // query TCProducts
        const params = { status: common_1.ParsingStatus.Validated };
        const data = yield (0, TCProduct_1.getTCProductDocs)(params);
        // return TCProducts
        res.status(200);
        const body = {
            data: data,
            message: common_1.GetUnvalidatedTCProductsStatus.Success
        };
        res.send(body);
        // error
    }
    catch (err) {
        res.status(500);
        const body = {
            message: `${common_1.GetUnvalidatedTCProductsStatus.Error}: ${err}`
        };
        res.send(body);
    }
}));
// ======
// server
// ======
app.listen(port, () => {
    console.log(`Started server at http://localhost:${port}`);
});
