// routes/index.js
const express = require('express');
const router = express.Router();

const toyRoutes = require('./toyRoutes'); // Import toy routes
const rentalRoutes = require('./rentalRoutes'); // Import rental routes
const customerRoutes = require('./customerRoutes');
const userRoutes = require('./userRoutes');
const categoryRoutes = require('./categoryRoutes');
const ageGroupRoutes = require('./ageGroupRoutes');
const cityRouters = require("./cityRoutes")
const zoneRouters = require("./zoneRoutes");
const pickUpPointRouter = require("./pickUpPointRoutes");
const areaRouters = require("./areaRoutes");
const orderRouters = require("./orderRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const couponRoutes = require("./couponRoutes");
const paymentHistory = require("./paymentHistoryRoutes");
const messOwners = require("./messOwers");

// Define API routes for toys and rentals
router.use('/toys', toyRoutes);
router.use('/rentals', rentalRoutes);
router.use('/customers', customerRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/agegroups', ageGroupRoutes);
router.use("/cities", cityRouters);
router.use("/zones", zoneRouters);
router.use("/pickUpPoints", pickUpPointRouter);
router.use("/areas", areaRouters);
router.use("/orders",orderRouters);
router.use("/dashboard",dashboardRoutes);
router.use("/coupons",couponRoutes);
router.use("/payment", paymentHistory);
router.use("/mess-owners", messOwners);

module.exports = router;
