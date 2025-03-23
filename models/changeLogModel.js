const mongoose = require('mongoose');

const changeDataSchema = new mongoose.Schema({
    toy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Toy',
        required: true
    },
    rent: {
        type: Number,
        required: true
    },
    deliveryFee: {
        type: Number,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    deliveryDate: {
        type: Date,
        required: true
    },
    returnDate: {
        type: Date,
        required: true
    },
    selfPickup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PickUpPoint',
    },
    discount: {
        type: Number,
        required: true,
        default: 0
    },
});
    
    

const changeLogSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    oldData: {
        type: changeDataSchema,
        required: true
    },
    newData: {
        type: changeDataSchema,
        required: true
    },
    changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
}, { timestamps: true });


const ChangeLog = mongoose.model('ChangeLog', changeLogSchema);

module.exports = ChangeLog;

