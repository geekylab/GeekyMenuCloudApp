var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var expressSession = require('express-session');
var cacheManifest = require('connect-cache-manifest');
var path = require('path');
var methodOverride = require('method-override');
var app = express();
require('./config/passport')(passport);


//app settings
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'GeekyOSEasyControl/app'));
//cache
app.use(cacheManifest({
    manifestPath: '/app/application.manifest',
    files: [{
        dir: __dirname + '/GeekyOSEasyControl/app/',
        prefix: '/app/',
        ignore: function (x) {

            if (/\.bower.*|bower\.json|package\.json|\.csscomb\.json/.test(x)) {
                return true;
            }

            //if (/views\/templates/.test(x)) {
            //    return false;
            //}

            if (/\.js$|\.ejs$|\.css$|\.json$/.test(x)) {
                return false;
            }

            //fonts
            if (/\.otf$|\.svg$|\.ttf$|\.woff$/.test(x)) {
                return false;
            }

            //images
            if (/\.jpe?g$|\.git$|\.png$/.test(x)) {
                return false;
            }
            console.log(x);
            return true;
        },
        replace: function (x) {
            return x.replace(/\.ejs/, '');
        }
    }
        //    , {
        //    dir: __dirname + '/views',
        //    prefix: '/app/views/',
        //    ignore: function (x) {
        //        return /\.bak$/.test(x);
        //    },
        //    replace: function (x) {
        //        return x.replace(/\.ejs/, '.html');
        //    }
        //}
    ],
    networks: ['*'],
    fallbacks: ['/app']
}));


app.use(methodOverride());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: false, limit: '50mb'}));
app.use(cookieParser());

// required for passport
app.use(expressSession({
        secret: 'lfsjdlfkjsdlfjsldkjfsblablablabla',
        resave: true,
        saveUninitialized: true
    })
); // session secret
app.use(passport.initialize());
app.use(passport.session({
    cookie: {
        maxAge: 3600000
    }
}));
app.use(flash());


require('./routes/auth')(app, passport, isLoggedIn);
app.use('/app', express.static(path.join(__dirname, '/GeekyOSEasyControl/app')));
require('./routes/app-core')(app, passport, isLoggedIn);

//open api
require('./routes/open-api')(app, passport, isLoggedIn);

//store sync
require('./routes/store-sync')(app, passport, isLoggedIn);


// catch 404 and forward to error handler
//app.use(function (req, res, next) {
//    var err = new Error('Not Found');
//    err.status = 404;
//    next(err);
//});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.status(401).json({error: 'not auth'});
}

//app.use(function (err, req, res, next) {
//    res.status(err.status || 500);
//    res.render('error', {
//        message: err.message,
//        error: err
//    });
//});

module.exports = app;
