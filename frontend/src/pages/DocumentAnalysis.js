import React, { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import axios from "axios";

import "../styles/document-analysis.css";

export default function DocumentAnalysis() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);

  const [selectedDoc, setSelectedDoc] = useState(null);

  const [loading, setLoading] = useState(false);

  const [results, setResults] = useState(null);

  const [search, setSearch] = useState("");

const [filter, setFilter] = useState("all");

  // ==========================================
  // LOAD DOCUMENTS
  // ==========================================

  useEffect(() => {

    loadDocuments();

  }, []);

  const loadDocuments = async () => {

    try {

      const res = await axios.get(
        `http://localhost:8000/documents/${id}`
      );

      setDocuments(res.data || []);

    } catch (e) {

      console.error(e);

    }
  };

  // ==========================================
  // ANALYZE
  // ==========================================

  const analyzeDocument = async () => {

    if (!selectedDoc) {

      alert("Select document first");

      return;
    }

    try {

      setLoading(true);

      setResults(null);

      const res = await axios.post(
        `http://localhost:8000/document-fraud/analyze/${selectedDoc.id}`
      );

      console.log(
        "ANALYSIS RESPONSE:",
        res.data
      );

      setResults(res.data);

    } catch (e) {

      console.error(e);

      alert("Analysis failed");

    } finally {

      setLoading(false);

    }
  };
  const imageCount = documents.filter(doc =>
  doc.file_type?.startsWith("image")
).length;

const pdfCount = documents.filter(doc =>
  doc.file_type === "application/pdf"
).length;


