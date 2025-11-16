/**
 * @fileoverview Mongoose schema for ticket booking management
 * @module models/ticketBookingModel
 * @requires mongoose
 */

const mongoose = require("mongoose");

/**
 * @schema TicketBookingSchema
 * @description Schema representing ticket bookings for events
 */
const ticketBookingSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    ticketType: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    bookingStatus: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED", "REFUNDED"],
      default: "PENDING",
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
    },

    meta: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TicketBooking", ticketBookingSchema);
