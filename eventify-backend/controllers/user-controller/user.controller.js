/**
 * @fileoverview Controller module for managing User authentication and profile operations.
 *
 * This file includes:
 * - User registration with password validation and Cloudinary profile picture upload
 * - Secure login system with JWT authentication, session tracking, and account lockout
 * - User profile management including retrieval and updates
 * - Password reset functionality with email verification
 * - Logout functionality with session invalidation
 *
 * @module controllers/userController
 * @requires mongoose
 * @requires bcrypt
 * @requires crypto
 * @requires jsonwebtoken
 * @requires ../../models/user-models/user.model
 * @requires ../../utilities/cloudinary/cloudinary.utility
 * @requires ../../helpers/password-helper/password.helper
 * @requires ../../helpers/token-helper/token.helper
 * @requires ../../helpers/email-helper/email.helper
 */

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../../models/user-model/user.model");
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
} = require("../../helpers/email-helper/email.helper");

/**
 * @description Controller for user registration
 * @route POST /api/user/signup-user
 * @access Public
 */
exports.registerUser = async (req, res) => {
  let uploadedFileUrl = null;

  try {
    const {
      userName,
      email,
      password,
      address,
      phone,
      bookedEvents,
      organizedEvents,
    } = req.body;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      role: "USER",
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
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

    const user = new User({
      profilePicture: profilePictureUrl,
      userName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "USER",
      phone,
      address,
      bookedEvents,
      organizedEvents,
      lastLogin: null,
      loginAttempts: 0,
      lockUntil: null,
      createdAt: new Date(),
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User created successfully!",
    });
  } catch (error) {
    console.error("❌ Error creating seller:", error);

    if (uploadedFileUrl) {
      try {
        await deleteFromCloudinary(uploadedFileUrl);
      } catch (cloudErr) {
        console.error("❌ Failed to rollback Cloudinary upload:", cloudErr);
      }
    }

    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    if (error.code === 11000 && error.keyPattern?.phone) {
      return res.status(409).json({
        success: false,
        message: "User with this phone already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @description Controller for user login
 * @route POST /api/user/signin-user
 * @access Public
 */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account locked. Try again in ${remaining} minutes.`,
      });
    }

    if (user.lockUntil && user.lockUntil <= Date.now()) {
      await User.updateOne(
        { _id: user._id },
        { $set: { loginAttempts: 0, lockUntil: null } }
      );
      user.loginAttempts = 0;
      user.lockUntil = null;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const updated = await User.findOneAndUpdate(
        { _id: user._id },
        { $inc: { loginAttempts: 1 } },
        { new: true }
      );

      if (updated.loginAttempts >= 3) {
        const lockTime = Date.now() + 30 * 60 * 1000;
        await User.updateOne(
          { _id: user._id },
          { $set: { lockUntil: lockTime } }
        );
        return res.status(423).json({
          success: false,
          message:
            "Too many failed login attempts. Account locked for 30 minutes.",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        attempts: updated.loginAttempts,
      });
    }

    const sessionId = generateSecureToken();
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      {
        $set: {
          loginAttempts: 0,
          lockUntil: null,
          lastLogin: new Date(),
          sessionId,
        },
      },
      { new: true }
    );

    const payload = {
      role: "USER",
      user: { id: updatedUser.id, email: updatedUser.email },
      sessionId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { algorithm: "HS256" },
      (err, token) => {
        if (err) {
          return res
            .status(500)
            .json({ success: false, message: "Error generating token" });
        }

        res.cookie("accessToken", token, {
          httpOnly: true,
          sameSite: "strict",
          maxAge: 60 * 60 * 1000,
        });

        res.json({
          success: true,
          message: "Login Successfully",
          user: {
            id: updatedUser.id,
            userName: updatedUser.userName,
            email: updatedUser.email,
          },
          token,
          expiresIn: 3600,
        });
      }
    );
  } catch (err) {
    console.error("Login Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error logging in" });
  }
};

/**
 * @description Controller to get user by ID
 * @route GET /api/user/get-user/:userId
 * @access Private (User)
 */
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select("-password -__v -refreshToken")
       .populate({
        path: "bookedEvents.eventId",
        model: "Event", // Make sure this matches your Event model name
        select: "-__v", // Exclude version key, add other fields to exclude if needed
      })      
      .populate({
        path: "organizedEvents.eventId",
        model: "Event", // Make sure this matches your Event model name
        select: "-__v", // Exclude version key, add other fields to exclude if needed
      })
      .populate({
        path: "organizedEvents.organizerId",
        model: "Organizer", // Make sure this matches your Event model name
        select: "-__v", // Exclude version key, add other fields to exclude if needed
      });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user: user,
    });
  } catch (err) {
    console.error("getUserById Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * @description Controller to update a user's profile
 * @route PATCH api/user/update-user/:userId
 * @access Private (User)
 */
exports.updateUser = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "USER") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! Only User can update.",
      });
    }

    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    const allowedFields = ["userName", "address", "phone"];
    let updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined && req.body[field] !== "") {
        updates[field] = req.body[field];
      }
    }

    if (req.files?.profilePicture) {
      let existingPublicId = null;

      if (user.profilePicture) {
        try {
          const matches = user.profilePicture.match(/\/v\d+\/(.+?)\./);
          if (matches && matches[1]) {
            existingPublicId = matches[1];
          }
        } catch (error) {
          console.error("❌ Error extracting public ID:", error);
        }
      }

      const profilePictureUploadResult = await uploadToCloudinary(
        req.files.profilePicture[0],
        "profilePicture",
        existingPublicId
      );
      updates.profilePicture = profilePictureUploadResult.url;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    res.status(201).json({
      success: true,
      message: "User updated successfully",
      updatedUser: updatedUser,
    });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @description Controller for user logout
 * @route POST /api/user/logout
 * @access Public
 */
exports.logoutUser = async (req, res, next) => {
  try {
    if (req.user && req.user.id) {
      await User.findByIdAndUpdate(req.user.id, {
        $set: { sessionId: generateSecureToken() },
      });
    }

    res.clearCookie("accessToken", {
      httpOnly: true,
      sameSite: "strict",
    });

    res.status(201).json({
      success: true,
      message: "Logout Successfully!",
    });
  } catch (err) {
    console.error("Error Logging Out:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @description Controller to handle forgot password - sending reset link to email
 * @route POST /api/user/forgot-password
 * @access Public
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account with that email exists, a password reset link has been sent",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000;

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetTokenExpiry;
    await user.save();

    const emailSent = await sendPasswordResetEmail(email, resetToken);

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
 * @route POST /api/user/reset-password/:token
 * @access Public
 */
exports.resetPasswordWithToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      });
    }

    const user = await User.findOne({
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
 * @route GET /api/user/verify-reset-token/:token
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

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
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
