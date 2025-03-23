const express = require('express');
const router = express.Router();
const MessOwnersController = require('../controllers/messOwnersController');
const { jwtAuthMiddleware } = require("../middleware/jwtAuthMiddleware");

router.get('/', jwtAuthMiddleware, MessOwnersController.searchMessOwners);
router.post('/create', jwtAuthMiddleware, MessOwnersController.addMessOwner);
router.put('/update', jwtAuthMiddleware, MessOwnersController.updateMessOwner);
module.exports = router;
