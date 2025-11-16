const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const getFrontendUrl = (role) => {
  if (role === "SUPERADMIN") return process.env.FRONTEND_SUPERADMIN_URL;
  if (role === "ORGANIZER") return process.env.FRONTEND_ORGANIZER_URL;
  return process.env.FRONTEND_URL; // fallback
};

/**
 * @function sendEmail
 * @description Sends an email using the configured transporter.
 */
const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"EVENTIFY" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error("Failed to send email:", err.message);
    return false;
  }
};

/**
 * @function getEmailTemplate
 * @description Generates a professional HTML email template with a header, body, and footer.
 */
const getEmailTemplate = (content, title = "") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', 'Segoe UI', Arial, sans-serif; background-color: #f5f7fa; color: #2d3748;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f7fa;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; background: #ffffff; border-radius: 14px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: #8E0400; border-bottom: 1px solid #f0f0f0; text-align: center; padding: 32px 20px;">
              <img src="https://res.cloudinary.com/dd524q9vc/image/upload/v1762770676/Eventify/logo/logo_cxqnt4.png" alt="EVENTIFY" style="width: 120px; height: auto; margin-bottom: 8px;" />
              <h1 style="font-size: 22px; font-weight: 700; color: #1a202c; letter-spacing: 0.5px; margin: 10px 0 0 0;">EVENTIFY</h1>
              <p style="color: #718096; font-size: 14px; margin: 6px 0 0 0;">Your trusted event management companion</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #edf2f7;">
              <p style="margin: 0; color: #718096; font-size: 13px; line-height: 1.6;">
                &copy; ${new Date().getFullYear()} EVENTIFY. All rights reserved.<br>
                <span style="font-size: 12px; color: #a0aec0;">
                  You received this email as part of your EVENTIFY account activity.<br>
                  If you didn’t expect this email, please contact support immediately.
                </span>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * @function getOtpEmail
 * @description Generates a styled OTP (One-Time Password) email using the common template.
 */
exports.sendOTPEmail = async (toEmail, otp) => {
  const content = `
    <div style="text-align: center;">
        <h2 style="color: #2d3748; font-size: 24px; margin-bottom: 20px; font-weight: 600;">Secure Verification Code</h2>
        <p style="color: #4a5568; line-height: 1.6; margin-bottom: 25px;">
            For your security, we require verification to complete this action. Please use the following One-Time Password (OTP) to proceed:
        </p>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin: 25px 0; display: inline-block;">
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center;">${otp}</div>
        </div>
        
        <p style="color: #e53e3e; font-size: 14px; margin: 20px 0;">
            ⚠️ This code will expire in 5 minutes. Do not share it with anyone.
        </p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 25px;">
            <p style="margin: 0; color: #6c757d; font-size: 13px;">
                If you did not request this verification, please immediately secure your account by changing your password and contact our support team.
            </p>
        </div>
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject: "Your EVENTIFY Verification Code",
    html: getEmailTemplate(content, "Secure Verification"),
  });
};

/**
 * @function getPasswordResetEmail
 * @description Generates the email template for password reset instructions.
 */
exports.sendPasswordResetEmail = async (toEmail, resetToken, role) => {
  const frontendUrl = getFrontendUrl(role);
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

  const content = `
    <div style="text-align:center;">
      <h2 style="color:#2d3748;font-size:24px;margin-bottom:20px;font-weight:600;">Password Reset Request</h2>
      <p style="color:#4a5568;line-height:1.6;margin-bottom:25px;">
        Click the button below to reset your password:
      </p>
      <div style="margin:30px 0;">
        <a href="${resetLink}" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:16px 32px;text-decoration:none;border-radius:8px;font-weight:600;display:inline-block;font-size:16px;">
          Reset My Password
        </a>
      </div>
      <p style="color:#718096;font-size:14px;margin:20px 0;">This link is valid for 1 hour. If you did not request a password reset, please ignore this email.</p>
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject: "Reset Your EVENTIFY Password",
    html: getEmailTemplate(content, "Password Reset"),
  });
};

/**
 * @function sendEventCreatedEmail
 * @description Sends email notification when a new event is created
 */
