/**
 * @fileoverview Express routes for Super Admin authentication and profile management.
 *
 * Routes:
 * - POST /signup-super-admin → Register a new Super Admin.
 * - POST /signin-super-admin → Authenticate and log in.
 * - GET /get-super-admin-by-id/:id → Fetch Super Admin details.
 * - POST /logout-super-admin → Logout and clear session.
 *
 * @module routes/superAdminRoutes
 * @requires express
 * @requires ../../middlewares/auth-middleware/auth.middleware
 * @requires ../../utilities/cloudinary-utility/cloudinary.utility
 * @requires ../../controllers/super-admin-controller/super-admin.controller
 */

const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  authLimiter,
} = require("../../middlewares/auth-middleware/auth.middleware");
const profilePictureUpload = require("../../utilities/cloudinary-utility/cloudinary.utility");
const superAdminController = require("../../controllers/super-admin-controller/super-admin.controller");

/**
 * @description Route for Super Admin registration.
 */
router.post(
  "/signup-super-admin",
  profilePictureUpload.upload,
  superAdminController.registerSuperAdmin
);

/**
 * @description Route for Super Admin sign-in.
 */
router.post(
  "/signin-super-admin",
  authLimiter,
  superAdminController.loginSuperAdmin
);

/**
 * @description Route to get a Super Admin's details by ID.
 */
router.get(
  "/get-super-admin-by-id/:superAdminId",
  authMiddleware,
  superAdminController.getSuperAdminById
);

/**
 * @description Route for Super Admin logout.
 */
router.post(
  "/logout-super-admin",
  authMiddleware,
  superAdminController.logoutSuperAdmin
);

/**
 * @description Route to send an email for a password reset.
 */
router.post("/forgot-password", superAdminController.forgotPassword);

/**
 * @description Route to reset a password using a token.
 */
router.post(
  "/reset-password/:token",
  superAdminController.resetPasswordWithToken
);

/**
 * @description Route to verify a password reset token.
 */
router.post(
  "/verify-reset-token/:token",
  superAdminController.verifyResetToken
);

/**
 * @description Route for update an event status.
 */
router.patch(
  "/event/update-event-status/:eventId",
  authMiddleware,
  superAdminController.updateEventStatus
);

/**
 * @description Route for update an booking status
 */
router.patch(
  "/ticket/update-booking-status/:bookingId",
  authMiddleware,
  superAdminController.updateBookingStatus
);

/**
 * @description Route to get all bookings.
 */
router.get(
  "/ticket/get-all-bookings",
  authMiddleware,
  superAdminController.getAllBookings
);

/**
 * @description Route to get all users.
 */
router.get(
  "/user/get-all-users",
  authMiddleware,
  superAdminController.getAllUsers
);

/**
 * @description Route to get all organizers.
 */
router.get(
  "/organizer/get-all-organizers",
  authMiddleware,
  superAdminController.getAllOrganizers
);

module.exports = router;
