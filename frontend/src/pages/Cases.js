import React, { useEffect, useState } from "react";
import { getAllCases } from "../services/api";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    const res = await getAllCases();

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