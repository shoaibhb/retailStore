var mongoose = require('mongoose');
var _ = require('underscore');

module.exports = function(wagner) {
    mongoose.connect('mongodb://localhost:27017/test');

    var Catagory = 
        mongoose.model('Catagory', require('./catagory'), 'catagories');
    var Product = 
        mongoose.model('Product', require('./product'), 'products');
    var User = 
        mongoose.model('User', require('./user'), 'users');

    var models = {
        Catagory: Catagory,
        Product: Product,
        User: User
    };

    // To ensure DRY-ness, register factories in a loop (DRY: Dont Repeat Yourself)
    _.each(models, function(value,key) {
        wagner.factory(key, function() {
            return value;
        });
    });
/**
 * for single factory implementaion - static  
    wagner.factory('Catagory', function() {
        return Catagory;
    });
*/
    return {
        Catagory: Catagory,
        Product: Product,
        User: User
    };

};