var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var app = express();


//open api
require('./routes/open-api')(app);

//store sync
require('./routes/store-sync')(app);


module.exports = app;
