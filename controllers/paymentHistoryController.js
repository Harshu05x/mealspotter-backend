const Payment = require("../models/paymentModel");
require("dotenv").config();

class paymentHistoryController {

      // async getPaymentHistory(req,res){
      //   try {
      //     const page = req.params.page || 1;
      //     const limit = req.params.limit || 10;
      //     const skip = (page - 1) * limit;
      //     const startDate = await req.body.startDate || new Date(new Date().setDate(new Date().getDate() - 7)) 
      //     const endDate = await req.body.endDate || new Date();
      //     const searchText = req.query.query || "";
      //     const searchTerms = searchText.split(' ').map(term => new RegExp(term, 'i'));
      //     console.log(searchText);
   
      //     const start = startDate;
      //     const end = new Date(endDate);
      //     end.setDate(end.getDate() + 1);

      //     let filterObj = {
      //       createdAt: { $gte: start, $lte: end },
      //     };
      //     if(searchText) {
      //       filterObj = {
      //         ...filterObj,
      //         $and: searchTerms.map(term => ({
      //           $or: [
      //             { 'customer.fname': term },
      //             { 'customer.lname': term },
      //             { 'customer.email': term },
      //           ]
      //         }))
      //       }
      //     }

      //     let aggregateObj = [
      //       { $match: filterObj },
      //     ];

      //     const payments = await Payment.aggregate([
      //       ...aggregateObj,
      //       // { $sort: { createdAt: -1 } },
      //       // { $skip: skip },
      //       // { $limit: limit },
      //     ]).exec();
      //     console.log(payments)

      //     const totalRecordsCount = await Payment.aggregate([
      //       ...aggregateObj,
      //       { $count: 'total' }
      //     ]);

      //     const totalRecords = totalRecordsCount.length ? totalRecordsCount[0].total : 0;

      //     res.json({payments ,totalRecords});
      //   } catch (error) {
      //     console.error(error);
      //     res.status(500).json({ message: 'Internal Server Error' });
      //   }
      // }

      async getPaymentHistory(req, res) {
        try {
          const page = parseInt(req.params.page) || 1;
          const limit = parseInt(req.params.limit) || 10;
          const skip = (page - 1) * limit;
          const startDate = req.body.startDate ? new Date(req.body.startDate) : new Date(new Date().setDate(new Date().getDate() - 7));
          const endDate = req.body.endDate ? new Date(req.body.endDate) : new Date();
          const searchText = req.query.query || "";
          const searchTerms = searchText.split(' ').map(term => new RegExp(term, 'i'));
          console.log(searchText);
      
          const start = startDate;
          const end = new Date(endDate);
          end.setDate(end.getDate() + 1);
      
          let filterObj = {
            createdAt: { $gte: start, $lte: end },
          };
          if (searchText) {
            filterObj = {
              ...filterObj,
              $and: searchTerms.map(term => {
                const numericTerm = Number(term.source);
                return {
                  $or: [
                    { 'customer.fname': term },
                    { 'customer.lname': term },
                    { 'customer.email': term },
                    { 'customer.mobile': term },
                    { 'razorpayPaymentId': term },
                    { 'razorpayOrderId': term },
                    { 'orders.orderId': isNaN(numericTerm) ? null : numericTerm }
                  ]
                };
              })
            };
          }
      
          let aggregateObj = [
            { $lookup: { from: 'orders', localField: 'orders', foreignField: '_id', as: 'orders' } },
            { $lookup: { from: 'customers', localField: 'customer', foreignField: '_id', as: 'customer' } },
            { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
            { $match: filterObj },
            { $project: {
              'razorpayPaymentId': 1,
              "razorpayOrderId": 1,
              'orders.orderId': 1,
              'customer': 1,
              'createdAt': 1,
              'amount': 1,
              'status': 1,
              'receipt': 1,
              'currency': 1,
            }}
          ];
      
          const payments = await Payment.aggregate([
            ...aggregateObj,
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
          ]).exec();
      
          const totalRecordsCount = await Payment.aggregate([
            ...aggregateObj,
            { $count: 'total' }
          ]);
      
          const totalRecords = totalRecordsCount.length ? totalRecordsCount[0].total : 0;
      
          res.json({ payments, totalRecords });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Internal Server Error' });
        }
      }
    
}

module.exports = new paymentHistoryController();
