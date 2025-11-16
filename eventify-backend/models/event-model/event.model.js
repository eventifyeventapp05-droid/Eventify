/**
 * @fileoverview Mongoose schema for Event
 * @module models/eventModel
 * @requires mongoose
 */

const mongoose = require("mongoose");

/**
 * @schema EventSchema
 * @description Schema representing event
 */

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
    },
    category: {
      type: String,
      enum: ["CONCERT", "SEMINAR", "LIVE_SHOW", "THEATER", "CULTURAL"],
      required: true,
    },
    type: {
      type: String,
      enum: ["CITY", "OUT_OF_CITY"],
      required: true,
    },
    venue: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
    },
    dateTime: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organizer",
    },
    eventImage: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        caption: { type: String, default: "" },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    ticketConfig: {
      isRegistrationRequired: { type: Boolean, default: false },
      maxAttendees: Number,
      ticketTypes: [
        {
          name: { type: String, required: true },
          price: { type: Number, required: true },
          quantity: { type: Number, required: true },
          sold: { type: Number, default: 0 },
        },
      ],
    },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"],
      default: "DRAFT",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    bookedBy: {
      userType: {
        type: String,
        enum: ["SUPERADMIN", "USER", "ORGANIZER"],
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "bookedBy.userType",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", eventSchema);
