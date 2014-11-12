module.exports = function (app, passport, isLoggedIn) {
    var version = '0.0.1';

    app.get('/app/version', isLoggedIn, function (req, res) {
        res.json({
            'name': 'app',
            'version': version
        });
    });

    app.get('/app/me', isLoggedIn, function (req, res) {
        console.log('/app/me');
        var user = req.user;
        console.log(req.isAuthenticated());
        if (user) {
            return res.json(user);
        }
        res.json({});
    });

    app.get('/app/:name', function (req, res) {
        res.render(req.params.name + '.ejs');
    });

    app.get('/app/views/:name', function (req, res) {
        res.render('views/' + req.params.name + '.ejs');
    });

    app.get('/app/views/templates/:name', function (req, res) {
        res.render('views/templates/' + req.params.name + '.ejs');
    });

};