var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var flash = require('connect-flash');
var expressSession = require('express-session');
var MongoStore = require('connect-mongo')(expressSession);
var mongoose = require('mongoose');
var path = require('path');
var methodOverride = require('method-override');
var EventEmitter = require('events').EventEmitter;
var authConfig = require('./config/auth.local.js');
var appEvent = new EventEmitter();
var app = express();
require('./config/passport')(passport);

app.prototype.__proto__ = EventEmitter.prototype;
EventEmitter.call(app);

// required for passport
var myMongoStore = new MongoStore({
    db: mongoose.connection.db
});

app.set('port', process.env.LISTEN_PORT || 80);
var server = app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + server.address().port);
});
var io = require('socket.io').listen(server);
app.set('io', io);


//app settings
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'GeekyOSEasyControl/app'));

//cache
/*
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
 fallbacks: []
 }));
 */
app.use(methodOverride());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: false, limit: '50mb'}));
app.use(cookieParser());

app.use(expressSession({
        secret: authConfig.secret_key,
        resave: true,
        saveUninitialized: true,
//        cookie: {},
        store: myMongoStore
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// socket io
var User = require('./models/schemas').User;
io.set('authorization', function (handshakeData, callback) {
    console.log(handshakeData._query.hash);
    if (handshakeData._query && handshakeData._query.hash) {
        var user_hash = handshakeData._query.hash;
        User.findOne({serverHash: user_hash}, function (err, user) {
            if (user) {
                handshakeData.user = user;
                callback(null, true); // error first, 'authorized' boolean second
            } else {
                callback('user not found', false); // error first, 'authorized' boolean second
            }
        });
    } else {
        callback('hash not found', false); // error first, 'authorized' boolean second
    }
});

io.sockets.on('connection', function (socket) {
    if (socket.request.user) {
        if (socket.request.user) {
            app.on('sync:all:finish:' + socket.request.user.serverHash, function (data) {
                console.log('emit socket');
                socket.emit('notice', data);
            });
        }

        socket.on('disconnect', function () {
            if (socket.request.user) {
                var eventName = 'sendNotice:' + socket.request.user._id;
                app.removeListener(eventName, function () {
                });
                console.log('disconnect11: ', socket.request.user.username);
            }
        });

    }
});


require('./routes/auth')(app, passport, isLoggedIn);
app.use('/app', express.static(path.join(__dirname, '/GeekyOSEasyControl/app')));
require('./routes/app-core')(app, passport, isLoggedIn);

//open api
require('./routes/open-api')(app, passport, isLoggedIn, cors);

//store sync
require('./routes/store-sync')(app, passport, appEvent, isLoggedIn);

//api test
app.use('/request-tester', express.static(path.join(__dirname, 'views/api-tester')));


//catch 404 and forward to error handler
//app.use(function (req, res, next) {
//    var err = new Error('Not Found');
////    err.status = 404;
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

//module.exports = app;
