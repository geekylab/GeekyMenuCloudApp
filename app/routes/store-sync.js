module.exports = function (app, passport) {
    var version = '0.0.1';
    var bodyParser = require('body-parser');
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({extended: false, limit: '50mb'}));

    app.get('/sync', function (req, res) {
        res.json({
            name: 'Sync API',
            version: version
        });
    });


    app.put('/sync/store', function (req, res) {
        console.log('put::/sync/store');
        console.log(req.body);
        res.json({
            status: true,
            message: 'saved'
        })
    });

    app.post('/sync/store', function (req, res) {
        console.log('post::/sync/store');
        console.log(req.body);
        res.json({
            status: true,
            message: 'saved'
        })
    });


};