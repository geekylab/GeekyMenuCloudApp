var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');

var db = mongoose.connect('mongodb://GEEKY_MONGO/geekyMenuCloud');

var Store = new mongoose.Schema({
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
    location: [Number, Number],
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
        path: {
            type: String
        },
        filename: {
            type: mongoose.Schema.Types.Mixed
        },
        desc: {
            type: mongoose.Schema.Types.Mixed
        }
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

Store.index({location: "2dsphere"});

var User = mongoose.Schema({
    serverHash: {
        type: String
    },
    local: {
        username: String,
        password: String
    },
    facebook: {
        id: String,
        token: String,
        email: String,
        name: String
    },
    twitter: {
        id: String,
        token: String,
        displayName: String,
        username: String
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String
    }
});

var Category = new mongoose.Schema({
    name: {
        type: mongoose.Schema.Types.Mixed,
        index: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

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
    return bcrypt.compareSync(password, this.local.password);
};

exports.Store = db.model('Store', Store);
exports.User = db.model('User', User);
exports.Category = db.model('Category', Category);