const filteredDocuments = documents.filter((doc) => {

  const matchSearch =
    doc.file_type
      .toLowerCase()
      .includes(search.toLowerCase());

  if (filter === "image")
    return matchSearch && doc.file_type.startsWith("image");

  if (filter === "pdf")
    return matchSearch && doc.file_type.includes("pdf");

  return matchSearch;

});

  return (

    <div className="page">

      <div className="container">

        <div className="card">

         <div className="analysis-header">

 

  <div>
    <h2>Document Analysis</h2>

    <p className="analysis-subtitle">
      AI powered forensic analysis for uploaded claim documents
    </p>
    <div className="stats-bar">

  <div className="stat-box">
    <h3>{documents.length}</h3>
    <p>Documents</p>
  </div>

  <div className="stat-box">
    <h3>{imageCount}</h3>
    <p>Images</p>
  </div>

  <div className="stat-box">
    <h3>{pdfCount}</h3>
    <p>PDF Files</p>
  </div>

</div>
  </div>

</div>
<div className="toolbar">

  <input
    type="text"
    placeholder="Search documents..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />

  <div className="filter-buttons">

    <button
      className={filter==="all" ? "active" : ""}
      onClick={()=>setFilter("all")}
    >
      All
    </button>

    <button
      className={filter==="image" ? "active" : ""}
      onClick={()=>setFilter("image")}
    >
      Images
    </button>

    <button
      className={filter==="pdf" ? "active" : ""}
      onClick={()=>setFilter("pdf")}
    >
      PDFs
    </button>

  </div>

</div>

          {/* ================================= */}
          {/* DOCUMENT LIST */}
          {/* ================================= */}

          <div className="doc-grid">

  {filteredDocuments.map((doc) => {

    const isPdf = doc.file_type?.includes("pdf");

    return (

      <div
        key={doc.id}
        className={`doc-card ${
          selectedDoc?.id === doc.id
            ? "selected"
            : ""
        }`}
        onClick={() => setSelectedDoc(doc)}
      >

        <div className="doc-preview">

          {isPdf ? (

            <div className="pdf-icon">
              📄
            </div>

          ) : (

            <img
              src={doc.file_url}
              alt="document"
            />

          )}

        </div>

        <div className="doc-info">

          <h4>
            {isPdf ? "PDF Document" : "Image Document"}
          </h4>

          <p>{doc.file_type}</p>

        </div>

        {selectedDoc?.id === doc.id && (

          <span className="selected-badge">
            ✓ Selected
          </span>

        )}

      </div>

    );

  })}

</div>

          <button
  className="analyze-btn"
  onClick={analyzeDocument}
  disabled={loading}
>

  {loading
    ? "Analyzing Document..."
    : "🔍 Analyze Selected Document"}

</button>

          {/* ================================= */}
          {/* RESULTS */}
          {/* ================================= */}


          {results?.success && (

  <div className="analysis-results">

    <div className="summary-card">

      <div className="summary-left">

        <h2>Overall Assessment</h2>

        <h1
          style={{
            color:
              results.final_score < 30
                ? "#16a34a"
                : results.final_score < 70
                ? "#f59e0b"
                : "#dc2626"
          }}
        >
          {results.final_verdict}
        </h1>

      </div>

      <div className="summary-right">

        <div className="score-circle">

          <h1>{results.final_score}</h1>

          <span>/100</span>

        </div>

      </div>

    </div>

    <div className="summary-grid">

      <div className="summary-item">

        <span>Risk Level</span>

        <strong>
          {results.final_score < 30
            ? "Low"
            : results.final_score < 70
            ? "Medium"
            : "High"}
        </strong>

      </div>

      <div className="summary-item">

        <span>AI Modules</span>

        <strong>
          {Object.keys(results.modules).length}
        </strong>

      </div>

      <div className="summary-item">

        <span>Analysis Status</span>

        <strong>Completed</strong>

      </div>

    </div>


              {/* ================================= */}
              {/* AI DETECTION */}
              {/* ================================= */}

              <div className="result-card">

<div className="result-header">

<h3>🤖 AI Detection</h3>

<span
className={
results.modules.ai_detection.label === "Genuine"
? "badge-success"
: "badge-danger"
}
>

{results.modules.ai_detection.label}

</span>

</div>

<div className="result-content">

<p>

<strong>Confidence</strong>

{results.modules.ai_detection.confidence}%

</p>

</div>

</div>

              {results?.modules?.face_verification && (

                <div className="result-card">

                  <h4>
                    Face Verification
                  </h4>

                  <p>

                    <strong>
                      Match Score:
                    </strong>

                    {" "}

                    {
                      results.modules
                        .face_verification
                        .score
                    }%

                  </p>

                  <p>

                    <strong>
                      Status:
                    </strong>

                    {" "}

                    {
                      results.modules
                        .face_verification
                        .status
                    }

                  </p>

                </div>

              )}

              {/* ================================= */}
              {/* METADATA */}
              {/* ================================= */}

              <div className="result-card">

  <div className="result-header">

    <h3>📋 Metadata Analysis</h3>

    <span
      className={
        results.modules.metadata.verdict === "Clean"
          ? "badge-success"
          : "badge-warning"
      }
    >
      {results.modules.metadata.verdict}
    </span>

  </div>

  <div className="result-content">

    <p>
      <strong>Score:</strong>{" "}
      {results.modules.metadata.score}
    </p>

    {results.modules.metadata.reasons?.map((reason, i) => (

      <div
        key={i}
        className="reason-item"
      >
        • {reason}
      </div>

    ))}

  </div>

</div>

              {/* ================================= */}
              {/* ELA */}
              {/* ================================= */}

              <div className="result-card">

  <div className="result-header">

    <h3>🖼 Error Level Analysis</h3>

    <span
      className={
        results.modules.ela.verdict === "Clean"
          ? "badge-success"
          : "badge-warning"
      }
    >
      {results.modules.ela.verdict}
    </span>

  </div>

  <div className="result-content">

    <p>
      <strong>Score:</strong>{" "}
      {results.modules.ela.score}
    </p>

  </div>

  <div className="image-grid">

                  <div>

                    <h5>ELA Image</h5>

                    <img
                      src={`http://localhost:8000${results.modules.ela.images.ela}`}
                      alt=""
                    />

                  </div>

                  <div>

                    <h5>Mask</h5>

                    <img
                      src={`http://localhost:8000${results.modules.ela.images.mask}`}
                      alt=""
                    />

                  </div>

                  <div>

                    <h5>Overlay</h5>

                    <img
                      src={`http://localhost:8000${results.modules.ela.images.overlay}`}
                      alt=""
                    />

                  </div>

                  <div>

                    <h5>Detected Regions</h5>

                    <img
                      src={`http://localhost:8000${results.modules.ela.images.boxed}`}
                      alt=""
                    />

                  </div>

                </div>

              </div>

              {/* ================================= */}
              {/* MANTRANET */}
              {/* ================================= */}


              {/* ================================= */}
              {/* COPY MOVE */}
              {/* ================================= */}

              <div className="result-card">

               <h3>🧩 Copy Move Detection</h3>

               <p>
  <strong>Score:</strong>{" "}
  {results.modules.copy_move.score}
</p>

<p>
  <strong>Verdict:</strong>{" "}
  {results.modules.copy_move.verdict}
</p>
                <div className="image-grid">

                  <div>

                    <h5>Visualization</h5>

                    <img
                      src={`http://localhost:8000${results.modules.copy_move.images.visualization}`}
                      alt=""
                    />

                  </div>

                </div>

              </div>

              {/* ================================= */}
              {/* FACE TAMPERING */}
              {/* ================================= */}

              <div className="result-card">

                <h3>👤 Face Tampering Detection</h3>

               <p>
  <strong>Score:</strong>{" "}
  {results.modules.face_tamper.score}
</p>

<p>
  <strong>Verdict:</strong>{" "}
  {results.modules.face_tamper.verdict}
</p>

                <div className="image-grid">

                  <div>

                    <h5>Detected Face Regions</h5>

                    <img
                      src={`http://localhost:8000${results.modules.face_tamper.images.visualization}`}
                      alt=""
                    />

                  </div>

                </div>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}