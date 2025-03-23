const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  maxDiscount: {
    type: Number,
    // required: true,
  },
  minOrder: {
    type: Number,
    required: true,
  },
  countOfProducts: {
    type: Number,
    required: true,
  },
  onlyNewCustomer: {
    type: Boolean,
    default: false,
  },
  status: {
    type: Boolean,
  },
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;