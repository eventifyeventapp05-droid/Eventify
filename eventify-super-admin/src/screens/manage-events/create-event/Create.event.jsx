import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./Create.event.css";
import InputField from "../../../utilities/InputField/InputField.utility";
import Button from "../../../utilities/Button/Button.utility";
import {
  validateTitle,
  validateDescription,
} from "../../../utilities/Validations/Validation.utility";
import { createEvent } from "../../../redux/slices/event.slice";
import { getOrganizers } from "../../../redux/slices/organizer.slice";
import { toast } from "react-hot-toast";

const CreateEvent = () => {
  const dispatch = useDispatch();
  const { organizers } = useSelector((state) => state.organizers);
  const imageInputRef = useRef(null);

  const [activeSection, setActiveSection] = useState(0);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [organizerId, setOrganizerId] = useState("");
  const [venue, setVenue] = useState({ name: "", address: "", city: "" });
  const [dateTime, setDateTime] = useState({ start: "", end: "" });
  const [ticketConfig, setTicketConfig] = useState({
    isRegistrationRequired: false,
    maxAttendees: "",
    ticketTypes: [{ name: "", price: "", quantity: "" }],
  });
  const [isFeatured, setIsFeatured] = useState(false);
  const [eventImages, setEventImages] = useState([]);
  const [eventImagePreviews, setEventImagePreviews] = useState([]);
  const [primaryIndex, setPrimaryIndex] = useState(0);
  const [captions, setCaptions] = useState("");

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

    setEventImages(files);
    const readers = files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readers).then(setEventImagePreviews);
  };

  const handleAddTicket = () => {
    setTicketConfig((prev) => ({
      ...prev,
      ticketTypes: [...prev.ticketTypes, { name: "", price: "", quantity: "" }],
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
    updated[idx][field] = value;
    setTicketConfig((prev) => ({ ...prev, ticketTypes: updated }));
  };

  const validateCurrentSection = () => {
    const sectionErrors = {};
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
      // Ticket section validation
      if (!ticketConfig.maxAttendees || ticketConfig.maxAttendees <= 0) {
        sectionErrors.maxAttendees = "Max attendees is required";
      }

      const ticketErrors = [];
      ticketConfig.ticketTypes.forEach((ticket, index) => {
        if (!ticket.name.trim()) {
          ticketErrors.push(`Ticket ${index + 1} name is required`);
        }
        if (!ticket.price || ticket.price <= 0) {
          ticketErrors.push(`Ticket ${index + 1} price must be greater than 0`);
        }
        if (!ticket.quantity || ticket.quantity <= 0) {
          ticketErrors.push(
            `Ticket ${index + 1} quantity must be greater than 0`
          );
        }
      });

      if (ticketErrors.length > 0) {
        sectionErrors.ticketTypes = ticketErrors[0]; // Show first error
      }
    }

    setErrors(sectionErrors);
    if (Object.keys(sectionErrors).length > 0) {
      Object.values(sectionErrors).forEach((err) => toast.error(err));
      return false;
    }
    return true;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateCurrentSection()) {
      setActiveSection(activeSection + 1);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    if (!validateCurrentSection()) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("type", type);
    formData.append("organizerId", organizerId);
    formData.append("venue", JSON.stringify(venue));
    formData.append("dateTime", JSON.stringify(dateTime));

    const filteredTickets = ticketConfig.ticketTypes.map((t) => ({
      name: t.name.trim(),
      price: Number(t.price),
      quantity: Number(t.quantity),
    }));

    formData.append(
      "ticketConfig",
      JSON.stringify({
        ...ticketConfig,
        ticketTypes: filteredTickets,
      })
    );

    formData.append("status", "DRAFT");
    formData.append("isFeatured", isFeatured ? "true" : "false");
    formData.append("primaryIndex", primaryIndex.toString());
    formData.append("captions", captions);
    eventImages.forEach((img) => formData.append("eventImage", img));

    try {
      const res = await dispatch(createEvent(formData));
      if (createEvent.fulfilled.match(res)) {
        toast.success("Event created!");
        resetForm();
      } else {
        toast.error(res.payload?.error || "Failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setType("");
    setOrganizerId("");
    setVenue({ name: "", address: "", city: "" });
    setDateTime({ start: "", end: "" });
    setTicketConfig({
      isRegistrationRequired: false,
      maxAttendees: "",
      ticketTypes: [{ name: "", price: "", quantity: "" }],
    });
    setIsFeatured(false);
    setPrimaryIndex(0);
    setCaptions("");
    setEventImages([]);
    setEventImagePreviews([]);
    setErrors({});
    setActiveSection(0);
  };

  return (
    <section id="create-event">
      <div className="event-header-container">
        <h2 className="header-title">Create Event</h2>
        <p className="header-subtitle">
          Fill in the details to create your amazing event
        </p>
      </div>

      <form
        id="event-form"
        onSubmit={activeSection === 3 ? handleCreateEvent : handleNext}
      >
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

            {/* Ticket Types Section */}
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
                  <i className="fas fa-ticket-alt me-2"></i> Ticket Types{" "}
                  <span className="text-muted ms-1">
                    ({ticketConfig.ticketTypes.length})
                  </span>
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

              {/* Only show tickets when expanded */}
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
                        icon={<i className="fas fa-tag"></i>}
                        required
                      />

                      <InputField
                        placeholder="Price"
                        type="number"
                        value={ticket.price}
                        onChange={(e) =>
                          handleTicketChange(index, "price", e.target.value)
                        }
                        icon={<i className="fas fa-money-bill"></i>}
                        required
                      />

                      <InputField
                        placeholder="Qty"
                        type="number"
                        value={ticket.quantity}
                        onChange={(e) =>
                          handleTicketChange(index, "quantity", e.target.value)
                        }
                        icon={<i className="fas fa-hashtag"></i>}
                        required
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
                          onClick={() => setPrimaryIndex(i)}
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
                      <div className="event-upload-icon">
                        <i className="fas fa-cloud-upload-alt"></i>
                      </div>
                      <p className="mb-1">Click to upload up to 5 images</p>
                      <small>Supported formats: JPG, PNG, WebP</small>
                    </div>
                  )}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagesSelect}
                    style={{ display: "none" }}
                  />
                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <InputField
                  id="event-primary-index"
                  label="Primary Image Index"
                  type="number"
                  value={primaryIndex}
                  onChange={(e) =>
                    setPrimaryIndex(
                      Math.max(
                        0,
                        Math.min(e.target.value, eventImages.length - 1)
                      )
                    )
                  }
                  min="0"
                  max={eventImages.length - 1}
                  icon={<i className="fas fa-star"></i>}
                  required
                />
              </div>
              <div className="col-md-6">
                <InputField
                  id="event-captions"
                  label="Captions (comma separated)"
                  value={captions}
                  onChange={(e) => setCaptions(e.target.value)}
                  icon={<i className="fas fa-pen"></i>}
                />
              </div>
            </div>

            <div className="row align-items-center">
              <div className="col-auto">
                <label className="event-checkbox-label">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                  />
                  <span className="event-checkmark"></span>
                  <i className="fas fa-star me-2 text-warning"></i>
                  Feature this Event
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="btn-container" style={{ marginLeft: 100, marginTop: 20 }}>
          <Button
            title={activeSection === 3 ? "Create Event" : "Next →"}
            loading={loading}
            width={500}
          />
        </div>
      </form>
    </section>
  );
};

export default CreateEvent;
