import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Loader from "../../../utilities/Loader/Loader.utility";
import "./Booking.details.css";
import "../../../styles/global.styles.css";

const BookingDetails = () => {
  const location = useLocation();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setBooking(location.state?.booking || null);
      setLoading(false);
    }, 1000);
  }, [location.state]);

  const getStatusColor = (status, type) => {
    if (type === "booking") {
      switch (status) {
        case "PENDING":
          return "#FFA500";
        case "CONFIRMED":
          return "#4169E1";
        case "CANCELLED":
          return "#FF0000";
        case "COMPLETED":
          return "#4CAF50";
        default:
          return "#808080";
      }
    } else if (type === "payment") {
      switch (status) {
        case "PENDING":
          return "#FFA500";
        case "PAID":
          return "#4CAF50";
        case "FAILED":
          return "#FF0000";
        default:
          return "#808080";
      }
    }
    return "#808080";
  };

  if (loading)
    return (
      <div className="loader-container">
        <Loader />
      </div>
    );
  if (!booking) return <div className="not-found">No Booking Found</div>;

  return (
    <section id="booking-detail">
      <div className="scroll-container">
        <h2 className="booking-title">Booking Details</h2>

        {/* ------------------ Booking Info Section ------------------ */}
        <div className="section-container">
          <h3 className="section-title">Booking Info</h3>
          <div className="details-table">
            <div className="detail-row">
              <div className="detail-label">Booking ID</div>
              <div className="detail-value">
                #{booking._id.slice(-6).toUpperCase()}
              </div>
              <div className="detail-label">Booking Status</div>
              <div className="detail-value">
                <span
                  className="status-badge"
                  style={{
                    backgroundColor: getStatusColor(
                      booking.bookingStatus,
                      "booking"
                    ),
                  }}
                >
                  {booking.bookingStatus}
                </span>
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Payment Status</div>
              <div className="detail-value">
                <span
                  className="status-badge"
                  style={{
                    backgroundColor: getStatusColor(
                      booking.paymentStatus,
                      "payment"
                    ),
                  }}
                >
                  {booking.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------ User Details Section ------------------ */}
        <div className="section-container">
          <h3 className="section-title">User Details</h3>
          <div className="details-table">
            <div className="detail-row">
              <div className="detail-label">User ID</div>
              <div className="detail-value">
                #{booking.user?._id.slice(-6).toUpperCase() || "N/A"}
              </div>
              <div className="detail-label">User Name</div>
              <div className="detail-value">
                {booking.user?.userName || "N/A"}
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Email</div>
              <div className="detail-value">{booking.user?.email || "N/A"}</div>
            </div>
          </div>
        </div>

        {/* ------------------ Event Details Section ------------------ */}
        <div className="section-container">
          <h3 className="section-title">Event Details</h3>
          <div className="details-table">
            <div className="detail-row">
              <div className="detail-label">Event ID</div>
              <div className="detail-value">
                #{booking.event?._id.slice(-6).toUpperCase() || "N/A"}
              </div>
              <div className="detail-label">Event Title</div>
              <div className="detail-value">
                {booking.event?.title || "N/A"}
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Venue</div>
              <div className="detail-value">
                {booking.event?.venue?.name}, {booking.event?.venue?.address},{" "}
                {booking.event?.venue?.city}
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Start Date</div>
              <div className="detail-value">
                {new Date(booking.event?.dateTime?.start).toLocaleString()}
              </div>
              <div className="detail-label">End Date</div>
              <div className="detail-value">
                {new Date(booking.event?.dateTime?.end).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* ------------------ Ticket Details Section ------------------ */}
        <div className="section-container">
          <h3 className="section-title">Ticket Details</h3>
          <div className="details-table">
            <div className="detail-row">
              <div className="detail-label">Ticket Type</div>
              <div className="detail-value">{booking.ticketType || "N/A"}</div>
              <div className="detail-label">Quantity</div>
              <div className="detail-value">{booking.quantity}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Total Price</div>
              <div className="detail-value">{booking.totalPrice} PKR</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Payment Gateway</div>
              <div className="detail-value">
                {booking.meta?.mockPaymentGateway || "N/A"}
              </div>
              <div className="detail-label">Payment ID</div>
              <div className="detail-value">
                {booking.meta?.mockPaymentId || "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingDetails;
