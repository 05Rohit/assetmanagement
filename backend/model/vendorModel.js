const { default: mongoose } = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {

    productType: {
      type: String,
       required: true,
      trim: true,
    },

    vendorName: {
      type: String,
       required: true,
      trim: true,
    },

    currency: {
      type: String,
      required: false,
      trim: true,
    },

    doorNumber: {
      type: String,
       required: false,
      trim: true,
    },

    street: {
      type: String,
       required: false,
      trim: true,
    },

    landmark: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
       required: false,
      trim: true,
    },

    zipCode: {
      type: String,
       required: false,
      trim: true,
    },

    state: {
      type: String,
       required: false,
      trim: true,
    },

    country: {
      type: String,
       required: false,
      trim: true,
    },

    phoneNo: {
      type: String,
       required: false,
      trim: true,
    },

    fax: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
       required: false,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },

    firstName: {
      type: String,
       required: false,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Vendor = mongoose.model("Vendor", vendorSchema);
module.exports = Vendor;