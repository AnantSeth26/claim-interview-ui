import React from "react";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">

      <AdminSidebar />

      <main className="main-content">
        {children}
      </main>

    </div>
  );
}