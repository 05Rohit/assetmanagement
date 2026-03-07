const express=require("express");
const router=express.Router();
const vendorController=require("../controller/vendorController");

router.post("/createVendor",vendorController.createVendor);
router.delete("/deleteVendor/:vendorId",vendorController.deleteVendor);
router.get("/getVendors",vendorController.getVendors);
router.get("/getVendorById/:vendorId",vendorController.getVendorById);
router.get("/getVendorByProductName/:productType",vendorController.getVendorByProductName);
router.put("/updateVendor/:vendorId",vendorController.updateVendor);
router.post("/validateVendor",vendorController.validateVendor);
module.exports=router;