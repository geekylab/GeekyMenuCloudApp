module.exports = function (app, passport) {
    var version = '0.0.1';

    app.get('/app/:name', function (req, res) {
        res.render(req.params.name);
    });

};