// config/passport.js

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var GoogleTokenStrategy = require('passport-google-token').Strategy;
var DigestStrategy = require('passport-http').BasicStrategy;
var authConfig = require('../config/auth.local.js');

// load up the user model
var User = require('../models/schemas').User;
module.exports = function (passport) {

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function (req, username, password, done) {
            // asynchronous
            process.nextTick(function () {
                User.findOne({'username': username}, function (err, user) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);
                    // if no user is found, return the message
                    if (!user)
                        return done(null, false, req.flash('loginMessage', 'No user found.'));
                    if (!user.validPassword(password))
                        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                    // all is well, return user
                    else
                        return done(null, user);
                });
            });
        }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, username, password, done) {
            // asynchronous
            process.nextTick(function () {
                User.findOne({'username': username}, function (err, existingUser) {
                    if (err)
                        return done(err);

                    if (existingUser)
                        return done(null, false, req.flash('signupMessage', 'That user is already taken.'));

                    if (req.user) {
                        var user = req.user;
                        user.username = username;
                        user.password = user.generateHash(password);
                        user.save(function (err) {
                            if (err)
                                throw err;
                            return done(null, user);
                        });
                    }

                    // We're not logged in, so we're creating a brand new user.
                    else {
                        // create the user
                        var newUser = new User();
                        newUser.fullname = req.body.fullname;
                        newUser.username = username;
                        newUser.password = newUser.generateHash(password);
                        newUser.save(function (err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            });
        }));

    // =========================================================================
    // DIGEST LOGIN =============================================================
    // =========================================================================
    passport.use('digest-login', new DigestStrategy({qop: 'auth'},
        function (username, password, done) {
            console.log('digest-login', username);
            User.findOne({username: username}, function (err, user) {
                if (err) {
                    return done(err);
                }

                if (!user) {
                    return done(null, false);
                }

                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                return done(null, user);
            });
        },
        function (params, done) {
            // validate nonces as necessary
            done(null, true)
        }
    ));


    passport.use('google-token',new GoogleTokenStrategy({
        clientID: authConfig.googleAuth.clientID,
        clientSecret: authConfig.googleAuth.clientSecret
      },
      function(accessToken, refreshToken, profile, done) {
        console.log(profile);
        return done(null, profile);
        // User.findOrCreate({ googleId: profile.id }, function (err, user) {
        //   return done(err, user);
        // });
      }
    ));

};

