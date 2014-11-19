module.exports = function (app, passport, appEvent) {
    var version = '0.0.1';
    var async = require('async');
    var digestAuth = passport.authenticate('digest-login', {session: false});
    var globalSchema = require('../models/schemas');
    var schemasObjs = {
        'store': globalSchema.Store,
        'item': globalSchema.Item
    };

    app.get('/sync', digestAuth, function (req, res) {
        console.log(req.user);
        res.json({
            name: 'Sync API',
            version: version
        });
    });

    var io = app.get('io');
    app.post('/sync/all', digestAuth, function (req, res) {
        if (req.body.data != undefined) {
            var postData = req.body.data;
            var user = req.user;
            if (postData.datas && postData.datas.length > 0) {
                async.eachSeries(postData.datas, function (data, callback) {
                    if (data.type && data.name && schemasObjs[data.name]) {
                        var schemaObj = schemasObjs[data.name];
                        async.eachSeries(data.datas, function (updateData, callback1) {
                            if (updateData != null && data.type == 'update' || data.type == 'save') {
                                if (updateData._id) {
                                    schemaObj.findOne({org_id: updateData._id, user: user._id}, function (err, obj) {
                                        if (!obj) {
                                            obj = new schemasObjs[data.name];
                                        }
                                        if (obj.setByParams) {
                                            updateData.user = user._id;
                                            obj.setByParams(updateData);
                                            obj.save(function (err) {
                                                if (err)
                                                    throw err;
                                                return callback1();
                                            });
                                        } else {
                                            return callback1();
                                        }
                                    });
                                } else {
                                    callback1();
                                }
                            } else {
                                //
                                callback1();
                            }

                        }, function (err) {
                            if (err) {
                                // One of the iterations produced an error.
                                // All processing will now stop.
                                console.log('A file failed to process');
                            } else {
                                console.log('All files have been processed successfully');
                                callback();
                            }
                        });
                    }
                }, function (err) {

                    if (err) {
                        console.log(err);
                    } else {
                        console.log('sync:all:finish');
                        //todo: send event finish
                        app.emit('sync:all:finish:' + user.serverHash, postData);
                    }
                });

                return res.json({
                    status: true,
                    message: 'Your request was successfully accepted.'
                });
            }
        }

        res.status(500).json({
            status: false,
            message: 'Invalid parameters.'
        });

    });

    app.post('/sync/store', digestAuth, function (req, res) {
        console.log('post::/sync/store');
        console.log(req.body);
        res.json({
            status: true,
            message: 'saved'
        })
    });


};