
const Location = require('../model/locationModel');
const Asset = require('../model/assetModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

// Create Location
exports.createLocation = catchAsync(async (req, res, next) => {
    const location = await Location.create(req.body);
    res.status(201).json(location);
});

// Get all Locations
exports.getAllLocations = catchAsync(async (req, res, next) => {
    const locations = await Location.find().populate('Assets');
    res.status(200).json(locations);
});

// Get a single Location
exports.getLocationById = catchAsync(async (req, res, next) => {
    const location = await Location.findById(req.params.id).populate('Assets');
    if (!location) {
        return next(new AppError('Location not found', 404));
    }
    res.status(200).json(location);
});

// Update a Location
exports.updateLocation = catchAsync(async (req, res, next) => {
    const location = await Location.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!location) {
        return next(new AppError('Location not found', 404));
    }
    res.status(200).json(location);
});

// Assign an Asset to a Location
exports.assignAssetToLocation = catchAsync(async (req, res, next) => {
    const location = await Location.findById(req.params.locationId);
    const asset = await Asset.findById(req.params.assetId);
    if (!location || !asset) {
        return next(new AppError('Location or Asset not found', 404));
    }
    if (!location.Assets.includes(asset._id)) {
        location.Assets.push(asset._id);
        await location.save();
    }
    asset.Location = location._id;
    await asset.save();
    res.status(200).json(location);
});


exports.updateLocation = catchAsync(async (req, res, next) => {
  const { newLocationId, changedBy } = req.body;
  const asset = await Asset.findById(req.params.assetId);

  if (!asset) return next(new AppError('Asset not found', 404));
  if (!isValidObjectId(newLocationId)) {
    return next(new AppError('Invalid location ID', 400));
  }

  const oldLocationId = asset.Location;
  asset.Location = newLocationId;

  // Add an event to the general history
  asset.AssetHistory.push({
    event: 'Location Updated',
    details: { oldLocation: oldLocationId, newLocation: newLocationId },
    changedBy,
  });

  await asset.save();
  res.status(200).json(asset);
});
