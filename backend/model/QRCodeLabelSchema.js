const mongoose = require("mongoose");

const CodeLabelSchema = new mongoose.Schema(
  {
    // The string value that gets encoded in the QR/Barcode
    code: { type: String, required: true, trim: true, unique: true, index: true },

    // "qr" or "barcode" (you can add other types)
    format: { type: String, enum: ["qr", "barcode"], default: "qr" },

    // Lifecycle of the code in the pool
    // available -> reserved -> assigned
    // assigned -> (optionally) revoked -> available (if you support unassign)
    state: {
      type: String,
      enum: ["available", "reserved", "assigned", "revoked"],
      default: "available",
      index: true
    },

    // If assigned, link the asset
    mappedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", index: true },

    // Optional batch id (useful for audits & grouping by generation events)
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: "CodeBatch", index: true },

    // Context (optional, to filter later)
    context: {
      productTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductType" },
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      siteId: { type: mongoose.Schema.Types.ObjectId, ref: "Site" }
    },

    comments: { type: String, trim: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CodeLabel", CodeLabelSchema);