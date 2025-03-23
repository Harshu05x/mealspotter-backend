// controllers/rentalController.js
const moment = require("moment");
const Order = require('../models/orderModel');
const Customer = require('../models/customerModel');

class dashboardController {
    //for Dashnoard analytics counts
  async getAllCounts(req, res) {
    try {
       const currentDate = moment().utc(true).toDate();
       const upComingStartDate = moment(currentDate).utc().add(1, 'days').startOf('day').toDate();
       const upComingEndDate = moment(currentDate).utc().add(1, 'days').endOf('day').toDate();
       const dueStartDate = moment(currentDate).utc().startOf('day').toDate();
       const dueEndDate = moment(currentDate).utc().add(2, 'days').endOf('day').toDate();

        const dueReturnsCount = await Order.countDocuments({
            returnDate: { $lte: dueEndDate, $gte: dueStartDate},
            status: { $ne: 'cancelled'},
            paid: true
        });
        const upcomingOrderCount = await Order.countDocuments({
            deliveryDate: { $gte: upComingStartDate, $lte: upComingEndDate },
            status: { $ne: 'cancelled'},
            paid: true
        });
        
        const customersWhoOrdered = await Customer.countDocuments({
            isNewCustomer: false
        });

        const newRegisteredCustomers = await Customer.countDocuments({
            isNewCustomer: true
        });

        // const firstDay = new Date(_currentDate.getFullYear(), _currentDate.getMonth(), 2);
        // const lastDay = new Date(_currentDate.getFullYear(), _currentDate.getMonth() + 1, 0);

        const firstDay = moment(currentDate).startOf('month').toDate();
        const lastDay = moment(currentDate).endOf('month').toDate();

        const monthlyIncome = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: firstDay, $lte: lastDay },
                    paid: true
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: { $add: ['$rent', '$deliveryFee'] } }
                }
            }
        ]);

        const realizedIncome = await Order.aggregate([
            {
                $match: {
                    deliveryDate: { $gte: firstDay, $lte: lastDay },
                    paid: true
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: { $add: ['$rent', '$deliveryFee'] } }
                }
            }
        ]);

        res.json({ 
            dueReturnsCount, 
            upcomingOrderCount, 
            newRegisteredCustomers, 
            customersWhoOrdered,
            monthlyIncome: monthlyIncome[0] ? monthlyIncome[0].total : 0,
            realizedIncome: realizedIncome[0] ? realizedIncome[0].total : 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  //for dashboard toy analytics (top rented toy, mostly rently products)
  async getTopRentedToys(req, res) {

    try {
        
        const topCount = await Order.aggregate([
            {
                $lookup: {
                    from: 'toys',
                    localField: 'toy',
                    foreignField: '_id',
                    as: 'toy'
                }
            },
            {
                $match: {
                    paid: true
                }
            },
            {
                $group: {
                    _id: '$toy',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 5
            },
        ]);

        const totalOrders = await Order.countDocuments();
        return res.json({ topCount, mostRented: topCount[0], totalOrders });
    } catch (error) {
        console.error(error);
        throw new Error('Error fetching rented toys stats');
    }
  }

  
}

module.exports = new dashboardController();

