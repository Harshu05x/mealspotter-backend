const express = require('express');
const router = express.Router();
const MessController = require('../controllers/messController');
const { jwtAuthMiddleware } = require("../middleware/jwtAuthMiddleware");

router.get('/', jwtAuthMiddleware, MessController.searchMessOwners);
router.post('/create', jwtAuthMiddleware, MessController.addMessOwner);
router.put('/update', jwtAuthMiddleware, MessController.updateMessOwner);
module.exports = router;
