/**
 * @fileoverview Express routes for Stripe payment operations and ticket booking management.
 *
 * Routes:
 * - POST /create-ticket-payment → Create Stripe payment intent for ticket purchase
 * - POST /confirm-ticket-booking → Confirm booking and capture payment
 *
 * @module routes/stripeRoutes
 * @requires express
 * @requires ../controllers/stripeTicket.controller
 * @requires ../middlewares/auth.middleware
 */

const express = require("express");
const router = express.Router();
const ticketController = require("../../controllers/ticket-controller/ticket.controller");
const {
  authMiddleware,
} = require("../../middlewares/auth-middleware/auth.middleware");

/**
 * @description Route for ticket booking
 */
router.post("/book-ticket", authMiddleware, ticketController.bookTicket);

/**
 * @description Route for cancel booking
 */
router.post(
  "/cancel-booking/:bookingId",
  authMiddleware,
  ticketController.cancelBooking
);

module.exports = router;
