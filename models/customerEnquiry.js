const mongoose = require('mongoose');

const customerEnquirySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
},
{timestamps: true});

const CustomerEnquiry = mongoose.model("CustomerEnquiry", customerEnquirySchema);
module.exports = CustomerEnquiry;
