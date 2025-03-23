const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController")
const jwtAuthMiddleware = require("../middleware/jwtAuthMiddleware");

router.get("/counts", jwtAuthMiddleware, dashboardController.getAllCounts);
router.get("/topRentedToys", jwtAuthMiddleware, dashboardController.getTopRentedToys);

module.exports = router;
