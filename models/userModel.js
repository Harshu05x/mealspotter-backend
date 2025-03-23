// models/userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  usertype: {
    type: String,
    enum: ['admin', 'mess'],
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  messId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mess',
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
