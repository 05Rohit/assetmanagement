const jwt = require("jsonwebtoken");
const User = require("../model/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const verifyToken = catchAsync(async (req, res, next) => {
  let token;
  token = req.cookies?.jwt;

  if (!token) {
    return next(new AppError("Unauthorized: No token provided", 401));
  }

  console.log(process.env.JWT_SECRET)
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded._id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    req.user = user;
    next();
  } catch (err) {
    console.error({ error: "Error verifying token", message: err.message });
    return next(new AppError("Forbidden: Token not verified", 403));
  }
});

module.exports = verifyToken;

