const Coupon = require("../models/couponModel")

class couponController {
  async getAllCoupons(req, res) {
    try {
      const coupons = await Coupon.find();
      res.json(coupons);
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async createCoupon(req, res) {
    try {
      const {
        code,
        percentage,
        // maxDiscount,
        minOrder,
        countOfProducts,
        onlyNewCustomer,
        status,
      } = req.body;

      const coupon = await Coupon.findOne({ code });
      if (coupon) {
        return res.status(400).json({ msg: "Coupon with this code already exists." });
      }

      const newCoupon = new Coupon({
        code,
        percentage,
        // maxDiscount,
        minOrder,
        countOfProducts,
        onlyNewCustomer,
        status,
      });

      await newCoupon.save();

      res.status(201).json(newCoupon);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }

  }

  async updateCoupon(req, res) {
    const { id: _id } = req.params;
    const updates = req.body;
    const options = { new: true };

    const coupon = await Coupon.findOne({ code: updates.code });
    if (coupon && coupon._id != _id) {
      return res.status(400).json({ msg: "Coupon with this code already exists." });
    }

    try {
      const updatedCoupon = await Coupon.findByIdAndUpdate(_id, updates, options);
      res.json(updatedCoupon);
    } catch (e) {
      res.status(400).send("Error updating Coupon");
    }
  }

  async deleteCoupon(req, res) {
    const { id: _id } = req.params;
    try {
      const coupon = await Coupon.findByIdAndRemove(_id);
      if (!coupon)
        return res.status(404).json({ msg: "This coupon does not exist." });
      res.json(coupon);
    } catch (e) {
      res.status(500).json({ msg: "Internal server error" });
    }
  }
}

module.exports = new couponController();
