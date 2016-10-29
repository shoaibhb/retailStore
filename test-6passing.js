var URL_ROOT = 'http://localhost:3131';
var express = require('express');
var wagner = require('wagner-core');
var assert = require('assert');
var superagent = require('superagent');
var mongoose = require('mongoose');
//mongoose.set('debug', true);

var PRODUCT_ID = '0000000000000000000001';
        
describe('Store API', function(){
    var server; 
    var Product;
    var Catagory;
    var User;
        
   
    before(function() {
        var app = express();

        // Bootstrap sertver
        models = require('./models')(wagner);
        require('./dependencies')(wagner);
        app.use(require('./api')(wagner));
        wagner.invoke(require('./auth'), {app: app});
        server = app.listen(3131);

        //Make Catagory and Product model available in test
        Catagory = models.Catagory;
        Product = models.Product;
        User = models.User;

        
        app.use( function(req, res, next) {
          User.findOne({}, function(error, user) {
               console.log('Time:', Date.now());
               assert.ifError(error);
               req.user = user;
               next();
           });  //user.findone
       }); //app.use
    }); //before

    after(function(){
        //Shut the server
        server.close();
    }); //after
 
    beforeEach(function(done) {
        //Make sure Catagories are empty before each test
        Catagory.remove({}, function(error) {
            assert.ifError(error);
            Product.remove({}, function(error) {
                assert.ifError(error);
                User.remove({}, function(error) {
                    assert.ifError(error);
                    //Create Products, Catagories and Users
                    var catagories = [
                        { _id: 'Electronics'},
                        { _id: 'Phones', parent: 'Electronics'},
                        { _id: 'Laptop', parent: 'Electronics'},
                        { _id: 'Meat'}
                    ];

                    // create product data
                    var products = [
                        {
                            _id: '00000000000001',
                            name: 'LG G4',
                            catagory: { _id: 'Phones', ancestors: ['Electronics', 'Phones']},
                            price: {
                                amount: 300,
                                currency: 'USD'
                            }
                        },
                        {
                            _id: '00000000000002',
                            name: 'Asus Zenbook Prime',
                            catagory: { _id: 'Laptop', ancestors: ['Electronics', 'Laptop']},
                            price: {
                                amount: 2000,
                                currency: 'USD'
                            }
                        },
                        {
                            _id: '00000000000003',
                            name: 'MeatOne Goasht Wala',
                            catagory: {_id: 'Meat', ancestors: ['Meat']},
                            price: {
                                amount: 20,
                                currency: 'USD'
                            }
                        }
                    ];

                    var users = [{
                        profile: {
                            username: 'shoaibhb',
                            picture: 'http://pbs.twimg.com/profile_images/364903575/ShoaibHayat_Butt.jpg'
                        },
                        data: {
                            oauth: 'invalid',
                            cart: []
                        }
                    }];
                    
                    Catagory.create( catagories, function(error) {
                        assert.ifError(error)
                        Product.create(products, function(error) {
                            assert.ifError(error)
                              User.create(users, function(error) {
                                  assert.ifError(error);
                                  User.findOne({}, function(err, user) {
                                        
                                  });
                             });
                        });
                    });
                });
                done();
            });
        });
    });

    it('can load a Catagory by id', function(done) {
        // Create a single Catagory
        // Catagory.create({ _id: 'Electronics' }, function(error, doc) {
        //     assert.ifError(error);
            var url = URL_ROOT + '/catagory/id/Electronics';
            //Make and HTTP request to localhost:3131/catagory/id/Electronics
            superagent.get(url, function(error, res) {
                assert.ifError(error);
                var result;
                // and make sure we got { _id: 'Electronics'} back
                assert.doesNotThrow(function() {
                    result = JSON.parse(res.text);
                });
                assert.ok(result.catagory);
                assert.equal(result.catagory._id, 'Electronics');
                done();
            });
        //});// ends here
    });

    it('can load all Catagories that have a certain parent', function(done) {
      
        // Create 4 catagories was here earlier, moved to beforeEach()

        //Catagory.create(catagories, function(error, catagories) {
            var url = URL_ROOT + '/catagory/parent/Electronics';
            //make HTTP request to /catagory/parent/Electronics
            superagent.get(url, function(error, res) {
                assert.ifError(error);
                var result;
                assert.doesNotThrow(function() {
                    result = JSON.parse(res.text);
                });
                assert.equal(result.catagories.length, 2);
                // should be in assending order by _id
                assert.equal(result.catagories[0]._id, 'Laptop');
                assert.equal(result.catagories[1]._id, 'Phones');
                done();
            });
        //});// create cat ends here
    });
 
    it('can load a product by id', function(done) {
        //Create a single product

        
        var oneProduct = {
                name: 'LG G4',
                _id: PRODUCT_ID,
                catagory: { _id: 'Phones', ancestors: ['Electronics', 'Phones']},
                price: {
                    amount: 300,
                    currency: 'USD'
                }
            };
        
        Product.create(oneProduct, function(error, doc) {
          assert.ifError( error);
            var url = URL_ROOT + '/product/id/' + PRODUCT_ID;
            // Make HTTP request to 
            // localhost:3131/product/id/0000000000000000000001
            superagent.get(url, function(error, res) {
                assert.ifError(error);
                var result = {};
                //And make sure we got LG G4 back
                
                assert.doesNotThrow(function() {
                    result = JSON.parse(res.text);
                });

                assert.ok(result.product);
                assert.equal(result.product._id, PRODUCT_ID);
                assert.equal(result.product.name, 'LG G4');
                done();
            });     
        });
    });

    it('can load all products in a Catagory with sub-catagories', function(done) {
        
        // moved to beforeEach function 
       
                var url = URL_ROOT + '/product/catagory/Electronics';
                //Make HTTP Request to loca:3131
                superagent.get(url, function(error, res) {
                    assert.ifError(error);
                    var result;
                    assert.doesNotThrow(function() {
                        result = JSON.parse(res.text);                
                    });
                    assert.equal(result.product.length, 2);
                    // should be assending order by name
                    assert.equal(result.product[0].name, 'Asus Zenbook Prime');
                    assert.equal(result.product[1].name, 'LG G4');

                    //Sort by price , assending
                    var url = URL_ROOT + '/product/catagory/Electronics?price=1';
                    superagent.get(url, function(error, res) {
                        assert.ifError(error);
                        var result;
                        assert.doesNotThrow(function() {
                            result = JSON.parse(res.text);
                        });
                        assert.equal(result.product[0].name, 'LG G4');
                        assert.equal(result.product[1].name, 'Asus Zenbook Prime');
                    });
                    //console.log(error);
                    assert.ifError(error);
                    done();
            });
    });

         
    it('can load user cart', function(done) {
        var url = URL_ROOT + '/me/';
        User.findOne({}, function( error, user) {
            console.log("error %j",error);
            //assert.ifError(error);
            user.data.cart = [{ product: PRODUCT_ID, quantity: 1}];
            console.log(user.data.cart);
            user.save(function(error) {
                assert.ifError(error);
                superagent.get(url, function(error, res) {
                    assert.ifError(error);
                    assert.equal(res.status, 200);
                    var result;
                    assert.doesNotThrow(function() {
                        result = JSON.parse(res.text).user;
                    });
                    assert.equal(result.data.cart.length,1);
                    assert.equal(result.data.cart[0].product.name, 'Asus Zenbook Prime');
                    assert.equal(result.data.cart[0].quantity, 1);
                    
                });
            });
        });
        done();
    });


      
    it('can save user cart', function(done) {
        var url = URL_ROOT + '/me/cart/';

        superagent.put(url).send({
             data: {
                 cart: [{ product: PRODUCT_ID, quantity: 1}]
             }
         }).end(function(error, res) {
             assert.ifError(error);
             assert.equal(res.status, status.OK);
             User.findOne({}, function(error, user) {
                 assert.ifError(error);
                 assert.equal(user.data.cart.length, 1);
                 assert.equal(user.data.cart[0].product, PRODUCT_ID);
                 assert.equal(user.data.cart[0], quantity, 1);
             });
         });
         done();
    });


});