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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TCCategory = exports.tccategorySchema = void 0;
const common_1 = require("common");
const mongoose_1 = __importStar(require("mongoose"));
// ==========
// properties
// ==========
exports.tccategorySchema = new mongoose_1.Schema({
    categoryId: {
        type: Number,
        min: 1,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    },
    tcg: {
        type: String,
        enum: common_1.TCG,
        required: true
    }
}, {
    collection: 'tccategories' // mongoose will default to 'tccategorys'
});
// ==============
// mongoose model
// ==============
exports.TCCategory = mongoose_1.default.model('TCCategory', exports.tccategorySchema);
