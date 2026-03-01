const mongoose = require("mongoose");

const DepartmentSchema = (sequelize, DataTypes) => {
  const Department = sequelize.define("Department", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  return Department;
};

const DepartmentModel = mongoose.model("Department", DepartmentSchema);
module.exports = DepartmentModel;