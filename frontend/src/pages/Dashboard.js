import React, { useEffect, useState, useContext } from "react";
import { getCases } from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
import { LoadingContext } from "../context/LoadingContext";

export default function Dashboard() {
  const [cases, setCases] = useState([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const { setLoading } = useContext(LoadingContext);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);

      const res = await getCases(user.id);

      if (res.cases) {
        const unique = Array.from(
          new Map(res.cases.map((c) => [c.id, c])).values()
        );
        setCases(unique);
      }
    } finally {
      setLoading(false);
    }
  };

  const openCase = (c) => {
    navigate(`/case/${c.id}`, { state: c });
  };

 const filteredCases = cases
  .filter((c) =>
    c.case_id.toLowerCase().includes(search.toLowerCase())
  )
  .filter((c) => {
  if (!startDate && !endDate) return true;

  const caseDate = new Date(c.created_at);

  if (startDate && caseDate < new Date(startDate)) {
    return false;
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (caseDate > end) {
      return false;
    }
  }

  return true;
})
  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  return (
    <div className="page">
      <div className="container">
        <div className="card">

          <div className="dashboard-header">
            <h2>Dashboard</h2>
            <button
              className="new-case-btn"
              onClick={() => navigate("/new-case")}
            >
               New Case
            </button>
          </div>

          <div className="section-card"> 
  <input
    className="search-box"
    placeholder="Search case ID..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />

  <div className="date-range">
    <div className="date-field">
      <label>From Date</label>
      <input
        type="date"
        className="filter-box"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
    </div>

    <div className="date-field">
      <label>To Date</label>
      <input
        type="date"
        className="filter-box"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
    </div>
  </div>
</div>
          

          <h3>Previous Cases</h3>

          {filteredCases.length === 0 && <p>No cases found</p>}

          {filteredCases.map((c) => (
            <div
              key={c.id}
              className="case-card"
              onClick={() => openCase(c)}
            >
              <p><b>Case ID:</b> {c.case_id}</p>
              <p><b>Type:</b> {c.claim_type}</p>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}