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
const s3Manager_1 = require("./aws/s3Manager");
const common_1 = require("common");
const express_1 = __importDefault(require("express"));
const mongoManager_1 = require("./mongo/mongoManager");
const multer_1 = __importDefault(require("multer"));
const scrapeManager_1 = require("./scraper/scrapeManager");
const utils_1 = require("./utils");
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
        const portfolioDoc = yield (0, mongoManager_1.getPortfolioDoc)(portfolio);
        if (!(0, utils_1.isPortfolioDoc)(portfolioDoc)) {
            res.status(204);
            const body = {
                message: common_1.DeletePortfolioStatus.DoesNotExist
            };
            res.send(body);
        }
        else {
            // delete portfolio
            const isDeleted = yield (0, mongoManager_1.deletePortfolio)(portfolio);
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
        const isCreated = yield (0, mongoManager_1.addPortfolio)(portfolio);
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
        const isUpdated = yield (0, mongoManager_1.setPortfolio)(body.existingPortfolio, body.newPortfolio);
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
  Handle GET request to retrieve performance data for the input Portfolio and
  date range
INPUT
  Request query parameters:
    userId: The userId who owns the Portfolio
    portfolioName: The name of the Portfolio
    startDate: The start date for performance calculation
    endDate: The end date for performance calculation
    metric: The performance metric
RETURN
  TGetPortfolioPerformanceResBody response with status codes

  Status Code
    200: The Portfolio performance data was retrieved successfully
    500: An error occurred
*/
app.get(common_1.PORTFOLIO_PERFORMANCE_URL, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // get portfolio
        const portfolioDoc = yield (0, mongoManager_1.getPortfolioDoc)({
            userId: req.query.userId,
            portfolioName: req.query.portfolioName,
            holdings: []
        });
        (0, common_1.assert)((0, utils_1.isPortfolioDoc)(portfolioDoc), 'Could not find Portfolio');
        const startDate = new Date(Date.parse(req.query.startDate));
        const endDate = new Date(Date.parse(req.query.endDate));
        const metric = req.query.metric;
        let values = [];
        // market value
        if (metric === common_1.PerformanceMetric.MarketValue) {
            values = yield (0, mongoManager_1.getPortfolioMarketValueAsDatedValues)(portfolioDoc, startDate, endDate);
        }
        const portfolioValueSeries = {
            portfolioName: portfolioDoc.portfolioName,
            values: values
        };
        // return performance data
        res.status(200);
        const body = {
            data: portfolioValueSeries,
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
        const data = yield (0, mongoManager_1.getPortfolios)(userId);
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
        const productDoc = yield (0, mongoManager_1.getProductDoc)({ tcgplayerId: tcgplayerId });
        if (!(0, utils_1.isProductDoc)(productDoc)) {
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
        const productDoc = yield (0, mongoManager_1.getProductDoc)({ tcgplayerId: price.tcgplayerId });
        if (!(0, utils_1.isProductDoc)(productDoc)) {
            const errMsg = `Product not found for tcgplayerId: ${price.tcgplayerId}`;
            throw new Error(errMsg);
        }
        // add Price
        const numInserted = yield (0, mongoManager_1.insertPrices)([price]);
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
        const latestPrices = yield (0, mongoManager_1.getLatestPrices)();
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
    const productDoc = yield (0, mongoManager_1.getProductDoc)({ tcgplayerId: tcgplayerId });
    if ((0, utils_1.isProductDoc)(productDoc)) {
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
            const numInserted = yield (0, mongoManager_1.insertProducts)([data]);
            // load image to S3
            const isImageLoaded = body.imageUrl
                ? yield (0, s3Manager_1.loadImageToS3)(tcgplayerId, body.imageUrl)
                : false;
            // success
            if (numInserted > 0) {
                res.status(201);
                const body = {
                    tcgplayerId: data.tcgplayerId,
                    message: isImageLoaded
                        ? common_1.PostProductStatus.Added
                        : common_1.PostProductStatus.AddedWithoutImage,
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
        const data = yield (0, mongoManager_1.getProductDocs)();
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
app.listen(port, () => {
    console.log(`Started server at http://localhost:${port}`);
});
