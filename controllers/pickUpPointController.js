const PickUpPoint = require("../models/pickUpPointModel");

class pickUpPointController {
    async getAllPickUpPoint(req, res) {
        const { status } = req.query;
        try {
            let pickUpPoints;
            let filter;
            if (status) {
                filter={ status: status };
            } else {
                filter={};
            }
            pickUpPoints = await PickUpPoint.find(filter).populate("city").exec();
            return res.status(200).json(pickUpPoints);
        } catch (err) {
            res.status(500).json({ msg: "Server error" });
        }
    }

    async createPickUpPoint(req, res) {
        const self = this; 
        const { storeName, city, status } = req.body;

        // Check if a category with the same name already exists
        const existingPickUpPoint = await PickUpPoint.findOne({ storeName });

        if (existingPickUpPoint) {
            return res
                .status(400)
                .json({ msg: "PickUpPoint with the same name already exists." });
        }

        try {
            const newPickUpPoint = await PickUpPoint.create({
                storeName,
                city,
                status,
            });
            
            const savedPickUpPoint = await PickUpPoint.findById(newPickUpPoint._id).populate("city").exec();
            return res.status(200).json(savedPickUpPoint);
        } catch (err) {
            console.log(err);
            res.status(400).json({ msg: "Bad request" });
        }
    }

    async updatePickUpPoint(req, res) {
        const self = this; 
        const { id: _id } = req.params;
        const updates = req.body;
        const options = { new: true };
        const pickUpPoint = await PickUpPoint.findById(_id);
        if (!pickUpPoint)
            return res.status(404).json({ error: "The pickUpPoint does not exist." });
        
        try{
            const updatedPickUpPoint = await PickUpPoint.findByIdAndUpdate(_id, updates, options);
            res.json(updatedPickUpPoint);
        }
        catch(err){
            res.status(400).json({ error: "Bad request" });
        }
    }
    
    async deletePickUpPoint(req, res) {
        const { id: _id } = req.params;
        try{
            const deletedPickUpPoint = await PickUpPoint.findByIdAndDelete(_id);
            if (!deletedPickUpPoint)
                return res.status(404).json({ error: "The pickUpPoint does not exist." });
            res.json(deletedPickUpPoint);
        }
        catch(err){
            res.status(400).json({ error: "Bad request" });
        }
    }
}

module.exports = new pickUpPointController();