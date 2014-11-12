module.exports = function (app, passport) {
    var version = '0.0.1';

    app.get('/auth', function (req, res) {
        res.json({
            name: 'auth',
            version: version
        });
    });
    // facebook -------------------------------
    // send to facebook to do the authentication
    app.get('/auth/connect/facebook', passport.authorize('facebook', {scope: 'email'}));


    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', { failureRedirect: '/app/login' }),
        function(req, res) {
            res.redirect('/app/index');
        });
};