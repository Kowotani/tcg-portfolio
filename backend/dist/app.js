"use strict";
// imports
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
const express_1 = __importDefault(require("express"));
const mongoManager_1 = require("./mongo/mongoManager");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)();
const app = (0, express_1.default)();
// app.use(upload);    // parse multipart/form-data
const port = 3030;
app.get('/', (req, res) => {
    res.send('Hello World!');
});
// =======
// product
// =======
/*
DESC: handle request to add a product
INPUT: request body in multipart/form-data containing
    tcgplayerId - the TCGplayer product id
    releaseDate - product release date in YYYY-MM-DD format
    name - product name
    type - ProductType enum
    language - ProductLanguage enum
    subtype [OPTIONAL] - ProductSubType enum
    setCode [OPTIONAL] - product set code
    
*/
app.post('/product', upload.none(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    // check if product already exists (via tcgplayerId)
    const query = yield (0, mongoManager_1.getProduct)({ tcgplayerId: Number(data.tcgplayerId) });
    console.log(query);
    if (query.length > 0) {
        res.status(202);
        const body = {
            tcgplayerId: data.tcgplayerId,
            message: 'tcgplayerId already exists',
        };
        res.send(body);
    }
    else {
        // add product
        const numInserted = yield (0, mongoManager_1.insertProducts)([data]);
        // success
        if (numInserted > 0) {
            res.status(201);
            const body = {
                tcgplayerId: data.tcgplayerId,
                message: 'tcgplayerId added',
                data: data,
            };
            res.send(body);
            // error
        }
        else {
            res.status(500);
            const body = {
                tcgplayerId: data.tcgplayerId,
                message: 'Error creating Product doc',
            };
            res.send(body);
        }
    }
}));
app.listen(port, () => {
    console.log(`Started server at http://localhost:${port}`);
});
