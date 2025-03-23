const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController")
const jwtAuthMiddleware = require("../middleware/jwtAuthMiddleware");

// Get all createdCity (protected with JWT auth)
router.get("/", jwtAuthMiddleware, couponController.getAllCoupons);

// Create a new createCity (protected with JWT auth)
router.post("/", jwtAuthMiddleware, couponController.createCoupon);

// Update a city by ID (protected with JWT auth)
router.put("/:id", jwtAuthMiddleware, couponController.updateCoupon);

// Delete a city by ID (protected with JWT auth)
router.delete("/:id", jwtAuthMiddleware, couponController.deleteCoupon);



module.exports = router;
