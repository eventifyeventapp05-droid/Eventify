import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./Update.event.css";
import InputField from "../../../utilities/InputField/InputField.utility";
import Button from "../../../utilities/Button/Button.utility";
import {
  validateTitle,
  validateDescription,
} from "../../../utilities/Validations/Validation.utility";
import { updateEvent } from "../../../redux/slices/event.slice";
import { getOrganizers } from "../../../redux/slices/organizer.slice";
import { toast } from "react-hot-toast";

const UpdateEvent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { organizers } = useSelector((state) => state.organizers);
  const originalEvent = location.state?.event || {};

  const imageInputRef = useRef(null);
  const [activeSection, setActiveSection] = useState(0);
  const [loading, setLoading] = useState(false);

  // Helper to format ISO date strings for datetime-local input
  const formatDateTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Prefill values from event
  const [title, setTitle] = useState(originalEvent.title || "");
  const [description, setDescription] = useState(
    originalEvent.description || ""
  );
  const [category, setCategory] = useState(originalEvent.category || "");
  const [type, setType] = useState(originalEvent.type || "");
  const [organizerId, setOrganizerId] = useState(
    originalEvent.organizer?._id || ""
  );
  const [venue, setVenue] = useState(
    originalEvent.venue || { name: "", address: "", city: "" }
  );
  const [dateTime, setDateTime] = useState({
    start: formatDateTime(originalEvent.dateTime?.start),
    end: formatDateTime(originalEvent.dateTime?.end),
  });

  const [ticketConfig, setTicketConfig] = useState(() => {
    if (originalEvent.ticketConfig) {
      return {
        ...originalEvent.ticketConfig,
        ticketTypes: originalEvent.ticketConfig.ticketTypes.map((t) => ({
          name: t.name || "",
          price: t.price || 0,
          quantity: t.quantity || 0,
          sold: t.sold || 0,
          _id: t._id || "",
        })),
        showTickets: true,
      };
    }
    return {
      isRegistrationRequired: false,
      maxAttendees: "",
      ticketTypes: [{ name: "", price: 0, quantity: 0 }],
      showTickets: true,
    };
  });

  const [isFeatured, setIsFeatured] = useState(
    originalEvent.isFeatured || false
  );

  const [eventImages, setEventImages] = useState([]); // newly uploaded images (File objects)
  const [eventImagePreviews, setEventImagePreviews] = useState(
    originalEvent.eventImage?.map((img) => img.url) || []
  );

  const [primaryIndex, setPrimaryIndex] = useState(
    originalEvent.eventImage
      ? originalEvent.eventImage.findIndex((img) => img.isPrimary)
      : 0
  );

  const [captions, setCaptions] = useState(
    originalEvent.eventImage
      ? originalEvent.eventImage.map((img) => img.caption).join(", ")
      : ""
  );

  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(getOrganizers());
  }, [dispatch]);

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    setErrors((prev) => ({ ...prev, title: validateTitle(val) }));
  };

  const handleDescriptionChange = (e) => {
    const val = e.target.value;
    setDescription(val);
    setErrors((prev) => ({ ...prev, description: validateDescription(val) }));
  };

  const handleImagesSelect = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    if (!files.length) return;

    if (files.length > 5) {
      toast.error(`You can only upload a maximum of 5 images.`);
      return;
    }

    setEventImages(files);
    const readers = files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readers).then((results) => setEventImagePreviews(results));
  };

  const handleAddTicket = () => {
    setTicketConfig((prev) => ({
      ...prev,
      ticketTypes: [...prev.ticketTypes, { name: "", price: 0, quantity: 0 }],
    }));
  };

  const handleRemoveTicket = (idx) => {
    if (ticketConfig.ticketTypes.length === 1) return;
    setTicketConfig((prev) => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter((_, i) => i !== idx),
    }));
  };

  const handleTicketChange = (idx, field, value) => {
    const updated = [...ticketConfig.ticketTypes];
    // Ensure price and quantity are numbers, but allow empty strings temporarily
    if (field === "price" || field === "quantity") {
      updated[idx][field] = value === "" ? "" : Number(value);
    } else {
      updated[idx][field] = value;
    }
    setTicketConfig((prev) => ({ ...prev, ticketTypes: updated }));
  };

  const validateCurrentSection = () => {
    const sectionErrors = {};
    console.log(`Validating Section ${activeSection}...`);

    if (activeSection === 0) {
      if (!title.trim()) sectionErrors.title = "Title is required";
      if (!description.trim())
        sectionErrors.description = "Description is required";
      if (!category) sectionErrors.category = "Category is required";
      if (!type) sectionErrors.type = "Type is required";
      if (!organizerId) sectionErrors.organizerId = "Organizer is required";
    } else if (activeSection === 1) {
      if (!venue.name.trim())
        sectionErrors.venueName = "Venue name is required";
      if (!venue.address.trim())
        sectionErrors.venueAddress = "Venue address is required";
      if (!venue.city.trim())
        sectionErrors.venueCity = "Venue city is required";
      if (!dateTime.start) sectionErrors.startDate = "Start date is required";
      if (!dateTime.end) sectionErrors.endDate = "End date is required";
    } else if (activeSection === 2) {
      const maxAttendeesNum = Number(ticketConfig.maxAttendees);
      if (isNaN(maxAttendeesNum) || maxAttendeesNum <= 0) {
        sectionErrors.maxAttendees = "Max attendees must be a number > 0";
      }

      ticketConfig.ticketTypes.forEach((ticket, index) => {
        if (!ticket.name.trim())
          sectionErrors[`ticketName${index}`] = `Ticket ${
            index + 1
          } name is required`;

        const priceNum = Number(ticket.price);
        if (isNaN(priceNum) || priceNum <= 0)
          sectionErrors[`ticketPrice${index}`] = `Ticket ${
            index + 1
          } price must be > 0`;

        const qtyNum = Number(ticket.quantity);
        if (isNaN(qtyNum) || qtyNum <= 0)
          sectionErrors[`ticketQty${index}`] = `Ticket ${
            index + 1
          } quantity must be > 0`;
      });
    } else if (activeSection === 3 && eventImagePreviews.length === 0) {
      // You might want to enforce images on update, but based on your logs, this section is passing,
      // suggesting images are optional or already present. We'll leave the validation light here.
    }

    setErrors(sectionErrors);
    if (Object.keys(sectionErrors).length > 0) {
      console.error("Validation Errors:", sectionErrors);
      Object.values(sectionErrors).forEach((err) => toast.error(err));
      return false;
    }
    console.log(`Validation for Section ${activeSection} passed.`);
    return true;
  };

  const handleBack = () => {
    if (activeSection > 0) {
      setErrors({});
      setActiveSection(activeSection - 1);
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateCurrentSection()) {
      setActiveSection((prev) => prev + 1);
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();

    if (!validateCurrentSection()) return;

    setLoading(true);

    try {
      const formData = new FormData();

      // Required string fields
      if (title) formData.append("title", title.trim());
      if (description) formData.append("description", description.trim());
      if (category) formData.append("category", category);
      if (type) formData.append("type", type);
      if (organizerId) formData.append("organizerId", organizerId);

      // Venue
      if (venue) {
        formData.append(
          "venue",
          JSON.stringify({
            name: venue.name.trim(),
            address: venue.address.trim(),
            city: venue.city.trim(),
          })
        );
      }

      // DateTime
      if (dateTime.start && dateTime.end) {
        formData.append(
          "dateTime",
          JSON.stringify({
            start: dateTime.start,
            end: dateTime.end,
          })
        );
      }

      // Ticket Config (optional)
      if (ticketConfig) {
        const payload = {
          isRegistrationRequired: ticketConfig.isRegistrationRequired,
          maxAttendees: Number(ticketConfig.maxAttendees) || 0,
          ticketTypes: ticketConfig.ticketTypes.map((t) => ({
            ...(t._id && { _id: t._id }),
            name: t.name,
            price: Number(t.price),
            quantity: Number(t.quantity),
            ...(t.sold && { sold: t.sold }),
          })),
          showTickets: ticketConfig.showTickets,
        };
        formData.append("ticketConfig", JSON.stringify(payload));
      }

      // Featured
      formData.append("isFeatured", isFeatured);

      // Primary index and captions
      formData.append("primaryIndex", primaryIndex.toString());
      formData.append("captions", captions);

      // Event images
      eventImages.forEach((img) => formData.append("eventImage", img));

      // Debug: Log what we're sending
      console.log("🔄 Starting update process...");
      console.log("🎯 Event ID:", originalEvent._id);
      console.log("📦 FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      // Dispatch update
      const res = await dispatch(
        updateEvent({
          eventId: originalEvent._id, // URL param
          formData,
        })
      );

      console.log("📨 Dispatch response:", res);

      if (updateEvent.fulfilled.match(res)) {
        console.log("✅ Update successful!");
        toast.success("Event updated successfully!");
        navigate("/super-admin/events/manage-events");
      } else {
        console.log("❌ Update failed:", res);
        const error =
          res.payload?.message ||
          res.payload?.error ||
          res.error?.message ||
          "Unknown error";
        toast.error(`Update failed: ${error}`);
        console.error("Update Failed Details:", error);
      }
    } catch (err) {
      console.error("💥 Exception during update:", err);
      toast.error("Something went wrong during update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="update-event">
      <div className="event-header-container">
        <h2 className="header-title">Update Event</h2>
        <p className="header-subtitle">Edit your event details</p>
      </div>

      <form
        id="event-form"
        onSubmit={(e) => {
          if (activeSection < 3) handleNext(e);
          else handleUpdateEvent(e);
        }}
      >
        {/* Section 0 - General Info */}
        {activeSection === 0 && (
          <div className="container-fluid">
            <div className="row">
              <div className="col-lg-6">
                <InputField
                  id="event-title"
                  label="Event Title"
                  value={title}
                  onChange={handleTitleChange}
                  error={errors.title}
                  icon={<i className="fas fa-signature"></i>}
                  required
                />
                <InputField
                  id="event-description"
                  label="Description"
                  value={description}
                  onChange={handleDescriptionChange}
                  error={errors.description}
                  multiline
                  rows={4}
                  icon={<i className="fas fa-file-alt"></i>}
                  required
                />
              </div>
              <div className="col-lg-6">
                <InputField
                  id="event-category"
                  label="Select Category"
                  dropdownOptions={[
                    { value: "CONCERT", label: "Concert" },
                    { value: "SEMINAR", label: "Seminar" },
                    { value: "LIVE_SHOW", label: "Live Show" },
                    { value: "THEATER", label: "Theater" },
                    { value: "CULTURAL", label: "Cultural" },
                  ]}
                  selectedValue={category}
                  onValueChange={(e) => setCategory(e.target.value)}
                  error={errors.category}
                  icon={<i className="fas fa-list-ul"></i>}
                  required
                />
                <InputField
                  id="event-type"
                  label="Select Event Type"
                  dropdownOptions={[
                    { value: "CITY", label: "City" },
                    { value: "OUT_OF_CITY", label: "Out of City" },
                  ]}
                  selectedValue={type}
                  onValueChange={(e) => setType(e.target.value)}
                  error={errors.type}
                  icon={<i className="fas fa-calendar"></i>}
                  required
                />
                <InputField
                  id="event-organizer"
                  label="Select Organizer"
                  dropdownOptions={organizers.map((o) => ({
                    value: o._id,
                    label: o.userName,
                  }))}
                  selectedValue={organizerId}
                  onValueChange={(e) => setOrganizerId(e.target.value)}
                  error={errors.organizerId}
                  icon={<i className="fas fa-user-secret"></i>}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 1 - Venue & Date */}
        {activeSection === 1 && (
          <div className="form-section container-fluid">
            <div className="row">
              <div className="col-lg-6">
                <InputField
                  id="venue-name"
                  label="Venue Name"
                  value={venue.name}
                  onChange={(e) => setVenue({ ...venue, name: e.target.value })}
                  error={errors.venueName}
                  icon={<i className="fas fa-map-marker-alt"></i>}
                  required
                />
                <InputField
                  id="venue-address"
                  label="Address"
                  value={venue.address}
                  onChange={(e) =>
                    setVenue({ ...venue, address: e.target.value })
                  }
                  error={errors.venueAddress}
                  icon={<i className="fas fa-home"></i>}
                  required
                />
                <InputField
                  id="venue-city"
                  label="City"
                  value={venue.city}
                  onChange={(e) => setVenue({ ...venue, city: e.target.value })}
                  error={errors.venueCity}
                  icon={<i className="fas fa-city"></i>}
                  required
                />
              </div>
              <div className="col-lg-6">
                <InputField
                  id="datetime-start"
                  type="datetime-local"
                  label="Start Date & Time"
                  value={dateTime.start}
                  onChange={(e) =>
                    setDateTime({ ...dateTime, start: e.target.value })
                  }
                  error={errors.startDate}
                  icon={<i className="fas fa-clock"></i>}
                  required
                />
                <InputField
                  id="datetime-end"
                  type="datetime-local"
                  label="End Date & Time"
                  value={dateTime.end}
                  onChange={(e) =>
                    setDateTime({ ...dateTime, end: e.target.value })
                  }
                  error={errors.endDate}
                  icon={<i className="fas fa-clock"></i>}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 2 - Tickets */}
        {activeSection === 2 && (
          <div className="form-section container-fluid">
            <div className="row mb-4 align-items-center">
              <div className="col-lg-6">
                <InputField
                  id="max-attendees"
                  label="Max Attendees"
                  type="number"
                  value={ticketConfig.maxAttendees}
                  onChange={(e) =>
                    setTicketConfig({
                      ...ticketConfig,
                      maxAttendees: e.target.value,
                    })
                  }
                  error={errors.maxAttendees}
                  icon={<i className="fas fa-users"></i>}
                  required
                />
              </div>
              <div className="col-lg-6 d-flex align-items-center mb-4">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={ticketConfig.isRegistrationRequired}
                    onChange={(e) =>
                      setTicketConfig({
                        ...ticketConfig,
                        isRegistrationRequired: e.target.checked,
                      })
                    }
                  />
                  <span className="checkmark"></span>
                  <i className="fas fa-clipboard-check checkbox-icon"></i>
                  Registration Required
                </label>
              </div>
            </div>

            {/* Ticket Types */}
            <div className="ticket-types-section">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6
                  className="fw-semibold mb-0 d-flex align-items-center"
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    setTicketConfig((prev) => ({
                      ...prev,
                      showTickets: !prev.showTickets,
                    }))
                  }
                >
                  <i className="fas fa-ticket-alt me-2"></i> Ticket Types (
                  {ticketConfig.ticketTypes.length})
                  <i
                    className={`fas ms-2 ${
                      ticketConfig.showTickets
                        ? "fa-chevron-up"
                        : "fa-chevron-down"
                    }`}
                    style={{ fontSize: "0.8rem" }}
                  ></i>
                </h6>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddTicket}
                >
                  <i className="fas fa-plus me-2"></i> Add Ticket
                </button>
              </div>

              {ticketConfig.showTickets && (
                <div id="ticket-list">
                  {ticketConfig.ticketTypes.map((ticket, index) => (
                    <div
                      key={index}
                      className="ticket-row d-flex align-items-center gap-2 mb-2 p-2 border rounded"
                    >
                      <InputField
                        placeholder="Name"
                        value={ticket.name}
                        onChange={(e) =>
                          handleTicketChange(index, "name", e.target.value)
                        }
                        error={errors[`ticketName${index}`]}
                        required
                        icon={<i className="fas fa-tag"></i>}
                      />
                      <InputField
                        placeholder="Price"
                        type="number"
                        value={ticket.price}
                        onChange={(e) =>
                          handleTicketChange(index, "price", e.target.value)
                        }
                        error={errors[`ticketPrice${index}`]}
                        required
                        icon={<i className="fas fa-money-bill"></i>}
                      />
                      <InputField
                        placeholder="Qty"
                        type="number"
                        value={ticket.quantity}
                        onChange={(e) =>
                          handleTicketChange(index, "quantity", e.target.value)
                        }
                        error={errors[`ticketQty${index}`]}
                        required
                        icon={<i className="fas fa-hashtag"></i>}
                      />
                      {ticketConfig.ticketTypes.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-link text-danger remove-ticket-btn"
                          onClick={() => handleRemoveTicket(index)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section 3 - Media */}
        {activeSection === 3 && (
          <div className="form-section container-fluid" id="media-section">
            <div className="row mb-4">
              <div className="col-12">
                <div
                  id="event-upload-area"
                  onClick={() => imageInputRef.current.click()}
                  className={eventImagePreviews.length > 0 ? "has-preview" : ""}
                >
                  {eventImagePreviews.length > 0 ? (
                    <div id="event-preview-grid">
                      {eventImagePreviews.map((src, i) => (
                        <div
                          key={i}
                          className={`event-preview-item ${
                            i === primaryIndex ? "primary" : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPrimaryIndex(i);
                          }}
                        >
                          <img src={src} alt={`event-${i}`} />
                          <span className="event-image-index">#{i + 1}</span>
                          {i === primaryIndex && (
                            <span className="event-primary-tag">Primary</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div id="event-upload-placeholder">
                      <i className="fas fa-cloud-upload-alt"></i>
                      <p>Click to upload images (max 5)</p>
                    </div>
                  )}
                  <input
                    ref={imageInputRef}
                    id="event-images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagesSelect}
                    style={{ display: "none" }}
                  />
                </div>
                <InputField
                  id="event-captions"
                  label="Image Captions (comma-separated)"
                  value={captions}
                  onChange={(e) => setCaptions(e.target.value)}
                  multiline
                  rows={2}
                />
              </div>

              <div className="col-12 mt-3 d-flex align-items-center">
                <label className="checkbox-label me-3">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Featured Event
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Button */}
        <div
          className="btn-container d-flex justify-content-center justify-content-md-between"
          style={{ marginTop: 20 }}
        >
          {activeSection > 0 && (
            <Button
              title="← Back"
              type="button"
              onClick={handleBack}
              width={150}
            />
          )}
          <Button
            title={activeSection === 3 ? "Update Event" : "Next →"}
            loading={loading}
            type="submit"
            width={activeSection === 0 ? 500 : 300}
          />
        </div>
      </form>
    </section>
  );
};

export default UpdateEvent;
