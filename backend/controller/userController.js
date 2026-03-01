
// const {MongoClient,ObjectId}=reqiure("mongodb")
const userModel = require("../model/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// const cookieParser = require("cookie-parser");
const { ObjectId } = require("mongodb"); // make sure you import this
const { MongoClient } = require("mongodb");
const client = new MongoClient("mongodb://localhost:27017/");
const dbName = "assetManagement";
const notificationCollectionName = "notifications";
const jwtSecretKey = "MyCompany";



// exports.createUser = catchAsync(async (req, res, next) => {
//   const {
//     name,
//     employeeId,
//     email,
//     password,
//     phoneNumber,
//     userType,
//     department,
//     designation,
//     status,
//     project,      // optional
//     location,     // optional
//     sublocation,  // optional
//   } = req.body;

//     // console.log("43",req.body)

//   const userExists = await userModel.findOne({ email: email });

//   if (userExists) {
//     return res.status(400).json({ error: "User already exists" });
//   }
//   const userNewData = new userModel({
//     name,
//     employeeId,
//     email,
//     password,
//     phoneNumber,
//     userType,
//     department,
//     designation,
//     status,
//     project,      // optional
//     location,     // optional
//     sublocation,  // optional
//   });

//   console.log("43",userNewData)

//   await userNewData.save();
//   res.status(201).json("User Is Created");
// });






exports.CreateUser = catchAsync(async (req, res, next) => {
  const {
    name,
    employeeId,
    email,
    password,
    phoneNumber,
    userType,
    department,
    designation,
    status,
    project,      // optional
    location,     // optional
    sublocation,  // optional
  } = req.body;

  // Uniqueness checks
  const [emailExists, empIdExists] = await Promise.all([
    userModel.findOne({ email: email.toLowerCase().trim() }).lean(),
    userModel.findOne({ employeeId: String(employeeId).toUpperCase().trim() }).lean(),
  ]);

  if (emailExists) {
    return res.status(409).json({ status: "fail", message: "Email already exists" });
  }
  if (empIdExists) {
    return res.status(409).json({ status: "fail", message: "Employee ID already exists" });
  }

  // Create user
  const payload = {
    name: String(name).trim(),
    employeeId: String(employeeId).toUpperCase().trim(),
    email: String(email).toLowerCase().trim(),
    password, // hashed by pre-save hook
    phoneNumber: String(phoneNumber).trim(),
    userType: userType || "user",
    department: String(department).trim(),
    designation: String(designation).trim(),
    status: status || "Enabled",
    project: project ? String(project).trim() : "",
    location: location ? String(location).trim() : "",
    sublocation: sublocation ? String(sublocation).trim() : "",
  };

  const user = await userModel.create(payload);

  // Build safe response (omit password)
  const token = user.generateAuthToken();

  return res.status(201).json({
    status: "success",
    message: "User created successfully",
    timestamp: new Date().toISOString(),
    data: {
      user: {
        _id: user._id,
        name: user.name,
        employeeId: user.employeeId,
        email: user.email,
        phoneNumber: user.phoneNumber,
        userType: user.userType,
        department: user.department,
        designation: user.designation,
        status: user.status,
        project: user.project,
        location: user.location,
        sublocation: user.sublocation,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token, // remove if not needed
    },
  });
});




exports.loginUser = catchAsync(async (req, res, next) => {
  const start = Date.now();
  const { employeeIdOREmail, password } = req.body || {};

  if (!employeeIdOREmail || !password) {
    return next(new AppError('Provide email/employeeId and password', 400));
  }

  const raw = String(employeeIdOREmail).trim();
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw);

  // Keep consistent with your schema:
  // - email: lowercase
  // - employeeId: uppercase
  const query = isEmail
    ? { email: raw.toLowerCase() }
    : { employeeId: raw.toUpperCase() };

  // IMPORTANT: select the password since schema has select:false
  const user = await userModel.findOne(query).select('+password');

  if (!user || !user.password || typeof user.password !== 'string') {
    // Avoid revealing whether email/employeeId exists
    return next(new AppError('Invalid credentials', 400));
  }

  const isPasswordMatch = await bcrypt.compare(String(password), user.password);
  if (!isPasswordMatch) {
    return next(new AppError('Invalid credentials', 400));
  }

  // Optional: in production, prefer failing if JWT secret is missing
  if (!process.env.JWT_SECRET_KEY && process.env.NODE_ENV === 'production') {
    return next(new AppError('Server configuration error', 500));
  }

  const token = await user.generateAuthToken();

  res.cookie('jwttoken', token, {
    expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
  });

  const end = Date.now();
  console.log(`Login took ${end - start} ms`);

  // If you rely fully on httpOnly cookie, you can omit sending token in body
  res.status(200).json({
    message: 'Login Successful',
    user: {
      name: user.name,
      email: user.email,
    },
    token,
  });
});


exports.updateUserDetails = catchAsync(async (req, res, next) => {
  const {
    name,
    employeeId,
    email,
    phoneNumber,
    userType,
    department,
    designation,
    status,
  } = req.body;

  const userId = req.user?._id;

  if (!userId) {
    return next(new AppError("Login is required", 400));
  }

  // Build update object
  const updateFields = {};
  if (name) updateFields.name = name;
  if (employeeId) updateFields.employeeId = employeeId;
  if (email) updateFields.email = email;
  if (phoneNumber) updateFields.phoneNumber = phoneNumber;
  if (userType) updateFields.userType = userType;
  if (department) updateFields.department = department;
  if (designation) updateFields.designation = designation;
  if (status) updateFields.status = status;

  const updatedUser = await userModel.findByIdAndUpdate(
    userId,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    message: "User details updated successfully",
    user: updatedUser,
  });
});
exports.changePassword = catchAsync(async (req, res, next) => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;

  const userId = req.user._id;

  if (!userId) {
    return next(new AppError("Login employeeIdOREmail ", 400));
  }
  if (!oldPassword) {
    return next(new AppError("Old Password is required ", 400));
  }
  if (!newPassword) {
    return next(new AppError("Please enter new password ", 400));
  }
  if (!confirmNewPassword) {
    return next(new AppError("please Enter Confirm Password", 400));
  }

  const userExists = await userModel.findById(userId);
  if (!userExists) {
    return next(new AppError("Invalid credentials ", 400));
  }

  const isPasswordMatch = await bcrypt.compare(
    oldPassword,
    userExists.password
  );
  if (!isPasswordMatch) {
    return next(new AppError("Old Password is incorrect ", 400));
  }

  if (newPassword !== confirmNewPassword) {
    return next(
      new AppError("New password is not match Confirm password ", 400)
    );
  }

  userExists.password = newPassword;
  userExists.confirmPassword = confirmNewPassword;

  await userExists.save();

  res
    .status(200)
    .json({ message: "Password updated successfully", user: userExists });
});

