import React, { useEffect, useState } from "react";
import { getAllCases, uploadExcel } from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import {
  FaHome,
  FaFileAlt,
  FaUsers,
  FaChartBar,
  FaClipboardList
} from "react-icons/fa";
import {
  FaUserCheck,
  FaMapMarkerAlt,
  FaCar,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle
} from "react-icons/fa";
import AdminLayout from "./AdminLayout";

export default function AdminDashboard() {

  const [cases, setCases] = useState([]);
  const [file, setFile] = useState(null);

  // 🔍 SEARCH
  const [search, setSearch] = useState("");

  // 📍 NEW FILTERS
  const [districtFilter, setDistrictFilter] = useState("");
  const [policeFilter, setPoliceFilter] = useState("");
  const [investigatorFilter, setInvestigatorFilter] = useState("");
  const [claimType, setClaimType] = useState("");

  const [allocationFrom, setAllocationFrom] = useState("");
  const [allocationTo, setAllocationTo] = useState("");

  const [firFrom, setFirFrom] = useState("");
  const [firTo, setFirTo] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadCases();
  }, [claimType]);

  const loadCases = async () => {
    const res = await getAllCases({
      claim_type: claimType
    });

    if (res.cases) setCases(res.cases);
  };

  const openCase = (c) => {
    navigate(`/case/${c.id}`, { state: c });
  };

  // 📁 FILE SELECT
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // 📤 UPLOAD
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file");
      const districtData = Object.entries(
  cases.reduce((acc, item) => {
    const district = item.district || "Unknown";

    acc[district] = (acc[district] || 0) + 1;

    return acc;
  }, {})
).map(([district, count]) => ({
  district,
  count
}));
const investigatorData = Object.entries(
  cases.reduce((acc, item) => {
    const name = item.investigator_name || "Unassigned";

    acc[name] = (acc[name] || 0) + 1;

    return acc;
  }, {})
)
.sort((a, b) => b[1] - a[1])
.slice(0, 5);
      return;
    }

    try {
      const res = await uploadExcel(file);

      if (res.message) {
        alert("Upload successful ✅");
        setFile(null);
        await loadCases();
      } else {
        alert("Upload failed ❌");
      }

    } catch (err) {
      console.error(err);
      alert("Error uploading file ❌");
    }
  };

