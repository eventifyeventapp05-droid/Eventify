/**
 * Dashboard Component
 *
 * Provides an overview of key business metrics including:
 * - Inventory: total count
 * - Sellers: total, active, suspended, banned
 * - Stores: total, active, suspended, banned
 *
 * Features:
 * - Fetches data from Redux slices (inventory, sellers, stores)
 * - Displays interactive statistic cards with icons
 * - Allows navigation to management pages
 *
 * @component
 * @example
 * return <Dashboard />
 *
 * @returns {JSX.Element} A dashboard overview with statistics and navigation
 */

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Card from "../../utilities/Card/Card.utility";
import { getUsers } from "../../redux/slices/user.slice";
import { getOrganizers } from "../../redux/slices/organizer.slice";
import { getEvents } from "../../redux/slices/event.slice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const users = useSelector((state) => state.users.users || []);
  const organizers = useSelector((state) => state.organizers.organizers || []);
  const events = useSelector((state) => state.events.events || []);

  useEffect(() => {
    if (user?.id) {
      dispatch(getUsers());
      dispatch(getOrganizers());
      dispatch(getEvents());
    }
  }, [dispatch, user?.id]);

  // User statistics
  const { totalUsers } = users.reduce(
    (acc) => {
      acc.totalUsers++;
      return acc;
    },
    {
      totalUsers: 0,
    }
  );

  // Organizer statistics
  const { totalOrganizers } = organizers.reduce(
    (acc) => {
      acc.totalOrganizers++;
      return acc;
    },
    {
      totalOrganizers: 0,
    }
  );

  // Event statistics
  const { totalEvents, draft, published, cancelled, completed } = events.reduce(
    (acc, event) => {
      acc.totalEvents++;
      if (event.status === "DRAFT") acc.draft++;
      else if (event.status === "PUBLISHED") acc.published++;
      else if (event.status === "CANCELLED") acc.cancelled++;
      else if (event.status === "COMPLETED") acc.completed++;

      return acc;
    },
    {
      totalEvents: 0,
      draft: 0,
      published: 0,
      cancelled: 0,
      completed: 0,
    }
  );

  const handleNavigate = (path) => navigate(path);

  return (
    <section id="dashboard" style={{ marginTop: 15 }}>
      <div className="container-fluid">
        <h2
          style={{
            fontSize: "28px",
            fontWeight: 700,
            color: "var(--primary)",
            margin: 0,
            paddingLeft: "10px",
            borderLeft: "4px solid var(--primary)",
            marginBottom: "40px",
          }}
        >
          Dashboard Overview
        </h2>

        {/* Statistic Cards */}
        <div className="row g-2 mb-2">
          {/* Users Card */}
          <div className="col-12 col-md-6 col-lg-4">
            <Card
              onClick={() => handleNavigate("/super-admin/users/manage-users")}
              title="Users"
              icon={
                <i
                  className="fas fa-users fa-shake text-white"
                  style={{ animationDuration: "2s" }}
                />
              }
              stats={[{ label: "Total", value: totalUsers }]}
              gradientType="emerald"
            />
          </div>

          {/* Organizers Card */}
          <div className="col-12 col-md-6 col-lg-4">
            <Card
              onClick={() =>
                handleNavigate("/super-admin/organizers/manage-organizers")
              }
              title="Organizers"
              icon={
                <i
                  className="fas fa-user-secret fa-bounce text-white"
                  style={{ animationDuration: "2s" }}
                />
              }
              stats={[{ label: "Total Organizers", value: totalOrganizers }]}
              gradientType="ocean"
            />
          </div>

          {/* Events Card */}
          <div className="col-12 col-md-6 col-lg-4">
            <Card
              onClick={() =>
                handleNavigate("/super-admin/events/manage-events")
              }
              title="Events"
              icon={
                <i
                  className="fas fa-glass-cheers fa-shake text-white"
                  style={{ animationDuration: "2s" }}
                />
              }
              stats={[
                { label: "Total", value: totalEvents },
                { label: "Draft", value: draft },
                { label: "Publish", value: published },
                { label: "Cancel", value: cancelled },
                { label: "Completed", value: completed },
              ]}
              gradientType="emerald"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
