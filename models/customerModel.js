// models/customerModel.js
const mongoose = require("mongoose");
const customerSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: false,
    unique: true
  },
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
},
  {
    timestamps: true,
  }
);
const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;
