const moment = require("moment");
const Order = require("../models/orderModel");
const Customer = require("../models/customerModel");
const Toy = require("../models/toyModel");
const ChangeLog = require("../models/changeLogModel");
const PickUpPoint = require("../models/pickUpPointModel");
const Coupon = require("../models/couponModel");
require("dotenv").config();


class orderController {

    async createOrder(req,res){
        try {
            // Extract order details from the request body
            const {
              toy,
              deposit,
              rent,
              deliveryFee,
              deliveryDate,
              returnDate,
              customer,
              duration,
              paid
            } = req.body;
        
            // Create a new order instance
            const newOrder = new Order({
              toy,
              deposit,
              rent,
              deliveryFee,
              deliveryDate,
              returnDate,
              customer,
              duration,
              paid
            });
        
            // Save the order to the database
            const savedOrder = await newOrder.save();
        
            res.json(savedOrder);
          } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
          }
    }

    async upcomingOrders(req, res) {
        try {
            const page = req.params.page || 1;
            const limit = req.params.limit || 10;
            const searchText = req.query.query || "";
            const searchTerms = searchText.split(' ').map(term => new RegExp(term, 'i'));
            // startDate and endDate from params
            const {startDate, endDate} = await req.body
            let _startDate = moment(startDate + " 00:00:00").utc().toDate();
            let _endDate = moment(endDate + " 23:59:59").utc().toDate();
            // Mongoose query to find orders within the calculated date range
            
            let filterObj = {
              status: { $nin: ['cancelled', 'refunded']},
              paid: true
            }

            if(startDate && endDate){
              filterObj = {
                ...filterObj,
                deliveryDate: { $gte: _startDate, $lte: _endDate }
              }
            }

            if(searchText){
              filterObj = {
                ...filterObj,
                $and: searchTerms.map(term => {
		              const numericTerm = Number(term?.source);
                  return {
                    $or: [
                      { 'customer.fname': term },
                      { 'customer.lname': term },
                      { 'customer.email': term },
                      { 'toy.name': term },
                      { orderId: isNaN(numericTerm) ? null : numericTerm }
                    ]
                  }
                }) 
              }
            }

            let aggregateObj = [
              { $lookup: { from: 'toys', localField: 'toy', foreignField: '_id', as: 'toy' } },
              { $unwind: { path: '$toy', preserveNullAndEmptyArrays: true } },
              { $lookup: { from: 'customers', localField: 'customer', foreignField: '_id', as: 'customer' } },
              { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
              { $lookup: { from: 'zones', localField: 'customer.zone', foreignField: '_id', as: 'customer.zone' } },
              { $unwind: { path: '$customer.zone', preserveNullAndEmptyArrays: true } },
              { $lookup: { from: 'cities', localField: 'customer.city', foreignField: '_id', as: 'customer.city' } },
              { $unwind: { path: '$customer.city', preserveNullAndEmptyArrays: true } },
              { $lookup: { from: 'coupons', localField: 'coupon', foreignField: '_id', as: 'coupon' } },
              { $unwind: { path: '$coupon', preserveNullAndEmptyArrays: true } },
              { $lookup: { from: 'pickuppoints', localField: 'selfPickup', foreignField: '_id', as: 'selfPickup' } },
              { $unwind: { path: '$selfPickup', preserveNullAndEmptyArrays: true } },
              { $lookup: { from: 'users', localField: 'updatedBy', foreignField: '_id', as: 'user' } },
              { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
              { $match: filterObj },
            ];

            const orders = await Order.aggregate([
              ...aggregateObj,
              {
                $sort: { deliveryDate: -1, orderId: -1}
              },
              {
                $skip: (page-1)*limit
              },
              {
                $limit: parseInt(limit)
              }
            ])

            const totalOrdersCount = await Order.aggregate([
              ...aggregateObj,
              {
                $count: 'totalOrders'
              }
            ]);

            const totalOrders = totalOrdersCount.length > 0 ? totalOrdersCount[0].totalOrders : 0;

            res.json({orders, totalOrders});

          } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
          }
      }
    async allOrders(req, res) {
        try {
            const page = req.params.page || 1;
            const limit = req.params.limit || 10;
            const searchText = req.query.query || "";
            const {startDate, endDate, csvTrue} = await req.body
            const searchTerms = searchText.split(' ').map(term => new RegExp(term, 'i'));
            
            let filterObj = {
              status: { $nin: ['cancelled', 'refunded']},
              paid: true
            }
            
            if(startDate && endDate){
              let _startDate = moment(startDate + " 00:00:00").utc().toDate();
              let _endDate = moment(endDate + " 23:59:59").utc().toDate();
              filterObj = {
                ...filterObj,
                deliveryDate: { $gte: _startDate, $lte: _endDate }
              }
            }   

            if(searchText){
              filterObj = {
                ...filterObj,
                $and: searchTerms.map(term => {
		              const numericTerm = Number(term?.source);
                  return {
                    $or: [
                      { 'customer.fname': term },
                      { 'customer.lname': term },
                      { 'customer.email': term },
                      { 'toy.name': term },
                      { orderId: isNaN(numericTerm) ? null : numericTerm }
                    ]
                  }
                }) 
              }
            }

            let aggregateObj = [
              { $lookup: { from: 'toys', localField: 'toy', foreignField: '_id', as: 'toy' } },
              { $unwind: { path: '$toy', preserveNullAndEmptyArrays: true } },
              { $lookup: { from: 'customers', localField: 'customer', foreignField: '_id', as: 'customer' } },
              { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
              { $lookup: { from: 'zones', localField: 'customer.zone', foreignField: '_id', as: 'customer.zone' } },
              { $unwind: { path: '$customer.zone', preserveNullAndEmptyArrays: true } },
              { $lookup: { from: 'cities', localField: 'customer.city', foreignField: '_id', as: 'customer.city' } },
              { $unwind: { path: '$customer.city', preserveNullAndEmptyArrays: true } },
              { $lookup: { from: 'coupons', localField: 'coupon', foreignField: '_id', as: 'coupon' } },
              { $unwind: { path: '$coupon', preserveNullAndEmptyArrays: true } },
              { $lookup: { from: 'pickuppoints', localField: 'selfPickup', foreignField: '_id', as: 'selfPickup' } },
              { $unwind: { path: '$selfPickup', preserveNullAndEmptyArrays: true } },
              { $lookup: { from: 'users', localField: 'updatedBy', foreignField: '_id', as: 'user' } },
              { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
              { $match: filterObj },
            ];
            if(csvTrue){
              const orders = await Order.aggregate([
                ...aggregateObj,
                {
                  $sort: { deliveryDate: -1 }
                },
              ]).exec();
              res.status(200).json({success: true, orders});
              return;
            }
            
            const orders = await Order.aggregate([
              ...aggregateObj,
              {
                $sort: { deliveryDate: -1 , orderId: -1}
              },
              {
                $skip: (page-1)*limit
              },
              {
                $limit: parseInt(limit)
              }
            ]).exec();

            const totalOrdersCount = await Order.aggregate([
              ...aggregateObj,
              {
                $count: 'totalOrders'
              }
            ]).exec();

            const totalOrders = totalOrdersCount.length > 0 ? totalOrdersCount[0].totalOrders : 0;
            res.json({orders, totalOrders});

          } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
          }
      }

      async pendingDueReturns(req, res) {
        try {
            const page = req.params.page || 1;
            const limit = req.params.limit || 10;
            const searchText = req.query.query || "";
            const searchTerms = searchText.split(' ').map(term => new RegExp(term, 'i'));
            const {startDate, endDate} = await req.body;
            let _startDate = moment(startDate + " 00:00:00").utc().toDate();
            let _endDate = moment(endDate + " 23:59:59").utc().toDate();
            // Mongoose query to find orders within the calculated date range
            // return date is less than or equal to the end date and greater than or equal to the start date

            let filterObj = {
              status: { $nin: ['cancelled', 'refunded']},
              paid: true
            }

            if(startDate && endDate){
              filterObj = {
                ...filterObj,
                returnDate: { $lte: _endDate, $gte: _startDate }
              }
            }

            if(searchText){
              filterObj = {
                ...filterObj,
                $and: searchTerms.map(term => {
                  const numericTerm = Number(term?.source);
                  return {
                    $or: [
                      { 'customer.fname': term },
                      { 'customer.lname': term },
                      { 'customer.email': term },
                      { 'toy.name': term },
                      { orderId: isNaN(numericTerm) ? null : numericTerm }
                    ]
                  }
                })
              }
            }

            let aggregateObj = [
              { $lookup: { from: 'toys', localField: 'toy', foreignField: '_id', as: 'toy' } },
              { $unwind: { path: '$toy', preserveNullAndEmptyArrays: true } },
              { $lookup: { from: 'customers', localField: 'customer', foreignField: '_id', as: 'customer' } },
              { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
              { $lookup: { from: 'zones', localField: 'customer.zone', foreignField: '_id', as: 'customer.zone' } },
              { $unwind: { path: '$customer.zone', preserveNullAndEmptyArrays: true } },
              { $lookup: { from: 'cities', localField: 'customer.city', foreignField: '_id', as: 'customer.city' } },
              { $unwind: { path: '$customer.city', preserveNullAndEmptyArrays: true } },
              { $lookup: { from: 'coupons', localField: 'coupon', foreignField: '_id', as: 'coupon' } },
              { $unwind: { path: '$coupon', preserveNullAndEmptyArrays: true } },
              { $lookup: { from: 'pickuppoints', localField: 'selfPickup', foreignField: '_id', as: 'selfPickup' } },
              { $unwind: { path: '$selfPickup', preserveNullAndEmptyArrays: true } },
              { $match: filterObj },
            ];

            const orders = await Order.aggregate([
              ...aggregateObj,
              {
                  $sort: { returnDate: 1, orderId: -1 }
              },
              {
                $skip: (page-1)*limit
              },
              {
                $limit: parseInt(limit)
              }
            ]).exec();

            const totalOrdersCount = await Order.aggregate([
              ...aggregateObj,
              {
                $count: 'totalOrders'
              }
            ]).exec();

            const totalOrders = totalOrdersCount.length > 0 ? totalOrdersCount[0].totalOrders : 0;

            res.json({orders,totalOrders});
          } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
          }
      }

      async onGoingOrders(req,res){
        try {
            const page = req.params.page || 1;
            const limit = req.params.limit || 10;
            const searchText = req.query.query || "";
            const { csvTrue } = await req.body;
            const searchTerms = searchText.split(' ').map(term => new RegExp(term, 'i'));
            let currentDate = moment().startOf('day').utc().toDate(); 

            let filterObj = {
              returnDate: { $gte: currentDate },
              deliveryDate: { $lte: currentDate },
              status: { $nin: ['cancelled', 'refunded']},
              paid: true
            } 

            if(searchText){
              filterObj = {
                ...filterObj,
                $and: searchTerms.map(term => {
		              const numericTerm = Number(term?.source);
                  return {
                    $or: [
                      { 'customer.fname': term },
                      { 'customer.lname': term },
                      { 'customer.email': term },
                      { 'toy.name': term },
                      { orderId: isNaN(numericTerm) ? null : numericTerm }
                    ]
                  }
                }) 
              }
            }

            let aggregateObj = [
              { $lookup: { from: 'toys', localField: 'toy', foreignField: '_id', as: 'toy' } },
              { $unwind: { path: '$toy', preserveNullAndEmptyArrays: true } },
              { $lookup: { from: 'customers', localField: 'customer', foreignField: '_id', as: 'customer' } },
              { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
              { $lookup: { from: 'zones', localField: 'customer.zone', foreignField: '_id', as: 'customer.zone' } },
              { $unwind: { path: '$customer.zone', preserveNullAndEmptyArrays: true } },
              { $lookup: { from: 'cities', localField: 'customer.city', foreignField: '_id', as: 'customer.city' } },
              { $unwind: { path: '$customer.city', preserveNullAndEmptyArrays: true } },
              { $lookup: { from: 'coupons', localField: 'coupon', foreignField: '_id', as: 'coupon' } },
              { $unwind: { path: '$coupon', preserveNullAndEmptyArrays: true } },
              { $lookup: { from: 'pickuppoints', localField: 'selfPickup', foreignField: '_id', as: 'selfPickup' } },
              { $unwind: { path: '$selfPickup', preserveNullAndEmptyArrays: true } },
              { $match: filterObj },
            ];

            if(csvTrue){
              const orders = await Order.aggregate([
                ...aggregateObj,
                {
                  $sort: { deliveryDate: -1, orderId: -1 }
                },
              ]).exec();
              res.status(200).json({success: true, orders});
              return;
            }

            const orders = await Order.aggregate([
              ...aggregateObj,
              {
                $sort: { deliveryDate: -1, orderId: -1 }
              },
              {
                $skip: (page-1)*limit
              },
              {
                $limit: parseInt(limit)
              }
            ]).exec();

            const totalOrdersCount = await Order.aggregate([
              ...aggregateObj,
              {
                $count: 'totalOrders'
              }
            ]).exec();

            const totalOrders = totalOrdersCount.length > 0 ? totalOrdersCount[0].totalOrders : 0;

            res.json({orders,totalOrders});
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }

      }

      async preBookingOrders(req,res){
        try {
          const page = req.params.page || 1;
          const limit = req.params.limit || 10;
          const searchText = req.query.query || "";
          const searchTerms = searchText.split(' ').map(term => new RegExp(term, 'i'));
          const {startDate, endDate} = await req.body;

          const defaultStartDate = moment().add(2, 'days').startOf('day').utc().toDate();
          let _startDate = startDate && moment(startDate).isAfter(defaultStartDate) ? moment(startDate + " 00:00:00").utc().toDate() : defaultStartDate;

          const defaultEndDate = moment().add(2, "days").add(2, 'months').endOf('day').utc().toDate();
          let _endDate = endDate && moment(endDate).isBefore(defaultEndDate) && moment(endDate).isAfter(_startDate) ? moment(endDate + " 23:59:59").utc().toDate() : defaultEndDate;
          
          let filterObj = {
            deliveryDate: { $gte: _startDate, $lte: _endDate },
            status: { $nin: ['cancelled', 'refunded']},
            paid: true
          }
          
          if(searchText){
            filterObj = {
              ...filterObj,
              $and: searchTerms.map(term => {
                const numericTerm = Number(term?.source);
                return {
                  $or: [
                    { 'customer.fname': term },
                    { 'customer.lname': term },
                    { 'customer.email': term },
                    { 'toy.name': term },
                    { orderId: isNaN(numericTerm) ? null : numericTerm }
                  ]
                }
              }) 
            }
          }

          let aggregateObj = [
            { $lookup: { from: 'toys', localField: 'toy', foreignField: '_id', as: 'toy' } },
            { $unwind: { path: '$toy', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'customers', localField: 'customer', foreignField: '_id', as: 'customer' } },
            { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'zones', localField: 'customer.zone', foreignField: '_id', as: 'customer.zone' } },
            { $unwind: { path: '$customer.zone', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'cities', localField: 'customer.city', foreignField: '_id', as: 'customer.city' } },
            { $unwind: { path: '$customer.city', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'coupons', localField: 'coupon', foreignField: '_id', as: 'coupon' } },
            { $unwind: { path: '$coupon', preserveNullAndEmptyArrays: true } },  
            { $lookup: { from: 'pickuppoints', localField: 'selfPickup', foreignField: '_id', as: 'selfPickup' } },
            { $unwind: { path: '$selfPickup', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'users', localField: 'updatedBy', foreignField: '_id', as: 'user' } },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            { $match: filterObj },
          ];

          const orders = await Order.aggregate([
            ...aggregateObj,
            {
              $sort: { deliveryDate: -1, orderId: -1 }
            },
            {
              $skip: (page-1)*limit
            },
            {
              $limit: parseInt(limit)
            }
          ]).exec();

          const totalOrdersCount = await Order.aggregate([
            ...aggregateObj,
            {
              $count: 'totalOrders'
            }
          ]).exec();

          const totalOrders = totalOrdersCount.length > 0 ? totalOrdersCount[0].totalOrders : 0;

          res.json({orders,totalOrders});
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Internal Server Error' });
        }
      }


      // async getPaginatedOrdersByCustomerId(req,res){
      //     const customerId = req.params.id;
      //     try {
      //       // Fetch 10 orders per page for the specified customer ID
      //       const page = req.query.page || 1;
      //       const pageSize = process.env.PAGE_LIMIT || 10;
        
      //       const orders = await Order.find({ customer: customerId })
      //         .sort({ createdDate: -1 }) // Sorting by createdDate in descending order
      //         .skip((page - 1) * pageSize)
      //         .limit(pageSize)
      //         .exec();
        
      //       res.json({ orders });
      //     } catch (error) {
      //       console.error(error);
      //       res.status(500).json({ error: 'Internal Server Error' });
      //     }
      
      // }

      async changeOrderStatus(req,res){
        const { orderIds, status } = req.body;
        consele.log(orderIds);
        consele.log(status);
        try {
          // Update the status of the specified orders
          const updatedOrders = await Order.updateMany(
            { _id: { $in: orderIds } },
            { status }
          );
        
          res.json(updatedOrders);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Internal Server Error' });
        }
      }

      async cancelOrder(req,res){
        try {
          const { orderId, reason } = await req.body;
          if(!orderId || !reason){
            return res.status(400).json({ message: 'Missing required fields' });
          }
          
          const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
              status: 'cancelled',
              cancelOrder: {
                createdAt: new Date(),
                reason
              }
            },
            { new: true }
          );

          if(!updatedOrder){
            return res.status(404).json({ message: 'Order not found' });
          }

          res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            updatedOrder
          });

        } catch(error){
          console.error(error);
          res.status(500).json({ message: 'Internal Server Error' });
        }
      }
      
      async getCanceledOrders(req,res){
        try {
          const page = req.params.page || 1;
          const limit = req.params.limit || 10;
          const searchText = req.query.query || "";
          const searchTerms = searchText.split(' ').map(term => new RegExp(term, 'i'));
          const {startDate, endDate, csvTrue} = await req.body;
          const _startDate = moment(startDate + " 00:00:00").utc().toDate();
          const _endDate = moment(endDate + " 23:59:59").utc().toDate();
          
          let filterObj = {
            status: 'cancelled',
          }

          if(startDate && endDate){
            filterObj = {
              ...filterObj,
              "cancelOrder.createdAt": { $gte: _startDate, $lte: _endDate}
            }
          }

          if(searchText){
            filterObj = {
              ...filterObj,
              $and: searchTerms.map(term => {
                const numericTerm = Number(term?.source);
                return {
                  $or: [
                    { 'customer.fname': term },
                    { 'customer.lname': term },
                    { 'customer.email': term },
                    { 'toy.name': term },
                    { orderId: isNaN(numericTerm) ? null : numericTerm }
                  ]
                }
              }) 
            }
          }

          let aggregateObj = [
            { $lookup: { from: 'toys', localField: 'toy', foreignField: '_id', as: 'toy' } },
            { $unwind: { path: '$toy', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'customers', localField: 'customer', foreignField: '_id', as: 'customer' } },
            { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'zones', localField: 'customer.zone', foreignField: '_id', as: 'customer.zone' } },
            { $unwind: { path: '$customer.zone', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'cities', localField: 'customer.city', foreignField: '_id', as: 'customer.city' } },
            { $unwind: { path: '$customer.city', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'coupons', localField: 'coupon', foreignField: '_id', as: 'coupon' } },
            { $unwind: { path: '$coupon', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'pickuppoints', localField: 'selfPickup', foreignField: '_id', as: 'selfPickup' } },
            { $unwind: { path: '$selfPickup', preserveNullAndEmptyArrays: true } },
            { $match: filterObj },
          ];

          if(csvTrue){
            const orders = await Order.aggregate([
              ...aggregateObj,
              {
                $sort: { "cancelOrder.deliveryDate": -1 }
              }
            ]).exec();
            
            res.status(200).json({success: true, orders});
            return;
          }
          
          const orders = await Order.aggregate([
            ...aggregateObj,
            {
              $sort: { "cancelOrder.deliveryDate": -1, orderId: -1 }
            },
            {
              $skip: (page-1)*limit
            },
            {
              $limit: parseInt(limit)
            }
          ]).exec();

          const totalOrdersCount = await Order.aggregate([
            ...aggregateObj,
            {
              $count: 'totalOrders'
            }
          ]).exec();

          const totalOrders = totalOrdersCount.length > 0 ? totalOrdersCount[0].totalOrders : 0;

          res.json({orders,totalOrders});
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Internal Server Error' });
        }
      }

      async fetchFailedCarts(req,res){
        try {
          const page = req.query.page || 1;
          const limit = req.query.limit || 10;
          const skip = (page-1)*limit;
          const csvTrue = req.query.csvTrue || false;
          const searchText = req.query.query || "";
          const searchTerms = searchText.split(' ').map(term => new RegExp(term, 'i'));
          const oneHourAgo = moment().subtract(1, 'hour').toDate();

          let filterObj = {
            paid: false,
            "paymentDetails.status": { $in: ["created", "failed"] }
          }

          if(searchText){
            filterObj = {
              ...filterObj,
              $and: searchTerms.map(term => {
                const numericTerm = Number(term?.source);
                return {
                  $or: [
                    { 'customer.fname': term },
                    { 'customer.lname': term },
                    { 'customer.email': term },
                    { 'toy.name': term },
                    { orderId: isNaN(numericTerm) ? null : numericTerm }
                  ]
                }
              }) 
            }
          }

          let aggregateObj = [
            { $lookup: { from: 'toys', localField: 'toy', foreignField: '_id', as: 'toy' } },
            { $unwind: { path: '$toy', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'customers', localField: 'customer', foreignField: '_id', as: 'customer' } },
            { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'zones', localField: 'customer.zone', foreignField: '_id', as: 'customer.zone' } },
            { $unwind: { path: '$customer.zone', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'cities', localField: 'customer.city', foreignField: '_id', as: 'customer.city' } },
            { $unwind: { path: '$customer.city', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'coupons', localField: 'coupon', foreignField: '_id', as: 'coupon' } },
            { $unwind: { path: '$coupon', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'pickuppoints', localField: 'selfPickup', foreignField: '_id', as: 'selfPickup' } },
            { $unwind: { path: '$selfPickup', preserveNullAndEmptyArrays: true } },
            { $match: filterObj },
          ];

          if(csvTrue){
            const orders = await Order.aggregate([
              ...aggregateObj,
              {
                $sort: { deliveryDate: -1 }
              }
            ]).exec();
            return res.status(200).json({success: true, orders});
          }

          const orders = await Order.aggregate([
            ...aggregateObj,
            {
              $sort: { deliveryDate: -1, orderId: -1 }
            },
            {
              $skip: skip
            },
            {
              $limit: parseInt(limit)
            }
          ]).exec();

          const totalOrdersCount = await Order.aggregate([
            ...aggregateObj,
            {
              $count: 'totalOrders'
            }
          ]).exec();

          const totalOrders = totalOrdersCount.length > 0 ? totalOrdersCount[0].totalOrders : 0;
          res.json({orders, totalOrders});

        } catch (error) {
          console.log(error);
          res.status(500).json({ message: 'Internal Server Error' }); 
        }
      }
    
      async completedOrders(req,res){
        try {
          const page = req.params.page || 1;
          const limit = req.params.limit || 10;
          const searchText = req.query.query || "";
          const searchTerms = searchText.split(' ').map(term => new RegExp(term, 'i'));
          const { date, csvTrue = false } = await req.body;

          let _date = date ? moment(date + " 23:59:59").utc().toDate() : moment().utc().toDate(); 

          let filterObj = {
            status: { $nin: ['cancelled', 'refunded']},
            paid: true
          }

          if(date){
            filterObj = {
              ...filterObj,
              deliveryDate: { $lte: _date }
            }
          }

          if(searchText){
            filterObj = {
              ...filterObj,
              $and: searchTerms.map(term => {
                const numericTerm = Number(term?.source);
                return {
                  $or: [
                    { 'customer.fname': term },
                    { 'customer.lname': term },
                    { 'customer.email': term },
                    { 'toy.name': term },
                    { orderId: isNaN(numericTerm) ? null : numericTerm }
                  ]
                }
              }) 
            }
          }

          let aggregateObj = [
            { $lookup: { from: 'toys', localField: 'toy', foreignField: '_id', as: 'toy' } },
            { $unwind: { path: '$toy', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'customers', localField: 'customer', foreignField: '_id', as: 'customer' } },
            { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'zones', localField: 'customer.zone', foreignField: '_id', as: 'customer.zone' } },
            { $unwind: { path: '$customer.zone', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'cities', localField: 'customer.city', foreignField: '_id', as: 'customer.city' } },
            { $unwind: { path: '$customer.city', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'coupons', localField: 'coupon', foreignField: '_id', as: 'coupon' } },
            { $unwind: { path: '$coupon', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'pickuppoints', localField: 'selfPickup', foreignField: '_id', as: 'selfPickup' } },
            { $unwind: { path: '$selfPickup', preserveNullAndEmptyArrays: true } },
            { $match: filterObj },
          ];

          if(csvTrue){
            const orders = await Order.aggregate([
              ...aggregateObj,
              {
                $sort: { deliveryDate: -1 }
              }
            ]).exec();
            return res.status(200).json({success: true, orders});
          }

          const orders = await Order.aggregate([
            ...aggregateObj,
            {
              $sort: { deliveryDate: -1, orderId: -1 }
            },
            {
              $skip: (page-1)*limit
            },
            {
              $limit: parseInt(limit)
            }
          ]).exec();

          const totalOrdersCount = await Order.aggregate([
            ...aggregateObj,
            {
              $count: 'totalOrders'
            }
          ]).exec();

          const totalOrders = totalOrdersCount.length > 0 ? totalOrdersCount[0].totalOrders : 0;
          res.json({orders, totalOrders});
        } catch (error) {
          console.log(error);
          res.status(500).json({ message: 'Internal Server Error' });
        }
      }

      async abondonedCarts(req,res){
        try {
          const page = req.query.page || 1;
          const limit = req.query.limit || 10;
          const skip = (page-1)*limit;
          const searchText = req.query.query || "";
          const searchTerms = searchText.split(' ').map(term => new RegExp(term, 'i'));
          const oneHourAgo = moment().subtract(1, 'hour').toDate();
          const csvTrue = req.query.csvTrue || false;

          let filterObj = {
            paid: false,
            status: { $ne: 'cancelled' },
            createdAt: { $lte: oneHourAgo },
            paymentDetails: { $exists: false } 
          }

          if(searchText){
            filterObj = {
              ...filterObj,
              $and: searchTerms.map(term => {
                const numericTerm = Number(term?.source);
                return {
                  $or: [
                    { 'customer.fname': term },
                    { 'customer.lname': term },
                    { 'customer.email': term },
                    { 'toy.name': term },
                    { orderId: isNaN(numericTerm) ? null : numericTerm }
                  ]
                }
              }) 
            }
          }

          let aggregateObj = [
            { $lookup: { from: 'toys', localField: 'toy', foreignField: '_id', as: 'toy' } },
            { $unwind: { path: '$toy', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'customers', localField: 'customer', foreignField: '_id', as: 'customer' } },
            { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'zones', localField: 'customer.zone', foreignField: '_id', as: 'customer.zone' } },
            { $unwind: { path: '$customer.zone', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'cities', localField: 'customer.city', foreignField: '_id', as: 'customer.city' } },
            { $unwind: { path: '$customer.city', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'coupons', localField: 'coupon', foreignField: '_id', as: 'coupon' } },
            { $unwind: { path: '$coupon', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'pickuppoints', localField: 'selfPickup', foreignField: '_id', as: 'selfPickup' } },
            { $unwind: { path: '$selfPickup', preserveNullAndEmptyArrays: true } },
            { $match: filterObj },
          ];

          if(csvTrue){
            const orders = await Order.aggregate([
              ...aggregateObj,
              {
                $sort: { deliveryDate: -1 }
              }
            ]).exec();
            return res.status(200).json({success: true, orders});
          }

          const orders = await Order.aggregate([
            ...aggregateObj,
            {
              $sort: { deliveryDate: -1, orderId: -1 }
            },
            {
              $skip: skip
            },
            {
              $limit: parseInt(limit)
            }
          ]).exec();

          const totalOrdersCount = await Order.aggregate([
            ...aggregateObj,
            {
              $count: 'totalOrders'
            }
          ]).exec();

          const totalOrders = totalOrdersCount.length > 0 ? totalOrdersCount[0].totalOrders : 0;
          res.json({orders, totalOrders});
        }
        catch (error) {
          console.log(error);
          res.status(500).json({ message: 'Internal Server Error' });
        }
      }

      async deleteAbandonedCarts(req,res){
        try {
          const orderId = req.query.orderId;
          if(!orderId){
            return res.status(400).json({ message: 'Missing Order ID' });
          }

          const oneHourAgo = moment().subtract(1, 'hour').toDate();
          const deletedOrder = await Order.findOneAndDelete({ _id: orderId, paid: false, createdAt: { $lte: oneHourAgo } });

          if(!deletedOrder){
            return res.status(404).json({ message: 'Order not found' });
          }

          res.status(200).json({
            success: true,
            message: 'Order deleted successfully',
            deletedOrder
          });

        } catch (error) {
          console.log(error);
          res.status(500).json({ message: 'Internal Server Error' });
        }
      }

      async refundOrder(req,res){
        try {
          const orderId = req.params.orderId;
          const { amount, reason, method } = req.body;
          if(!orderId || !amount || !reason || !method){
            return res.status(400).json({ message: 'Missing required fields' });
          }

          if(isNaN(amount)){
            return res.status(400).json({ message: 'Invalid amount' });
          }

          const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
              status: 'refunded',
              refundOrder: {
                createdAt: new Date(),
                amount,
                reason,
                method
              }
            },
            { new: true }
          );

          if(!updatedOrder){
            return res.status(404).json({ message: 'Order not found' });
          }

          res.status(200).json({
            success: true,
            message: 'Order refunded successfully',
            updatedOrder
          });

        } catch(error){
          console.error(error);
          res.status(500).json({ message: 'Internal Server Error' });
        }
      }

      async getRefundedOrders(req,res){
        try {
          const page = req.params.page || 1;
          const limit = req.params.limit || 10;
          const searchText = req.query.query || "";
          const searchTerms = searchText.split(' ').map(term => new RegExp(term, 'i'));
          const {startDate, endDate, csvTrue} = await req.body;
          
          let filterObj = {
            status: 'refunded',
          }
          
          if(startDate && endDate){
            const _startDate = moment(startDate + " 00:00:00").utc().toDate();
            const _endDate = moment(endDate + " 23:59:59").utc().toDate();
            filterObj = {
              ...filterObj,
              deliveryDate: { $gte: _startDate, $lte: _endDate}
            }
          }

          if(searchText){
            filterObj = {
              ...filterObj,
              $and: searchTerms.map(term => {
                const numericTerm = Number(term?.source);
                return {
                  $or: [
                    { 'customer.fname': term },
                    { 'customer.lname': term },
                    { 'customer.email': term },
                    { 'toy.name': term },
                    { orderId: isNaN(numericTerm) ? null : numericTerm }
                  ]
                }
              }) 
            }
          }

          let aggregateObj = [
            { $lookup: { from: 'toys', localField: 'toy', foreignField: '_id', as: 'toy' } },
            { $unwind: { path: '$toy', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'customers', localField: 'customer', foreignField: '_id', as: 'customer' } },
            { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'zones', localField: 'customer.zone', foreignField: '_id', as: 'customer.zone' } },
            { $unwind: { path: '$customer.zone', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'cities', localField: 'customer.city', foreignField: '_id', as: 'customer.city' } },
            { $unwind: { path: '$customer.city', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'coupons', localField: 'coupon', foreignField: '_id', as: 'coupon' } },
            { $unwind: { path: '$coupon', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'pickuppoints', localField: 'selfPickup', foreignField: '_id', as: 'selfPickup' } },
            { $unwind: { path: '$selfPickup', preserveNullAndEmptyArrays: true } },
            { $match: filterObj },
          ];

          if(csvTrue){
            const orders = await Order.aggregate([
              ...aggregateObj,
              {
                $sort: { deliveryDate: -1 }
              }
            ]).exec();
            return res.status(200).json({success: true, orders});
          }

          const orders = await Order.aggregate([
            ...aggregateObj,
            {
              $sort: { deliveryDate: -1, orderId: -1 }
            },
            {
              $skip: (page-1)*limit
            },
            {
              $limit: parseInt(limit)
            }
          ]).exec();

          const totalOrdersCount = await Order.aggregate([
            ...aggregateObj,
            {
              $count: 'totalOrders'
            }
          ]).exec();

          const totalOrders = totalOrdersCount.length > 0 ? totalOrdersCount[0].totalOrders : 0;
          res.json({orders,totalOrders});

        } catch (error) {
          console.log(error);
          res.status(500).json({ message: 'Internal Server Error' });
        }
      }

      async editOrder(req,res){
        try {
          const orderId = req.params.orderId;
          const { toyId, deliveryDate, duration, pickupPoint } = req.body;
          const order = await Order.findOne({ _id: orderId });
          if(!order){
            return res.status(404).json({ message: 'Order not found' });
          }
          let _deliveryDate = new Date(deliveryDate).toISOString();
          if(moment(order.deliveryDate).format('YYYY-MM-DD') !== moment(_deliveryDate).format('YYYY-MM-DD')){
            if(order.toy.toString() === toyId && order?.deliveryDate?.toISOString() === _deliveryDate && order?.duration === duration){
              return res.status(400).json({ message: 'No changes made' });
            }
          }
          const customerId = order?.customer;
          const returnDate = new Date(moment(_deliveryDate).add(duration * 7, 'days').toISOString());
          const oneHourAgo = moment().utc().subtract(1, 'hour').toDate();
          console.log(moment(order.deliveryDate).format('YYYY-MM-DD'))
          console.log(moment(_deliveryDate).format('YYYY-MM-DD'))
          if(moment(order.deliveryDate).format('YYYY-MM-DD') !== moment(_deliveryDate).format('YYYY-MM-DD')){
            const orderCount = await Order.countDocuments({
                toy: toyId,
                _id: { $ne: orderId },
                deliveryDate: {$lte: _deliveryDate},
                returnDate: {$gte: _deliveryDate},
                status: { $nin: ['cancelled', 'refunded']},
                $or: [
                    {
                        $and: [ {createdAt: {$gt: oneHourAgo}}, {paid: false} ],
                    },
                    {
                        $and: [ {paid: true}],
                    },
                ] 
            })
            
            if(orderCount > 0){
              return res.status(400).json({ message: 'Selected toy is already booked for the current delivery date.' });
            }
          }

          // create new change log if any changes are made
          if(order.toy.toString() !== toyId || order.deliveryDate !== _deliveryDate || order.duration !== duration || order.selfPickup !== pickupPoint){
            // calculate the new rent and delivery fee
            const newToy = await Toy.findById(toyId);
            const customer = await Customer.findById(customerId).populate("zone");
            if(!newToy || !customer){
              return res.status(404).json({ message: 'Toy or Customer not found' });
            }

            const deliveryFee = pickupPoint?._id ? 0 : customer?.zone?.deliveryFee || 0 ;
            const rent = newToy.cityPricing?.find((city) => city?.city?.toString() === customer?.city?.toString())?.["w" + duration] || 0;
            let discount = 0;
            if(order?.coupon){
              const coupon = await Coupon.findById(order?.coupon);
              discount = (rent * coupon.percentage) / 100;
            }
            const total = rent - discount + deliveryFee;
            
            const newChanges = await ChangeLog.create({
              orderId: orderId,
              oldData: {
                toy: order.toy,
                deliveryDate: order.deliveryDate,
                duration: order.duration,
                returnDate: order.returnDate,
                rent: order.rent,
                deliveryFee: order.deliveryFee,
                selfPickup: order.selfPickup,
                discount: order.discount,
              },
              newData: {
                toy: toyId,
                deliveryDate: _deliveryDate,
                duration: duration,
                returnDate: returnDate,
                rent: rent,
                deliveryFee: deliveryFee,
                selfPickup: pickupPoint?._id ? pickupPoint?._id : null,
                discount: discount,
              },
              changedBy: req?.user?.userId,
            })
            // update the order
            const updatedOrder = await Order.findByIdAndUpdate
            (orderId, {
              toy: toyId,
              deliveryDate: _deliveryDate,
              duration: duration,
              returnDate: returnDate,
              rent: rent,
              discount: discount,
              orderTotal: total,
              deliveryFee: deliveryFee,
              orderTotal: total,
              selfPickup: pickupPoint?._id ? pickupPoint?._id : null,
              updatedBy: req?.user?.userId,
              updatedAt: new Date()
            }, { new: true });
            res.status(200).json({ message: 'Order updated successfully', updatedOrder });
          }
          else{
            res.status(200).json({ message: 'Order updated successfully', });
          }
        }
        catch (error) {
          console.log(error);
          res.status(500).json({ message: 'Internal Server Error' });
        }
      }

    async checkToyAvailability(req, res) {
      try {
          const toyId = req.params.toyId
          const { deliveryDate, duration, orderId, selfPickup } = req.body;
          const order = await Order.findOne({ _id: orderId });
          if(!order){
            return res.status(404).json({ message: 'Order not found' });
          }

          const oneHourAgo = moment().utc().subtract(1, 'hour').toDate();
          const customer = await Customer.findById(order?.customer).populate('city').populate('zone');
          if(!customer){
            return res.status(404).json({ message: 'Customer not found' });
          }

          const deliveryDays = customer?.zone?.deliveryDays;
          const pickupPoint = order?.pickupPoint ? true : false; 
          const weeklyOff = customer?.city?.weeklyOff;
          // const currentDateUTC = moment().isBefore(moment(order.deliveryDate)) ? moment() : moment(order.deliveryDate)
          const currentDateUTC = moment().subtract(parseInt(duration || 2) * 7, 'days');
	        const orders = await Order.find({
            toy: toyId,
            _id: { $ne: orderId },
            status: { $nin: ['cancelled', 'refunded']},
            $or: [
                {
                    $and: [ {createdAt: {$gt: oneHourAgo}}, {paid: false}],
                },
                {
                    $and: [ {returnDate: {$gte: currentDateUTC}}, {paid: true}],
                },
                {
                    $and: [ {deliveryDate: {$gte: currentDateUTC}}, {paid: true}],
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
            const duration = parseInt(order.duration) * 7 + 60;
            for (let i = 1; i <= duration; i++) {
              const weekDay = currentDate.weekday();
              if (weekDay !== weeklyOff && (deliveryDays.includes(weekDay) || selfPickup === true ) && !bookedDates.includes(currentDate.format("YY-MM-DD"))) {
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
              if (available) {
                availability["w" + week].push(dt);
              }
            })
          })
          const selectedDate = moment(deliveryDate).format("YYYY-MM-DD");
          const isAvailable = availability.w2.includes(selectedDate) || availability.w3.includes(selectedDate) || availability.w4.includes(selectedDate);
          if(isAvailable){
            return res.status(200).json({ message: 'Toy is available for the selected delivery date.', availability });
          }
          else{
            if(order?.toy?.toString() === toyId){
              return res.status(200).json({ message: 'Toy is available for the selected delivery date.', availability });
            }
            return res.status(400).json({ message: 'Toy is not available for the selected delivery date.', availability });
          }

      } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    }

    async fetchPickUpPoints(req,res){
      try {
        const userId = req.params.id;
        const user = await Customer.findById(userId).populate('city');
        const pickUpPoints = await PickUpPoint.find({city: user.city});
        res.status(200).json({success: true, pickUpPoints});
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    }

  async addOrder(req, res) {
    try {
      const { customerId, toyId, duration, deliveryDate, selfPickup } = req.body;
      
      const customer = await Customer.findById(customerId).populate('city').populate('zone');
      const toy = await Toy.findById(toyId);
      if (!customer || !toy) {
        return res.status(404).json({ message: 'Customer or Toy not found' });
      }
      
      const oneHourAgo = moment().utc().subtract(1, 'hour').toDate();
      const orderCount = await Order.countDocuments({
        toy: toyId,
        deliveryDate: { $lte: deliveryDate },
        returnDate: { $gte: deliveryDate },
        status: { $nin: ['cancelled', 'refunded'] },
        $or: [
          {
            $and: [{ createdAt: { $gt: oneHourAgo } }, { paid: false }],
          },
          {
            $and: [{ paid: true }],
          },
        ]
      });
      if (orderCount > 0) {
        return res.status(400).json({ message: 'Selected toy is already booked for the current delivery date.' });
      }

      if(!customer?.zone?.homeDelivery && !selfPickup){
        return res.status(400).json({ message: 'Home delivery is not available in the area of selected customer. Please select self pickup.' });
      }
      
      if(customer?.zone?.homeDelivery && !selfPickup){
        const currentDate = new Date();
        const deliveryDateUTC = new Date(deliveryDate);
        if(currentDate.toDateString() == deliveryDateUTC.toDateString()){
          return res.status(400).json({ message: 'We do not accept orders for delivery on the same day. Please select a future date for delivery.' });
        }

        const currentTime = moment().utc(true).utcOffset(330).format("HH:mm");
        if(currentTime > "18:00" ){
            const nextDay = moment().utc(true).add(1, 'day').format("YYYY-MM-DD");
            const nextDayDate = new Date(nextDay);
            if(deliveryDateUTC.toDateString() == nextDayDate.toDateString()){
              return res.status(400).json({ message: 'We do not accept orders for delivery on the next day after 6 PM. Please select a future date for delivery.' });
            }
        }
      }

      const rent = toy.cityPricing?.find((city) => city?.city?.toString() === customer?.city?._id?.toString())?.["w" + duration] || 0;
      const deliveryFee = selfPickup ? 0 : customer?.zone?.deliveryFee || 0;
      const orderTotal = rent + deliveryFee;

      const lastOrder = await Order.findOne().sort({ orderId: -1 });
      let orderId = 1;
      if (lastOrder) {
        orderId = lastOrder.orderId + 1;
      }
      const newOrder = new Order({
        orderId: orderId,
        customer: customerId,
        toy: toyId,
        deliveryDate: new Date(deliveryDate),
        duration: duration,
        returnDate: new Date(new Date(deliveryDate).setDate(new Date(deliveryDate).getDate() + (duration * 7))),
        deposit: toy?.deposit || 0,
        rent: rent,
        deliveryFee: deliveryFee,
        orderTotal: orderTotal,
        selfPickup: selfPickup,
        paid: true,
        paymentDetails: { status: "manualPayment" },
      });
      await newOrder.save();
      await Customer.findByIdAndUpdate(customerId, { isNewCustomer: false });
      res.status(200).json({ message: 'Order added successfully', newOrder });

    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  }
module.exports = new orderController();
