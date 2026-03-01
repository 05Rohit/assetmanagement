const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const productSchema = require("../model/productModel");
const { default: mongoose } = require("mongoose");

exports.createProduct = catchAsync(async (req, res, next) => {
  const { productType, productName, manufacturer, partNumber,productVisibility, description } =
    req.body;
console.log("productType", req.body);
  const missingFields = [];

  if (!productType) missingFields.push("Product Type");
  if (!productName) missingFields.push("Product Name");


  if (missingFields.length > 0) {
    return next(
      new AppError(
        `${missingFields.join(", ")} ${
          missingFields.length > 1 ? "are" : "is"
        } required`,
        400
      )
    );
  }

  // Create new asset using all fields from req.body
  const product = new productSchema({
    productType,
    productName,
    manufacturer,
    partNumber,
    productVisibility,
    description,
  });

  // Save to database
  await product.save();

  // Send success response
  res.status(201).json({
    status: "success",
    message: "Product created successfully",
    data: product,
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  // Validate ID format
  if (!productId) {
    return next(new AppError("Provide product Id", 400));
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return next(new AppError("Invalid Object Type", 400));
  }

  // Delete in one query
  const deletedProduct = await productSchema.findByIdAndDelete(productId);

  if (!deletedProduct) {
    return next(new AppError("Product not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Product deleted successfully",
    data: deletedProduct, // optional: return deleted product details
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const { productType } = req.params;

  if (!productType) {
    return next(new AppError("Provide product name", 400));
  }

  const result = await productSchema.find({ productType });

  // If no product found
  if (!result || result.length === 0) {
    return next(new AppError("Product not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Product list",
    data: result,
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const updateData = req.body;

  if (!productId) {
    return next(new AppError("Select Product ", 400));
  }

  const updatedProduct = await productSchema.findByIdAndUpdate(
    productId,
    updateData,
    { new: true, runValidators: true } // return updated doc & validate schema
  );

  if (!updatedProduct) {
    return next(new AppError("Product not found", 404));
  }

  // If no product found

  res.status(200).json({
    status: "success",
    message: "Product updated successfully",
    data: updatedProduct,
  });
});