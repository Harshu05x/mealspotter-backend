const express = require("express");
const router = express.Router();
const { jwtAuthMiddleware } = require("../middleware/jwtAuthMiddleware");
const pickUpPointController = require("../controllers/pickUpPointController");

// Get all created pickUpPoint (protected with JWT auth)
router.get("/", jwtAuthMiddleware, pickUpPointController.getAllPickUpPoint);

// Create a new pickUpPoint (protected with JWT auth)
router.post("/", jwtAuthMiddleware, pickUpPointController.createPickUpPoint.bind(pickUpPointController));

// Update a pickUpPoint by ID (protected with JWT auth)
router.put("/:id", jwtAuthMiddleware, pickUpPointController.updatePickUpPoint.bind(pickUpPointController));

// Delete a pickUpPoint by ID (protected with JWT auth)
router.delete("/:id", jwtAuthMiddleware, pickUpPointController.deletePickUpPoint);

module.exports = router;