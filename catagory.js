var mongoose = require('mongoose');

var catagorySchema = {
    _id: {type: String},
    parent: {
        type:String,
        ref: 'Catagory'
    },
    ancestors: [{
        type: String,
        ref: 'Catagory'
    }]
};

module.exports = new mongoose.Schema(catagorySchema);
module.exports.catagorySchema = catagorySchema;
