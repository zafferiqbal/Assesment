// server/models/User.js
const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  tickets: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', schema);
