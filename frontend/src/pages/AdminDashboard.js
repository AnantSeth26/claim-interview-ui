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
  FaExclamationTriangle,
  FaUser,
  FaKey,
  FaSignOutAlt
} from "react-icons/fa";
import AdminLayout from "./AdminLayout";

import AdminSidebar from "../components/AdminSidebar";

export default function AdminDashboard() {

  const [cases, setCases] = useState([]);
  const [file, setFile] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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

  console.log("All Cases:", res.cases);

  if (res.cases) setCases(res.cases);
};

  const openCase = (c) => {
    navigate(`/case/${c.id}`, { state: c });
  };
  const handleSearch = (e) => {
  if (e.key !== "Enter") return;

  const foundCase = cases.find((c) =>
    c.case_id?.toLowerCase() === search.toLowerCase()
  );

  if (foundCase) {
    navigate(`/case/${foundCase.id}`, {
      state: foundCase,
    });
  } else {
    alert("Case not found");
  }
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

 const pendingCases = cases.filter(
  c => c.case_status?.toLowerCase() === "pending"
).length;

const completedCases = cases.filter(
  c => c.case_status?.toLowerCase() === "completed"
).length;

const fraudCases = cases.filter(
  c => c.fraud_flag
).length;

const validTimeLag = cases.filter(c => c.time_lag != null);

const avgProcessing =
  validTimeLag.length > 0
    ? (
        validTimeLag.reduce(
          (sum, c) => sum + Number(c.time_lag),
          0
        ) / validTimeLag.length
      ).toFixed(1)
    : "0";
    const today = new Date().toISOString().split("T")[0];

const todaysCases = cases.filter(c =>
  c.created_at?.startsWith(today)
).length;
  return (
    <div className="admin-layout">

  <AdminSidebar />

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
  onKeyDown={handleSearch}
/>
      <div className="notification-bell">
  🔔
  
</div>

    <div className="admin-profile">

  <div>
    <h4>Admin</h4>
    <span>Claims Manager</span>
  </div>

  <div
    className="avatar"
    onClick={() => setShowProfileMenu(!showProfileMenu)}
    style={{ cursor: "pointer", position: "relative" }}
  >
    A
  </div>

  {showProfileMenu && (
    <div className="profile-dropdown">

      <div className="profile-item">
        <FaUser />
        <span>Admin</span>
      </div>

      <div
  className="profile-item"
  onClick={() => navigate("/forgot-password")}
>
  <FaKey />
  <span>Update Password</span>
</div>

      <div
        className="profile-item"
        onClick={() => {
          localStorage.clear();
          navigate("/");
        }}
      >
        <FaSignOutAlt />
        <span>Logout</span>
      </div>

    </div>
  )}

</div>

  </div>



</div>
          <div className="stats-grid">
 <div
  className="stat-card total-card"
  onClick={() => navigate("/cases")}
  style={{ cursor: "pointer" }}
>
  <FaFileAlt className="stat-icon" />
  <h3>{cases.length}</h3>
  <p>Total Cases</p>
</div>

<div
  className="stat-card assigned-card"
  onClick={() =>
    navigate("/cases?filter=assigned")
  }
  style={{ cursor: "pointer" }}
>
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

<div
  className="stat-card motor-card"
  onClick={() =>
    navigate("/cases?claim_type=motor")
  }
  style={{ cursor: "pointer" }}
>
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

<div
  className="stat-card pending-card"
  onClick={() =>
    navigate("/cases?status=pending")
  }
  style={{ cursor: "pointer" }}
>
  <h3>{pendingCases}</h3>
  <p>Pending Verification</p>
</div>

<div
  className="stat-card fraud-card"
  onClick={() =>
    navigate("/cases?today=true")
  }
  style={{ cursor: "pointer" }}
>
  <h3>{todaysCases}</h3>
  <p>Today's Cases</p>
</div>

<div
  className="stat-card completed-card"
  onClick={() =>
    navigate("/cases?status=completed")
  }
  style={{ cursor: "pointer" }}
>
  <h3>{completedCases}</h3>
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