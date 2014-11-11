var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var app = express();


app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: false, limit: '50mb'}));
app.use(cookieParser());
app.set('view engine', 'ejs');


//open api
require('./routes/open-api')(app);

//store sync
require('./routes/store-sync')(app);


module.exports = app;
