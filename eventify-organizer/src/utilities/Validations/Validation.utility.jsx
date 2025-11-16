/**
 * Validation Utilities
 *
 * Provides reusable validation functions for authentication,
 * event management, and general form handling.
 *
 * Features:
 * - Field-level validators (e.g., email, password, full name, etc.)
 * - Unified validation function to check multiple fields at once
 * - Utility to determine overall form validity
 */

/**
 * Validate full name.
 * @param {string} fullName - The user's full name.
 * @returns {string} Error message or empty string if valid.
 */
export const validateFullName = (fullName) => {
  if (!fullName) {
    return "Full Name is required";
  }
  if (fullName.length < 3) {
    return "Full Name must be at least 3 characters long";
  }
  return "";
};

/**
 * Validate email format.
 * @param {string} email - The user's email address.
 * @returns {string} Error message or empty string if valid.
 */
export const validateEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return "Email is required";
  }
  if (!emailPattern.test(email)) {
    return "Please enter a valid email address";
  }
  return "";
};

/**
 * Validate password strength.
 * @param {string} password - The user's password.
 * @returns {string} Error message or empty string if valid.
 */
export const validatePassword = (password) => {
  if (!password) {
    return "Password is required";
  }
  if (password.length < 4) {
    return "Password must be at least 4 characters long";
  }
  return "";
};

/**
 * Validate contact number (must be 11 digits).
 * @param {string} contactNumber - The user's contact number.
 * @returns {string} Error message or empty string if valid.
 */
export const validateContactNumber = (contactNumber) => {
  const contactNumberPattern = /^[0-9]{11}$/;
  if (!contactNumber) {
    return "Contact number is required";
  }
  if (!contactNumberPattern.test(contactNumber)) {
    return "Contact number must be 11 digits";
  }
  return "";
};

/**
 * Validate event title.
 * @param {string} title - The event title.
 * @returns {string} Error message or empty string if valid.
 */
export const validateTitle = (title) => {
  if (!title) {
    return "Event title is required";
  }
  if (title.length < 5) {
    return "Event title must be at least 5 characters long";
  }
  if (title.length > 100) {
    return "Event title must be less than 100 characters";
  }
  return "";
};

/**
 * Validate event description.
 * @param {string} description - The event description.
 * @returns {string} Error message or empty string if valid.
 */
export const validateDescription = (description) => {
  if (!description) {
    return "Event description is required";
  }
  if (description.length < 15) {
    return "Event description must be at least 15 characters long";
  }
  if (description.length > 1000) {
    return "Event description must be less than 1000 characters";
  }
  return "";
};

/**
 * Validate event category.
 * @param {string} category - The event category.
 * @returns {string} Error message or empty string if valid.
 */
export const validateCategory = (category) => {
  const validCategories = [
    "CONCERT",
    "CONFERENCE",
    "WORKSHOP",
    "SEMINAR",
    "FESTIVAL",
    "SPORTS",
    "OTHER",
  ];
  if (!category) {
    return "Event category is required";
  }
  if (!validCategories.includes(category)) {
    return "Please select a valid event category";
  }
  return "";
};

/**
 * Validate event type.
 * @param {string} type - The event type.
 * @returns {string} Error message or empty string if valid.
 */
export const validateType = (type) => {
  const validTypes = ["CITY", "ONLINE", "HYBRID"];
  if (!type) {
    return "Event type is required";
  }
  if (!validTypes.includes(type)) {
    return "Please select a valid event type";
  }
  return "";
};

/**
 * Validate venue information.
 * @param {Object} venue - The venue object containing name, address, city.
 * @returns {string} Error message or empty string if valid.
 */
export const validateVenue = (venue) => {
  if (!venue || typeof venue !== "object") {
    return "Venue information is required";
  }
  if (!venue.name || !venue.name.trim()) {
    return "Venue name is required";
  }
  if (!venue.address || !venue.address.trim()) {
    return "Venue address is required";
  }
  if (!venue.city || !venue.city.trim()) {
    return "City is required";
  }
  if (venue.name.length < 3) {
    return "Venue name must be at least 3 characters long";
  }
  if (venue.address.length < 5) {
    return "Venue address must be at least 5 characters long";
  }
  return "";
};

/**
 * Validate date and time.
 * @param {Object} dateTime - The dateTime object containing start and end.
 * @returns {string} Error message or empty string if valid.
 */
export const validateDateTime = (dateTime) => {
  if (!dateTime || typeof dateTime !== "object") {
    return "Date and time information is required";
  }
  if (!dateTime.start) {
    return "Start date and time is required";
  }
  if (!dateTime.end) {
    return "End date and time is required";
  }

  const startDate = new Date(dateTime.start);
  const endDate = new Date(dateTime.end);
  const now = new Date();

  if (isNaN(startDate.getTime())) {
    return "Invalid start date format";
  }
  if (isNaN(endDate.getTime())) {
    return "Invalid end date format";
  }
  if (startDate >= endDate) {
    return "End date must be after start date";
  }
  if (startDate < now) {
    return "Start date cannot be in the past";
  }

  return "";
};

/**
 * Validate organizer ID.
 * @param {string} organizerId - The organizer ID.
 * @returns {string} Error message or empty string if valid.
 */
export const validateOrganizer = (organizerId) => {
  if (!organizerId) {
    return "Organizer is required";
  }
  if (organizerId.length < 10) {
    return "Invalid organizer ID";
  }
  return "";
};

