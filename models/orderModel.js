const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AutoIncrement = require('mongoose-sequence')(mongoose);

// Define the schema
const orderSchema = new Schema({
  orderId: {
    type: Number,
    required: true
  },
  toy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Toy',
    required: true
  },
  deposit: {
    type: Number,
    required: true
  },
  rent: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    required: true,
    default: 0
  },
  deliveryDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  paid: {
    type: Boolean,
    default: false
  },
  dispatched: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'dispatched', 'delivered', 'returned', 'cancelled'],
    default: 'pending'
  },
  selfPickup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PickUpPoint'
  },
  paymentDetails: {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    createdAt: Date,
    receipt: String,
    currency: String,
    status: String,
    amount: Number
  },
  refundOrder: {
    createdAt: Date,
    reason: String,
    method: String,
    amount: Number
  },
  cancelOrder: {
    createdAt: Date,
    reason: String
  },
  orderTotal: {
    type: Number,
    default: 0,
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date
  },
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon'
  }
});

// orderSchema.plugin(AutoIncrement, {inc_field: 'orderId'});

// Pre hook to auto increment orderId
// orderSchema.pre('save', async function (next) {
//   console.log('isNew', this.isNew);
//   if (!this.isNew) {
//     return next();
//   }
//   console.log('this', this);
//   const highestOrder = await this.constructor.findOne({}).sort({ orderId: -1 }).exec();
//   if (highestOrder && highestOrder.orderId) {
//     this.orderId = highestOrder.orderId + 1;
//   } else {
//     this.orderId = 1;
//   }
//   console.log('orderId', this.orderId);
//   next();
// });

// Create the model
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
