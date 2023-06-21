// imports
const { Schema } = require('mongoose');
const utils = require('../../utils');

const productSchema = new Schema({
    tcgplayer_id: {
        type: Number,
        min: 1,
        unique: true,
        required: true
    },
    tcg: {
        type: String,
        enum: Object.values(utils.TCG),
        required: true
    },
    release_date: {
        type: Date,
        required: true
    }, 
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: Object.values(utils.ProductType),
        required: true
    },
    language: {
        type: String,
        enum: Object.values(utils.ProductLanguage),
        required: true
    },
    subtype: {
        type: String,
        enum: Object.values(utils.ProductSubType)
    },
    set_code: String,
});


module.exports = { productSchema };