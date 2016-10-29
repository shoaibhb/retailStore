var express = require('express');
var status = require('http-status');
var catagory = require('./catagory');
var bodyparser = require('body-parser');


module.exports = function(wagner) {

    var api = express.Router();

    api.use(bodyparser.json());
    

    function handleOne(property, res, error, result) {
        if(error) {
                    return res.
                    status(status.INTERNAL_SERVER_ERROR).
                    json({error: error.toString()});
        }
        if (!catagory) {
                    return res.
                    status(status.NOT_FOUND).
                    json({error: 'Not found'});
        }

        var json = {};
        json[property] = result;
        res.json(json);
    }

 
    function handleMany(property, res, error, result) {
        if(error) {
                    return res.
                    status(status.INTERNAL_SERVER_ERROR).
                    json({error: error.toString()});
        }
        if (!catagory) {
                    return res.
                    status(status.NOT_FOUND).
                    json({error: 'Not found'});
        }

        var json = {};
        json[property] = result;
        res.json(json);
    }

    api.get('/catagory/id/:id', wagner.invoke(function(Catagory){
        return function(req, res) {
            Catagory.
            findOne({ _id: req.params.id}, function(error, catagory){
                if(error) {
                    return res.
                    status(status.INTERNAL_SERVER_ERROR).
                    json({error: error.toString()});
                }
                if (!catagory) {
                    return res.
                    status(status.NOT_FOUND).
                    json({error: 'Not found'});
                }
                res.json({catagory: catagory});
            });
        };
    }));


    api.get('/catagory/parent/:id', wagner.invoke(function(Catagory){
        return function(req, res) { 
            Catagory.find({ parent: req.params.id}).sort({ _id: 1 }).exec( function(error, catagories){
                if(error) {
                return res.status( status.INTERNAL_SERVER_ERROR).json({error: error.toString()});
                }
            res.json({catagories: catagories});
            });
        }
    }));

    api.get('/product/id/:id', wagner.invoke(function(Product) {
        return function(req, res) {
            Product.findOne({ _id: req.params.id},
            handleOne.bind(null, 'product', res));
        };
    }));
    
        
    api.get('/product/catagory/:id', wagner.invoke(function(Product) {
        return function (req, res) {
            var sort = { name: 1};
            if (req.query.price === "1") {
                sort = {'internal.approximatePriceUSD': 1};
            } else if (req.query.price === "-1") {
                sort = {'internal.approximatePriceUSD': -1}
            }

            Product.
                find({'catagory.ancestors': req.params.id}).
                    sort(sort).
                        exec(handleMany.bind(null, 'product', res));
        };
    }));

    api.put('/me/cart', wagner.invoke(function(User) {
        return function(req, res) {
            try {
                var cart = requ.body.data.cart;
                console.log("requ.body.data.cart %d", requ.body.data.cart);
            } catch(e) {
                return res.
                 status(status.BAD_REQUEST).
                 json({ error: 'No cart specified'});
            }
            req.body.data.cart = cart;
            req.user.save(function(error, user) {
                if(error) {
                    return res.
                     status(status.INTERNAL_SERVER_ERROR).
                     json({ error: error.toString()});
                }
                return res.json({ user: user });
            });
        };
    }));
  
    api.get('/me', wagner.invoke(function(User) {
        return(function(req, res) {
            if(!req.user) {
                return res.
                status(status.UNAUTHORIZED).
                json({error: 'Not logged in'});
            }
            console.log("req.user %d", req.user);
            req.user.populate(
                { path: 'data.cart.product', model: 'Product'},
                handleOne.bind(null,'user', res));
        });   
    }));

    api.post('/checkout', wagner.invoke(function(User, Stripe) {
        return function(req, res) {
            if(!req.user) {
                return res.
                 status(status.UNAUTHORIZED).
                 json({ error: 'Not Logged in'});
            } 
            console.log(req.user.populate);
            //Populate Products in User cart
            req.user.populate({ path: 'data.cart.product', model: 'Product'}, function(error, user) {
                //Sum up total price in USD
                var totalCostUSD = 0;
                _.each(user.data.cart, function(item) {
                    totalCostUSD += item.product.internal.approximatePriceUSD * item.quantity;
                });

                // And Create a charge in stripe corrosponding to the price
                Stripe.charges.create(
                    {
                        //Stripe wants price in cents, *100 and roudup
                        amoumt: Math.ceil(totalCostUSD * 100),
                        currency: 'usd',
                        source: req.body.stripeToken,
                        description: 'Example charge'
                    },
                    function(err, charge) {
                 /**        if(err && err.type === 'StripeCardError') {
                            return res.
                             status(status.BAD_REQUEST).
                             json({ error: err.toString() });
                            
                        }*/ 
                        if(err) {
                            console.log(err);
                            return res.
                             status(status.INTERNAL_SERVER_ERROR).
                             json({ error: err.toString() });
                        }

                        req.user.data.cart = [];
                        req.user.save(function() {
                            //Ignore any errors
                            return res.json({ id: charge.id});
                        });
                });
            });
        }
    }));

    return api;
};
