const mongoose = require('mongoose');

const User = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    phone: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    username: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
},

    {
        timestamps: true
    }
);

module.exports = mongoose.model('User', User)