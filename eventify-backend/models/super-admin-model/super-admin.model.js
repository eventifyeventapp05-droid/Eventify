/**
 * @fileoverview Mongoose schema for SuperAdmin management with permissions
 * @module models/superAdminModel
 * @requires mongoose
 */

const mongoose = require("mongoose");

/**
 * @schema SuperAdminSchema
 * @description Schema representing super admin and admin accounts with permissions
 */
const superAdminSchema = new mongoose.Schema(
  {
    profilePicture: {
      type: String,
      default: null,
    },

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
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["SUPERADMIN"],
      default: "SUPERADMIN",
    },

    permissions: {
      eventManagement: {
        canCreate: { type: Boolean, default: true },
        canEdit: { type: Boolean, default: true },
        canDelete: { type: Boolean, default: true },
        canPublish: { type: Boolean, default: true },
      },

      userManagement: {
        canView: { type: Boolean, default: false },
        canEdit: { type: Boolean, default: false },
        canDelete: { type: Boolean, default: false },
      },

      contentManagement: {
        canUpload: { type: Boolean, default: true },
        canEdit: { type: Boolean, default: true },
        canDelete: { type: Boolean, default: true },
      },
    },

    isActive: {
      type: Boolean,
      default: true,
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

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SuperAdmin", superAdminSchema);
