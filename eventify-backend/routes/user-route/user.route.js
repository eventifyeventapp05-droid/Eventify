/**
 * @fileoverview Express routes for User authentication and profile management.
 *
 * Routes:
 * - POST /signup-user → Register a new User
 * - POST /signin-user → Authenticate and log in
 * - GET /get-user-by-id/:id → Fetch User details
 * - PATCH /update-user/:id → Update User profile
 * - POST /logout-user → Logout and clear session
 * - POST /forgot-password → Send password reset email
 * - POST /reset-password/:token → Reset password with token
 * - POST /verify-reset-token/:token → Verify reset token validity
 *
 * @module routes/userRoutes
 * @requires express
 * @requires ../../middlewares/auth.middleware
 * @requires ../../utilities/cloudinary/cloudinary.utility
 * @requires ../../controllers/user-controllers/user.controller
 */

const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  authLimiter,
} = require("../../middlewares/auth-middleware/auth.middleware");
const profilePictureUpload = require("../../utilities/cloudinary-utility/cloudinary.utility");
const userController = require("../../controllers/user-controller/user.controller");

/**
 * @description Route for user registration.
 */
router.post(
  "/signup-user",
  profilePictureUpload.upload,
  userController.registerUser
);

/**
 * @description Route for user sign-in.
 */
router.post("/signin-user", authLimiter, userController.loginUser);

/**
 * @description Route to get a user's details by ID.
 */
router.get(
  "/get-user-by-id/:userId",
  authMiddleware,
  userController.getUserById
);

/**
 * @description Route to update a user's details by ID.
 */
router.patch(
  "/update-user/:userId",
  authMiddleware,
  profilePictureUpload.upload,
  userController.updateUser
);

/**
 * @description Route for user logout.
 */
router.post("/logout-user", authMiddleware, userController.logoutUser);

/**
 * @description Route to send an email for a password reset.
 */
router.post("/forgot-password", userController.forgotPassword);

/**
 * @description Route to reset a password using a token.
 */
router.post("/reset-password/:token", userController.resetPasswordWithToken);

/**
 * @description Route to verify a password reset token.
 */
router.post("/verify-reset-token/:token", userController.verifyResetToken);

module.exports = router;
