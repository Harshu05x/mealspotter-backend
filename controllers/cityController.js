const City = require("../models/cityModel");
const Zone = require("../models/zoneModel");

class CityController {
  async getAllCity(req, res) {
    const { status } = req.query;
    try {
      let data;
      if (status) {
        data = await City.find({ status: status });
      } else {
        data = await City.find();
      }
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async createCity(req, res) {
    const { name, status, weeklyOff } = req.body;
    
    const existingCity = await City.findOne({ name });

    if (existingCity) {
      return res
        .status(400)
        .json({ msg: "City with the same name already exists." });
    }

    const newCity = new City({ name, status, weeklyOff: parseInt(weeklyOff) || -1 });

    try {
      const savedCity = await newCity.save();
      res.status(201).json(savedCity);
    } catch (err) {
      res.status(400).json({ msg: "Bad request" });
    }
  }

  async updateCity(req, res) {
    const { id: _id } = req.params;

    try {
      const { name, status, weeklyOff } = req.body;
 
      const city = await City.findById(_id);
      if (!city) {
        return res.status(404).json({ msg: "City not found" });
      }

      const existingCity = await City.findOne({ 
        name,
        _id: { $ne: _id }
      });
      if (existingCity) {
        return res
          .status(400)
          .json({ msg: "City with the same name already exists." });
      }

      if (city.weeklyOff !== parseInt(weeklyOff)) {
        const zones = await Zone.find({ city: _id });
        if (zones.length > 0) {
          zones.forEach(async zone => {
            zone.deliveryDays = zone.deliveryDays.filter(day => day !== parseInt(weeklyOff));
            await zone.save();
          });
        }
      }
      
      city.name = name;
      city.status = status;
      city.weeklyOff = parseInt(weeklyOff) || -1;

      const updatedCity = await city.save();
      res.json(updatedCity);

    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Internal server error" });
    }
    
  }

  async deleteCity(req, res) {
    const { id: _id } = req.params;
    try {
      const city = await City.findByIdAndRemove(_id);
      if (!city)
        return res.status(404).json({ error: "This city does not exist." });
      res.json(city);
    } catch (e) {
      console.log(e);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = new CityController();
