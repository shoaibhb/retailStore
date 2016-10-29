var Stripe = require('stripe');

module.exports = function(wagner)
 {
    var STRIPE_API_KEY  = "tok_198e7uD4qfzF621SAgCbdVS0";
    var stripe = Stripe(STRIPE_API_KEY);

    wagner.factory('Stripe', function() {
        return stripe;
    });

    return { Stripe: stripe };
};





