var express = require('express');
var app = express();


//open api
require('./routes/open-api')(app);

//store sync
require('./routes/store-sync')(app);


module.exports = app;
