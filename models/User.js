const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
 email: {
    type: String,
    required: true,
    unique: true,
 },
 profile: {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
 },
 qrCode: {
    type: String,
    required: true,
 },
});

module.exports = mongoose.model('User', UserSchema);
