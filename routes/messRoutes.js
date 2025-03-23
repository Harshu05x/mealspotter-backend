const express = require("express");
const router = express.Router();
const messController = require("../controllers/messController");

router.get("/", messController.getMess);
router.get("/:id", messController.getMessById);

// router.post("/create", messController.createMess);
// router.put("/update/:id", messController.updateMess);
// router.delete("/delete/:id", messController.deleteMess);

module.exports = router;

