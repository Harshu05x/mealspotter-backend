// models/customerModel.js
const mongoose = require("mongoose");
const customerSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: false,
  },
  lname: {
    type: String,
    required: false,
  },
  mobile: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    addressLine1: String,
    addressLine2: String
  },
  pincode: String,
  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "City",
  },
  zone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Zone",
  },
  agegroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AgeGroup",
  },
  isNewCustomer:{
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true,
    required: true
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  // You can add more fields related to customers if needed
},
  {
    timestamps: true,
  }
);
const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;
