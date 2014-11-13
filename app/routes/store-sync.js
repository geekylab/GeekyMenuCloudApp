module.exports = function (app, passport, appEvent) {
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

    var io = app.get('io');
    app.post('/sync/all', function (req, res) {
        if (req.body.datas != undefined) {
            console.log(req.body.datas);
//            req.body.datas.forEach(function (data) {
//                if (data.datas != undefined && data.datas.length > 0) {
//                    data.datas.forEach(function (obj) {
//                        console.log(data.type);
//                        if (data.type == 'save' || data.type == 'update') {
////                            console.log('update or save', obj);
//                        } else if (data.type == 'delete') {
//                            //                          console.log('delete', obj);
//                        }
//                    });
//                }
//            });
            setTimeout(function () {
                appEvent.emit('sendNotice:' + req.body.datas.userHash);
            }, 5000);
        }


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