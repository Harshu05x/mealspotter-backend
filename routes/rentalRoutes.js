// routes/rentalRoutes.js
const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');
const { jwtAuthMiddleware } = require("../middleware/jwtAuthMiddleware");

// Define API routes for rentals
router.get("/rentals", jwtAuthMiddleware,rentalController.getAllRentals);
router.post("/rentals", jwtAuthMiddleware,rentalController.createRental);

module.exports = router;
