// models/cityModel.js
const mongoose = require("mongoose");

const deliveryDatesSchema = new mongoose.Schema({
  date:{
    type: Date,
    required: true,
  }
});

const zoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "City",
  },
  status: Boolean,
  deliveryDays: {
    type: [Number],
    default: [],
  },
  deliveryFee: {
    type: Number,
    default: 0.0,
  },
  pincodes: {
    type: [String],
    default: [],
  },
  homeDelivery: {
    type: Boolean,
    default: true,
  },


  // You can add more fields related to cities if needed
});

const Zone = mongoose.model("Zone", zoneSchema);

module.exports = Zone;
