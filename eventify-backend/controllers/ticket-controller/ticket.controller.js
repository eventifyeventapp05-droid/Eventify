/**
 * @fileoverview Controller for ticket booking operations
 * @module controllers/ticketController
 * @requires ../../models/event-model/event.model
 * @requires ../../models/ticket-model/ticket.model
 * @requires ../../models/user-model/user.model
 * @requires mongoose
 */

const {
  sendTicketBookingEmail,
} = require("../../helpers/email-helper/email.helper");
const Event = require("../../models/event-model/event.model");
const TicketBooking = require("../../models/ticket-model/ticket.model");
const User = require("../../models/user-model/user.model");
const mongoose = require("mongoose");

/**
 * @description Controller for ticket booking
 * @route POST /api/ticket/book-event-ticket
 * @access Public
 */
exports.bookTicket = async (req, res) => {
  try {
    const { eventId, ticketType, quantity } = req.body;
    const user = req.user;

    if (!eventId || !ticketType || !quantity || quantity < 1)
      return res.status(400).json({ success: false, message: "Invalid input" });

    if (!user || !user.id) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    const event = await Event.findById(eventId);
    if (!event || event.status !== "PUBLISHED")
      return res
        .status(404)
        .json({ success: false, message: "Event not available" });

    const ticket = event.ticketConfig.ticketTypes.find(
      (t) => t.name.trim().toLowerCase() === ticketType.trim().toLowerCase()
    );

    if (!ticket)
      return res
        .status(400)
        .json({ success: false, message: "Ticket type not found" });

    const remainingTickets = ticket.quantity - (ticket.sold || 0);
    if (remainingTickets < quantity)
      return res.status(400).json({
        success: false,
        message: `Only ${remainingTickets} tickets left`,
      });

    const totalPrice = Number(ticket.price) * Number(quantity);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const booking = await TicketBooking.create(
        [
          {
            event: event._id,
            user: user.id,
            ticketType: ticket.name,
            quantity,
            totalPrice,
            bookingStatus: "PENDING",
            paymentStatus: "PENDING",
            meta: {
              mockPaymentId: `mock_${Date.now()}`,
              mockPaymentGateway: "SimulatedPay",
            },
          },
        ],
        { session }
      );

      ticket.sold = (ticket.sold || 0) + quantity;
      await event.save({ session });

      await User.findByIdAndUpdate(
        user.id,
        {
          $push: {
            bookedEvents: {
              bookingId: booking[0]._id,
              eventId: event._id,
              user: user.id,
              ticketType: ticket.name,
              quantity,
              totalPrice,
              status: "PENDING",
              bookedAt: new Date(),
            },
          },
        },
        { session }
      );

      await session.commitTransaction();

      try {
        const userDetails = await User.findById(user.id);
        await sendTicketBookingEmail(
          userDetails.email,
          booking[0],
          event,
          userDetails
        );
      } catch (emailError) {
        console.error("Failed to send booking email:", emailError);
      }

      return res.status(201).json({
        success: true,
        message: "Ticket booked successfully. Payment status: PENDING",
        bookingId: booking[0]._id,
        bookingStatus: "PENDING",
        paymentStatus: "PENDING",
        data: {
          event: event.title,
          ticketType: ticket.name,
          quantity,
          totalPrice,
          bookingDate: new Date().toISOString(),
        },
      });
    } catch (error) {
      await session.abortTransaction();
      console.error("Transaction error:", error);
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Booking error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/**
 * @description Controller for cancel booking
 * @route POST /api/ticket/cancel-booking/:bookingId
 * @access Public
 */
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await TicketBooking.findById(bookingId);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    booking.bookingStatus = "CANCELLED";
    booking.paymentStatus =
      booking.paymentStatus === "PAID" ? "REFUNDED" : "PENDING";
    await booking.save();

    await User.updateOne(
      { "bookedEvents.bookingId": booking._id },
      { $set: { "bookedEvents.$.status": booking.bookingStatus } }
    );

    return res.status(200).json({
      success: true,
      message: "Booking cancelled",
      bookingStatus: booking.bookingStatus,
      paymentStatus: booking.paymentStatus,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to cancel booking" });
  }
};

