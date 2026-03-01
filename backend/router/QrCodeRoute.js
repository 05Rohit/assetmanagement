
const express=require("express");
const verifyToken = require("../middleware/verifyToken");
const router=express.Router();
const QRCodeGeneratorController =require("../controller/qrCodeGeneratorController")



router.post("/batches", QRCodeGeneratorController.createBatch);          // Phase 1: store codes
router.get("/available", QRCodeGeneratorController.listAvailable);       // list codes to pick from
router.post("/reserve", QRCodeGeneratorController.reserveCodes);         // optional
// router.post("/assign", QRCodeGeneratorController.assignCodes);           // Phase 2: assign to assets
// router.post("/unassign", QRCodeGeneratorController.unassignCode);        // optional

module.exports = router;