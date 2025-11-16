import React, { useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../../../styles/global.styles.css";
import "./Signup.auth.css";
import Logo from "../../../assets/logo/logo.png";
import InputField from "../../../utilities/InputField/InputField.utility";
import Button from "../../../utilities/Button/Button.utility";
import { validateEmail } from "../../../utilities/Validations/Validation.utility";
import imgPlaceholder from "../../../assets/placeHolders/img-placeholder.png";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { register } from "../../../redux/slices/auth.slice";

// Predefined service options
const serviceOptions = [
  { value: "wedding_planning", label: "Wedding Planning" },
  { value: "corporate_events", label: "Corporate Events" },
  { value: "birthday_parties", label: "Birthday Parties" },
  { value: "catering", label: "Catering" },
  { value: "photography", label: "Photography" },
  { value: "music_dj", label: "Music / DJ" },
  { value: "decor", label: "Decor & Lighting" },
];

const validateFields = (fields) => {
  const errors = {};
  if (!fields.userName?.trim()) errors.userName = "Username is required.";
  if (!fields.email?.trim()) errors.email = "Email is required.";
  else {
    const emailErr = validateEmail(fields.email);
    if (emailErr) errors.email = emailErr;
  }
  if (!fields.password) errors.password = "Password is required.";
  if (!fields.services || fields.services.length === 0)
    errors.services = "At least one service is required.";
  return errors;
};

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle profile image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => fileInputRef.current.click();

  // Remove a selected service
  const removeService = (serviceToRemove) => {
    setServices(services.filter((s) => s !== serviceToRemove));
  };

  // Handle signup submission
  const handleSignup = async (event) => {
    event.preventDefault();
    const fields = { userName, email, password, services, bio };
    const errors = validateFields(fields);

    if (Object.keys(errors).length > 0) {
      toast.error(errors[Object.keys(errors)[0]]);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("userName", userName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("organizerProfile", JSON.stringify({ services, bio }));
    if (fileInputRef.current.files[0]) {
      formData.append("profilePicture", fileInputRef.current.files[0]);
    }

    try {
      const resultAction = await dispatch(register(formData));
      if (register.fulfilled.match(resultAction)) {
        toast.success("Registered Successfully!");
        setTimeout(() => navigate("/"), 2000);
      } else {
        toast.error(resultAction.payload?.error || "Register failed.");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="signup-screen">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-sm-12 col-md-12 col-lg-6">
            <div className="card">
              <div className="card-body">
                {/* Logo */}
                <div className="logo-container">
                  <img src={Logo} alt="Logo" className="logo" />
                </div>

                <form className="form-container" onSubmit={handleSignup}>
                  {/* Profile Picture */}
                  <div className="img-container">
                    <div
                      className="image-placeholder-container"
                      onClick={handleImageClick}
                    >
                      <img
                        src={selectedImage || imgPlaceholder}
                        alt="Profile"
                        className="image"
                      />
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleImageSelect}
                      />
                    </div>
                  </div>

                  <div className="form-grid">
                    {/* Username */}
                    <InputField
                      label="Username"
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      icon={<i className="fas fa-user"></i>}
                    />

                    {/* Email */}
                    <InputField
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      icon={<i className="fas fa-envelope"></i>}
                    />

                    {/* Password */}
                    <InputField
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      icon={<i className="fas fa-lock"></i>}
                    />

                    {/* Services Dropdown */}
                    <div className="services-container full-width">
                      <InputField
                        label="Select a Service"
                        dropdownOptions={serviceOptions.filter(
                          (opt) => !services.includes(opt.value)
                        )} // only show unselected
                        selectedValue=""
                        onValueChange={(e) => {
                          const selected = e.target.value;
                          if (selected && !services.includes(selected)) {
                            setServices([...services, selected]);
                          }
                        }}
                        fullWidth={true}
                        icon={<i className="fas fa-concierge-bell"></i>}
                      />

                      {/* Display Selected Services as Tags */}
                      {services.length > 0 && (
                        <div className="selected-services">
                          <label className="selected-services-label">
                            Selected Services:
                          </label>
                          <div className="service-tags">
                            {services.map((service, index) => {
                              const serviceObj = serviceOptions.find(
                                (opt) => opt.value === service
                              );
                              return (
                                <span key={index} className="service-tag">
                                  {serviceObj?.label}
                                  <button
                                    type="button"
                                    className="remove-tag"
                                    onClick={() => removeService(service)}
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bio */}
                    <InputField
                      label="Bio"
                      multiline={true}
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      icon={<i className="fas fa-file-alt"></i>}
                    />
                  </div>

                  {/* Signup Button */}
                  <div className="btn-container">
                    <Button
                      title="Signup"
                      width="100%"
                      onPress={handleSignup}
                      loading={loading}
                    />
                  </div>

                  {/* Signin link */}
                  <div className="signin-container">
                    <label className="label">Already have an account?</label>
                    <NavLink to="/" className="signin-label">
                      Signin
                    </NavLink>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Signup;
