const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true });

const userDB = mongoose.connection.useDb('users');

const userModel = userDB.model('User', userSchema);

// export module
module.exports = userModel;