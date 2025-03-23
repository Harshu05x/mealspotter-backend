const Mess = require("../models/messModel");

class MessController {
    async getMess(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const mess = await Mess.find().skip((page - 1) * limit).limit(limit);
            res.status(200).json(mess);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getMessById(req, res) {
        try {
            const { id } = req.params;
            const mess = await Mess.findById(id);
            if (!mess) {
                return res.status(404).json({ message: "Mess not found" });
            }
            res.status(200).json(mess);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async createMess(req, res) {
        const mess = await Mess.create(req.body);
        res.status(201).json(mess);
    }
    
    async updateMess(req, res) {
        const mess = await Mess.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(mess);
    }
    
    async deleteMess(req, res) {
        await Mess.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Mess deleted successfully" });
    }
}

module.exports = new MessController();
