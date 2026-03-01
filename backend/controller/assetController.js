
const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;
const Asset = require("../model/assetModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Create Asset
exports.createAsset = catchAsync(async (req, res, next) => {
  const asset = new Asset(req.body);
  // console.log(req.body);
  await asset.save();
  res.status(201).json(asset);
});

// exports.createAsset = catchAsync(async (req, res, next) => {
//   const {
//     user,
//     associatedTo,
//     department,
//     site,
//     ...rest
//   } = req.body;

//   const asset = new Asset({
//     ...rest,
//     assignmentHistory: [
//       {
//         user,
//         associatedTo,
//         department,
//         site,
//         assignedFrom: new Date(), // default already set, but explicit is fine
//         // assignedBy: req.user._id, // assuming you're using auth middleware
//       },
//     ],
//   });

//   console.log(req.body);
//   await asset.save();
//   res.status(201).json(asset);
// })


// Read all Assets
exports.getAllAsset = catchAsync(async (req, res, next) => {
  const assets = await Asset.find();
  res.status(200).json(assets);
});
// Read Assets Basis of Asset-Type
exports.getAssetByType = catchAsync(async (req, res, next) => {
  const { type } = req.params;
  const assets = await Asset.find({
    type,
  });
  res.status(200).json(assets);
});

// Read single Asset by ID
exports.getByAssetId = catchAsync(async (req, res, next) => {
  const asset = await Asset.findOne({ assetID: req.params.id }).populate([
    // { path: "Location" },
    // { path: "Vendor" },
    // { path: "AssignedTo" },
    // { path: "AssignmentHistory.assignedTo" },
    // { path: "AssignmentHistory.assignedBy" },
    // { path: "AssetHistory.changedBy" },
    // { path: "MaintenanceHistory.performedBy" },
  ]);

  if (!asset) {
    return next(new AppError("Asset not found with the provided ID", 404));
  }

  res.status(200).json(asset);
});

// Update Asset
exports.updateAsset = catchAsync(async (req, res, next) => {
  const assetID = req.params.assetID;

  // Only update fields that are present in req.body
  const updatedFields = req.body;

  const asset = await Asset.findOneAndUpdate(
    { assetID },
    { $set: updatedFields },
    { new: true, runValidators: true }
  );

  if (!asset) {
    return next(new AppError("Asset not found with the provided ID", 404));
  }

  res.status(200).json(asset);
});

// Delete Asset
exports.deleteAsset = catchAsync(async (req, res, next) => {
  const { assetID } = req.params;
  const asset = await Asset.findOneAndDelete({ assetID });

  if (!asset) {
    return next(new AppError("Asset not found with the provided ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

//if asset assign to someone
exports.checkoutAsset = catchAsync(async (req, res, next) => {
  //both are ID check MongoSchema
  const { assignedTo, assignedBy } = req.body;
  const asset = await Asset.findById(req.params.assetId);

  if (!asset) return next(new AppError("Asset not found", 404));
  if (!isValidObjectId(assignedTo) || !isValidObjectId(assignedBy)) {
    return next(new AppError("Invalid user ID format", 400));
  }

  asset.Status = "In Use";
  asset.AssignedTo = assignedTo;

  asset.AssignmentHistory.push({
    assignedTo,
    assignedBy,
    assignedFrom: new Date(),
  });

  asset.AssetHistory.push({
    event: "Asset Checked Out",
    details: { assignedTo, assignedBy },
    changedBy: assignedBy,
  });

  await asset.save();
  res.status(200).json(asset);
});

//if asset assign to giving back to IT
exports.checkinAsset = catchAsync(async (req, res, next) => {
  const { assignedBy } = req.body;
  const asset = await Asset.findById(req.params.assetId);

  if (!asset) return next(new AppError("Asset not found", 404));
  if (!asset.AssignedTo)
    return next(new AppError("Asset is not currently checked out", 400));

  asset.Status = "Available";
  asset.AssignedTo = null;

  const lastAssignment = asset.AssignmentHistory.pop();
  if (lastAssignment) {
    lastAssignment.assignedUntil = new Date();
    asset.AssignmentHistory.push(lastAssignment);
  }

  asset.AssetHistory.push({
    event: "Asset Checked In",
    details: { assignedBy },
    changedBy: assignedBy,
  });

  await asset.save();
  res.status(200).json(asset);
});