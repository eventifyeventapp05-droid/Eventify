const mongoose = require("mongoose");

/**
 * @schema organizerSchema
 * @description Schema representing organizer who can give services.
 */
const organizerSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    organizerProfile: {
      services: [
        {
          type: String,
        },
      ], // e.g., ["Catering", "Photography", "Decoration"]
      availability: [
        {
          date: {
            type: Date,
            required: true,
          },
          isAvailable: {
            type: Boolean,
            default: true,
          },
        },
      ],
      bio: {
        type: String,
        trim: true,
      },
      profilePicture: {
        type: String,
      },
    },

    bookedEvents: [
      {
        bookingId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "TicketBooking",
        },
        eventId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Event",
        },
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        ticketType: String,
        quantity: Number,
        totalPrice: Number,
        status: {
          type: String,
          default: "PENDING",
        },
        bookedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    role: {
      type: String,
      enum: ["ORGANIZER"],
      default: "ORGANIZER",
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },

    sessionId: {
      type: String,
      default: null,
    },

    passwordResetToken: {
      type: String,
      default: null,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Organizer", organizerSchema);
