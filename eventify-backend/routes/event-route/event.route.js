/**
 * @fileoverview Express routes for Event management (SuperAdmin only)
 *
 * Routes:
 * - POST /create-event → Create a new event.
 *
 * @module routes/eventRoutes
 * @requires express
 * @requires ../../middlewares/auth-middleware/auth.middleware
 * @requires ../../utilities/cloudinary-utility/cloudinary.utility
 * @requires ../../controllers/event-controller/event.controller
 */

const express = require("express");
const router = express.Router();
const {
  authMiddleware,
} = require("../../middlewares/auth-middleware/auth.middleware");
const eventImageUpload = require("../../utilities/cloudinary-utility/cloudinary.utility");
const eventController = require("../../controllers/event-controller/event.controller");

/**
 * @description Route for new event creation.
 */
router.post(
  "/create-event",
  authMiddleware,
  eventImageUpload.upload,
  eventController.createEvent
);

/**
 * @description Route to get all events.
 */
router.get("/get-all-events", eventController.getAllEvents);

/**
 * @description Route for update an existing event.
 */
router.patch(
  "/update-event/:eventId",
  authMiddleware,
  eventImageUpload.upload,
  eventController.updateEvent
);

/**
 * @description Route for delete an event.
 */
router.delete(
  "/delete-event/:eventId",
  authMiddleware,
  eventController.deleteEvent
);

module.exports = router;
