// routes/rentalRoutes.js
const express = require('express');
const router = express.Router();
const paymentHistroyController = require('../controllers/paymentHistoryController');
const jwtAuthMiddleware = require("../middleware/jwtAuthMiddleware");

// Define API routes for payment history
router.post("/payment-history/:page/:limit", jwtAuthMiddleware, paymentHistroyController.getPaymentHistory);

module.exports = router;
