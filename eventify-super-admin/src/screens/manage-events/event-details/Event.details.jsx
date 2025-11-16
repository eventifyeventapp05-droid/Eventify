import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Loader from "../../../utilities/Loader/Loader.utility";
import "./Event.details.css";
import "../../../styles/global.styles.css";

const EventDetails = () => {
  const location = useLocation();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log("EVENTSS", event);

  useEffect(() => {
    setTimeout(() => {
      setEvent(location.state?.event || null);
      setLoading(false);
    }, 1000);
  }, [location.state]);

  const getStatusColor = (status) => {
    switch (status) {
      case "DRAFT":
        return "#FFA500"; // Orange
      case "PUBLISHED":
        return "#4169E1"; // Royal Blue
      case "CANCELLED":
        return "#FF0000"; // Red
      case "COMPLETED":
        return "#4CAF50"; // Green
      default:
        return "#808080";
    }
  };

  if (loading) {
    return (
      <div
        className="loader-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <Loader />
      </div>
    );
  }

  if (!event) {
    return <div className="not-found">No Event Found</div>;
  }

  return (
    <section id="event-detail">
      <div className="scroll-container">
        <h2 className="event-title">Event Details</h2>

        <div className="content-container">
          {/* Event Image Section */}
          <div className="event-image-container">
            <img
              src={
                event?.eventImage?.find((img) => img.isPrimary)?.url ||
                event?.eventImage?.[0]?.url ||
                "/default-event.png"
              }
              alt={event.title}
              className="event-image"
              onError={(e) => (e.target.src = "/default-event.png")}
            />
          </div>

          {/* Event Info Section */}
          <div className="details-container">
            <div className="details-table">
              <div className="detail-row">
                <div className="detail-label">Event ID</div>
                <div className="detail-value">
                  #{event._id.substring(18, 24).toUpperCase()}
                </div>
                <div className="detail-label">Status</div>
                <div className="detail-value">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(event.status) }}
                  >
                    {event.status}
                  </span>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Title</div>
                <div className="detail-value">{event.title}</div>
                <div className="detail-label">Category</div>
                <div className="detail-value">{event.category}</div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Description</div>
                <div className="detail-value">{event.description}</div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Type</div>
                <div className="detail-value">{event.type}</div>
                <div className="detail-label">Featured</div>
                <div className="detail-value">
                  {event.isFeatured ? "Yes" : "No"}
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Start Date</div>
                <div className="detail-value">
                  {new Date(event.dateTime.start).toLocaleString()}
                </div>
                <div className="detail-label">End Date</div>
                <div className="detail-value">
                  {new Date(event.dateTime.end).toLocaleString()}
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Venue</div>
                <div className="detail-value">
                  {event.venue?.name}, {event.venue?.address},{" "}
                  {event.venue?.city}
                </div>

                <div className="detail-label">Max Attendees</div>
                <div className="detail-value">
                  {event.ticketConfig?.maxAttendees}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Information Section */}
        <div className="event-tickets-container">
          <h3 className="event-tickets-title">Ticket Details</h3>
          <div className="tickets-table">
            <div className="tickets-header">
              <div className="header-cell">Ticket Type</div>
              <div className="header-cell">Price (PKR)</div>
              <div className="header-cell">Available Quantity</div>
              <div className="header-cell">Sold</div>
            </div>

            {event.ticketConfig?.ticketTypes?.map((ticket, index) => (
              <div className="ticket-row" key={index}>
                <div className="ticket-cell">{ticket.name.trim()}</div>
                <div className="ticket-cell">{ticket.price}</div>
                <div className="ticket-cell">{ticket.quantity}</div>
                <div className="ticket-cell">{ticket.sold}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 🔹 Organizer Information Section - Horizontal Table Layout */}
        <div className="organizer-details-container">
          <h3 className="organizer-title">Organizer Details</h3>
          <div className="organizer-table">
            <div className="organizer-header">
              <div className="organizer-header-cell">Profile Picture</div>
              <div className="organizer-header-cell">Profile Picture</div>
              <div className="organizer-header-cell">Organizer Name</div>
              <div className="organizer-header-cell">Email</div>
              <div className="organizer-header-cell">Services</div>
            </div>

            <div className="organizer-row">
                <div className="organizer-cell organizer-profile-picture">
                #{event.organizer?._id.substring(18, 24).toUpperCase()}
              </div>
              <div className="organizer-cell organizer-profile-picture">
                <img
                  src={
                    event.organizer?.profilePicture ||
                    event.organizer?.organizerProfile?.profilePicture ||
                    "/default-avatar.png"
                  }
                  alt={event.organizer?.userName || "Organizer"}
                  className="organizer-avatar"
                  onError={(e) => (e.target.src = "/default-avatar.png")}
                />
              </div>
              <div className="organizer-cell organizer-name">
                {event.organizer?.userName || "N/A"}
              </div>
              <div className="organizer-cell organizer-email">
                {event.organizer?.email || "N/A"}
              </div>
              <div className="organizer-cell organizer-services">
                {event.organizer?.organizerProfile?.services?.length > 0
                  ? event.organizer.organizerProfile.services.join(", ")
                  : "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* 🔹 User Information Section - Horizontal Table Layout */}
        <div className="organizer-details-container">
          <h3 className="organizer-title">Event Creator Details</h3>
          <div className="organizer-table">
            <div className="organizer-header">
              <div className="organizer-header-cell">UID</div>
              <div className="organizer-header-cell">Profile Picture</div>
              <div className="organizer-header-cell">User Name</div>
              <div className="organizer-header-cell">Email</div>
            </div>

            <div className="organizer-row">
              <div className="organizer-cell organizer-profile-picture">
                #{event.bookedBy?.user?._id.substring(18, 24).toUpperCase()}
              </div>
              <div className="organizer-cell organizer-profile-picture">
                <img
                  src={
                    event.bookedBy?.user?.profilePicture ||
                    event.bookedBy?.user?.profilePicture ||
                    "/default-avatar.png"
                  }
                  alt={event.bookedBy?.user?.userName || "User"}
                  className="organizer-avatar"
                  onError={(e) => (e.target.src = "/default-avatar.png")}
                />
              </div>
              <div className="organizer-cell organizer-name">
                {event.bookedBy?.user?.userName || "N/A"}
              </div>
              <div className="organizer-cell organizer-email">
                {event.bookedBy?.user?.email || "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventDetails;
