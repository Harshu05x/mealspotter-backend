// controllers/toyController.js
const Toy = require("../models/toyModel");
const Order = require("../models/orderModel");
const multer = require("multer");
const fs = require('fs');
const path = require("path");
const AWS = require('aws-sdk');
const Customer = require("../models/customerModel");
const moment = require("moment");

const s3 = new AWS.S3({
  secretAccessKey: process.env.S3_SECRET,
  accessKeyId: process.env.S3_ACCESS,
  region: process.env.S3_REGION
});


class ToyController {
  async getAllToys(req, res) {    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const status = req.query.status || "all";
      const category = req.query.category || "all";
      const skip = (page - 1) * limit;
      const query = req.query.query || "";
      const type = req.query.type;
      if(type === "all"){
        const toys = await Toy.find({ 
          status: "AVAILABLE",
        }).populate("category").populate("ageGroup").populate("cityPricing.city");
        const totalToys = await Toy.countDocuments({});
        return res.json({
          toys,
          totalToys: totalToys
        });
      }

      let filterObj = {};
      if(status !== "all"){
        filterObj.status = status;
      }
      if(category !== "all"){
        filterObj.category = { $in: category };
      }
      if(query){
        filterObj.$or = [
          { name: { $regex: query, $options: 'i' } },
        ];
      }
      const toys = await Toy.find(filterObj)
      .skip(skip)
      .limit(limit)
      .populate("category")
      .populate("ageGroup")
      .populate("cityPricing.city");

      const totalToys = await Toy.countDocuments(filterObj);
      res.json({
        toys,
        totalToys: totalToys
      });


    } catch (err) {
      console.log("Err", err);
      res.status(500).json({ error: "Server error" });
    }
  }

  async createToy(req, res) {
    const {name, category, ageGroup, status, description, brand, isAvailable, featured, showOnWebsite} = req.body;

    const toyExists = await Toy.findOne({ name });
    if (toyExists) {
      return res.status(400).json({ error: "Toy with the same name already exists" });
    }

    const newToy = new Toy({
      name, 
      category,
      ageGroup,
      status,
      description,
      brand,
      isAvailable,
      featured,
      showOnWebsite
    });

    try {
      await newToy.save();
      await newToy.populate("ageGroup")
      await newToy.populate("category")

      res.status(200).json(newToy);
    } catch (err) {
      console.log("toy::", err)
      res.status(400).json({ error: "Bad request" });
    }
  }

  async updateToy(req, res) {
    const toyId = req.params.id;
    const {name, category, ageGroup, mrp, purchase, description, 
      brand, youtubeUrl, cityPricing, isAvailable, status, deposit, purchaseSource, purchaseDate, featured, showOnWebsite} = req.body;
    
    try {
      // Find the toy by ID
      const toy = await Toy.findById(toyId);

      if (!toy) {
        return res.status(404).json({ error: "Toy not found" });
      }

      const toyExists = await Toy.findOne({ name, _id: { $ne: toyId } });
      if (toyExists) {
        return res.status(400).json({ error: "Toy with the same name already exists" });
      }
     
    let ageGroups = [];
    if(ageGroup){
      ageGroups = ageGroup.split(',').map(a => a && a.trim())
    }

    let categories = [];
    if(category){
      categories = category.split(',').map(a => a && a.trim())
    }

     toy.name = name;
     toy.category = categories;
     toy.ageGroup = ageGroups;
     toy.mrp = mrp;
     toy.purchase = purchase;
     toy.description = description;
     toy.brand = brand;
     toy.youtubeUrl = youtubeUrl;
     toy.cityPricing = cityPricing;
     toy.isAvailable = isAvailable;
     toy.status = status;
     toy.deposit = deposit;
     toy.purchaseSource = purchaseSource;
     toy.purchaseDate = purchaseDate;
     toy.featured = featured;
     toy.showOnWebsite = showOnWebsite;

      const newToy = await Toy.findByIdAndUpdate(toyId, toy, { new: true }).populate("ageGroup").populate("category").populate("cityPricing.city");

      res.json(newToy);
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async uploadImages(req, res) {
    try {
      const _id = req.body._id; 
      const key = req.body.key; 
      const uploadedFile = req.file;

      if (!uploadedFile) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      if(_id && uploadedFile && uploadedFile.location && key){
        await Toy.findByIdAndUpdate(_id, {$set: {[key]: uploadedFile.location}})
        res.status(200).json({path : "", status : 200})
      }
      else{
        res.status(400).json({msg : "Error occured"})
      }
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async deleteToy(req, res) {
    const toyId = req.params.id;
    try {
      const toy = await Toy.findById(toyId);
      if (!toy) {
        return res.status(404).json({ error: "Toy not found" });
      }

      const order = await Order.findOne({ toy: toyId });
      if (order) {
        return res.status(400).json({ error: "Toy is in use" });
      }
      await Toy.findByIdAndDelete(toyId);
      res.json({ message: "Toy deleted" });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async getToyHistory(req, res) {
    try {
      const toyId = await req.body.toyId;
      if (!toyId) {
        return res.status(400).json({ error: "Toy ID undefined" });
      }

      const toy = await Toy.findById(toyId).
      populate("category").
      populate("ageGroup").
      exec();

      // find such orders where toyId is present and equal to this toyid
      const orders = await Order.find
      ({
        toy: toyId,
        paid : true
      })
      .populate("customer")
      .populate("selfPickup")
      .exec();

      res.status(200).json({
        toy: toy,
        orders: orders
      });
    } catch (err) {
      console.log("err", err);  
      res.status(500).json({ error: "Server error" });
    }
  }

  async updateToysStatus(req, res) {
    try {
      const { toys, status } = await req.body;
      if (!toys) {
        return res.status(400).json({ error: "Toys undefined" });
      }

      await Toy.updateMany({ _id: { $in: toys } }, { status: status });
      
      res.status(200).json({ message: "Toys status updated", success: true});

    } catch (err) {
      console.log("err", err);
      res.status(500).json({ error: "Server error" });
    }
  }

  async getToyAvailablilty(req, res) {
    try {
      const { toy, customerId, pickupPoint, duration } = req.body;
      const oneHourAgo = moment().utc().subtract(1, 'hour').toDate();
      const customer = await Customer.findById(customerId).populate('city').populate('zone');
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      const deliveryDays = customer?.zone?.deliveryDays;
      const weeklyOff = customer?.city?.weeklyOff;
      const currentDateUTC = moment().utc().subtract((duration || 2), 'weeks');
      const orders = await Order.find({
        toy: toy,
        status: { $nin: ['cancelled', 'refunded'] },
        $or: [
          {
            $and: [{ createdAt: { $gt: oneHourAgo } }, { paid: false }],
          },
          {
            $and: [{ returnDate: { $gte: currentDateUTC } }, { paid: true }],
          },
          {
            $and: [{ deliveryDate: { $gte: currentDateUTC } }, { paid: true }],
          }
        ]
      }).exec();
      const bookedDates = [];
      orders.forEach((order) => {
        let i = 0;
        let startDate = moment(order.deliveryDate);
        let returnDate = moment(order.returnDate);
        returnDate.add(1, "day");

        while (startDate <= returnDate && i <= 29) {
          bookedDates.push(startDate.format("YY-MM-DD"));
          startDate.add(1, "day");
          i++;
        }
      });

      const availableDates = [];
      if (deliveryDays && deliveryDays.length > 0) {
        let currentDate = currentDateUTC;
        for (let i = 1; i <= (parseInt(duration) || 2) + 60; i++) {
          const weekDay = currentDate.weekday();
          if (weekDay !== weeklyOff && (deliveryDays.includes(weekDay) || pickupPoint === true) && !bookedDates.includes(currentDate.format("YY-MM-DD"))) {
            availableDates.push(currentDate.format("YYYY-MM-DD"));
          }
          currentDate.add(1, "day");
        }
      }

      let availability = { w2: [], w3: [], w4: [] };

      [2, 3, 4].forEach(week => {
        availableDates.forEach(dt => {
          let available = true;
          const startDate = moment(dt);
          const endDate = moment(dt).add(((week * 7) + 1), "day");
          let i = 0;
          while (startDate <= endDate && i <= 29) {
            if (bookedDates.includes(startDate.format("YY-MM-DD"))) {
              available = false;
              i = 30;
            }
            else {
              startDate.add(1, "day");
              i++;
            }
          }
          // if data is available and not today's date then only add to availability
          if (available && !moment().isSame(moment(dt), 'day')) {
            availability["w" + week].push(dt);
          }
        })
      })

      res.status(200).json({ availability });

    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}

module.exports = new ToyController();
