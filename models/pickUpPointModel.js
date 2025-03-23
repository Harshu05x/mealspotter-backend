const mongoose = require("mongoose");

const pickUpPointSchema = new mongoose.Schema({
    storeName: {
        type: String,
        required: true,
    },
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "City",
    },
    status: {
        type: Boolean,
        default: true,
    },
});

const PickUpPoint = mongoose.model("PickUpPoint", pickUpPointSchema);

module.exports = PickUpPoint;