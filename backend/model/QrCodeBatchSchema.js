// models/CodeBatch.js
const mongoose = require("mongoose");

const CodeBatchSchema = new mongoose.Schema(
  {
    method: { type: String, enum: ["sequential", "manual"], required: true },
    format: { type: String, enum: ["qr", "barcode"], default: "qr" },

    // Sequential params
    prefix: { type: String, trim: true },
    suffix: { type: String, trim: true },
    startingFrom: { type: Number },
    count: { type: Number },
    padLength: { type: Number }, // optional

    // Manual params
    manualCodes: [{ type: String, trim: true }],

    // Optional context for later filtering
    productTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductType" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: "Site" },

    comments: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    generatedCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CodeBatch", CodeBatchSchema);

