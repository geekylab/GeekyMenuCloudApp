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

    app.post('/sync/image', digestAuth, function (req, res) {
        var size = 0;

        req.on('data', function (data) {
            size += data.length;
            console.log('Got chunk: ' + data.length + ' total: ' + size);
        });

        req.on('end', function () {
            console.log("total size = " + size);
            res.end("Thanks");
        });

        req.on('error', function(e) {
            console.log("ERROR ERROR: " + e.message);
        });

        res.send("Thanks");
    });


    app.post('/sync/store/:store_id?', digestAuth, function (req, res) {
        var user = req.user;
        if (req.params.store_id) {
            var newStore = req.body.store;
            globalSchema.Store.findOne({org_id: req.params.store_id, user: user._id}, function (err, store) {
                console.log(newStore);
                if (!store) {
                    store = new globalSchema.Store();
                }

                newStore.user = req.user._id;
                store.setByParams(newStore, function (err) {
                    if (err) {
                        return res.status(400).json({status: false, message: err});
                    } else {
                        store.save(function () {
                            if (err) throw err;
                            res.json({status: true, message: 'store is updated', store: store});
                        });
                    }
                });
                //store.store_name = newStore.store_name;
                //store.seat_count = newStore.seat_count;
                //store.location = newStore.location;
                //store.address2 = newStore.address2;
                //store.address = newStore.address;
                //store.city = newStore.city;
                //store.state = newStore.state;
                //store.zip_code = newStore.zip_code;
                //store.country = newStore.country;
                //store.tel = newStore.tel;
                //store.desc = newStore.desc;
                //store.created = newStore.created;
                //store.tables = newStore.tables;
                //store.opts = newStore.opts;
                //store.images = newStore.images;
                //store.seat_type = newStore.seat_type;
                //store.opening_hour = newStore.opening_hour;
            });
        }
    });

    app.post('/sync/item/:item_id?', digestAuth, function (req, res) {
        var user = req.user;
        if (req.params.item_id) {
            var newItem = req.body.item;
            console.log(newItem);
            globalSchema.Item.findOne({org_id: req.params.item_id, user: user._id}, function (err, item) {
                if (!item) {
                    item = new globalSchema.Item();
                }
                newItem.user = req.user._id;
                item.setByParams(newItem, function (err) {
                    if (err) {
                        return res.status(400).json({status: false, message: err, store: item});
                    } else {
                        item.save(function (err) {
                            if (err) throw err;
                            return res.json({status: true, message: 'store is updated', store: item});
                        });
                    }
                });
            });
        }
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
                                            obj.setByParams(updateData, function () {
                                                obj.save(function (err) {
                                                    if (err)
                                                        throw err;
                                                    return callback1();
                                                });
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