exports.sendEventCreatedEmail = async (toEmail, event, creatorName) => {
  const eventDate = new Date(event.dateTime.start).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const eventEndDate = new Date(event.dateTime.end).toLocaleDateString(
    "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  // Get primary image if exists
  const primaryImage =
    event.eventImage.find((img) => img.isPrimary) || event.eventImage[0];
  const imageHtml = primaryImage
    ? `
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="${primaryImage.url}" alt="${event.title}" style="max-width: 100%; height: auto; border-radius: 8px; max-height: 200px; object-fit: cover;">
    </div>
  `
    : "";

  // Ticket configuration info
  const ticketInfo =
    event.ticketConfig &&
    event.ticketConfig.ticketTypes &&
    event.ticketConfig.ticketTypes.length > 0
      ? `
    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <h4 style="color: #2d3748; margin: 0 0 10px 0; font-weight: 600;">Ticket Information</h4>
      ${event.ticketConfig.ticketTypes
        .map(
          (ticket) => `
        <p style="margin: 5px 0; color: #4a5568;">
          <strong>${ticket.name}:</strong> $${ticket.price} (${ticket.quantity - ticket.sold} available)
        </p>
      `
        )
        .join("")}
      ${
        event.ticketConfig.isRegistrationRequired
          ? '<p style="margin: 5px 0; color: #667eea; font-weight: 600;">✓ Registration Required</p>'
          : '<p style="margin: 5px 0; color: #667eea; font-weight: 600;">✓ Open Attendance</p>'
      }
    </div>
  `
      : `
    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <p style="margin: 0; color: #4a5568; text-align: center;">
        ${
          event.ticketConfig.isRegistrationRequired
            ? "Registration required for this event"
            : "Open attendance - no registration required"
        }
      </p>
    </div>
  `;

  const content = `
    <div style="text-align: center;">
        <h2 style="color: #2d3748; font-size: 24px; margin-bottom: 20px; font-weight: 600;">🎉 Event Created Successfully!</h2>
        
        <div style="background: linear-gradient(135deg, #f0f4ff 0%, #e6e9ff 100%); padding: 20px; border-radius: 12px; margin-bottom: 25px;">
            <p style="color: #667eea; font-size: 18px; margin: 0; font-weight: 500;">
                "${event.title}" has been created successfully!
            </p>
        </div>

        ${imageHtml}
        
        <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: left;">
            <h3 style="color: #2d3748; margin: 0 0 15px 0; font-weight: 600;">Event Details</h3>
            
            <table width="100%" style="border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 120px;">Title</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.title}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Description</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.description}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Category</td>
                    <td style="padding: 8px 0; color: #2d3748;">
                        <span style="background: #667eea; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                            ${event.category}
                        </span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Type</td>
                    <td style="padding: 8px 0; color: #2d3748;">
                        <span style="background: #764ba2; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                            ${event.type}
                        </span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Date & Time</td>
                    <td style="padding: 8px 0; color: #2d3748;">
                        ${eventDate}<br>
                        <small style="color: #6c757d;">Ends at ${eventEndDate}</small>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Venue</td>
                    <td style="padding: 8px 0; color: #2d3748;">
                        <strong>${event.venue.name}</strong><br>
                        ${event.venue.address}, ${event.venue.city}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Status</td>
                    <td style="padding: 8px 0;">
                        <span style="color: ${
                          event.status === "PUBLISHED"
                            ? "#52c41a"
                            : event.status === "DRAFT"
                              ? "#fa8c16"
                              : event.status === "CANCELLED"
                                ? "#f5222d"
                                : "#1890ff"
                        }; font-weight: 600;">
                          ${event.status}
                        </span>
                    </td>
                </tr>
                ${
                  event.isFeatured
                    ? `
                <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Featured</td>
                    <td style="padding: 8px 0; color: #52c41a; font-weight: 600;">⭐ Yes</td>
                </tr>
                `
                    : ""
                }
            </table>
        </div>

        ${ticketInfo}                             
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject: `Event Created: ${event.title}`,
    html: getEmailTemplate(content, "Event Created Successfully"),
  });
};

/**
 * @function sendEventStatusUpdatedEmail
 * @description Sends email notification when an event status is updated
 */
exports.sendEventStatusUpdatedEmail = async (
  toEmail,
  event,
  updatedBy,
  previousStatus
) => {
  const statusColors = {
    PUBLISHED: "#52c41a",
    CANCELLED: "#f5222d",
    COMPLETED: "#1890ff",
    DRAFT: "#fa8c16",
  };

  const content = `
    <div style="text-align: center;">
      <h2 style="color: #2d3748; font-size: 24px; margin-bottom: 20px; font-weight: 600;">📢 Event Status Updated</h2>
      
      <p style="color: #4a5568; line-height: 1.6; margin-bottom: 25px;">
        The status of your event <strong>"${event.title}"</strong> has been updated.
      </p>

      <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 25px; display: inline-block; text-align: left;">
        <p style="margin: 0 0 10px 0; font-weight: 500; color: #2d3748;">Previous Status:
          <span style="color: ${statusColors[previousStatus] || "#718096"}; font-weight: 600;">${previousStatus}</span>
        </p>
        <p style="margin: 0 0 10px 0; font-weight: 500; color: #2d3748;">New Status:
          <span style="color: ${statusColors[event.status] || "#718096"}; font-weight: 600;">${event.status}</span>
        </p>
        ${
          event.status === "CANCELLED" && event.suspensionReason
            ? `<p style="margin: 5px 0 0 0; color: #e53e3e; font-size: 14px;">Reason: ${event.suspensionReason}</p>`
            : ""
        }
      </div>      

      <div style="margin-top: 25px; color: #6c757d; font-size: 13px;">
        <p style="margin: 0;">Updated by: ${updatedBy}</p>
        <p style="margin: 0;">Event ID: ${event._id}</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject: `Event Status Updated: ${event.title}`,
    html: getEmailTemplate(content, "Event Status Updated"),
  });
};

