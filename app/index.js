var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var flash = require('connect-flash');
var expressSession = require('express-session');
var MongoStore = require('connect-mongo')(expressSession);
var mongoose = require('mongoose');
//var cacheManifest = require('connect-cache-manifest');
var path = require('path');
var methodOverride = require('method-override');
var passportSocketIo = require("passport.socketio");
var EventEmitter = require('events').EventEmitter;
var appEvent = new EventEmitter();
var app = express();
require('./config/passport')(passport);


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

var notices = [];
io.sockets.on('connection', function (socket) {
    if (socket.request.user) {
        console.log("connection!!!!!");
        if (socket.request.user.facebook) {
            console.log("connection11", socket.request.user.facebook.name);


            appEvent.on('sendNotice:' + socket.request.user._id, function (data) {
                socket.emit('notice', data);
            });
        }


        socket.on('disconnect', function () {
            if (socket.request.user.facebook) {
                var eventName = 'sendNotice:' + socket.request.user._id;
                appEvent.removeListener(eventName, function () {
                });
                console.log('disconnect11: ', socket.request.user.facebook.name);
            }
        });

    }
});


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
        secret: 'lfsjdlfkjsdlfjsldkjfsblablablabla',
        resave: true,
        saveUninitialized: true,
//        cookie: {},
        store: myMongoStore
    })
); // session secret
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


//socket io
io.use(passportSocketIo.authorize({
    cookieParser: cookieParser,
//    key: 'express.sid',       // the name of the cookie where express/connect stores its session_id
    secret: 'lfsjdlfkjsdlfjsldkjfsblablablabla',    // the session_secret to parse the cookie
    store: myMongoStore,        // we NEED to use a sessionstore. no memorystore please
    success: onAuthorizeSuccess,  // *optional* callback on success - read more below
    fail: onAuthorizeFail      // *optional* callback on fail/error - read more below
}));

function onAuthorizeSuccess(data, accept) {
    console.log('successful connection to socket.io');

    //// The accept-callback still allows us to decide whether to
    //// accept the connection or not.
    //accept(null, true);
    //
    //// OR
    //
    //// If you use socket.io@1.X the callback looks different
    accept();
}

// load up the user model
var User = require('./models/schemas').User;

function onAuthorizeFail(data, message, error, accept) {
    if (error)
        throw new Error(message);

    if (data._query.hash) {
        User.findOne({serverHash: data._query.hash}, function (err, user) {
            if (!user) {
                console.log("not user", data._query.hash);
                accept(new Error("err"));
            } else {
                data['user'] = user;
                data['user'].logged_in = true;
                accept();
            }
        });
    } else {
        console.log('failed connection to socket.io:', message);
        if (error)
            accept(new Error(message));
        // this error will be sent to the user as a special error-package
        // see: http://socket.io/docs/client-api/#socket > error-object
    }
}


require('./routes/auth')(app, passport, isLoggedIn);
app.use('/app', express.static(path.join(__dirname, '/GeekyOSEasyControl/app')));
require('./routes/app-core')(app, passport, isLoggedIn);

//open api
require('./routes/open-api')(app, passport, isLoggedIn);

//store sync
require('./routes/store-sync')(app, passport, appEvent, isLoggedIn);


//catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

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
