/**
 * @fileoverview Controller module for managing Organizer authentication and profile operations.
 *
 * This file includes:
 * - Organizer registration with password validation and Cloudinary profile picture upload
 * - Secure login system with JWT authentication, session tracking, and account lockout
 * - Organizer profile management including retrieval and updates
 * - Availability and services management
 * - Password reset functionality with email verification
 * - Logout functionality with session invalidation
 *
 * @module controllers/organizerController
 */

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Organizer = require("../../models/organizer-model/organizer.model");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../../utilities/cloudinary-utility/cloudinary.utility");
const {
  passwordRegex,
  hashPassword,
} = require("../../helpers/password-helper/password.helper");
const {
  generateSecureToken,
} = require("../../helpers/token-helper/token.helper");
const {
  sendPasswordResetEmail,
  sendBookingStatusUpdateEmail,
} = require("../../helpers/email-helper/email.helper");

/**
 * @description Controller for organizer registration
 * @route POST /api/organizer/signup-organizer
 * @access Public
 */
exports.registerOrganizer = async (req, res) => {
  let uploadedFileUrl = null;

  try {
    const { userName, email, password, bio } = req.body;

    // Services can come as comma-separated string or array
    let services = [];
    if (req.body.organizerProfile?.services) {
      services = Array.isArray(req.body.organizerProfile.services)
        ? req.body.organizerProfile.services
        : req.body.organizerProfile.services.split(",").map((s) => s.trim());
    }

    // Availability parsing: convert strings to Date and Boolean
    let availability = [];
    if (req.body.organizerProfile?.availability) {
      const rawAvailability =
        typeof req.body.organizerProfile.availability === "string"
          ? JSON.parse(req.body.organizerProfile.availability)
          : req.body.organizerProfile.availability;

      availability = rawAvailability.map((slot) => ({
        date: new Date(slot.date),
        isAvailable: slot.isAvailable === "true" || slot.isAvailable === true,
      }));
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      });
    }

    const existingOrganizer = await Organizer.findOne({
      email: email.toLowerCase(),
    });
    if (existingOrganizer) {
      return res.status(409).json({
        success: false,
        message: "Organizer with this email already exists",
      });
    }

    let profilePictureUrl = null;
    if (req.files?.profilePicture) {
      const uploadResult = await uploadToCloudinary(
        req.files.profilePicture[0],
        "profilePicture"
      );
      profilePictureUrl = uploadResult.url;
      uploadedFileUrl = uploadResult.url;
    }

    const hashedPassword = await hashPassword(password);

    const organizer = new Organizer({
      userName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "ORGANIZER",
      organizerProfile: {
        services,
        bio,
        profilePicture: profilePictureUrl,
        availability,
      },
      lastLogin: null,
      loginAttempts: 0,
      lockUntil: null,
    });

    await organizer.save();

    res.status(201).json({
      success: true,
      message: "Organizer registered successfully!",
    });
  } catch (error) {
    console.error("❌ Error registering organizer:", error);

    if (uploadedFileUrl) {
      try {
        await deleteFromCloudinary(uploadedFileUrl);
      } catch (cloudErr) {
        console.error("❌ Failed to rollback Cloudinary upload:", cloudErr);
      }
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @description Controller for organizer login
 * @route POST /api/organizer/signin-organizer
 * @access Public
 */
exports.loginOrganizer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const organizer = await Organizer.findOne({ email });
    if (!organizer) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (organizer.lockUntil && organizer.lockUntil > Date.now()) {
      const remaining = Math.ceil((organizer.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account locked. Try again in ${remaining} minutes.`,
      });
    }

    if (organizer.lockUntil && organizer.lockUntil <= Date.now()) {
      organizer.loginAttempts = 0;
      organizer.lockUntil = null;
      await organizer.save();
    }

    const isMatch = await bcrypt.compare(password, organizer.password);
    if (!isMatch) {
      organizer.loginAttempts += 1;
      if (organizer.loginAttempts >= 3) {
        organizer.lockUntil = Date.now() + 30 * 60 * 1000;
      }
      await organizer.save();
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        attempts: organizer.loginAttempts,
      });
    }

    organizer.loginAttempts = 0;
    organizer.lockUntil = null;
    organizer.lastLogin = new Date();
    const sessionId = generateSecureToken();
    organizer.sessionId = sessionId;
    await organizer.save();

    const payload = {
      role: "ORGANIZER",
      user: { id: organizer._id, email: organizer.email },
      sessionId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { algorithm: "HS256" },
      (err, token) => {
        if (err)
          return res
            .status(500)
            .json({ success: false, message: "Token generation error" });

        res.cookie("accessToken", token, {
          httpOnly: true,
          sameSite: "strict",
          maxAge: 3600000,
        });

        res.json({
          success: true,
          message: "Login successful",
          organizer: {
            id: organizer._id,
            userName: organizer.userName,
            email: organizer.email,
          },
          token,
          expiresIn: 3600,
        });
      }
    );
  } catch (error) {
    console.error("❌ Error logging in:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @description Controller to get organizer by ID
 * @route GET /api/organizer/:organizerId
 * @access Private
 */
exports.getOrganizerById = async (req, res) => {
  try {
    const { organizerId } = req.params;

    const organizer = await Organizer.findById(organizerId)
      .select("-password -__v -passwordResetToken -passwordResetExpires")
      .populate({
        path: "bookedEvents.eventId",
        model: "Event",
        select: "-__v",
        populate: [
          {
            path: "bookedBy.user", // populate the user inside bookedBy
            model: "User",
            select: "-password -__v -role", // exclude sensitive fields
          },
          {
            path: "organizer", // optional: populate event organizer
            model: "Organizer",
            select: "userName email organizerProfile",
          },
        ],
      });

    if (!organizer) {
      return res
        .status(404)
        .json({ success: false, message: "Organizer not found" });
    }

    res.status(200).json({
      success: true,
      message: "Organizer fetched successfully",
      organizer,
    });
  } catch (error) {
    console.error("❌ Error fetching organizer:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @description Controller to update organizer profile including services and availability
 * @route PATCH /api/organizer/:organizerId
 * @access Private
 */
exports.updateOrganizerProfile = async (req, res) => {
  try {
    const { organizerId } = req.params;

    const organizer = await Organizer.findById(organizerId);
    if (!organizer) {
      return res
        .status(404)
        .json({ success: false, message: "Organizer not found" });
    }

    const updates = {};

    if (req.body.userName) updates.userName = req.body.userName;
    if (req.body.bio) updates["organizerProfile.bio"] = req.body.bio;

    if (req.body.services) {
      updates["organizerProfile.services"] = Array.isArray(req.body.services)
        ? req.body.services
        : req.body.services.split(",").map((s) => s.trim());
    }

    if (req.body.availability) {
      const parsedAvailability =
        typeof req.body.availability === "string"
          ? JSON.parse(req.body.availability)
          : req.body.availability;
      updates["organizerProfile.availability"] = parsedAvailability;
    }

    if (req.files?.profilePicture) {
      const uploadResult = await uploadToCloudinary(
        req.files.profilePicture[0],
        "profilePicture"
      );
      updates["organizerProfile.profilePicture"] = uploadResult.url;
    }

    const updatedOrganizer = await Organizer.findByIdAndUpdate(
      organizerId,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Organizer profile updated successfully",
      organizer: updatedOrganizer,
    });
  } catch (error) {
    console.error("❌ Error updating organizer profile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @description Controller for organizer logout
 * @route POST /api/organizer/logout
 * @access Private
 */
exports.logoutOrganizer = async (req, res) => {
  try {
    if (req.organizer && req.organizer.id) {
      await Organizer.findByIdAndUpdate(req.organizer.id, {
        sessionId: generateSecureToken(),
      });
    }

    res.clearCookie("accessToken", { httpOnly: true, sameSite: "strict" });

    res.status(200).json({ success: true, message: "Logout successfully" });
  } catch (error) {
    console.error("❌ Logout error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @description Controller to initiate forgot password for organizer
 * @route POST /api/organizer/forgot-password
 * @access Public
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({
        success: false,
        message: "Email and role are required",
      });
    }

    let userModel;
    if (role === "SUPERADMIN") userModel = SuperAdmin;
    else if (role === "ORGANIZER") userModel = Organizer;
    else
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });

    const user = await userModel.findOne({ email });

    if (!user) {
      // Respond with 200 to prevent email enumeration
      return res.status(200).json({
        success: true,
        message:
          "If an account with that email exists, a password reset link has been sent",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetTokenExpiry;
    await user.save();

    const emailSent = await sendPasswordResetEmail(email, resetToken, role);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email",
      });
    }

    res.status(200).json({
      success: true,
      message: "Link sent successfully! Please check your email",
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @description Controller to reset password with token
 * @route POST /api/super-admin/reset-password/:token
 * @access Public
 */
exports.resetPasswordWithToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, role } = req.body;

    if (!token || !newPassword || !role) {
      return res.status(400).json({
        success: false,
        message: "Token, new password, and role are required",
      });
    }

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      });
    }

    let userModel;
    if (role === "SUPERADMIN") userModel = SuperAdmin;
    else if (role === "ORGANIZER") userModel = Organizer;
    else
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });

    const user = await userModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    const isSameAsCurrent = await bcrypt.compare(newPassword, user.password);
    if (isSameAsCurrent) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as the current password",
      });
    }

    const hashedPassword = await hashPassword(newPassword);

    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.passwordChangedAt = new Date();
    user.sessionId = generateSecureToken();

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @description Controller to verify reset token validity
 * @route GET /api/organizer/verify-reset-token/:token
 * @access Public
 */
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    const organizer = await Organizer.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!organizer) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    res.status(200).json({
      success: true,
      message: "Valid reset token",
    });
  } catch (error) {
    console.error("Error verifying reset token:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
