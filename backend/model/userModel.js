// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const jwtSecretKey = process.env.JWT_SECRET_KEY || "rohit";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    employeeId: {
      type: String, // keep string for flexibility like "EMP-00123"
      required: [true, "Employee ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email address is required"],
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address!`,
      },
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // do not return password by default
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      validate: {
        validator: function (v) {
          return /^[0-9]{10}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid 10-digit phone number!`,
      },
    },

    // Dropdowns from your UI. Using strings now; later you can switch to IDs.
    userType: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Enabled", "Disabled", "Suspended", "Onboarding", "Active", "Inactive"],
      default: "Enabled",
    },

    // Additional fields from your form
    project: { type: String, trim: true, default: "" }, // project name
    location: { type: String, trim: true, default: "" }, // city
    sublocation: { type: String, trim: true, default: "" }, // area/park

    filePath: { type: String, default: null },
  },
  { timestamps: true }
);

// ✅ Pre-save: hash password if modified
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ✅ Instance method to generate JWT token
UserSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      _id: this._id.toString(),
      userType: this.userType,
      name: this.name,
      email: this.email,
      employeeId: this.employeeId,
    },
    jwtSecretKey,
    { expiresIn: "1d" }
  );
};

// ✅ Compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Helpful compound index (optional)
UserSchema.index({ email: 1, employeeId: 1 });

const userModel = mongoose.model("User", UserSchema);
module.exports = userModel;