/**
 * @function sendTicketBookingEmail
 * @description Sends email notification to user when a ticket is booked successfully
 */
exports.sendTicketBookingEmail = async (toEmail, booking, event, user) => {
  const bookingDate = new Date(booking.createdAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const eventDate = new Date(event.dateTime.start).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Get primary image if exists
  const primaryImage =
    event.eventImage.find((img) => img.isPrimary) || event.eventImage[0];
  const imageHtml = primaryImage
    ? `
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="${primaryImage.url}" alt="${event.title}" style="max-width: 100%; height: auto; border-radius: 8px; max-height: 200px; object-fit: cover;">
    </div>
  `
    : "";

  // Status badges with colors
  const statusBadge = (status) => {
    const statusConfig = {
      PENDING: { color: "#fa8c16", bg: "#fff7e6" },
      CONFIRMED: { color: "#52c41a", bg: "#f6ffed" },
      CANCELLED: { color: "#f5222d", bg: "#fff2f0" },
      REFUNDED: { color: "#1890ff", bg: "#f0f8ff" },
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    return `<span style="background: ${config.bg}; color: ${config.color}; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; border: 1px solid ${config.color}20;">${status}</span>`;
  };

  const content = `
    <div style="text-align: center;">
      <h2 style="color: #2d3748; font-size: 24px; margin-bottom: 20px; font-weight: 600;">🎫 Ticket Booking Confirmation</h2>
      
      <div style="background: linear-gradient(135deg, #f0f4ff 0%, #e6e9ff 100%); padding: 20px; border-radius: 12px; margin-bottom: 25px;">
        <p style="color: #667eea; font-size: 18px; margin: 0; font-weight: 500;">
          Your ticket booking for "${event.title}" has been received!
        </p>
      </div>

      ${imageHtml}
      
      <!-- Booking Summary -->
      <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: left;">
        <h3 style="color: #2d3748; margin: 0 0 15px 0; font-weight: 600;">Booking Summary</h3>
        
        <table width="100%" style="border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 140px;">Booking ID</td>
            <td style="padding: 8px 0; color: #2d3748; font-family: monospace;">${booking._id}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Booking Date</td>
            <td style="padding: 8px 0; color: #2d3748;">${bookingDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Booking Status</td>
            <td style="padding: 8px 0; color: #2d3748;">${statusBadge(booking.bookingStatus)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Payment Status</td>
            <td style="padding: 8px 0; color: #2d3748;">${statusBadge(booking.paymentStatus)}</td>
          </tr>
        </table>
      </div>

      <!-- Event Details -->
      <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: left;">
        <h3 style="color: #2d3748; margin: 0 0 15px 0; font-weight: 600;">Event Details</h3>
        
        <table width="100%" style="border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 140px;">Event</td>
            <td style="padding: 8px 0; color: #2d3748; font-weight: 600;">${event.title}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Date & Time</td>
            <td style="padding: 8px 0; color: #2d3748;">${eventDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Venue</td>
            <td style="padding: 8px 0; color: #2d3748;">
              <strong>${event.venue.name}</strong><br>
              ${event.venue.address}, ${event.venue.city}
            </td>
          </tr>
        </table>
      </div>

      <!-- Ticket Details -->
      <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: left;">
        <h3 style="color: #2d3748; margin: 0 0 15px 0; font-weight: 600;">Ticket Details</h3>
        
        <table width="100%" style="border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 140px;">Ticket Type</td>
            <td style="padding: 8px 0; color: #2d3748;">
              <span style="background: #667eea; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                ${booking.ticketType}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Quantity</td>
            <td style="padding: 8px 0; color: #2d3748; font-weight: 600;">${booking.quantity} ticket(s)</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Total Amount</td>
            <td style="padding: 8px 0; color: #2d3748; font-size: 18px; font-weight: 700; color: #52c41a;">
              $${booking.totalPrice}
            </td>
          </tr>
        </table>
      </div>

      <!-- Next Steps -->
      <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h4 style="color: #2d3748; margin: 0 0 15px 0; font-weight: 600;">📋 Next Steps</h4>
        <ul style="text-align: left; color: #4a5568; margin: 0; padding-left: 20px;">
          <li>Complete your payment to confirm the booking</li>
          <li>You will receive another email with QR codes once payment is confirmed</li>
          <li>Bring your QR code(s) to the event for entry</li>
          <li>Keep this booking ID for reference: <strong>${booking._id}</strong></li>
        </ul>
      </div>

      <!-- Action Buttons -->      
      <!-- Important Notes -->
      <div style="background: #fff2e8; border: 1px solid #ffbb96; border-radius: 8px; padding: 15px; margin-top: 20px;">
        <p style="margin: 0; color: #d46b08; font-size: 13px; text-align: left;">
          <strong>⚠️ Important:</strong> This booking is not confirmed until payment is completed. 
          Your tickets will be reserved for 30 minutes pending payment. 
          If payment is not received within this time, your booking may be cancelled.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject: `Booking Confirmation: ${event.title}`,
    html: getEmailTemplate(content, "Ticket Booking Confirmation"),
  });
};

/**
 * @function sendBookingStatusUpdateEmail
 * @description Sends email notification when booking status is updated by admin
 */
exports.sendBookingStatusUpdateEmail = async (
  toEmail,
  booking,
  event,
  user,
  updates,
  updatedBy
) => {
  const updateDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const eventDate = new Date(event.dateTime.start).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Status badges with colors
  const statusBadge = (status, type) => {
    const statusConfig = {
      PENDING: { color: "#fa8c16", bg: "#fff7e6" },
      CONFIRMED: { color: "#52c41a", bg: "#f6ffed" },
      CANCELLED: { color: "#f5222d", bg: "#fff2f0" },
      REFUNDED: { color: "#1890ff", bg: "#f0f8ff" },
      PAID: { color: "#52c41a", bg: "#f6ffed" },
      FAILED: { color: "#f5222d", bg: "#fff2f0" },
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    return `<span style="background: ${config.bg}; color: ${config.color}; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; border: 1px solid ${config.color}20;">${status}</span>`;
  };

  // Generate update summary
  const getUpdateSummary = () => {
    let summary = "";
    if (updates.bookingStatus) {
      summary += `
        <tr>
          <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 140px;">Booking Status</td>
          <td style="padding: 8px 0; color: #2d3748;">
            <span style="color: #fa8c16;">${updates.previousBookingStatus}</span> 
            → 
            ${statusBadge(updates.bookingStatus)}
          </td>
        </tr>
      `;
    }
    if (updates.paymentStatus) {
      summary += `
        <tr>
          <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 140px;">Payment Status</td>
          <td style="padding: 8px 0; color: #2d3748;">
            <span style="color: #fa8c16;">${updates.previousPaymentStatus}</span> 
            → 
            ${statusBadge(updates.paymentStatus)}
          </td>
        </tr>
      `;
    }
    return summary;
  };

  // Get appropriate message based on status changes
  const getStatusMessage = () => {
    if (
      updates.bookingStatus === "CONFIRMED" &&
      updates.paymentStatus === "PAID"
    ) {
      return {
        title: "🎉 Booking Confirmed!",
        message:
          "Your booking has been confirmed and payment processed successfully. Your tickets are now active!",
        bgColor: "linear-gradient(135deg, #f0f4ff 0%, #e6e9ff 100%)",
        textColor: "#667eea",
      };
    } else if (updates.bookingStatus === "CANCELLED") {
      return {
        title: "❌ Booking Cancelled",
        message:
          "Your booking has been cancelled. If payment was made, refund will be processed according to our policy.",
        bgColor: "linear-gradient(135deg, #fff2f0 0%, #ffe6e6 100%)",
        textColor: "#f5222d",
      };
    } else if (updates.paymentStatus === "REFUNDED") {
      return {
        title: "💰 Refund Processed",
        message:
          "Your refund has been processed successfully. The amount will be credited to your account within 5-7 business days.",
        bgColor: "linear-gradient(135deg, #f0f8ff 0%, #e6f7ff 100%)",
        textColor: "#1890ff",
      };
    } else if (updates.paymentStatus === "FAILED") {
      return {
        title: "⚠️ Payment Failed",
        message:
          "We encountered an issue with your payment. Please update your payment method to confirm your booking.",
        bgColor: "linear-gradient(135deg, #fff7e6 0%, #fff2cc 100%)",
        textColor: "#fa8c16",
      };
    } else {
      return {
        title: "📋 Booking Status Updated",
        message:
          "Your booking status has been updated. Please review the changes below.",
        bgColor: "linear-gradient(135deg, #f0f4ff 0%, #e6e9ff 100%)",
        textColor: "#667eea",
      };
    }
  };

  const statusMessage = getStatusMessage();

  const content = `
    <div style="text-align: center;">
      <h2 style="color: #2d3748; font-size: 24px; margin-bottom: 20px; font-weight: 600;">${statusMessage.title}</h2>
      
      <div style="background: ${statusMessage.bgColor}; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
        <p style="color: ${statusMessage.textColor}; font-size: 18px; margin: 0; font-weight: 500;">
          ${statusMessage.message}
        </p>
      </div>

      <!-- Update Summary -->
      <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: left;">
        <h3 style="color: #2d3748; margin: 0 0 15px 0; font-weight: 600;">Status Update Summary</h3>
        
        <table width="100%" style="border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 140px;">Booking ID</td>
            <td style="padding: 8px 0; color: #2d3748; font-family: monospace;">${booking._id}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Updated On</td>
            <td style="padding: 8px 0; color: #2d3748;">${updateDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Updated By</td>
            <td style="padding: 8px 0; color: #2d3748;">${updatedBy}</td>
          </tr>
          ${getUpdateSummary()}
          ${
            updates.reason
              ? `
            <tr>
              <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Reason</td>
              <td style="padding: 8px 0; color: #2d3748;">${updates.reason}</td>
            </tr>
          `
              : ""
          }
          ${
            updates.notes
              ? `
            <tr>
              <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Admin Notes</td>
              <td style="padding: 8px 0; color: #2d3748;">${updates.notes}</td>
            </tr>
          `
              : ""
          }
        </table>
      </div>

      <!-- Event Details -->
      <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: left;">
        <h3 style="color: #2d3748; margin: 0 0 15px 0; font-weight: 600;">Event Details</h3>
        
        <table width="100%" style="border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 140px;">Event</td>
            <td style="padding: 8px 0; color: #2d3748; font-weight: 600;">${event.title}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Date & Time</td>
            <td style="padding: 8px 0; color: #2d3748;">${eventDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Venue</td>
            <td style="padding: 8px 0; color: #2d3748;">
              <strong>${event.venue.name}</strong><br>
              ${event.venue.address}, ${event.venue.city}
            </td>
          </tr>
        </table>
      </div>

      <!-- Ticket Details -->
      <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: left;">
        <h3 style="color: #2d3748; margin: 0 0 15px 0; font-weight: 600;">Ticket Details</h3>
        
        <table width="100%" style="border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 140px;">Ticket Type</td>
            <td style="padding: 8px 0; color: #2d3748;">
              <span style="background: #667eea; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                ${booking.ticketType}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Quantity</td>
            <td style="padding: 8px 0; color: #2d3748; font-weight: 600;">${booking.quantity} ticket(s)</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Total Amount</td>
            <td style="padding: 8px 0; color: #2d3748; font-size: 18px; font-weight: 700; color: #52c41a;">
              $${booking.totalPrice}
            </td>
          </tr>
        </table>
      </div>     

      <!-- Support Information -->
      ${
        updates.bookingStatus === "CANCELLED" ||
        updates.paymentStatus === "FAILED"
          ? `
        <div style="background: #fff2e8; border: 1px solid #ffbb96; border-radius: 8px; padding: 15px; margin-top: 20px;">
          <p style="margin: 0; color: #d46b08; font-size: 13px; text-align: left;">
            <strong>📞 Need Help?</strong> If you have any questions about this update, please contact our support team at 
            <a href="mailto:support@eventify.com" style="color: #d46b08; font-weight: 600;">support@eventify.com</a> 
            or call us at +1 (555) 123-4567.
          </p>
        </div>
      `
          : ""
      }
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject: `Booking Update: ${event.title} - ${statusMessage.title}`,
    html: getEmailTemplate(content, "Booking Status Update"),
  });
};
