import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { getAllCases } from "../services/api";

export default function Investigators() {
  const [investigators, setInvestigators] = useState([]);

  useEffect(() => {
    loadInvestigators();
  }, []);

  const loadInvestigators = async () => {
    const res = await getAllCases();

    if (res.cases) {
      const unique = [
        ...new Map(
          res.cases
            .filter(c => c.investigator_name)
            .map(c => [
              c.investigator_name,
              {
                name: c.investigator_name,
                phone: c.phone || "-"
              }
            ])
        ).values()
      ];

      setInvestigators(unique);
    }
  };

  return (
    <AdminLayout>
     <div
  className="table-header"
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  }}
>
  <h1 style={{ margin: 0 }}>Investigators</h1>

  <button
    className="upload-btn"
    style={{
      width: "220px",
      padding: "12px 20px",
    }}
  >
    + Add Investigator
  </button>
</div>

      <div className="table-container">
        <table className="cases-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone Number</th>
            </tr>
          </thead>

          <tbody>
            {investigators.map((inv, index) => (
              <tr key={index}>
                <td>{inv.name}</td>
                <td>{inv.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}