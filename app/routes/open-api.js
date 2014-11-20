var globalSchema = require('../models/schemas');

module.exports = function (app, passport) {
    var version = '0.0.1';

    app.get('/open-api', function (req, res) {
        res.json({
            name: 'Open API',
            version: version
        });
    });


    app.post('/open-api/store/:store_id?', function (req, res) {
        var filter = {};
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

            console.log(filter);
            globalSchema.Store.find({
                location: {
                    $near: [req.body.location.lng, req.body.location.lat],
                    $maxDistance: maxDistance
                }
            }, function (err, stores) {
                if (err) {
                    console.log(err);
                    return res.status(400).json({
                        status: false, message: err
                    });
                } else {
                    console.log(stores.length);
                    return res.json({
                        status: true,
                        data: stores
                    });
                }
            });
        }
    });

    app.get('/open-api/item/:store_id/:item_id?', function (req, res) {
        var filter = {};

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

        if (filter._id) {
            globalSchema.Item.findOne(filter, function (err, item) {
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
            globalSchema.Item.find(filter, function (err, items) {
                if (err) {
                    return res.status(400).json({
                        status: false, message: err
                    });
                } else {
                    return res.json({
                        status: true,
                        data: items
                    });
                }
            });
        }
    });


};