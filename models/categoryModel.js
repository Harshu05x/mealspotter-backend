// models/categoryModel.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  status : Boolean
  // You can add more fields related to categories if needed
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
