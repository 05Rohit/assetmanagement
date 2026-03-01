const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema(
  {
    Name: { type: String, required: true, trim: true },
    ParentLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      default: null,
    },
    Address: { type: String, trim: true },
    Description: { type: String, trim: true },
    Assets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Asset" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Location", LocationSchema);
