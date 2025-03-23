const express = require("express");
const router = express.Router();
const areaController = require("../controllers/areaController");
const jwtAuthMiddleware = require("../middleware/jwtAuthMiddleware");

// Get all created_area (protected with JWT auth)
router.get("/", jwtAuthMiddleware, areaController.getAllArea);

// Create a new createarea (protected with JWT auth)
router.post("/", jwtAuthMiddleware, areaController.createArea);

// Update a area by ID (protected with JWT auth)
router.put("/:id", jwtAuthMiddleware, areaController.updateArea);

// Delete a area by ID (protected with JWT auth)
router.delete("/:id", jwtAuthMiddleware, areaController.deleteArea);


module.exports = router;