/**
 * Validate ticket configuration.
 * @param {Object} ticketConfig - The ticket configuration object.
 * @returns {string} Error message or empty string if valid.
 */
export const validateTicketConfig = (ticketConfig) => {
  if (!ticketConfig || typeof ticketConfig !== "object") {
    return "Ticket configuration is required";
  }

  // Validate maxAttendees
  if (ticketConfig.maxAttendees && ticketConfig.maxAttendees < 1) {
    return "Maximum attendees must be at least 1";
  }

  // Validate ticket types
  if (!ticketConfig.ticketTypes || !Array.isArray(ticketConfig.ticketTypes)) {
    return "At least one ticket type is required";
  }

  if (ticketConfig.ticketTypes.length === 0) {
    return "At least one ticket type is required";
  }

  for (let i = 0; i < ticketConfig.ticketTypes.length; i++) {
    const ticket = ticketConfig.ticketTypes[i];

    if (!ticket.name || !ticket.name.trim()) {
      return `Ticket type ${i + 1}: Name is required`;
    }

    if (
      ticket.price === undefined ||
      ticket.price === null ||
      ticket.price === ""
    ) {
      return `Ticket type ${i + 1}: Price is required`;
    }

    const price = parseFloat(ticket.price);
    if (isNaN(price) || price < 0) {
      return `Ticket type ${i + 1}: Price must be a valid number`;
    }

    if (
      ticket.quantity === undefined ||
      ticket.quantity === null ||
      ticket.quantity === ""
    ) {
      return `Ticket type ${i + 1}: Quantity is required`;
    }

    const quantity = parseInt(ticket.quantity);
    if (isNaN(quantity) || quantity < 0) {
      return `Ticket type ${i + 1}: Quantity must be a valid number`;
    }
  }

  return "";
};

/**
 * Validate event status.
 * @param {string} status - The event status.
 * @returns {string} Error message or empty string if valid.
 */
export const validateStatus = (status) => {
  const validStatuses = ["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"];
  if (!status) {
    return "Event status is required";
  }
  if (!validStatuses.includes(status)) {
    return "Please select a valid event status";
  }
  return "";
};

/**
 * Validate primary image index.
 * @param {number} primaryIndex - The primary image index.
 * @param {number} maxIndex - The maximum allowed index.
 * @returns {string} Error message or empty string if valid.
 */
export const validatePrimaryIndex = (primaryIndex, maxIndex = 0) => {
  if (primaryIndex === undefined || primaryIndex === null) {
    return "Primary image index is required";
  }

  const index = parseInt(primaryIndex);
  if (isNaN(index) || index < 0) {
    return "Primary image index must be a non-negative number";
  }

  if (maxIndex > 0 && index > maxIndex) {
    return `Primary image index cannot exceed ${maxIndex}`;
  }

  return "";
};

/**
 * Validate multiple fields at once using the appropriate validation function.
 *
 * @param {Object} fields - Object containing field names and values.
 * @returns {Object} Errors keyed by field name.
 */
export const validateFields = (fields) => {
  const validationFunctions = {
    fullName: validateFullName,
    email: validateEmail,
    password: validatePassword,
    contactNumber: validateContactNumber,
    title: validateTitle,
    description: validateDescription,
    category: validateCategory,
    type: validateType,
    venue: validateVenue,
    dateTime: validateDateTime,
    organizerId: validateOrganizer,
    ticketConfig: validateTicketConfig,
    status: validateStatus,
    primaryIndex: (value) => validatePrimaryIndex(value, fields.maxImages || 0),
  };

  const errors = {};

  Object.keys(fields).forEach((field) => {
    if (validationFunctions[field]) {
      const error = validationFunctions[field](fields[field]);
      if (error) {
        errors[field] = error;
      }
    }
  });

  return errors;
};

/**
 * Determine if all inputs in a form are valid.
 *
 * @param {Object} fields - Object containing field names and values.
 * @returns {boolean} True if all fields are valid, false otherwise.
 */
export const isValidInput = (fields) => {
  console.log("Validating fields: ", fields);
  const errors = validateFields(fields);
  console.log("Validation errors: ", errors);
  return Object.keys(errors).length === 0;
};

/**
 * Validate event creation form specifically.
 * @param {Object} formData - The event form data.
 * @returns {Object} Validation errors.
 */
export const validateEventForm = (formData) => {
  const errors = {};

  // Required fields
  if (!formData.title) errors.title = "Event title is required";
  if (!formData.description)
    errors.description = "Event description is required";
  if (!formData.category) errors.category = "Event category is required";
  if (!formData.type) errors.type = "Event type is required";
  if (!formData.organizerId) errors.organizerId = "Organizer is required";

  // Venue validation
  if (!formData.venue?.name) errors.venue = "Venue name is required";
  if (!formData.venue?.address) errors.venue = "Venue address is required";
  if (!formData.venue?.city) errors.venue = "City is required";

  // Date validation
  if (!formData.dateTime?.start) errors.dateTime = "Start date is required";
  if (!formData.dateTime?.end) errors.dateTime = "End date is required";

  // Ticket validation
  if (
    !formData.ticketConfig?.ticketTypes ||
    formData.ticketConfig.ticketTypes.length === 0
  ) {
    errors.ticketConfig = "At least one ticket type is required";
  }

  return errors;
};
