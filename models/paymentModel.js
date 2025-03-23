// models/cityModel.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    createdAt: Date,
    receipt: String,
    currency: String,
    status: String,
    amount: Number
});

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
