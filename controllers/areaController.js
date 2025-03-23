const Area = require("../models/areaModel");

class areaController {
  async getAllArea(req, res) {
    const {status}=req.query;
    try {
      let area;
      if(status){
        area=await Area.find({status:status});
      }else{
        area = await Area.find();
      }
      res.json(area);
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async createArea(req, res) {
    const { areaName, zone, status } = req.body;

    // Check if a area with the same areaName already exists
    const existingArea = await Area.findOne({ areaName });

    if (existingArea) {
      return res
        .status(400)
        .json({ error: "Area with the same areaName already exists." });
    }

    const newArea = new Area({
      areaName,
      zone,
      status,
    });

    try {
      const savedArea = await newArea.save();
      res.status(201).json(savedArea);
    } catch (err) {
      res.status(400).json({ error: "Bad request" });
    }
  }

  async updateArea(req,res){
    const { id: _id } = req.params;
    const updates = req.body;
    const options={new:true}
    const area=await Area.findById(_id);
    if(!area){return res.status(404).json({error:"Area not found"})};
    
    try{
      const updatedArea=await Area.findByIdAndUpdate(_id,updates,options);
      res.json(updatedArea);
      }catch(e){
        res.status(400).send("Error updating area");
    }
        
    
  }

  async deleteArea(req,res){
    const { id: _id } = req.params;
    try{
      const area=await Area.findByIdAndRemove(_id)
      if(!area) return res.status(404).json({error:"This area does not exist."})
      res.json(area)
      }catch(e){
        console.log(e)
        res.status(500).json({error:"Internal server error"})
      }
    
  }






}

module.exports = new areaController();
