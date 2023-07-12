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
exports.loadImageToS3 = void 0;
// imports
const axios_1 = __importDefault(require("axios"));
const client_s3_1 = require("@aws-sdk/client-s3");
// =========
// constants
// =========
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
const BUCKET = 'tcg-portfolio';
const REGION = 'us-east-1';
// =========
// functions
// =========
/*
DESC
    Create a new S3 client
RETURN
    An S3 client
*/
function getS3Client() {
    return new client_s3_1.S3Client({
        region: REGION,
        credentials: {
            accessKeyId: AWS_ACCESS_KEY,
            secretAccessKey: AWS_SECRET_KEY,
        }
    });
}
/*
DESC
    Returns the file extension of a file name (eg. foo.bar => bar)
INPUT
    fileName: the filename (with extension) as a string
RETURN
    The file extension, or an empty string if it does not exist
*/
function getFileExtension(fileName) {
    const arr = fileName.split('.');
    return arr.length > 1
        ? arr[arr.length - 1]
        : '';
}
/*
DESC
    Loads the image identified by the imageUrl into S3 with the tcgPlayerId as
    the image filename
INPUT
    tcgPlayerId: the tcgPlayerId
    imageUrl: the URL of the image
RETURN
    TRUE if the file is successfully loaded, FALSE otherwise
*/
function loadImageToS3(tcgPlayerId, imageUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        // get S3 client
        const s3Client = getS3Client();
        try {
            // read image into buffer
            const axiosRes = yield (0, axios_1.default)({
                method: 'get',
                url: imageUrl,
                responseType: 'arraybuffer',
            });
            // call PutObject command
            const commandConfig = {
                Body: axiosRes.data,
                Bucket: BUCKET,
                Key: tcgPlayerId.toString() + '.' + getFileExtension(imageUrl),
                Metadata: { source: imageUrl }
            };
            const command = new client_s3_1.PutObjectCommand(commandConfig);
            // send command to S3
            const s3Res = yield s3Client.send(command);
            // success
            if (s3Res.$metadata.httpStatusCode === 200) {
                return true;
                // error
            }
            else {
                console.log(`Error loading image to S3: ${s3Res}`);
                return false;
            }
        }
        catch (err) {
            console.log(`Error in loadImageToS3: ${err}`);
            return false;
        }
    });
}
exports.loadImageToS3 = loadImageToS3;
// async function main() {
//     const imageUrl = 'https://product-images.tcgplayer.com/fit-in/615x615/121527.jpg'
//     const tcgPlayerId = 121527
//     const res = loadImageToS3(tcgPlayerId, imageUrl)    
//     console.log(`Succuess: ${res}`)
// }
// main()
//     .then(console.log)
//     .catch(console.log)
