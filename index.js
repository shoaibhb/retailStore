var express = require('express');
var wagner = require('wagner-core');

var sa = require('superagent'); //required for un-controlled test block at server init

require('./models')(wagner);
require('./dependencies')(wagner);

//models = require('./models')(wagner);

var app = express();

wagner.invoke(require('./auth'), {app: app});

app.use('/api/v1', require('./api')(wagner));

app.listen(3131);
console.log('listening on 3131...');
