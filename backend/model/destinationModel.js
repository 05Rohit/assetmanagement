

const mongoose = require("mongoose");

const designationSchema = mongoose.Schema({
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

});

const DesignationModel = mongoose.model("Designation", designationSchema);
module.exports = DesignationModel;