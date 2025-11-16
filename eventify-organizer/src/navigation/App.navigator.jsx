/**
 * App Navigator
 *
 * Defines the routing structure of the application using React Router.
 * It organizes public and protected routes, ensuring that only
 * authenticated users can access admin-related screens.
 *
 * Structure:
 * - Public Routes: Signin
 * - Protected Routes: Wrapped with ProtectedRoute and DashboardLayout
 *   - Dashboard
 *   - Product Management
 *   - Review Management
 *   - Order Management
 *   - Chats Management
 * - Fallback: 404 Not Found page
 */

import { Routes, Route } from "react-router-dom";
import DashboardLayout from "./outlet/Outlet.outlet";
import ProtectedRoute from "./protected-routes/Protected.routes";

// Authentication
import Signin from "../screens/auth/Signin/Signin.auth";
import Signup from "../screens/auth/Signup/Signup.auth";
import ForgotPassword from "../screens/auth/Forgot-password/ForgotPassword.auth";
import ResetPassword from "../screens/auth/Reset-password/ResetPassword.auth";

// Not Found
import NotFound from "../screens/not-found/Not-Found";

// Dashboard Screens
import Dashboard from "../screens/dashboard/Main.dashboard";
import Chats from "../screens/manage-chats/chats/Chats";
import Bookings from "../screens/manage-bookings/bookings/Bookings";
import BookingDetails from "../screens/manage-bookings/booking-details/Booking.details";

/**
 * Application routing configuration.
 *
 * @returns {JSX.Element} The route definitions for the app.
 */
const AppNavigator = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<Signin />} />
      <Route path="/organizer/signup" element={<Signup />} />
      <Route path="/organizer/forgot-password" element={<ForgotPassword />} />
      <Route path="/organizer/reset-password" element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route
        path="/organizer"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Make dashboard the index route for /admin */}
        <Route index element={<Dashboard />} />

        {/* Dashboard Routes */}
        <Route path="dashboard" element={<Dashboard />} />

        {/* Chat Routes */}
        <Route path="chats/manage-chats" element={<Chats />} />

        {/* Booking Routes */}
        <Route path="bookings/manage-bookings" element={<Bookings />} />
        <Route
          path="bookings/manage-bookings/booking-details/:id"
          element={<BookingDetails />}
        />
      </Route>

      {/* Not Found Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppNavigator;
