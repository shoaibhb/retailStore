var mongoose = require('mongoose');

var catagory = require('./catagory');
var fx = require('./fx');
var Amount;

var productSchema = {
    _id: {type: String, required: true},
    name: {type: String, required: true},
    //Pictures must start with http://
    pictures: [{type: String, match: /^http:\/\//i}],
    price: {
        amount: { 
            type: Number, 
            defualt: 0,
            required: true,
            set: function(v) {
                    this.internal.approximatePriceUSD = 
                    v / (fx()[this.price.currency] || 1);
                    return v;
                },
        },
        //Only 3 supported currencies for now
        currency: {
            type: String,
            enum: ['USD','EUR','PKR'],
            required: true
        }
    },
    catagory: catagory.catagorySchema,
    internal: {
        approximatePriceUSD: { type: Number }
    }
};

module.exports = new mongoose.Schema(productSchema);
module.exports.productSchema = productSchema;



