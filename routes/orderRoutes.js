// routes/rentalRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const jwtAuthMiddleware = require("../middleware/jwtAuthMiddleware");

// Define API routes for rentals
router.post("/", jwtAuthMiddleware,orderController.createOrder);


router.post("/all/:page/:limit", jwtAuthMiddleware, orderController.allOrders);
router.post("/upcoming/:page/:limit", jwtAuthMiddleware,orderController.upcomingOrders);
router.post("/returns/:page/:limit", jwtAuthMiddleware,orderController.pendingDueReturns);
router.post("/ongoing/:page/:limit", jwtAuthMiddleware,orderController.onGoingOrders);
router.post("/prebooking/:page/:limit", jwtAuthMiddleware,orderController.preBookingOrders);
// router.get("/:id", jwtAuthMiddleware,orderController.getPaginatedOrdersByCustomerId);
router.put("/change-orderStatus", jwtAuthMiddleware,orderController.changeOrderStatus);
router.post("/cancel", jwtAuthMiddleware,orderController.cancelOrder);
router.post("/cancelled/:page/:limit", jwtAuthMiddleware,orderController.getCanceledOrders);
router.get("/failed-carts", jwtAuthMiddleware,orderController.fetchFailedCarts);
router.post("/completed/:page/:limit", jwtAuthMiddleware,orderController.completedOrders);
router.get("/abandoned", jwtAuthMiddleware,orderController.abondonedCarts);
router.delete("/delete-abandoned", jwtAuthMiddleware, orderController.deleteAbandonedCarts);
router.post("/refund/:orderId", jwtAuthMiddleware,orderController.refundOrder);
router.post("/refunded/:page/:limit", jwtAuthMiddleware,orderController.getRefundedOrders);
router.post("/edit-order/:orderId", jwtAuthMiddleware,orderController.editOrder);
router.post("/check-toy-availability/:toyId", jwtAuthMiddleware,orderController.checkToyAvailability);
router.get("/pickup-points/:id", jwtAuthMiddleware,orderController.fetchPickUpPoints);
router.post("/add", jwtAuthMiddleware, orderController.addOrder);
module.exports = router;
