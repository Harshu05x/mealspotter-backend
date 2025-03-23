const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const jwtAuthMiddleware = require("../middleware/jwtAuthMiddleware");

// Define login route for customers
router.post("/login", jwtAuthMiddleware, customerController.loginCustomer);

//get customer by id
router.get("/:id", jwtAuthMiddleware, customerController.customerDetailsById);

// Define Register route for customers
router.post(
  "/register",
  jwtAuthMiddleware,
  customerController.registerCustomer
);

router.get("/", jwtAuthMiddleware, customerController.fetchCustomersPerPage);
router.get("/inquiry", jwtAuthMiddleware, customerController.customerInquiry);
router.post("/enquiries/:page", jwtAuthMiddleware, customerController.getEnquiries);
router.post("/delete-enquiry", jwtAuthMiddleware, customerController.deleteEnquiry);

router.get("/:id/orders", jwtAuthMiddleware, customerController.getCustomerOrders);

router.put("/update/:id", jwtAuthMiddleware, customerController.updateCustomer);
router.put("/verify-email/:id", jwtAuthMiddleware, customerController.verifyEmail);

router.put("/update-password/:id", jwtAuthMiddleware, customerController.updatePassword);

router.delete("/delete/:id", jwtAuthMiddleware, customerController.deleteCustomer);

router.get("/all/customers", jwtAuthMiddleware, customerController.fetchAllCustomers);

module.exports = router;
