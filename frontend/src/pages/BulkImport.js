import React, { useState } from "react";
import { uploadExcel } from "../services/api";
import AdminLayout from "./AdminLayout";

export default function BulkImport() {

  const [file, setFile] = useState(null);

  const handleUpload = async () => {

    if (!file) {
      alert("Please select a file");
      return;
    }

    try {

      const res = await uploadExcel(file);

      if (res.message) {
        alert("Upload Successful");
        setFile(null);
      } else {
        alert("Upload Failed");
      }

    } catch (err) {
      console.error(err);
      alert("Upload Error");
    }

  };

  return (
    <AdminLayout>

      <div className="card">

        <h1>Bulk Case Import</h1>

        <br />

        <input
          type="file"
          accept=".xlsx"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <br />
        <br />

        <button
          className="upload-btn"
          onClick={handleUpload}
        >
          Upload Excel File
        </button>

      </div>

    </AdminLayout>
  );
}