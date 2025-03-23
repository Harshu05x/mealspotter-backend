const express = require("express");
const router = express.Router();
const cityController = require("../controllers/cityController");
const jwtAuthMiddleware = require("../middleware/jwtAuthMiddleware");

// Get all createdCity (protected with JWT auth)
router.get("/", jwtAuthMiddleware, cityController.getAllCity);

// Create a new createCity (protected with JWT auth)
router.post("/", jwtAuthMiddleware, cityController.createCity);

// Update a city by ID (protected with JWT auth)
router.put("/:id", jwtAuthMiddleware, cityController.updateCity);

// Delete a city by ID (protected with JWT auth)
router.delete("/:id", jwtAuthMiddleware, cityController.deleteCity);



module.exports = router;
