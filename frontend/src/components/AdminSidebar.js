import { useNavigate, useLocation } from "react-router-dom";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
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

      <div
        className={`menu-item ${
          location.pathname === "/investigators" ? "active" : ""
        }`}
        onClick={() => navigate("/investigators")}
      >
        Investigators
      </div>

      <div
        className={`menu-item ${
          location.pathname === "/bulk-import" ? "active" : ""
        }`}
        onClick={() => navigate("/bulk-import")}
      >
        Bulk Case Import
      </div>
    </aside>
  );
}