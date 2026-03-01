const mongoose = require("mongoose");

// Sub-schemas
const AssignmentHistorySchema = new mongoose.Schema({
  assignedFrom: { type: Date, default: Date.now },
  assignedUntil: { type: Date },
  associatedTo: { type: String },
  department: { type: String },
  user: { type: String },
  site: { type: String },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const MaintenanceHistorySchema = new mongoose.Schema({
  maintenanceDate: { type: Date, required: true },
  serviceDetails: { type: String, required: true },
  cost: { type: Number },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

// Main Asset Schema
const AssetSchema = new mongoose.Schema(
  {
    type: { type: String, trim: true },
    assetID: { type: String, unique: true, trim: true },
    assetName: { type: String, required: true, trim: true },
    productName: { type: String, required: true, trim: true },
    platform: { type: String, trim: true },
    buildVersion: { type: String, trim: true },
    osName: { type: String, trim: true },
    osVersion: { type: String, trim: true },
    serialNumber: { type: String, required: true, unique: true, trim: true },
    assetTag: { type: String, trim: true },
    vendor: { type: String, trim: true },
    barcodeQR: { type: String, trim: true },
    purchaseCost: { type: Number, min: 0 },
    acquisitionDate: { type: Date },
    expiryDate: { type: Date },
    warrantyExpiry: { type: Date },
    location: { type: String, trim: true },

    // Monitor details
    monitorType: { type: String, trim: true },
    monitorManufacturer: { type: String, trim: true },
    monitorSerialNumber: { type: String, trim: true },
    monitorMaxResolution: { type: String, trim: true },

    // Hard disk details
    hardDiskModel: { type: String, trim: true },
    hardDiskSerialNumber: { type: String, trim: true },
    hardDiskManufacturer: { type: String, trim: true },
    hardDiskCapacity: { type: String, trim: true },

    // Keyboard details
    keyboardManufacturer: { type: String, trim: true },
    keyboardSerialNumber: { type: String, trim: true },

    // Mouse details
    mouseManufacturer: { type: String, trim: true },
    mouseSerialNumber: { type: String, trim: true },

    // Status and relationships
    assetCurrently: {
      type: String,
      enum: ["Available", "In Use", "Under Maintenance", "Retired", "In Store"],
      default: "Available",
    },

    assignmentHistory: [AssignmentHistorySchema],
    maintenanceHistory: [MaintenanceHistorySchema],

    assetHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        event: { type: String, required: true },
        details: { type: mongoose.Schema.Types.Mixed },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true },
);
AssetSchema.pre("save", async function () {
  if (!this.assetID) {
    // Get the product name (assetName) and normalize it
    const prefix = this.assetName
      ? this.assetName.toUpperCase().replace(/\s+/g, "")
      : "ASSET";

    // Count existing assets with same prefix
    const count = await mongoose
      .model("Asset")
      .countDocuments({ assetName: this.assetName });

    // Generate assetID like LAPTOP-001, LAPTOP-002
    this.assetID = `${prefix}-${String(count + 1).padStart(3, "0")}`;
  }

});

module.exports = mongoose.model("Asset", AssetSchema);
