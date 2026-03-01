// middlewares/validateCreateUser.js
module.exports = (req, res, next) => {
  const { name, employeeId, email, password, phoneNumber, department, designation } = req.body || {};
  const missing = [];
  if (!name) missing.push("name");
  if (!employeeId) missing.push("employeeId");
  if (!email) missing.push("email");
  if (!password) missing.push("password");
  if (!phoneNumber) missing.push("phoneNumber");
  if (!department) missing.push("department");
  if (!designation) missing.push("designation");
  
  if (missing.length > 0) {
    return res.status(400).json({
      status: "fail",
      message: `Missing required fields: ${missing.join(", ")}`,
    });
  }
  
  return next();
};
