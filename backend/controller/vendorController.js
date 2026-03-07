const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const vendorSchema = require("../model/vendorModel");
const { default: mongoose } = require("mongoose");

exports.createVendor = catchAsync(async (req, res, next) => {
  const {
    productType,
    vendorName,
    address,
    city,
    zipCode,
    state,
    country,
    phoneNo,
    fax,
    email,
    firstName,
    description,
  } = req.body;

  const missingFields = [];
  if (!vendorName) missingFields.push("Vendor Name");
  if (!productType) missingFields.push("Product Type");
  if (missingFields.length > 0) {
    return next(
      new AppError(
        `${missingFields.join(", ")} ${missingFields.length > 1 ? "are" : "is"} required`,
        400,
      ),
    );
  }

  // Create new asset using all fields from req.body
  const vendor = new vendorSchema({
    productType,
    vendorName,
    address,
    city,
    zipCode,
    state,
    country,
    phoneNo,
    fax,
    email,
    firstName,
    description,
  });

  // Save to database
  await vendor.save();

  // Send success response
  res.status(201).json({
    status: "success",
    message: "Vendor created successfully",
    data: vendor,
  });
});

exports.deleteVendor = catchAsync(async (req, res, next) => {
  const { vendorId } = req.params;
  // Validate ID format
  if (!vendorId) {
    return next(new AppError("Provide vendor Id", 400));
  }
  if (!mongoose.Types.ObjectId.isValid(vendorId)) {
    return next(new AppError("Invalid Object Type", 400));
  }
  // Delete in one query
  const vendor = await vendorSchema.findByIdAndDelete(vendorId);
  if (!vendor) {
    return next(new AppError("No vendor found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    message: "Vendor deleted successfully",
    data: null,
  });
});

exports.getVendors = catchAsync(async (req, res, next) => {
  const vendors = await vendorSchema.find().select("vendorName");
  res.status(200).json({
    status: "success",
    results: vendors.length,
    data: vendors,
  });
});

exports.getVendorById = catchAsync(async (req, res, next) => {
  const { vendorId } = req.params;

  if (!vendorId) {
    return next(new AppError("Provide vendor Id", 400));
  }
  if (!mongoose.Types.ObjectId.isValid(vendorId)) {
    return next(new AppError("Invalid Object Type", 400));
  }

  const vendor = await vendorSchema.findById(vendorId);
  if (!vendor) {
    return next(new AppError("No vendor found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: vendor,
  });
});
exports.getVendorByProductName = catchAsync(async (req, res, next) => {
  const { productType } = req.params;

  

  if (!productType) {
    return next(new AppError("Provide product type", 400));
  }


  const vendor = await vendorSchema.find({ productType }).select("vendorName") ;
  if (!vendor) {
    return next(new AppError("No vendor found with that product type", 404));
  }
  res.status(200).json({
    status: "success",
    data: vendor,
  });
});

exports.updateVendor = catchAsync(async (req, res, next) => {
  const { vendorId } = req.params;
  const updateData = req.body;

  if (!vendorId) {
    return next(new AppError("Provide vendor Id", 400));
  }
  if (!mongoose.Types.ObjectId.isValid(vendorId)) {
    return next(new AppError("Invalid Object Type", 400));
  }

  const vendor = await vendorSchema.findByIdAndUpdate(vendorId, updateData, {
    new: true,
    runValidators: true,
  });
  if (!vendor) {
    return next(new AppError("No vendor found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    message: "Vendor updated successfully",
    data: vendor,
  });
});

exports.validateVendor = catchAsync(async (req, res, next) => {
  const { vendorName } = req.body;

  if (!vendorName) {
    return next(new AppError("Provide vendor name", 400));
  }
  const vendor = await vendorSchema.findOne({ vendorName });
  if (vendor) {
    return next(new AppError("Vendor name already exists", 400));
  }
  res.status(200).json({
    status: "success",
    message: "Vendor name is available",
  });
});
