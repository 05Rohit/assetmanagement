
 const express = require("express");
const assetController = require("../controller/assetController.js");
const verifyToken = require("../middleware/verifyToken.js");
const router = express.Router();


router.post("/create_asset",assetController.createAsset);
router.get("/get_all",assetController.getAllAsset);
router.get("/get_all/:type",assetController.getAssetByType);
router.get("/get_one/:id",assetController.getByAssetId);
router.patch("/asset_update/:assetID",assetController.updateAsset);
router.delete("/asset_delete/:assetID",assetController.deleteAsset);
router.patch("/checkout/:assetId",assetController.checkoutAsset);
router.patch("/checkin/:assetId",assetController.checkinAsset);

module.exports=router;
