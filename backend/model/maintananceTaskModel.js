const mongoose = require("mongoose");

const MaintenanceTaskSchema = new mongoose.Schema(
  {
    TaskID: { type: String, required: true, unique: true, trim: true },
    Title: { type: String, required: true, trim: true },
    Description: { type: String, trim: true },
    Priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    Status: {
      type: String,
      enum: ["Open", "In Progress", "Completed", "Canceled"],
      default: "Open",
    },
    Location: { type: mongoose.Schema.Types.ObjectId, ref: "Location" },
    Asset: { type: mongoose.Schema.Types.ObjectId, ref: "Asset" },
    AssignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ReportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ScheduledDate: { type: Date },
    CompletionDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MaintenanceTask", MaintenanceTaskSchema);