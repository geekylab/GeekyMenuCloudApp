var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var expressSession = require('express-session');
var cacheManifest = require('connect-cache-manifest');
var path = require('path');
require('./config/passport')(passport);
var app = express();


//app settings
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: false, limit: '50mb'}));
app.use(cookieParser());
app.set('view engine', 'ejs');

// required for passport
app.use(expressSession({
        secret: 'lfsjdlfkjsdlfjsldkjfsblablablabla',
        proxy: true,
        resave: true,
        saveUninitialized: true
    })
); // session secret
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.set('views', path.join(__dirname, 'views'));

//cache
app.use(cacheManifest({
    manifestPath: '/application.manifest',
    files: [{
        dir: __dirname + '/public/js/',
        prefix: '/app/js/'
    }, {
        dir: __dirname + '/public/css',
        prefix: '/app/css/'
    }, {
        dir: __dirname + '/views',
        prefix: '/app/',
        ignore: function (x) {
            return /\.bak$/.test(x);
        },
        replace: function (x) {
            return x.replace(/\.ejs/, '');
        }
    }],
    networks: ['*'],
    fallbacks: ['/app']
}));


//open api
require('./routes/open-api')(app, passport);

//store sync
require('./routes/store-sync')(app);

//app core
app.use('/app', express.static(path.join(__dirname, '/public')));
require('./routes/app-core')(app);


module.exports = app;