const districtData = Object.entries(
  cases.reduce((acc, item) => {
    const district = item.district || "Unknown";

    acc[district] = (acc[district] || 0) + 1;

    return acc;
  }, {})
).map(([district, count]) => ({
  district,
  count
}));
const investigatorData = Object.entries(
  cases.reduce((acc, item) => {
    const name = item.investigator_name || "Unassigned";

    acc[name] = (acc[name] || 0) + 1;

    return acc;
  }, {})
)
.sort((a, b) => b[1] - a[1])
.slice(0, 5);


  return (
    <div className="admin-layout">

  <aside className="sidebar">

    <h2>ClaimIQ</h2>

    <div
  className="menu-item active"
  onClick={() => navigate("/dashboard")}
>
  Dashboard
</div>

<div
  className="menu-item"
  onClick={() => navigate("/cases")}
>
  Cases
</div>

<div
  className="menu-item"
  onClick={() => navigate("/investigators")}
>
  Investigators
</div>

<div
  className="menu-item"
  onClick={() => navigate("/analytics")}
>
  Analytics
</div>

<div
  className="menu-item"
  onClick={() => navigate("/reports")}
>
  Reports
</div>

  </aside>

  <main className="main-content">

    <div className="card">

        <div className="dashboard-topbar">

  <div>
    <h1>Motor Claims Dashboard</h1>
    <p>
      Monitor investigations and manage motor insurance claims
    </p>
  </div>

  <div className="topbar-right">

    <input
      className="quick-search"
      type="text"
      placeholder="🔍 Search Case ID..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
      <div className="notification-bell">
  🔔
  <span className="notification-badge">3</span>
</div>

    <div className="admin-profile">
      <div>
        <h4>Admin</h4>
        <span>Claims Manager</span>
      </div>

      <div className="avatar">
        A
      </div>
    </div>

  </div>



</div>
          <div className="stats-grid">
 <div className="stat-card total-card">
  <FaFileAlt className="stat-icon" />
  <h3>{cases.length}</h3>
  <p>Total Cases</p>
</div>

<div className="stat-card assigned-card">
  <FaUserCheck className="stat-icon" />
  <h3>
    {cases.filter(c => c.investigator_name).length}
  </h3>
  <p>Assigned Cases</p>
</div>

<div className="stat-card district-card">
  <FaMapMarkerAlt className="stat-icon" />
  <h3>
    {
      new Set(
        cases.map(c => c.district).filter(Boolean)
      ).size
    }
  </h3>
  <p>Districts Covered</p>
</div>

<div className="stat-card motor-card">
  <FaCar className="stat-icon" />
  <h3>
    {
      cases.filter(
        c => c.claim_type === "motor"
      ).length
    }
  </h3>
  <p>Motor Claims</p>
</div>

<div className="stat-card pending-card">
  <h3>12</h3>
  <p>Pending Verification</p>
</div>

<div className="stat-card fraud-card">
  <h3>4</h3>
  <p>Fraud Alerts</p>
</div>

<div className="stat-card completed-card">
  <h3>28</h3>
  <p>Completed Cases</p>
</div>

<div className="stat-card processing-card">
  <h3>3.2 Days</h3>
  <p>Avg Processing</p>
</div>
</div>
<div className="analytics-grid">

  <div className="chart-card">
    <h3>Claims by District</h3>

    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={districtData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="district" />
        <YAxis />
        <Tooltip />
        <Bar
  dataKey="count"
  fill="#3366E8"
  radius={[8, 8, 0, 0]}
/>
      </BarChart>
    </ResponsiveContainer>
  </div>

  <div className="leaderboard-card">
    <h3>Top Investigators</h3>

    {investigatorData.map(([name, count]) => (
      <div className="leader-row" key={name}>
        <span>{name}</span>
        <strong>{count}</strong>
      </div>
    ))}
  </div>

</div>
<div className="activity-card">
  <h3>Recent Activity</h3>

  {cases.slice(0, 5).map((c) => (
    <div className="activity-row" key={c.id}>
      <strong>{c.case_id}</strong>

      <span>
        {c.investigator_name || "Unassigned"}
      </span>
    </div>
  ))}
</div>

          {/* 📤 UPLOAD */}
          <div className="upload-section">

  <h3>Bulk Case Import</h3>

  <input
    type="file"
    accept=".xlsx"
    onChange={handleFileChange}
  />

  <button
    className="upload-btn"
    onClick={handleUpload}
  >
    Upload Excel File
  </button>

</div>

          {/* 🔴 STEP 1 — GROUP FILTERS */}
          <div className="section-card">
            <h3>Filters</h3>

            <div className="grid-3">
             

              <input
                placeholder="District"
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
              />

              <input
                placeholder="Police Station"
                value={policeFilter}
                onChange={(e) => setPoliceFilter(e.target.value)}
              />

              <input
                placeholder="Investigator"
                value={investigatorFilter}
                onChange={(e) => setInvestigatorFilter(e.target.value)}
              />

              <select
                value={claimType}
                onChange={(e) => setClaimType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="health">Health</option>
                <option value="motor">Motor</option>
              </select>
            </div>
          </div>

          

          <div className="date-grid">

  <div>
    <label>Allocation From</label>
    <input
      type="date"
      value={allocationFrom}
      onChange={(e) => setAllocationFrom(e.target.value)}
    />
  </div>

  <div>
    <label>Allocation To</label>
    <input
      type="date"
      value={allocationTo}
      onChange={(e) => setAllocationTo(e.target.value)}
    />
  </div>

  <div>
    <label>FIR From</label>
    <input
      type="date"
      value={firFrom}
      onChange={(e) => setFirFrom(e.target.value)}
    />
  </div>

  <div>
    <label>FIR To</label>
    <input
      type="date"
      value={firTo}
      onChange={(e) => setFirTo(e.target.value)}
    />
  </div>

</div>

         {/* <div className="table-header">
  <h3>All Cases</h3>

  <span>
    Showing {cases.length} Cases
  </span>
</div>

{cases.length === 0 && <p>No cases found</p>}

<div className="table-container">
  <table className="cases-table">
    <thead>
      <tr>
        <th>Case ID</th>
        <th>Investigator</th>
        <th>District</th>
        <th>Police Station</th>
        <th>Type</th>
        <th>Action</th>
      </tr>
    </thead>

    <tbody>
      {cases
        .filter((c) =>
          c.case_id?.toLowerCase().includes(search.toLowerCase())
        )

        .filter((c) =>
          districtFilter
            ? (c.district || "")
                .toLowerCase()
                .includes(districtFilter.toLowerCase())
            : true
        )

        .filter((c) =>
          policeFilter
            ? (c.police_station || "")
                .toLowerCase()
                .includes(policeFilter.toLowerCase())
            : true
        )

        .filter((c) =>
          investigatorFilter
            ? (c.investigator_name || "")
                .toLowerCase()
                .includes(investigatorFilter.toLowerCase())
            : true
        )

        .map((c) => (
          <tr key={c.id}>
            <td>{c.case_id}</td>
            <td>{c.investigator_name || "Unassigned"}</td>
            <td>{c.district || "N/A"}</td>
            <td>{c.police_station || "N/A"}</td>

            <td>
              <span className="badge">
                {c.claim_type}
              </span>
            </td>

            <td>
              <button
                className="view-btn"
                onClick={() => openCase(c)}
              >
                View
              </button>
            </td>
          </tr>
        ))}
    </tbody>
  </table>
</div> */}

           </div>

  </main>

</div>
  );
}