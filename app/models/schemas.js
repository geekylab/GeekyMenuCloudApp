var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var async = require('async');

var db = mongoose.connect('mongodb://GEEKY_MONGO/geekyMenuCloud');

var StoreTable = new mongoose.Schema({
    table_number: {
        type: String,
        index: true
    },
    table_status: {
        type: Number,
        default: 0
    }
});

var Store = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    org_id: {
        type: mongoose.Schema.Types.ObjectId,
        index: true
    },
    'store_name': {
        type: mongoose.Schema.Types.Mixed,
        index: true
    },
    'desc': {
        type: mongoose.Schema.Types.Mixed
    },
    'logo': {
        type: String
    },
    'tel': {
        type: String
    },
    'country': {
        type: String
    },
    'zip_code': {
        type: String
    },
    'state': {
        type: String
    },
    'city': {
        type: String
    },
    'address': {
        type: String
    },
    'address2': {
        type: String
    },
    location: {
        type: [Number],
        index: '2d'
    },
    seat_count: {
        type: Number
    },
    'opening_hour': {
        start: {
            type: String
        },
        end: {
            type: String
        },
        last_order: {
            type: String
        }
    },
    'seat_type': [{
        type: String
    }],
    'images': [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ImageStorage'
    }],
    tables: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StoreTable'
    }],
    'opts': [{
        type: String,
        index: true
    }],
    'created': {
        type: Date,
        default: Date.now
    }
});

//Store.index({location: "2dsphere"});
Store.methods.setByParams = function (params, callback) {
    if (params._id)
        this.org_id = params._id;

    if (params.user)
        this.user = params.user;

    if (params.store_name)
        this.store_name = params.store_name;

    if (params.desc)
        this.desc = params.desc;

    if (params.opts)
        this.opts = params.opts;

    if (params.tel)
        this.tel = params.tel;

    if (params.country)
        this.country = params.country;

    if (params.zip_code)
        this.zip_code = params.zip_code;

    if (params.state)
        this.state = params.state;

    if (params.city)
        this.city = params.city;

    if (params.address)
        this.address = params.address;

    if (params.location && params.location.length == 2) {
        this.location = params.location;
    }

    if (params.seat_count)
        this.seat_count = params.seat_count;

    if (params.opening_hour)
        this.opening_hour = params.opening_hour;

    if (params.seat_type)
        this.seat_type = params.seat_type;

    if (params.created)
        this.created = params.created;

    if (params.images && params.images.length > 0) {
        var self = this;
        async.eachSeries(params.images, function (img, next) {
            exports.ImageStorage.findOne({org_id: img._id}, function (err, _img) {

                if (!_img) {
                    _img = new exports.ImageStorage();
                }
                img.user = params.user;
                _img.setByParams(img, function (err2) {
                    _img.save(function (err3) {
                        var idx = self.images.indexOf(_img._id);
                        if (idx == -1)
                            self.images.push(_img._id);
                        next(err3);
                    });
                });
            });
        }, function (err) {
            console.log('OK');
            callback();
        });
    } else {
        callback();
    }
};

var Image = new mongoose.Schema({
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ImageStorage'
    },
    filename: {
        type: mongoose.Schema.Types.Mixed
    },
    sort_order: {
        type: Number,
        default: 0
    },
    image_type: {
        type: Number,
        default: 0
    }
});


var Item = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    org_id: {
        type: mongoose.Schema.Types.ObjectId,
        index: true
    },
    name: {
        type: mongoose.Schema.Types.Mixed,
        index: true,
        required: true
    },
    desc: {
        type: mongoose.Schema.Types.Mixed,
        index: true,
        required: true
    },
    price: {
        type: Number,
        default: 0,
        index: true
    },
    'time': {
        type: Number,
        default: 0
    },
    store: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store'
    }],

    'images': [Image],
    'categories': [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    created: {
        type: Date,
        default: Date.now
    }
});

