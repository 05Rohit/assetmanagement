const express = require("express");
const userController = require("../controller/userController.js");
const verifyToken = require("../middleware/verifyToken.js");
const validateCreateUser = require("../middleware/validateCreateUser.js");
const router = express.Router();

// router.post("/createuser", userController.createUser);
router.post("/createuser", validateCreateUser, userController.CreateUser);
router.post("/login", userController.loginUser);
// router.post("/download/:id", verifyToken, userController.downloadFile);
router.patch(
  "/updateuserdetails",
  verifyToken,
  userController.updateUserDetails
);
router.patch("/changepassword", verifyToken, userController.changePassword);

router.post("/logout", userController.logoutUser);
router.post("/protectedroute", userController.protectedRoute);
router.post("/checkAuth", userController.checkAuth);
router.get("/notification", verifyToken, userController.getNotifications);
router.post(
  "/readNotifications",
  verifyToken,
  userController.handleReadNotifications
);
router.post(
  "/readAllNotifications",
  verifyToken,
  userController.handleReadAllNotifications
);
module.exports=router;
