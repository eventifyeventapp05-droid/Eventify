/**
 * Signin Component
 *
 * Provides the authentication form for logging into the admin panel.
 * Includes input validation, error handling, and Redux-powered login action.
 * Redirects to the admin dashboard on successful login.
 *
 * @component
 * @example
 * return (
 *   <Signin />
 * )
 */

import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../../../styles/global.styles.css";
import "./Signin.auth.css";
import Logo from "../../../assets/logo/logo.png";
import InputField from "../../../utilities/InputField/InputField.utility";
import Button from "../../../utilities/Button/Button.utility";
import {
  validateEmail,
  validatePassword,
  validateFields,
} from "../../../utilities/Validations/Validation.utility";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { login } from "../../../redux/slices/auth.slice";

const Signin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const hasErrors = emailError || passwordError || !email || !password;
  }, [emailError, passwordError, email, password]);

  /**
   * Handle email input change
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(validateEmail(e.target.value));
  };

  /**
   * Handle password input change
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError(validatePassword(e.target.value));
  };

  /**
   * Handle form submission for signing in
   * Validates fields and dispatches login action
   * @param {React.FormEvent<HTMLFormElement>} event
   */
  const handleSignin = async (event) => {
    event.preventDefault();

    const fields = { email, password };
    const errors = validateFields(fields);
    const errorKeys = Object.keys(errors);

    if (errorKeys.length > 0) {
      const firstErrorKey = errorKeys[0];
      toast.error(errors[firstErrorKey]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const loginData = { email, password };
      const resultAction = await dispatch(login(loginData));

      if (login.fulfilled.match(resultAction)) {
        const successMessage =
          resultAction.payload.message || "Login successful";
        toast.success(successMessage);

        setTimeout(() => {
          navigate("/super-admin/dashboard");
        }, 2000);

        setEmail("");
        setPassword("");
      } else if (login.rejected.match(resultAction)) {
        const errorPayload = resultAction.payload;

        let errorMessage = "Login failed. Please try again.";

        if (errorPayload) {
          errorMessage = errorPayload.message || errorMessage;

          if (
            errorPayload.status === 423 &&
            errorPayload.message?.includes("Account locked")
          ) {
            toast.error(errorPayload.message, { autoClose: 5000 });
            return;
          }

          if (
            errorPayload.status === 423 &&
            errorPayload.message?.includes("Too many failed")
          ) {
            toast.error(errorPayload.message, { autoClose: 6000 });
            return;
          }

          if (errorPayload.attempts !== undefined) {
            const remainingAttempts = 3 - errorPayload.attempts;
            if (remainingAttempts > 0) {
              toast.error(
                `${errorMessage} (${remainingAttempts} attempts remaining)`
              );
              return;
            }
          }
        }

        toast.error(errorMessage);
      }
    } catch (err) {
      console.error("An unexpected error occurred during login:", err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="signin-screen">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-sm-12 col-md-12 col-lg-6">
            <div className="card">
              <div className="card-body">
                {/* Logo */}
                <div className="logo-container">
                  <img src={Logo} alt="Logo" className="logo" />
                </div>

                {/* Signin Form */}
                <form className="form-container" onSubmit={handleSignin}>
                  <div className="email-container">
                    <InputField
                      label="Enter Email"
                      type="text"
                      editable={true}
                      value={email}
                      onChange={handleEmailChange}
                      icon={<i className="fas fa-envelope"></i>}
                    />
                  </div>

                  <div className="password-container">
                    <InputField
                      label="Enter Password"
                      type="password"
                      secureTextEntry={true}
                      editable={true}
                      value={password}
                      onChange={handlePasswordChange}
                      icon={<i className="fas fa-lock"></i>}
                    />
                  </div>

                  <div className="forgot-password-container">
                    <NavLink
                      className="fg-label"
                      to={"/super-admin/forgot-password"}
                    >
                      Forgot Password
                    </NavLink>
                  </div>

                  <div className="btn-container">
                    <Button
                      title="Signin"
                      width={"100%"}
                      onPress={handleSignin}
                      loading={loading}
                      icon={<i className="fas fa-sign-in-alt"></i>}
                    />
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

export default Signin;
