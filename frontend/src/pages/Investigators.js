import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { getAllCases } from "../services/api";

export default function Investigators() {
  const [investigators, setInvestigators] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
const [selectedInvestigator, setSelectedInvestigator] = useState(null);
const [editName, setEditName] = useState("");
const [editPhone, setEditPhone] = useState("");
const [showAddModal, setShowAddModal] = useState(false);

const [newName, setNewName] = useState("");
const [newPhone, setNewPhone] = useState("");
const [newRole, setNewRole] = useState("user");

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
  phone: c.phone || "-",
  disabled: false
}
            ])
        ).values()
      ];

      setInvestigators(unique);
    }
  };
  const toggleStatus = (index) => {
  const updated = [...investigators];

  updated[index].disabled = !updated[index].disabled;

  setInvestigators(updated);
};
  const openEdit = (inv) => {
  setSelectedInvestigator(inv);
  setEditName(inv.name);
  setEditPhone(inv.phone);
  setShowEditModal(true);
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
  onClick={() => setShowAddModal(true)}
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
               <th>Action</th>
            </tr>
          </thead>

          <tbody>
  {investigators.map((inv, index) => (
    <tr key={index}>
      <td>{inv.name}</td>
      <td>{inv.phone}</td>

      <td>
  <div
    style={{
      display: "flex",
      gap: "10px"
    }}
  >
    <button
      className="view-btn"
      onClick={() => openEdit(inv)}
    >
      Edit
    </button>

    <button
      onClick={() => toggleStatus(index)}
      style={{
        background: inv.disabled ? "#dc2626" : "#16a34a",
        color: "#fff",
        border: "none",
        padding: "8px 16px",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "600"
      }}
    >
      {inv.disabled ? "Enable" : "Disable"}
    </button>
  </div>
</td>

    </tr>
  ))}
</tbody>
        </table>
      </div>
      {showEditModal && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    }}
  >
    <div
      style={{
        background: "#fff",
        padding: "25px",
        borderRadius: "10px",
        width: "400px",
      }}
    >
      <h2>Edit Investigator</h2>

      <input
        type="text"
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
        placeholder="Name"
        style={{
          width: "100%",
          marginBottom: "15px",
          padding: "10px",
        }}
      />

      <input
        type="text"
        value={editPhone}
        onChange={(e) => setEditPhone(e.target.value)}
        placeholder="Phone Number"
        style={{
          width: "100%",
          marginBottom: "20px",
          padding: "10px",
        }}
      />

      <div
        style={{
          display: "flex",
          gap: "10px",
        }}
      >
        <button
          className="view-btn"
          onClick={() => {
            alert("Frontend only. Backend update will be added later.");
            setShowEditModal(false);
          }}
        >
          Save
        </button>

        <button
          className="secondary-btn"
          onClick={() => setShowEditModal(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
{showAddModal && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    }}
  >
    <div
      style={{
        background: "#fff",
        padding: "25px",
        borderRadius: "10px",
        width: "420px",
      }}
    >
      <h2>Add Investigator</h2>

      <input
        type="text"
        placeholder="Name"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
        }}
      />

      <input
        type="text"
        placeholder="Phone Number"
        value={newPhone}
        onChange={(e) => setNewPhone(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
        }}
      />

      <select
        value={newRole}
        onChange={(e) => setNewRole(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "20px",
        }}
      >
        <option value="admin">Admin</option>
        <option value="user">User</option>
      </select>

      <div
        style={{
          display: "flex",
          gap: "10px",
        }}
      >
        <button
          className="view-btn"
          onClick={() => {
            alert("Frontend only");

            setShowAddModal(false);

            setNewName("");
            setNewPhone("");
            setNewRole("user");
          }}
        >
          Save
        </button>

        <button
          className="secondary-btn"
          onClick={() => setShowAddModal(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
    </AdminLayout>
  );
}