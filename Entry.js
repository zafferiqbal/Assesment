// server/models/Entry.js
const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  title: String,
  url: String,
  authorEmail: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Entry', schema);
