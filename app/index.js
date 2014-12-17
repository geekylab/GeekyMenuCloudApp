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
var async = require('async');
var appEvent = new EventEmitter();
var app = express();

app.use(cors());

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
var Store = require('./models/schemas').Store;
var Customer = require('./models/schemas').Customer;
io.set('authorization', function (handshakeData, callback) {
    console.log("authorization");
    console.log(handshakeData._query);
    if (handshakeData._query && handshakeData._query.hash) {
        var user_hash = handshakeData._query.hash;
        async.waterfall([
            function (asyncCallback) { //search user
                User.findOne({serverHash: user_hash}, function (err, user) {
                    if (user) {
                        asyncCallback(null, user);
                    } else {
                        asyncCallback('user not found', false);
                    }
                });
            }, function (user, asyncCallback) { //find user store
                Store.findOne({user:user._id},function(err, myStore) {
                    if (err) {
                        return asyncCallback(err);
                    }
                    if (myStore) {
                        user.store = myStore;
                    }
                    asyncCallback(null, user);
                });
            }
        ],function(err, user){
            handshakeData.user = user;
            callback(null, true);
        });

    } else if (handshakeData._query &&
        handshakeData._query.service_token &&
        handshakeData._query.store_id &&
        handshakeData._query.table_token) {

        async.waterfall([
            function (asyncCallback) { //search user
                var service_token = handshakeData._query.service_token;
                Customer.findOne({service_token: service_token}, function (err, user) {
                    if (user) {
                        console.log("has customer");
                        asyncCallback(null, user);
                    } else {
                        asyncCallback('user not found', false);
                    }
                });
            }, function (user, asyncCallback) { //find user store
                var store_id = handshakeData._query.store_id;
                Store.findById(store_id,function(err, myStore) {

                    if (err) {
                        return asyncCallback(err);
                    }

                    if (myStore) {
                        console.log("has store");
                        user.store_id = store_id;
                    } else {
                        console.log("no store");
                    }

                    asyncCallback(null, user, myStore);
                });
            }
        ],function(err, user){
            handshakeData.customer = user;
            callback(null, true);
        });


    } else {
        callback('hash not found', false);
    }
});

var connectedUsers = {};
io.sockets.on('connection', function (socket) {
    console.log("connection");
    if (socket.request.user) {
            connectedUsers[socket.request.user.serverHash] = socket;
            if (socket.request.user.store) {
                socket.join(socket.request.user.store._id);
                console.log("store join in", socket.request.user.store._id);
            }
    } else if (socket.request.customer) {
        console.log("johna");
        if (socket.request.customer.store_id) {
            socket.join(socket.request.customer.store_id);
            console.log("customer join in", socket.request.customer.store_id);
        }
    } else {
        socket.disconnect();
    }


    socket.on('disconnect', function () {
        if (socket.request.user) {
            if (connectedUsers[socket.request.user.serverHash]) {
                connectedUsers[socket.request.user.serverHash] = null;
                delete connectedUsers[socket.request.user.serverHash];
            } else {
                console.log('no object');
            }
            console.log('disconnect: ', socket.request.user.username);
        }
    });

    socket.on("neworder", function (msg) {
        var room = this.handshake.query.store_id;
        io.to(room).emit('neworder',msg);


    });
});


require('./routes/auth')(app, passport, isLoggedIn);
app.use('/app', express.static(path.join(__dirname, '/GeekyOSEasyControl/app')));
require('./routes/app-core')(app, passport, isLoggedIn);

//open api
require('./routes/open-api')(app, passport, isLoggedIn, cors, connectedUsers);
//api test
app.use('/assets', express.static(path.join(__dirname, 'views/assets')));

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
