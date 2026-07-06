import React, { useEffect, useState } from "react";
import { getAllCases } from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import AdminLayout from "./AdminLayout";

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [search, setSearch] = useState("");
const [districtFilter, setDistrictFilter] = useState("");
const [policeFilter, setPoliceFilter] = useState("");
const [investigatorFilter, setInvestigatorFilter] = useState("");
const [claimType, setClaimType] = useState("");

const [allocationFrom, setAllocationFrom] = useState("");
const [allocationTo, setAllocationTo] = useState("");

const [firFrom, setFirFrom] = useState("");
const [firTo, setFirTo] = useState("");

const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");

  const navigate = useNavigate();

  const location = useLocation();

const params = new URLSearchParams(location.search);

const statusFilter = params.get("status");
const claimTypeFilter = params.get("claim_type");
const assignedFilter = params.get("filter");
const todayFilter = params.get("today");

const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadCases();
  }, []);

 const loadCases = async () => {
  const res = await getAllCases();

  console.log("Cases:", res.cases);

  if (res.cases) {
    setCases(res.cases);
  }
};

  const openCase = (c) => {
    navigate(`/case/${c.id}`, { state: c });
  };

  return (
    <AdminLayout>
      <div className="cases-page">

        <div className="table-header">
  <h1>All Cases</h1>

  <span>
    Showing {
      cases.filter((c) =>
        c.case_id?.toLowerCase().includes(search.toLowerCase())
      ).length
    } Cases
  </span>
</div>

<div className="cases-search">
  <input
    type="text"
    placeholder="Search Case ID..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />

  <input
    type="date"
    value={fromDate}
    onChange={(e) => setFromDate(e.target.value)}
  />

  <input
    type="date"
    value={toDate}
    onChange={(e) => setToDate(e.target.value)}
  />
</div>
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

  .filter((c) =>
    claimType
      ? c.claim_type === claimType
      : true
  )

  .filter((c) =>
    statusFilter
      ? c.case_status?.toLowerCase() === statusFilter.toLowerCase()
      : true
  )

  .filter((c) =>
    claimTypeFilter
      ? c.claim_type === claimTypeFilter
      : true
  )

  .filter((c) =>
    assignedFilter === "assigned"
      ? !!c.investigator_name
      : true
  )

  .filter((c) =>
    todayFilter === "true"
      ? c.created_at?.startsWith(today)
      : true
  )

  // Teammate's date filter
  .filter((c) => {
    const caseDate = new Date(c.created_at);

    if (fromDate) {
      const from = new Date(fromDate);
      if (caseDate < from) return false;
    }

    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      if (caseDate > to) return false;
    }

    return true;
  })

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
        </div>

      </div>
    </AdminLayout>
  );
}