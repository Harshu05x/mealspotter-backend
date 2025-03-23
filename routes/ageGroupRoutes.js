const express = require("express");
const router = express.Router();
const ageGroupController = require("../controllers/ageGroupController");
const jwtAuthMiddleware = require("../middleware/jwtAuthMiddleware");

// Get all age groups
router.get("/", jwtAuthMiddleware, ageGroupController.getAllAgeGroups);

// Get age group by ID
router.get("/:id", jwtAuthMiddleware, ageGroupController.getAgeGroupById);

// Create a new age group
router.post("/", jwtAuthMiddleware, ageGroupController.createAgeGroup);

// Update an age group by ID
router.put("/:id", jwtAuthMiddleware, ageGroupController.updateAgeGroup);

// Delete an age group by ID
router.delete("/:id", jwtAuthMiddleware, ageGroupController.deleteAgeGroup);

module.exports = router;
