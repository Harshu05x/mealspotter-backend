const express = require("express");
const router = express.Router();
const zoneController = require("../controllers/zoneController");
const jwtAuthMiddleware = require("../middleware/jwtAuthMiddleware");

// Get all createdzone (protected with JWT auth)
router.get("/", jwtAuthMiddleware, zoneController.getAllZone);

// Create a new createzone (protected with JWT auth)
router.post("/", jwtAuthMiddleware, zoneController.createZone.bind(zoneController));

// Update a zone by ID (protected with JWT auth)
router.put("/:id", jwtAuthMiddleware, zoneController.updateZone.bind(zoneController));

// Delete a zone by ID (protected with JWT auth)
router.delete("/:id", jwtAuthMiddleware, zoneController.deleteZone);

router.post("/canRemovePincode", jwtAuthMiddleware, zoneController.canRemovePincode);
router.post("/removePincode", jwtAuthMiddleware, zoneController.removePincode);
router.post("/shiftPincode", jwtAuthMiddleware, zoneController.shiftPincode);
router.post("/canAddPincode", jwtAuthMiddleware, zoneController.canAddPincode);

module.exports = router;
