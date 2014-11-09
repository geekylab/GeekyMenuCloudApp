module.exports = function (app, passport) {
    var version = '0.0.1';
    app.get('/sync', function (req, res) {
        res.json({
            name: 'Sync API',
            version : version
        });
    });

};