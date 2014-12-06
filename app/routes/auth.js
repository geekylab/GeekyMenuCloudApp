module.exports = function (app, passport) {
    var version = '0.0.1';
    var request = require('request');

    app.get('/auth', function (req, res) {
        res.json({
            name: 'auth',
            version: version
        });
    });

    //server login
    app.post('/auth/login', function (req, res, next) {
        passport.authenticate('local-login', function (err, user, info) {
            console.log('call cloud login');
            if (err) {
                return next(err);
            }

            if (!user) {
                console.log('user not found');
                return res.json({status: false, message: 'user is not found'});
            }
            //
            //req.logIn(user, function(err) {
            //    if (err) { return next(err); }
            //    return res.redirect('/users/' + user.username);
            //});
            return res.json({status: true, message: 'OK'});


        })(req, res, next);
    });

    app.post('/auth/signup', function (req, res, next) {
        passport.authenticate('local-signup', function (err, user, info) {
            if (err) {
                return next(err);
            }

            if (!user) {
                return res.json({
                    status: false,
                    message: 'user is not found'
                });
            }
            //
            //req.logIn(user, function(err) {
            //    if (err) { return next(err); }
            //    return res.redirect('/users/' + user.username);
            //});
            return res.json({status: true, message: 'OK'});


        })(req, res, next);
    });

    var digestAuth = passport.authenticate('digest-login', {session: false});
    app.get('/auth/token', digestAuth, function (req, res, next) {
        var user = req.user;
        if (user) {
            user.serverHash = user.generateServerHash("" + user._id);
            user.save(function (err, user) {
                if (err)
                    return res.status(400).json(err);
                res.json({'token': user.serverHash});
            });
        }
    });

    app.post('/auth/google-token', passport.authenticate('google-token'), function (req, res, next) {
        var user = req.user;
        return res.json({
            status: true, message: 'OK',
            profile: user
        });
    });

    //var accessToken = req.body.access_token || req.query.access_token;
    //
    //var responseCallback = function (status, message, profile) {
    //    return res.json({
    //        status: true,
    //        message: 'OK',
    //        profile: profile
    //    });
    //};

    //if (accessToken) {
    //    request('https://www.googleapis.com/plus/v1/people/me?access_token=' + accessToken, function (error, response, body) {
    //        if (!error && response.statusCode == 200) {
    //            try {
    //                var json = JSON.parse(body);
    //
    //                var profile = {
    //                    provider: 'google'
    //                };
    //                profile.id = json.id;
    //                profile.displayName = json.name;
    //                profile.name = {
    //                    familyName: json.family_name,
    //                    givenName: json.given_name
    //                };
    //                profile.emails = [{value: json.email}];
    //
    //                profile._raw = body;
    //                profile._json = json;
    //
    //                User.findOne({username: username}, function (err, user) {
    //
    //                });
    //
    //                responseCallback(true, 'OK', profile);
    //
    //            } catch (e) {
    //                responseCallback(false, 'NG', null);
    //            }
    //        } else {
    //            responseCallback(false, 'NG', null);
    //        }
    //    });
    //} else {
    //    responseCallback(false, 'Invalid params', null);
    //}

    //// facebook -------------------------------
    //// send to facebook to do the authentication
    //app.get('/auth/connect/facebook', passport.authorize('facebook', {scope: 'email'}));
    //
    //
    //app.get('/auth/facebook/callback',
    //    passport.authenticate('facebook', {failureRedirect: '/app/login'}),
    //    function (req, res) {
    //        var user = req.user;
    //
    //        //redirect to local login
    //        res.redirect('http://127.0.0.1:3000/login/' + user.serverHash);
    //    });
};