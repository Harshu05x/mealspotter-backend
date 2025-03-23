// controllers/customerController.js
const Customer = require("../models/customerModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const generateUpdatePasswordEmailTemplate = require('../utils/mailTemplates/updatePasswordEmailTemplate');
const sendMail = require("../utils/sendMail");

const bcryptSalt = bcrypt.genSaltSync(10);

const Order = require("../models/orderModel");
const CustomerEnquiry = require("../models/customerEnquiry");
const { configDotenv } = require("dotenv");
const Zone = require("../models/zoneModel");
const { default: mongoose } = require("mongoose");

class CustomerController {
  async loginCustomer(req, res) {
    try {
      const { email, password } = req.body;

      // Find the customer by email
      const customer = await Customer.findOne({ email });

      // Check if the customer exists
      if (!customer) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Verify the password
      const passwordMatch = await bcrypt.compare(password, customer.password);

      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Customer is authenticated, generate a JWT token
      const token = jwt.sign(
        { customerId: customer._id, email: customer.email },
        process.env.JWT_SECRET, // Replace with your secret key
        { expiresIn: "1h" } // Set token expiration as needed
      );

      // Send the token in the response
      res.json({ token });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async registerCustomer(req, res) {
    try {
      const { fname, lname, email, password, mobile, address } = req.body;

      if (!fname || !lname || !email || !password || !mobile || !address) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Check if the customer already exists
      const existingCustomer = await Customer.findOne({ email });

      if (existingCustomer) {
        return res.status(409).json({ message: "Customer already exists" });
      }

      const hash_pass = bcrypt.hashSync(password, bcryptSalt);
      // Create a new customer document
      const newCustomer = new Customer({
        fname,
        lname,
        email,
        password: hash_pass,
        mobile,
        address: {
          flatNo: address.flatNo,
          floor: address.floor,
          wing: address.wing,
          building: address.building,
          area: address.area,
          landmark: address.landmark,
          pincode: address.pincode,
          city: address.city,
        },
      });

      // Save the new customer document
      await newCustomer.save();

      // Customer is authenticated, generate a JWT token
      const token = jwt.sign(
        { customerId: newCustomer._id, email: newCustomer.email },
        process.env.JWT_SECRET, // Replace with your secret key
        { expiresIn: "1h" } // Set token expiration as needed
      );

      // Send the token in the response
      res.json({ token });
    } catch (e) {
      res.status(422).json({ message: e.message });
    }
  }

  async customerDetailsById(req, res) {
    const customerId = req.params.id;
    try {
      const customer = await Customer.findById(customerId)
        .populate("zone")
        .exec();
      if (!customer) {
        return res
          .status(404)
          .json({ error: "Customer with this id is not available" });
      }
      res.json(customer);
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async fetchCustomersPerPage(req, res) {
    try {
      // Parse page and limit parameters from the query string
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10; // Default limit is 10
      const enquiry = req.query.enquiry || "false";
      const csvTrue = req.query.csvTrue || false;
      const searchText = req.query.query || "";
      const searchTerms = searchText.split(' ').map(term => new RegExp(term, 'i'));
      const skip = (page - 1) * limit;

      if (enquiry == "emailVerification") {
        let filterObj = {
          emailVerified: false
        };
        if(searchText) {
          filterObj = {
            ...filterObj,
            $and: searchTerms.map(term => ({
              $or: [
                { fname: term },
                { lname: term },
                { email: term },
                { "address.addressLine1": term },
                { "address.addressLine2": term },
                { pincode: term },
                { mobile: term },
              ]
            }))
          }
        }
        if(csvTrue) {
          const customers = await Customer.find(filterObj).sort({ createdAt: -1 }).populate("city zone").exec();
          return res.json({customers, success: true});
        }
        const customers = await Customer.find(filterObj)
          .sort({ createdAt: -1 }).skip(skip).limit(limit)
          .populate("city zone")
          .exec();
        const totalCustomers = await Customer.find(filterObj).countDocuments();
        return res.json({ customers, totalCustomers });
      }

      let filterObj = {
        isNewCustomer: enquiry === "false" ? false : true
      };
      
      if(searchText) {
        filterObj = {
          ...filterObj,
          $and: searchTerms.map(term => ({
            $or: [
              { fname: term },
              { lname: term },
              { email: term },
              { "address.addressLine1": term },
              { "address.addressLine2": term },
              { pincode: term },
              { mobile: term },
            ]
          }))
        }
      }

      if(csvTrue) {
        const customers = await Customer.find(filterObj).sort({ createdAt: -1 }).populate("city zone").exec();
        return res.json({customers, success: true});
      }

      const customers = await Customer.find(filterObj)
              .sort({ createdAt: -1 }).skip(skip).limit(limit)
              .populate("city zone")
              .exec();

      const totalCustomers = await Customer.find(filterObj).countDocuments();

      
      res.json({ customers, totalCustomers });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async customerInquiry(req, res) {
    const state = req.query.isNew || true;

    const customers = await Customer.find({ isNewCustomer: state }).sort({ createdAt: -1 });
    return res.json(customers);
  }

  async getUpcomingOrdersForCustomer(req, res) {
    try {
      const customerId = req.params.id;

      // Query upcoming orders for the specific customer
      const upcomingOrders = await Order.find({ customer: customerId });

      res.json(upcomingOrders);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async getCustomerOrders(req, res) {
    try {
      const customerId = req.params.id;
      // Query all orders for the specific customer
      const orders = await Order.find({ 
        customer: customerId, paid: true, 
        status: { $nin: ["cancelled", "refunded"] }
       })
        .populate({
          path: "toy",
          select: "name defaultPhoto",
        })
        .exec();

      res.json(orders);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async updateCustomer(req, res) {
    try {
      const customerId = req.params.id;
      const update = req.body;

      const customer = await Customer.findById(customerId);
      let updateObj = update;
      
      if(update.pincode && update.pincode !== customer.pincode) {
        const zone = await Zone.findOne({
          pincodes: { $in: [update.pincode] }
        })
        if(!zone) {
          return res.status(400).json({ message: "Zone not found for this pincode." });
        }
        updateObj = {
          ...update,
          zone: zone._id
        }
      }
      const customerZone = customer?.zone?.toString();
      if(update.zone && update.zone !== customerZone) {
        const zone = await Zone.findById(update.zone);
        if(!zone.pincodes.includes(update.pincode)) {
          return res.status(400).json({ message: "The selected zone does not have this pincode. Please change the pincode first."});
        }
      }

      const updatedCustomer = await Customer.findByIdAndUpdate(
        customerId,
        updateObj,
        { new: true }
      );

      res.json(updatedCustomer);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async verifyEmail(req, res) {
    try {
      const customerId = req.params.id;

      const updatedCustomer = await Customer.findByIdAndUpdate(
        customerId,

        {
          emailVerified: true,
        },
        { new: true }
      );
      if(!updatedCustomer) return res.status(404).json({ message: "User not found."})
      res.json(updatedCustomer);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  //update password
  async updatePassword(req, res) {
    try {
      const customerId = req.params.id;
      const { password } = await req.body;

      const customer = await Customer.findById(customerId);

      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      const hash_pass = bcrypt.hashSync(password, bcryptSalt);
      const updatedCustomer = await Customer.findByIdAndUpdate(
        customerId,
        { password: hash_pass },
        { new: true }
      );

      // Send Password email to the user.
      const name = customer.fname + " " + customer.lname;
      const emailSubject = "Your password has been updated by Admin";
      const body = generateUpdatePasswordEmailTemplate(name, password);
      await sendMail(customer.email, emailSubject, body);
      res.json(updatedCustomer);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async deleteCustomer(req, res) {
    try {
      const customerId = req.params.id;
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res.json({ message: "Customer with this id is not available" });
      }
      const orders = await Order.find({ customer: customer._id });

      if (orders.length > 0) {
        return res
          .status(400)
          .json({ message: "Customer has orders. Cannot delete" });
      }
      await Customer.findByIdAndDelete(customerId);
      res.json(customer);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async getEnquiries(req, res) {
    try {
      const page = req.params.page || 1;
      const limit = req.query.limit || 10;
      const csvTrue = req.query.csvTrue || false;
      const searchText = req.query.query || "";
      const searchTerms = searchText.split(' ').map(term => new RegExp(term, 'i'));
      const page_limit = process.env.PAGE_LIMIT || 10;
      const skip = (page - 1) * page_limit;

      let filterObj = {};
      if(searchText) {
        filterObj = {
          $and: searchTerms.map(term => ({
            $or: [
              { email: term },
              { name: term },
              { phone: term },
            ]
          }))
        }
      }

      if(csvTrue) {
        const enquiries = await CustomerEnquiry.find(filterObj).sort({ createdAt: -1 }).exec();
        return res.json({enquiries, success: true});
      }
      const enquiries = await CustomerEnquiry.find(filterObj)
        .sort({ createdAt: -1 }).skip(skip).limit(limit)
        .exec();

      const totalEnquiries = await CustomerEnquiry.find(filterObj).countDocuments();

      res.json({ enquiries, totalEnquiries });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async deleteEnquiry(req, res) {
    try {
      const Id = await req.body.Id;
      const enquiry = await CustomerEnquiry.findById(Id);

      if (!enquiry) {
        return res
          .status(404)
          .json({ success: true, message: "Enquiry not found" });
      }
      await CustomerEnquiry.findByIdAndDelete(Id);
      res.status(200).json({ success: true, message: "Enquiry deleted" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

  async fetchAllCustomers(req, res) {
    try {
      const searchText = req.query.query || "";
      const searchTerms = searchText.split(' ').map(term => new RegExp(term, 'i'));
      const searchType = req.query.searchType || "name";
      
      let filterObj = {};
      if(searchText){
        if(searchType === "email") {
          filterObj = {
            email: { $in: searchTerms }
          }
        } else {
          filterObj = {
            $and: searchTerms.map(term => ({
              $or: [
                { fname: term },
                { lname: term },
              ]
            }))
          }
        }
      }

      const allCustomers = await Customer.find(filterObj)
      .select("fname lname email _id pincode mobile")
      .populate("zone city")
      .sort({ createdAt: -1 })
      .exec();

      res.json(allCustomers);
    } catch (error) {
      console.log("error:: ",error);
      res.status(500).json({ message: "Internal Server Errorrrrrrrrrrr" });
    }
  }
}

module.exports = new CustomerController();

const isIncludes = (customer, query) => {
  return customer?.email.includes(query) ||
  (customer?.fname + " " + customer?.lname).toLocaleLowerCase().includes(query.toLocaleLowerCase());
}