const mongoose = require('mongoose');

const ExpressSessionSchema = new mongoose.Schema({
  _id: String,
  session: Object,
  expires: Date
});

module.exports = mongoose.model('ExpressSession', ExpressSessionSchema);