/**
 * Sidebar Component
 *
 * Provides a fixed navigation menu for the admin dashboard.
 * Uses `NavLink` for route navigation with active highlighting.
 * The current route is tracked using `useLocation` to apply "active" styling
 * to grouped navigation links (e.g., all `/admin/products/*` routes).
 *
 * @component
 * @example
 * return (
 *   <Sidebar />
 * )
 */

import { NavLink, useLocation } from "react-router-dom";
import "../../styles/global.styles.css";
import "./Sidebar.utility.css";

const Sidebar = () => {
  const location = useLocation();

  return (
    <section id="sidebar">
      <ul className="sidebar-nav">
        <li className="sidebar-container">
          {/* Dashboard */}
          <NavLink
            to="/organizer/dashboard"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <div className="sidebar-icon">
              <i className="fas fa-home"></i>
            </div>
            <span>Dashboard</span>
          </NavLink>

          {/* Bookings */}
          <NavLink
            to="/organizer/bookings/manage-bookings"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <div className="sidebar-icon">
              <i className="fas fa-users"></i>
            </div>
            <span>Manage Bookings</span>
          </NavLink>

          {/* Chats */}
          <NavLink
            to="/organizer/chats/manage-chats"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <div className="sidebar-icon">
              <i className="fas fa-users"></i>
            </div>
            <span>Manage Chats</span>
          </NavLink>
        </li>
      </ul>
    </section>
  );
};

export default Sidebar;
