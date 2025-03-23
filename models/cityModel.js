// models/cityModel.js
const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  status: Boolean,
  weeklyOff: {
    type: Number,
    default: -1,
  }
  // You can add more fields related to cities if needed
});

const City = mongoose.model('City', citySchema);

module.exports = City;
