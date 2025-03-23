// models/toyModel.js
const mongoose = require('mongoose');
const {ORDER_STATUS} = require('../helpers/Constants');
const AutoIncrement = require('mongoose-sequence')(mongoose);


const cityPriceSchema = new mongoose.Schema({
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
    },
    w2: {
      type: Number,
      default: 0.00,
    },
    w3: {
      type: Number,
      default: 0.00,
    },
    w4: {
      type: Number,
      default: 0.00,
    },
});

const toySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  defaultPhoto: String,
  photo2: String,
  photo3: String,
  ageGroup: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AgeGroup',
  }],
  category: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],
  cityPricing: [cityPriceSchema],
  status: {
    type: String,
    enum: ['AVAILABLE', 'RENTED', 'ONHOLD', 'CLEANING', 'BROKEN', 'MAINTENANCE'],
    default: ORDER_STATUS.AVAILABLE,
  },
  description: String,
  brand: String,
  youtubeUrl: String,
  mrp: {
    type: Number,
    default: 0.00,
  },
  purchase: {
    type: Number,
    default: 0.00,
  },
  deposit: {
    type: Number,
    default: 0.00,
  },
  source: String,
  purchaseDate: Date,
  notes: String,
  featured: {
    type: Boolean,
    default: false
  },
  isAvailable:{
    type: Boolean,
    default: true
  },
  purchaseSource : String, 
  purchaseDate : Date,
  showOnWebsite: {
    type: Boolean,
    default: false
  }
});

toySchema.plugin(AutoIncrement, {inc_field: 'toyId'});

const Toy = mongoose.model('Toy', toySchema);

module.exports = Toy;
