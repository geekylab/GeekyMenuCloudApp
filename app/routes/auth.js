module.exports = function (app, passport) {
    var version = '0.0.1';

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
            console.log('user OK');
            return res.json({status: true, message: 'OK'});


        })(req, res, next);
    });

    app.post('/auth/signup', function (req, res, next) {
        passport.authenticate('local-signup', function (err, user, info) {
            console.log('call cloud local-signup');
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
            console.log('user OK');
            return res.json({status: true, message: 'OK'});


        })(req, res, next);
    });

    // facebook -------------------------------
    // send to facebook to do the authentication
    app.get('/auth/connect/facebook', passport.authorize('facebook', {scope: 'email'}));


    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {failureRedirect: '/app/login'}),
        function (req, res) {
            var user = req.user;

            //redirect to local login
            res.redirect('http://127.0.0.1:3000/login/' + user.serverHash);
        });
};