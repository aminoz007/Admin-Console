mongoose = require('mongoose');

userShema = new mongoose.Schema({

    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    name: String,
    created_at: {type: Date, default: Date.now()}

});

module.exports = mongoose.model('User', userShema);