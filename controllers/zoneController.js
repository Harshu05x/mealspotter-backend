const Zone = require("../models/zoneModel");
const Customer = require("../models/customerModel");
const { weekDays } = require("../helpers/Constants");
class zoneController {
  async getAllZone(req, res) {
    const { status } = req.query;
    try {
      let zone;
      let filter;
      if (status) {
        filter={ status: status };
      } else {
        filter={};
      }
      zone = await Zone.find(filter).populate("city");
      res.json(zone);
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async createZone(req, res) {
    const self = this; 
    const { name, city, status, deliveryDays, deliveryFee, pincodes } = req.body;
    // Check if a category with the same name or pincode already exists
    const existingZone = await Zone.findOne({
      $or: [{ name: name }, { pincodes: { $in: pincodes} }]
    })
    if (existingZone) {
      if(existingZone.name === name){
        return res.status(400).json({ msg: "Zone with this name already exists." });
      }
      return res.status(400).json({ msg: "One or more pincodes are already associated with another zone." });
    }

    const filteredPincodes = await self.formatPincodes(pincodes);

    const newZone = new Zone({
      name,
      city,
      status,
      deliveryDays,
      deliveryFee,
      pincodes: filteredPincodes,
    });

    const customers = await Customer.find({
      pincode: { $in: filteredPincodes }
    });

    if(customers.length > 0){
      customers.forEach(async customer => {
        customer.zone = newZone._id;
        customer.city = city;
        await customer.save();
      });
    }

    try {
      const savedZone = await newZone.save();
      res.status(201).json(savedZone);
    } catch (err) {
      res.status(400).json({ error: "Bad request" });
    }
  }

  async updateZone(req, res) {
    const self = this; 
    const { id: _id } = req.params;
    const updates = req.body;
    const options = { new: true };
    const zone = await Zone.findById(_id).populate("city");
    if (!zone)
      return res.status(404).json({ msg: "The zone does not exist." });
    
    if(updates.pincodes){
      updates.pincodes = await self.formatPincodes(updates.pincodes);
    }

    if(zone?.city?.weeklyOff && updates?.deliveryDays && updates?.deliveryDays.includes(zone?.city?.weeklyOff)){
      return res.status(400).json({msg: `${zone?.city?.name} has weekly off on ${weekDays[zone?.city?.weeklyOff]}.`});
    }

    const newPincodes = updates.pincodes.filter(pin => !zone?.pincodes?.includes(pin));
    
    const customers = await Customer.find({
      pincode: { $in: newPincodes }
    });
    
    if(customers.length > 0){
      customers.forEach(async customer => {
        customer.zone = _id;
        customer.city = zone.city;
        await customer.save();
      });
    }

    try {
      const updatedZone = await Zone.findByIdAndUpdate(_id, updates, options);
      res.json(updatedZone);
    } catch (e) {
      res.status(400).send("Error updating product");
    }
  }


  async deleteZone(req,res){
    const { id: _id } = req.params;
    try{
      const zone=await Zone.findByIdAndRemove(_id)
      if(!zone) return res.status(404).json({error:"This zone does not exist."})
      res.json(zone)
      }catch(e){
        console.log(e)
        res.status(500).json({error:"Internal server error"})
      }
  }

  async canRemovePincode(req,res){
    try {
      const {pincode} = await req.body;
      // find zone whose pincodes array contains the given pincode
      const zone = await Zone.findOne({
        pincodes: { $in: [pincode] }
      })
      // find customers who are in this zone
      const customers = await Customer.countDocuments({
        zone: zone?._id,
        pincode: pincode
      });

      if(customers > 0){
        return res.json({canRemove: false, message: `This pincode is associated with ${customers} customers. Can't Remove.`});
      }
      return res.json({canRemove: true});

    } catch (error) {
      console.log(error);
      res.status(500).json({error: "Internal server error"});
    }
  }   

  async canAddPincode(req,res){
    try {
      const {pincode} = await req.body;
      const zone = await Zone.findOne({
        pincodes: { $in: [pincode] }
      })
      if(zone){
        return res.json({canAdd: false, message: `This pincode is already associated with "${zone.name}".` });
      }
      return res.json({canAdd: true});
    } catch (error) {
      console.log(error);
      res.status(500).json({error: "Internal server error"});
    }
  }

  async removePincode(req,res){
    try {
      const {pincode} = await req.body;
      const zone = await Zone.findOne({
        pincodes: { $in: [pincode] }
      })
      if(!zone){
        return res.status(404).json({error: "Zone not found"});
      }

      const customers = await Customer.countDocuments({
        zone: zone._id,
        pincode: pincode
      });

      if(customers > 0){
        return res.status(400).json({error: `This pincode is associated with ${customers} customers. Can't Remove.`});
      }

      zone.pincodes = zone.pincodes.filter(p => p !== pincode);
      await zone.save();
      res.status(200).json({message: "Pincode removed successfully"});
    } catch (error) {
      console.log(error);
      res.status(500).json({error: "Internal server error"});
    }
  }

  async shiftPincode(req,res){
    try {
      const {fromZoneId, toZoneId, pincode} = await req.body;
      const fromZone = await Zone.findById(fromZoneId);
      const toZone = await Zone.findById(toZoneId);
      if(!fromZone || !toZone){
        return res.status(404).json({error: "Zone not found"});
      }
      
      fromZone.pincodes = fromZone.pincodes.filter(p => p !== pincode);
      toZone.pincodes.push(pincode);
      
      await fromZone.save();
      await toZone.save();

      await Customer.updateMany({
        pincode: pincode
      },{
        zone: toZoneId,
        city: toZone.city
      });
      res.status(200).json({message: "Pincode shifted successfully"});
    } catch (error) {
      console.log(error);
      res.status(500).json({error: "Internal server error"});
    }
  }

  async formatPincodes (pincodes) {
    let pinCodesArray = pincodes && pincodes.split(',') || []
    pinCodesArray = pinCodesArray.map(pincode => {
      if(pincode){
        pincode = pincode.trim()
        if(!isNaN(pincode) && /^\d{6}$/.test(pincode)){
          return pincode;
        }
      }
    })
    pinCodesArray = pinCodesArray.filter(pin => pin !== undefined)
    return Array.from(new Set(pinCodesArray)).sort(); // Remove duplicates using Set and convert back to array
  }

}

module.exports = new zoneController();
