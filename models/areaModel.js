// models/cityModel.js
const mongoose = require("mongoose");

const areaSchema = new mongoose.Schema({
  areaName: {
    type: String,
    required: true,
  },
  zone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Zone",
  },
  status: Boolean,
  // You can add more fields related to cities if needed
});

const Area = mongoose.model("Area", areaSchema);

module.exports = Area;
