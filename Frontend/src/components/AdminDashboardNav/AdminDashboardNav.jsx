import React from "react";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import DashboardHome from "../DashboardHome/DashboardHome";
import EventManagement from "../EventManagement/EventManagement";
import ViewRegistrations from "../ViewRegistrations/ViewRegistrations";
const logo = "/logo copy copy.jpg";
import "./AdminDashboardNav.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("buc_admin_authenticated");
    navigate("/admin/login");
  };

  return (
    <div className="admin-dashboard">
      <nav className="admin-navbar">
        <div className="nav-left">
          <img src={logo} alt="BUC India Logo" className="buc-logo" />
          <div className="brand-text">
            <h2>BUC_India</h2>
            <p>Ride Together, Stand Together</p>
          </div>
        </div>
        <div className="nav-center">
          <NavLink to="/admin/dashboard" end className="nav-link">
            Dashboard
          </NavLink>
          <NavLink to="/admin/events" className="nav-link">
            Events
          </NavLink>
          <NavLink to="/admin/registrations" className="nav-link">
            Registrations
          </NavLink>
        </div>
        <div className="nav-right">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="view-public-button"
          >
            View Public Site
          </a>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </nav>

      <main className="admin-content">
        <Routes>
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="events" element={<EventManagement />} />
          <Route path="registrations" element={<ViewRegistrations />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
