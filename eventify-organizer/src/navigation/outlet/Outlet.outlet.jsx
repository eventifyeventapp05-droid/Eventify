/**
 * Dashboard Layout
 *
 * Provides the main layout structure for authenticated dashboard pages.
 * It includes:
 * - A persistent Header at the top
 * - A Sidebar for navigation
 * - A main content area where nested routes are rendered via React Router's Outlet
 *
 * This layout ensures a consistent structure across all admin dashboard screens.
 */

import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Dashboard.layout.css";
import Header from '../../utilities/Header/Header.utility';
import Sidebar from '../../utilities/Sidebar/Sidebar.utility';

/**
 * Dashboard page layout wrapper.
 *
 * @returns {JSX.Element} The structured dashboard layout with header, sidebar, and content area.
 */
const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // Close sidebar when switching to mobile view
      if (mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Header onMenuClick={toggleSidebar} />
      <div className="dashboard-container">
        <aside 
          className={`sidebar-container ${sidebarOpen ? 'sidebar-open' : ''} ${isMobile ? 'sidebar-mobile' : ''}`}
          onClick={closeSidebar}
        >
          <Sidebar />
        </aside>
        
        {/* Overlay for mobile when sidebar is open */}
        {isMobile && sidebarOpen && (
          <div className="sidebar-overlay" onClick={closeSidebar}></div>
        )}
        
        <main className="content" onClick={closeSidebar}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;