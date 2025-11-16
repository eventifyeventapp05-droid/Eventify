/**
 * @fileoverview Express routes for Organizer authentication and profile management.
 *
 * Routes:
 * - POST /signup → Register a new Organizer
 * - POST /signin → Authenticate and log in
 * - GET /:organizerId → Fetch Organizer details
 * - PATCH /:organizerId → Update Organizer profile
 * - POST /logout → Logout and clear session
 * - POST /forgot-password → Send password reset email
 * - POST /reset-password/:token → Reset password with token
 *
 * @module routes/organizerRoutes
 * @requires express
 * @requires ../../middlewares/auth.middleware
 * @requires ../../utilities/cloudinary-utility/cloudinary.utility
 * @requires ../../controllers/organizer-controller/organizer.controller
 */

const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  authLimiter,
} = require("../../middlewares/auth-middleware/auth.middleware");
const profilePictureUpload = require("../../utilities/cloudinary-utility/cloudinary.utility");
const organizerController = require("../../controllers/organizer-controller/organizer.controller");

/**
 * @description Route for organizer registration.
 */
router.post(
  "/signup-organizer",
  profilePictureUpload.upload,
  organizerController.registerOrganizer
);

/**
 * @description Route for organizer sign-in.
 */
router.post(
  "/signin-organizer",
  authLimiter,
  organizerController.loginOrganizer
);

/**
 * @description Route to get an organizer's details by ID.
 */
router.get(
  "/get-organizer-by-id/:organizerId",
  authMiddleware,
  organizerController.getOrganizerById
);

/**
 * @description Route to update an organizer's profile by ID.
 */
router.patch(
  "/update-organizer/:organizerId",
  authMiddleware,
  profilePictureUpload.upload,
  organizerController.updateOrganizerProfile
);

/**
 * @description Route for organizer logout.
 */
router.post(
  "/logout-organizer",
  authMiddleware,
  organizerController.logoutOrganizer
);

/**
 * @description Route to send an email for password reset.
 */
router.post("/forgot-password", organizerController.forgotPassword);

/**
 * @description Route to reset a password using a token.
 */
router.post(
  "/reset-password/:token",
  organizerController.resetPasswordWithToken
);

/**
 * @description Route to verify a password reset token.
 */
router.post("/verify-reset-token/:token", organizerController.verifyResetToken);

module.exports = router;
