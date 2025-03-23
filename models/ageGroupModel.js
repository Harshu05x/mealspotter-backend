// models/ageGroupModel.js
const mongoose = require('mongoose');

const ageGroupSchema = new mongoose.Schema({
  fromAge: {
    type: Number,
    required: true,
  },
  toAge: {
    type: Number,
    required: true,
  },
  status: Boolean,
  // Additional fields for age groups, if needed
});

const AgeGroup = mongoose.model('AgeGroup', ageGroupSchema);

module.exports = AgeGroup;
