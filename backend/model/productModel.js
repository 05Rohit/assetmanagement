const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productType: { type: String, required: true },
    productName: { type: String, required: true,index: true },
    manufacturer: { type: String },
    partNumber: { type: String },
    productVisibility: { type: Boolean, default: false },
    description: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("product", productSchema);
