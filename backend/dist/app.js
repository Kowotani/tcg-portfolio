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
// imports
const common_1 = require("common");
const express_1 = __importDefault(require("express"));
const mongoManager_1 = require("./mongo/mongoManager");
const multer_1 = __importDefault(require("multer"));
const s3Manager_1 = require("./aws/s3Manager");
const utils_1 = require("./utils");
const upload = (0, multer_1.default)();
const app = (0, express_1.default)();
const port = 3030;
// =========
// portfolio
// =========
/*
DESC
  Handle GET request for all IPopulatedPortfolios for the input userId
INPUT
  userId: The userId who owns the Portfolios
RETURN
  Response body with status codes and messages

  Status Code
    200: The Portfolio documents were returned successfully
    500: An error occurred
*/
app.get(common_1.GET_PORTFOLIOS_URL, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // query Portfolios
        const userId = req.query.userId;
        const data = yield (0, mongoManager_1.getPortfolios)(userId);
        // return Portfolios
        res.status(200);
        // TODO: Add a type inference for this
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
/*
DESC
  Handle PUT request to update a Portfolio
INPUT
  Request body in multipart/form-data containing the following structure
  for both existingPortfolio and newPortfolio objects:
    userId: The Portfolio userId
    portfolioName: The Portfolio name
    holdings: An IHolding[]
    description?: The Portfolio description
RETURN
  TResBody response with status codes

  Status Code
    200: The Portfolio was successfully updated
    500: An error occurred
*/
app.put(common_1.UPDATE_PORTFOLIO_URL, upload.none(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // variables
    const body = req.body;
    try {
        // update Portfolio
        const isUpdated = yield (0, mongoManager_1.setPortfolio)(body.existingPortfolio, body.newPortfolio);
        // success
        if (isUpdated) {
            res.status(200);
            const body = {
                message: common_1.PutPortfoliosStatus.Success
            };
            res.send(body);
            // error
        }
        else {
            res.status(500);
            const body = {
                message: common_1.PutPortfoliosStatus.Error
            };
            res.send(body);
        }
        // error
    }
    catch (err) {
        res.status(500);
        const body = {
            message: `${common_1.PutPortfoliosStatus.Error}: ${err}`
        };
        res.send(body);
    }
}));
// ======
// prices
// ======
/*
DESC
  Handle POST request to add a Price
RETURN
  Response body with status codes and messages

  Status Code
    201: The Price Was added successfully
    500: An error occurred
*/
app.post(common_1.ADD_PRICE_URL, upload.none(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
app.get(common_1.GET_LATEST_PRICES_URL, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
  Request body in multipart/form-data containing
    tcgplayerId: The TCGplayer product id
    releaseDate: Product release date in YYYY-MM-DD format
    name: Product name
    type: ProductType enum
    language: ProductLanguage enum
    subtype?: ProductSubType enum
    setCode?: Product set code
RETURN
  TProductPostResBody response with status codes

  Status Code
    201: The Product was successfully added
    202: The Product already exists
    500: An error occurred
*/
app.post(common_1.ADD_PRODUCT_URL, upload.none(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
app.get(common_1.GET_PRODUCTS_URL, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
