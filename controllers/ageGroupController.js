// controllers/ageGroupController.js
const AgeGroup = require("../models/ageGroupModel");
const Toy = require("../models/toyModel");

class AgeGroupController {
  async getAllAgeGroups(req, res) {
    const { status } = req.query;
    try {
      let ageGroups;
      if (status) {
        ageGroups = await AgeGroup.find({ status: status });
      } else {
        ageGroups = await AgeGroup.find();
      }
      res.json(ageGroups);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  async getAgeGroupById(req, res) {
    const ageGroupId = req.params.id;
    try {
      const ageGroup = await AgeGroup.findById(ageGroupId);
      if (!ageGroup) {
        return res.status(404).json({ error: "Age group not found" });
      }
      res.json(ageGroup);
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async createAgeGroup(req, res) {
    const { fromAge, toAge, status } = req.body;

    // Check if an age group with the same range already exists
    const existingAgeGroup = await AgeGroup.findOne({ fromAge, toAge });

    if (existingAgeGroup) {
      return res.status(400).json({ error: 'Age group with the same range already exists.' });
    }

    const newAgeGroup = new AgeGroup({ fromAge, toAge, status });

    try {
      const savedAgeGroup = await newAgeGroup.save();
      res.status(201).json(savedAgeGroup);
    } catch (err) {
      res.status(400).json({ error: 'Bad request' });
    }
  }

  async updateAgeGroup(req, res) {
    const ageGroupId = req.params.id;
    const { fromAge, toAge, status } = req.body;

    try {
      // Check if an age group with the same range already exists
      const existingAgeGroup = await AgeGroup.findOne({ fromAge, toAge });

      if (existingAgeGroup && existingAgeGroup._id.toString() !== ageGroupId) {
        return res
          .status(400)
          .json({ error: "Age group with the same range already exists." });
      }

      const updatedAgeGroup = await AgeGroup.findByIdAndUpdate(ageGroupId, { fromAge, toAge, status }, { new: true });
      if (!updatedAgeGroup) {
        return res.status(404).json({ error: "Age group not found" });
      }
      res.json(updatedAgeGroup);
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async deleteAgeGroup(req, res) {
    const ageGroupId = req.params.id;

    // Check if the age group is used in toys
    const isAgeGroupUsedInToys = await Toy.exists({ ageGroup: ageGroupId });

    if (isAgeGroupUsedInToys) {
      return res
        .status(400)
        .json({ error: "Age group is used in toys and cannot be deleted." });
    } else {
      try {
        const deletedAgeGroup = await AgeGroup.findByIdAndRemove(ageGroupId);
        if (!deletedAgeGroup) {
          return res.status(404).json({ error: "Age group not found" });
        }
        res.json(deletedAgeGroup);
      } catch (err) {
        res.status(500).json({ error: "Server error" });
      }
    }
  }
}

module.exports = new AgeGroupController();
