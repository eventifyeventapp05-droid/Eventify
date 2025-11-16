/**
 * @fileoverview Mongoose schema for Chat
 * @module models/chatModel
 * @requires mongoose
 */

const mongoose = require("mongoose");

/**
 * @schema ChatSchema
 * @description Schema representing chat between user and superadmin
 */

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organizer",
      required: true,
    },

    messages: [
      {
        sender: {
          type: String,
          enum: ["USER", "ORGANIZER"],
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        sentAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

chatSchema.index({ user: 1 });
chatSchema.index({ organizer: 1 });
chatSchema.index({ isActive: 1 });
chatSchema.index({ updatedAt: -1 });

module.exports = mongoose.model("Chat", chatSchema);
