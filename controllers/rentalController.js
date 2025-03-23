// controllers/rentalController.js
const Order = require('../models/orderModel');

class RentalController {
  async getAllRentals(req, res) {
    try {
      const rentals = await Order.find();
      res.json(rentals);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  async createRental(req, res) {
    const newRental = new Order(req.body);
    try {
      await newRental.save();
      res.status(201).json(newRental);
    } catch (err) {
      res.status(400).json({ error: 'Bad request' });
    }
  }
}

module.exports = new RentalController();
