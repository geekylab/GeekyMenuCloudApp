module.exports = function (app, passport) {
    var version = '0.0.1';

    app.get('/auth', function (req, res) {
        res.json({
            name: 'auth',
            version: version
        });
    });

    //server hash
    app.get('/auth/s/:hash', passport.authenticate('local-hash', {}),
        function (req, res) {
            var user = res.user;
            console.log('test');
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