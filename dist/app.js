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
const mongoManager_1 = require("./backend/mongoManager");
const multer_1 = __importDefault(require("multer"));
// const utils = require('./utils');
const upload = (0, multer_1.default)();
const app = (0, express_1.default)();
// app.use(upload);    // parse multipart/form-data
// app.use(express.static('public'));  // serve static files from public
const port = 3000;
app.get('/', (req, res) => {
    res.send('Hello World!');
});
// =======
// product
// =======
/*
DESC: handle request to add a product
INPUT: request body in multipart/form-data containing
    tcgplayer_id - the TCGplayer product id
    release_date - product release date in YYYY-MM-DD format
    name - product name
    type - ProductType enum
    language - ProductLanguage enum
    subtype [OPTIONAL] - ProductSubType enum
    set_code [OPTIONAL] - product set code
    
*/
app.post('/product', upload.none(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    // check if product already exists (via tcgplayer_id)
    const query = yield (0, mongoManager_1.getProduct)({ tcgplayer_id: Number(data.tcgplayer_id) });
    console.log(query);
    if (query === null) {
        res.send('Product already exists');
    }
    else {
        // add product
        yield (0, mongoManager_1.insertDocs)('product', [data]);
        res.send('Product added: ' + JSON.stringify(data));
    }
}));
app.listen(port, () => {
    console.log(`Started server at http://localhost:${port}`);
});
