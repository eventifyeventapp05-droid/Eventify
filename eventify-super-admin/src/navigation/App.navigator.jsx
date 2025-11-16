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
import ForgotPassword from "../screens/auth/Forgot-password/ForgotPassword.auth";
import ResetPassword from "../screens/auth/Reset-password/ResetPassword.auth";

// Not Found
import NotFound from "../screens/not-found/Not-Found";

// Dashboard Screens
import Dashboard from "../screens/dashboard/Main.dashboard";

// Users Screens
import Users from "../screens/manage-users/users/User";
import UserDetails from "../screens/manage-users/user-details/User.details";

// Organizers Screens
import Organizers from "../screens/manage-organizers/organizers/Organizer";
import OrganizerDetails from "../screens/manage-organizers/organizer-details/Organizer.details";

// Events Screens
import Events from "../screens/manage-events/events/Event";
import EventDetails from "../screens/manage-events/event-details/Event.details";
import CreateEvent from "../screens/manage-events/create-event/Create.event";
import UpdateEvent from "../screens/manage-events/update-event/Update.event";

// Bookings Screens
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
      <Route path="/super-admin/forgot-password" element={<ForgotPassword />} />
      <Route path="/super-admin/reset-password" element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route
        path="/super-admin"
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

        {/* User Routes */}
        <Route path="users/manage-users" element={<Users />} />
        <Route
          path="users/manage-users/user-details/:id"
          element={<UserDetails />}
        />

        {/* Organizer Routes */}
        <Route path="organizers/manage-organizers" element={<Organizers />} />
        <Route
          path="organizers/manage-organizers/organizer-details/:id"
          element={<OrganizerDetails />}
        />

        {/* Event Routes */}
        <Route path="events/manage-events" element={<Events />} />
        <Route
          path="events/manage-events/event-details/:id"
          element={<EventDetails />}
        />
        <Route
          path="events/manage-events/create-event"
          element={<CreateEvent />}
        />
        <Route
          path="events/manage-events/update-event/:id"
          element={<UpdateEvent />}
        />

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
