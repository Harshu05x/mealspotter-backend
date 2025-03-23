const User = require("../models/userModel");    
const bcrypt = require("bcrypt");

class MessOwnersController {
    async searchMessOwners(req, res) {
        try {
            if (req.user.usertype !== 'admin') {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const mess = await User.find({ usertype: 'mess' }).select('-password').sort({ createdAt: -1 });
            res.status(200).json(mess);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async addMessOwner(req, res) {
        try {
            const { email, password, status } = req.body;

            if(!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }

            const _email = email.toString().toLowerCase().trim();

            const user = await User.findOne({ email: _email });
            if (user) {
                return res.status(400).json({ message: 'User already exists' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({ email: _email, password: hashedPassword, usertype: 'mess', status });
            await newUser.save();
            res.status(200).json(newUser);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateMessOwner(req, res) {
        try {
            const { email, status, _id } = req.body;
            const user = await User.findById(_id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            user.email = email;
            user.status = status;
            await user.save();
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new MessOwnersController();
