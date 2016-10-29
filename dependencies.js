var Stripe = require('stripe');

module.exports = function(wagner)
 {
    var STRIPE_API_KEY  = "XXX";
    var stripe = Stripe(STRIPE_API_KEY);

    wagner.factory('Stripe', function() {
        return stripe;
    });

    return { Stripe: stripe };
};





