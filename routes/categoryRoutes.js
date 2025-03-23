
const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { jwtAuthMiddleware } = require("../middleware/jwtAuthMiddleware");

// Get all categories (protected with JWT auth)
router.get("/", jwtAuthMiddleware, categoryController.getAllCategories);

// Get category by ID (protected with JWT auth)
router.get("/:id", jwtAuthMiddleware, categoryController.getCategoryById);

// Create a new category (protected with JWT auth)
router.post("/", jwtAuthMiddleware, categoryController.createCategory);

// Update a category by ID (protected with JWT auth)
router.put("/:id", jwtAuthMiddleware, categoryController.updateCategory);

// Delete a category by ID (protected with JWT auth)
router.delete("/:id", jwtAuthMiddleware, categoryController.deleteCategory);

module.exports = router;
