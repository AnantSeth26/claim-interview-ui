import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="admin-layout">

      <aside className="sidebar">
        <h2>ClaimIQ</h2>

        <div
          className={`menu-item ${
            location.pathname === "/dashboard" ? "active" : ""
          }`}
          onClick={() => navigate("/dashboard")}
        >
          Dashboard
        </div>

        <div
          className={`menu-item ${
            location.pathname === "/cases" ? "active" : ""
          }`}
          onClick={() => navigate("/cases")}
        >
          Cases
        </div>

        <div className="menu-item">
          Investigators
        </div>

        <div className="menu-item">
          Analytics
        </div>

        <div className="menu-item">
          Reports
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>

    </div>
  );
}