// exports.downloadFile = catchAsync(async (req, res, next) => {
//   const userDetails = await userModel.findById(req.params.id);
//   if (!userDetails) {
//     return next(new AppError("user Not found", 404));
//   }
//   const filePath = userDetails.filePath;
//   res.download(filePath);
// });

exports.logoutUser = catchAsync(async (req, res, next) => {
  // Clear the jwttoken cookie by setting it to an expired date
  res.cookie("jwttoken", "", {
    expires: new Date(0), // Setting the expiration date to 0 to expire the cookie
    httpOnly: true, // Make sure it's only accessible via HTTP requests, not JavaScript
  });
  // Respond with a success message
  res.json({ message: "Logged out successfully" });
});

exports.protectedRoute = catchAsync(async (req, res, next) => {
  // Validate JWT token
  const token = req.cookies.jwttoken;

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }
});

exports.checkAuth = catchAsync(async (req, res, next) => {
  const token = req.cookies.jwttoken;

  if (!token) {
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecretKey);
    const currentUser = await userModel.findOne({ email: decoded.email });

    if (!currentUser) {
      return next(new AppError("UnAuthenticated action ,User not found", 400));
    }

    const expirationTime = Date.now() + 60 * 60 * 1000; // Example expiration time
    res.status(200).json({
      status: "success",
      expiredAt: { expirationTime },
      data: {
        user: {
          name: currentUser.name,
          userType: currentUser.userType,
          email: currentUser.email,
          phoneNumber: currentUser.phoneNumber,
          id: currentUser._id,
        },
      },
    });
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

exports.getNotifications = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  if (!userId) {
    return next(new AppError("Login is required", 400));
  }

  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(notificationCollectionName);

  const notifications = await collection
    .find({ userId: new ObjectId(userId) })
    .sort({ isRead: 1, createdAt: -1 }) // 🔁 sort: unread employeeIdOREmail, then newest
    .toArray();

  if (notifications.length === 0) {
    return res.status(404).json({ message: "No notifications found" });
  }

  res.status(200).json({
    status: "success",
    data: notifications,
  });
});

exports.handleReadNotifications = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { notificationId, isRead } = req.body;
  if (!notificationId) {
    return next(new AppError("Notification ID is required", 400));
  }

  if (!userId) {
    return next(new AppError("Login is required", 400));
  }

  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(notificationCollectionName);

  const updatedNotification = await collection.findOneAndUpdate(
    {
      _id: new ObjectId(notificationId),
      // userId: new ObjectId(userId),
    },
    {
      $set: {
        isRead: isRead, // Default to true if not provided
      },
    }
  );

  if (!updatedNotification) {
    return res.status(404).json({ message: "Notification not found" });
  }

  res.status(200).json({
    status: "success",
  });
});

exports.handleReadAllNotifications = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { isRead } = req.body;

  if (!userId) {
    return next(new AppError("Login is required", 400));
  }

  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(notificationCollectionName);

  const result = await collection.updateMany(
    { userId: new ObjectId(userId) },
    {
      $set: {
        isRead: isRead === undefined ? true : isRead,
      },
    }
  );

  if (result.modifiedCount === 0) {
    return res.status(404).json({ message: "No notifications were updated" });
  }

  res.status(200).json({
    status: "success",
    message: `${result.modifiedCount} notifications marked as read.`,
  });
});

