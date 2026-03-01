

const express = require('express');
const router = express.Router();
const locationController = require("../controller/locationContoller.js" );

router.post('/', locationController.createLocation);
router.get('/', locationController.getAllLocations);
router.get('/:id', locationController.getLocationById);
router.put('/:assetId', locationController.updateLocation);
router.post('/:locationId/assign-asset/:assetId', locationController.assignAssetToLocation);

module.exports = router;