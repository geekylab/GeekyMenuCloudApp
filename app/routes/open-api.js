var globalSchema = require('../models/schemas');
var async = require('async');

module.exports = function (app, passport, isLoggedIn, cors, connectedUsers) {
    var version = '0.0.1';

    app.get('/open-api', function (req, res) {
        res.json({
            name: 'Open API',
            version: version
        });
    });

    app.get('/open-api/global-category', cors(), function (req, res) {
        var dummyImageBaseUrl = "http://192.168.111.103:8080/assets";
        return res.json({
            status: true,
            data: [
                {
                    name: "Italiano",
                    image_url: dummyImageBaseUrl + "/italiano.jpg"
                },
                {
                    name: "Japonesa",
                    image_url: dummyImageBaseUrl + "/japonesa.jpg"
                },
                {
                    name: "Francesa",
                    image_url: dummyImageBaseUrl + "/francesa.jpg"
                },
                {
                    name: "Pizzaria",
                    image_url: dummyImageBaseUrl + "/pizzaria.jpg"
                },
                {
                    name: "Bar",
                    image_url: dummyImageBaseUrl + "/bar.jpg"
                },
                {
                    name: "Churrascaria",
                    image_url: dummyImageBaseUrl + "/churrascaria.jpg"
                }
            ]
        });
    });

    function getLang(lang) {
        console.log("getLang", lang);
        if (lang == 'ja') {
            lang = "jp";
        }
        return lang;
    }

    app.post('/open-api/store/:store_id?', cors(), function (req, res) {
        var filter = {};

        var lang = req.param('l', 'us');
        lang = getLang(lang);


        if (req.params.store_id)
            filter._id = req.params.store_id;

        if (filter._id) {
            globalSchema.Store.findOne(filter, function (err, store) {
                if (err) {
                    return res.status(400).json({
                        status: false,
                        message: err
                    });
                } else {

                    if (store.store_name) {
                        if (store.store_name[lang] != undefined) {
                            store.store_name = store.store_name[lang];
                        } else {
                            store.store_name = store.store_name["us"];
                        }
                    }

                    if (store.desc) {
                        if (store.desc[lang] != undefined) {
                            store.desc = store.desc[lang];
                        } else {
                            store.desc = store.desc["us"];
                        }
                    }

                    return res.json({
                        status: true,
                        data: store
                    });
                }
            });
        } else {
            //location search
            if (req.body.location) {
                if (req.body.location.lat && req.body.location.lng) {
                    var maxDistance = req.body.location.maxDistance || 1;
                    maxDistance = maxDistance / 111.12;
                    filter.location = {
                        $near: [req.body.location.lng, req.body.location.lat],
                        $maxDistance: maxDistance
                    };
                }
            }

            globalSchema.Store.find(filter, function (err, stores) {
                if (err) {
                    console.log(err);
                    return res.status(400).json({
                        status: false, message: err
                    });
                } else {
                    var returnArray = [];

                    for (var i = 0; i < stores.length; i++) {
                        if (stores[i].store_name[lang]) {
                            stores[i].store_name = stores[i].store_name[lang];
                        } else {
                            stores[i].store_name = stores[i].store_name["us"];
                        }

                        if (stores[i].desc[lang]) {
                            stores[i].desc = stores[i].desc[lang];
                        } else {
                            stores[i].desc = stores[i].desc["us"];
                        }
                    }


                    return res.json({
                        status: true,
                        data: stores
                    });
                }
            });
        }
    });

    app.post('/open-api/item/:store_id/:item_id?', cors(), function (req, res) {
        var filter = {};

        var lang = req.param('l', 'us');
        lang = getLang(lang);

        if (!req.params.store_id) {
            return res.status(400).json({
                status: false,
                message: 'Store Id is required'
            });
        }

        filter.store = req.params.store_id;
        if (req.params.item_id) {
            filter._id = req.params.item_id;
        }

        if (req.body.category_id) {
            filter.categories = req.body.category_id;
        }

//        console.log("filters",filter);

        if (filter._id) {
            globalSchema.Item.findOne(filter)
                .populate('images')
                .exec(function (err, item) {
                    if (err) {
                        return res.status(400).json({
                            status: false,
                            message: err
                        });
                    } else {
                        return res.json({
                            status: true,
                            data: item
                        });
                    }
                });
        } else {
            globalSchema.Item.find(filter)
                .populate('images')
                .exec(function (err, items) {
                    if (err) {
                        return res.status(400).json({
                            status: false, message: err
                        });
                    } else {

                        for (var i = 0; i < items.length; i++) {
                            if (items[i].name[lang]) {
                                items[i].name = items[i].name[lang];
                            } else {
                                items[i].name = items[i].name["us"];
                            }

                            if (items[i].desc[lang]) {
                                items[i].desc = items[i].desc[lang];
                            } else {
                                items[i].desc = items[i].desc["us"];
                            }

                            if (items[i].images && items[i].images.length > 0) {
                                console.log('HAS image');
                                for (var j = 0; j < items[i].images.length; j++) {
                                    console.log(items[i].images[j], lang);
                                    if (items[i].images[j].filename[lang]) {
                                        console.log(items[i].images[j], lang, "has");
                                        items[i].images[j].filename = items[i].images[j].filename[lang]
                                    } else {
                                        //console.log(items[i].images[j],lang, "has no");
                                        items[i].images[j].filename = items[i].images[j].filename['us']
                                        console.log(items[i].images[j], lang, "has no");
                                    }
                                }
                            }


                        }

                        return res.json({
                            status: true,
                            data: items
                        });
                    }
                });
        }
    });


    app.post('/open-api/category/:store_id', cors(), function (req, res) {
        var filter = {};

        var lang = req.param('l', 'us');
        console.log("category", lang);
        lang = getLang(lang);


        if (!req.params.store_id) {
            return res.status(400).json({
                status: false,
                message: 'Store Id is required'
            });
        }

        filter.store = req.params.store_id;
        if (req.params.category_id) {
            filter._id = req.params.category_id;
        }

        globalSchema.Category.find(filter)
//        .populate('images')
            .exec(function (err, categories) {
                if (err) {
                    return res.status(400).json({
                        status: false, message: err
                    });
                } else {

                    for (var i = 0; i < categories.length; i++) {
                        if (categories[i].name[lang]) {
                            categories[i].name = categories[i].name[lang];
                        } else {
                            categories[i].name = categories[i].name["us"];
                        }
                    }

                    return res.json({
                        status: true,
                        data: categories
                    });
                }
            });
    });


    /**
     * image
     */

    app.get('/open-api/image/:id', cors(), function (req, res, next) {
        var user = req.user;
        globalSchema.ImageStorage.findById(req.params.id, function (err, doc) {
            if (err) return next(err);
            res.contentType(doc.contentType);
            res.write(doc.data);
            res.end();
        });
    });


    app.post('/open-api/table_token/:store_id', cors(), function (req, res) {
        console.log(req.body.table_token);
        console.log(req.body.service_token);
        var responseJson = function (status, json, message, code) {
            if (!code) {
                if (status)
                    code = 200;
                else
                    code = 400;
            }

            return res.status(code).json({
                status: status,
                data: json,
                code: code,
                message: message
            });
        };

        async.series([function (asyncCallback) {
            globalSchema.Store.findById(req.params.store_id)
                .populate('user')
                .exec(function (err, store) {
                    if (store) {
                        asyncCallback(null, store.user.serverHash)
                    } else {
                        asyncCallback("store not found")
                    }
                });

        }, function (asyncCallback) {
            globalSchema.Customer
                .findOne({service_token: req.body.service_token}, function (err, customer) {
                    if (err)
                        return asyncCallback("internal error");

                    if (customer) {
                        asyncCallback(null, {
                            id: customer._id,
                            name: customer.name
                        });
                    } else {
                        asyncCallback(null);
                    }
                });
        }], function (err, results) {
            if (err) {
                return responseJson(false, {}, err, 400);
            }
            if (results[0]) {
                if (connectedUsers[results[0]]) {
                    var sendData = {
                        table_token: req.body.table_token
                    };

                    if (results[1]) {
                        sendData.customer = results[1];
                    }

                    connectedUsers[results[0]].emit("check_table_hash", sendData, function (data) {
                        return responseJson(true, {}, "OK");
                    });
                    
                } else {
                    return responseJson(false, {}, "server is off", 400);
                }
            } else {
                return responseJson(false, {}, "invalid parameters", 400);
            }
        });
    });

};