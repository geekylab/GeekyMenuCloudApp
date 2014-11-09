module.exports = function (app, passport) {
    var version = '0.0.1';

    app.get('/open-api', function (req, res) {
        res.json({
            name: 'Open API',
            version : version
        });
    });

};