Item.methods.setByParams = function (params, callback) {
    if (params._id)
        this.org_id = params._id;

    if (params.user)
        this.user = params.user;

    if (params.name)
        this.name = params.name;

    if (params.desc)
        this.desc = params.desc;

    if (params.price)
        this.price = params.price;

    if (params.time)
        this.time = params.time;

    if (params.created)
        this.created = params.created;

    if (params.store || params.images || params.categories) {
        var self = this;
        async.series([
            function (asyncCallback) {
                if (params.store) {
                    exports.Store.findOne({org_id: params.store, user: params.user}, function (err, store) {
                        if (!store) {
                            asyncCallback('Can\'t find store');
                        } else {
                            var idx = self.store.indexOf(store._id);
                            if (idx === -1) {
                                self.store.push(store);
                            }
                            asyncCallback();
                        }
                    });
                } else {
                    asyncCallback();
                }
            }, function (asyncCallback) {
                if (params.categories) {
                    async.eachSeries(params.categories, function (category, next) {
                        // console.log("category in eachSeries", {org_id: category, user: params.user});
                        exports.Category.findOne({org_id: category, user: params.user}, function (err, category) {
                            if (!category) {
                                next('Can\'t find category');
                            } else {
                                var idx = self.categories.indexOf(category._id);
                                if (idx === -1) {
                                    self.categories.push(category);
                                }
                                next();
                            }
                        });
                    }, function (err) {
                        asyncCallback(err);
                    })
                } else {
                    asyncCallback();
                }
            }, function (asyncCallback) {
                if (params.images && params.images.length > 0) {
                    async.eachSeries(params.images, function (img, next) {
                        if (img.image._id) {
                            exports.ImageStorage.findOne({org_id: img.image._id}, function (err, _img) {
                                if (!_img) {
                                    _img = new exports.ImageStorage();
                                }
                                img.image.user = params.user;
                                _img.setByParams(img.image, function (err2) {
                                    _img.save(function (err3) {
                                        img.image = _img._id;
                                        next(err3);
                                    });
                                });
                            });
                        } else {
                            next('no image id');
                        }
                    }, function (err) {
                        self.images = params.images;
                        asyncCallback();
                    });
                } else {
                    asyncCallback();
                }

            }
        ], function (err, results) {
            callback(err);
        });
    }
};

var ImageStorage = new mongoose.Schema({
    org_id: {
        type: mongoose.Schema.Types.ObjectId,
        index: true
    },
    data: Buffer,
    contentType: String,
    filename: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

ImageStorage.methods.setByParams = function (params, callback) {

    if (params._id)
        this.org_id = params._id;

    if (params.user)
        this.user = params.user;

    if (params.filename)
        this.filename = params.filename;

    if (params.contentType)
        this.contentType = params.contentType;

    if (params.data)
        this.data = params.data;
    callback();
};

var User = mongoose.Schema({
    serverHash: String,
    full_name: String,
    username: String,
    password: String
});

var Category = new mongoose.Schema({
    org_id: {
        type: mongoose.Schema.Types.ObjectId,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    name: {
        type: mongoose.Schema.Types.Mixed,
        index: true
    },
    store: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store'
    }],
    created: {
        type: Date,
        default: Date.now
    }
});

Category.methods.setByParams = function (params, callback) {

    if (params._id)
        this.org_id = params._id;

    if (params.user)
        this.user = params.user;

    if (params.store)
        this.store = params.store;

    if (params.name)
        this.name = params.name;

    if (params.store) {
        var self = this;
        exports.Store.findOne({org_id: params.store, user: params.user}, function (err, store) {
            if (!store) {
                asyncCallback('Can\'t find store');
            } else {
                var idx = self.store.indexOf(store._id);
                if (idx === -1) {
                    self.store.push(store);
                }
                callback();
            }
        });
    } else {
        callback();
    }
};

// methods ======================
// generating a hash
User.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

User.methods.generateServerHash = function (token) {
    return crypto.createHmac('sha1', 'fkjdsalfkjsdlfj;askjfj;lkeoiarewiorjiejfskdaljfJ#$IJ#E)~#EWUD').update(token).digest('hex');
};

// checking if password is valid
User.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

var Customer = mongoose.Schema({
    provider: String,
    provider_id: {
        type: String,
        index: true
    },
    service_token: {
        type: String,
        index: true
    },
    image_url: String,
    name: {
        family_name: String,
        given_name: String
    },
    display_name: {
        type: String
    },
    push_info: {
        endpoint_arn: {
            type: String
        },
        regid: {
            type: String
        }
    },
    emails: [String],
    _raw: String
});

Customer.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

var OrderItem = mongoose.Schema({
    name: {
        type: mongoose.Schema.Types.Mixed,
        index: true,
        required: true
    },
    price: {
        type: Number,
        default: 0,
        index: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

var Order = mongoose.Schema({
    table: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StoreTable'
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store'
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem'
    }]
});

var CheckInRequest = new mongoose.Schema({
    table: {
        type: String
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stores'
    },
    customer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    status: {
        type: Number
    },
    request_token: {
        type: String,
        index: true
    },
    request_count: {
        type: Number,
        default: 1
    },
    created: {
        type: Date,
        default: Date.now
    }
});

CheckInRequest.methods.generateRequestToken = function () {
    var current_date = (new Date()).valueOf().toString();
    var random = Math.random().toString();
    return crypto.createHash('sha1').update(current_date + random).digest('hex');
};


exports.Store = db.model('Store', Store);
exports.User = db.model('User', User);
exports.Category = db.model('Category', Category);
exports.Item = db.model('Item', Item);
exports.ImageStorage = db.model('ImageStorage', ImageStorage);
exports.Customer = db.model('Customer', Customer);
exports.StoreTable = db.model('StoreTable', StoreTable);
exports.OrderItem = db.model('OrderItem', OrderItem);
exports.Order = db.model('Order', Order);
exports.CheckInRequest = db.model('CheckInRequest', CheckInRequest);
