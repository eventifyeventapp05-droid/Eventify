import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Loader from "../../../utilities/Loader/Loader.utility";
import "./User.details.css";
import "../../../styles/global.styles.css";

const UserDetails = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log("USERRR", user);

  useEffect(() => {
    setTimeout(() => {
      setUser(location.state?.user || null);
      setLoading(false);
    }, 1000);
  }, [location.state]);

  const getRoleColor = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "#FF6B35";
      case "ADMIN":
        return "#4169E1";
      case "ORGANIZER":
        return "#4CAF50";
      case "USER":
        return "#6A5ACD";
      default:
        return "#808080";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const formatEmail = (email) => email || "N/A";

  if (loading) {
    return (
      <div className="loader-container">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return <div className="not-found">No User Found</div>;
  }

  return (
    <section id="user-detail">
      <div className="scroll-container">
        <h2 className="user-title">User Details</h2>

        {/* Profile & Info */}
        <div className="content-container">
          <div className="user-image-container">
            <img
              src={user?.profilePicture || "/default-avatar.png"}
              alt={user.userName}
              className="user-image"
              onError={(e) => (e.target.src = "/default-avatar.png")}
            />
          </div>

          <div className="details-container">
            <div className="details-table">
              <div className="detail-row">
                <div className="detail-label">User ID</div>
                <div className="detail-value">
                  #{user._id.substring(18, 24).toUpperCase()}
                </div>
                <div className="detail-label">Role</div>
                <div className="detail-value">
                  <span
                    className="role-badge"
                    style={{ backgroundColor: getRoleColor(user.role) }}
                  >
                    {user.role}
                  </span>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Username</div>
                <div className="detail-value">{user.userName}</div>
                <div className="detail-label">Email</div>
                <div className="detail-value user-email">
                  {formatEmail(user.email)}
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Account Created</div>
                <div className="detail-value">{formatDate(user.createdAt)}</div>
                <div className="detail-label">Last Login</div>
                <div className="detail-value">{formatDate(user.lastLogin)}</div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Account Status</div>
                <div className="detail-value">
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: user.lockUntil ? "#FF0000" : "#4CAF50",
                    }}
                  >
                    {user.lockUntil ? "Locked" : "Active"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booked Events */}
        <div className="user-events-container">
          <h3 className="user-events-title">Booked Events</h3>
          <div className="events-table">
            <div className="events-header">
              <div className="header-cell">Event</div>
              <div className="header-cell">Date</div>
              <div className="header-cell">Venue</div>
              <div className="header-cell">Ticket Type</div>
              <div className="header-cell">Quantity</div>
              <div className="header-cell">Booking Status</div>
            </div>

            {user.bookedEvents?.length > 0 ? (
              user.bookedEvents.map((booking, index) => {
                const event = booking.eventId;
                return (
                  <div key={index} className="events-row">
                    <div className="events-cell">
                      {event?.title || `Event ${index + 1}`}
                    </div>
                    <div className="events-cell">
                      {event?.dateTime?.start
                        ? new Date(event.dateTime.start).toLocaleDateString()
                        : "N/A"}
                    </div>
                    <div className="events-cell">
                      {event?.venue?.name || "N/A"}
                    </div>
                    <div className="events-cell">
                      {booking.ticketType || "N/A"}
                    </div>
                    <div className="events-cell">{booking.quantity || 0}</div>
                    <div className="events-cell">
                      {booking.bookingStatus || "N/A"}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="events-row">
                <div className="events-cell" colSpan="6">
                  <span className="no-data">No booked events</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Organized Events - Events Created by User */}
        <div className="user-events-container">
          <h3 className="user-events-title">Created Events</h3>
          <div className="events-table">
            <div className="events-header">
              <div className="header-cell">Event</div>
              <div className="header-cell">Date</div>
              <div className="header-cell">Venue</div>
              <div className="header-cell">Ticket Types</div>
              <div className="header-cell">Total Capacity</div>
            </div>

            {user.organizedEvents?.length > 0 ? (
              user.organizedEvents.map((organizerEvent, index) => {
                const event = organizerEvent.eventId;

                // Calculate total tickets and ticket types
                const totalTickets =
                  event?.ticketConfig?.ticketTypes?.reduce(
                    (sum, ticket) => sum + ticket.quantity,
                    0
                  ) || 0;

                const ticketTypes =
                  event?.ticketConfig?.ticketTypes
                    ?.map((t) => `${t.name} (${t.quantity})`)
                    .join(", ") || "No tickets";

                return (
                  <div key={event?._id || index} className="events-row">
                    <div className="events-cell">
                      {event?.title || `Event ${index + 1}`}
                    </div>
                    <div className="events-cell">
                      {event?.dateTime?.start
                        ? new Date(event.dateTime.start).toLocaleDateString()
                        : "Date not set"}
                    </div>
                    <div className="events-cell">
                      {event?.venue?.name || "Venue not set"}
                    </div>
                    <div className="events-cell">{ticketTypes}</div>
                    <div className="events-cell">
                      {totalTickets.toLocaleString()}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="events-row">
                <div className="events-cell" colSpan="6">
                  <span className="no-data">No events created yet</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserDetails;
