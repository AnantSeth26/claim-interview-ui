import React, { useEffect, useState, useRef } from "react";



import {
  getInterviewDetails,
  getVideos,
  getDocuments,
  uploadDocument,
  updateCase
} from "../services/api";

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import { getCaseById } from "../services/api";
import { updateInterview } from "../services/api";
import { getCaseLogs } from "../services/api";
import { reassignCase } from "../services/api";
import { getUsers } from "../services/api";
import { getStatusReport } from "../services/api";
import { formatToIST } from "../utils/time";
import { addRemark, getRemarks, updateRemark } from "../services/api";

import { useLocation, useNavigate, useParams } from "react-router-dom";

import "../styles/case.css";

const motorCategories = [
  "Insured",
  "Driver",
  "Claimant",
  "Accident spot",
  "Hospital",
  "Police station",
  "Eye witnesses",
  "Others"
];

export default function CaseDetails() {
  
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const { state } = useLocation();
  const { id } = useParams();

  const [caseData, setCaseData] = useState(state || null);
  const realCaseId =
    caseData?.case_id && typeof caseData.case_id === "string"
      ? caseData.case_id
      : null;
  console.log("CASE DATA INIT:", state);

  const navigate = useNavigate();
  const [subcategory, setSubcategory] = useState("");

  const [showReassign, setShowReassign] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  
  

  const [interviews, setInterviews] = useState([]);
  const [videos, setVideos] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showUploadChoice, setShowUploadChoice] = useState(false);
  const [uploadMode, setUploadMode] = useState("document");

  const [currentVideo, setCurrentVideo] = useState(0);
  const fileInputRef = useRef(null);

  // ✅ NEW STATES (SAFE ADD)
  const [caseStatus, setCaseStatus] = useState(caseData.case_status || "pending");
  const [fraudFlag, setFraudFlag] = useState(caseData.fraud_flag || "");
  const [fraudReason, setFraudReason] = useState(caseData.fraud_reason || "");
  const [fraudEvidence, setFraudEvidence] = useState(caseData.fraud_evidence || "");

  const [logs, setLogs] = useState([]);

  const [remarks, setRemarks] = useState([]);
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [remarkText, setRemarkText] = useState("");
  const [editingRemarkId, setEditingRemarkId] = useState(null);

  const [statusReport, setStatusReport] = useState([]);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (caseData) {
      loadData();
    } else if (id) {
      fetchCaseById();
    }
  }, [id, caseData]);
  
  useEffect(() => {
    loadUsers();
  }, []);


  useEffect(() => {
    if (caseData) {
      loadData();
    }
  }, [subcategory, caseData]);

  useEffect(() => {
  if (!isProcessing) return;

  const interval = setInterval(() => {
      console.log("Polling for results...");
      loadData();
    }, 5000); // every 5 sec

    return () => clearInterval(interval);
  }, [isProcessing]);

  const loadData = async () => {
    try {
      const safeCaseId =
        caseData?.case_id && typeof caseData.case_id === "string"
          ? caseData.case_id
          : null;

      if (!safeCaseId) {
        console.error("INVALID case_id:", caseData);
        return;
      }

      const interviewRes = await getInterviewDetails(realCaseId, subcategory)
      const videoRes = await getVideos(realCaseId, subcategory);
      const docsRes = await getDocuments(realCaseId, subcategory);
      const logsRes = await getCaseLogs(realCaseId, subcategory);
      const remarksRes = await getRemarks(realCaseId);
      setRemarks(remarksRes || []);
      if (Array.isArray(logsRes)) {
        setLogs(logsRes);
      } else {
        console.error("Invalid logs response:", logsRes);
        setLogs([]);
      }

      const ordered = (interviewRes || []).slice().reverse();
      setInterviews(ordered);
      setVideos([]);  // 🔥 RESET BEFORE SET (CRITICAL FIX)
      const vids = Array.isArray(videoRes) ? videoRes : [];
      setVideos(vids);

      // 🔥 CHECK IF FIRST VIDEO STILL PROCESSING
      if (vids.length > 0) {
        const first = vids[0];
        if (!first?.fraud_result) {
          setIsProcessing(true);
        } else {
          setIsProcessing(false);
        }
      }
      setDocuments(docsRes || []);
    } catch (e) {
      console.error("Error loading case details", e);
    } finally {
      setLoading(false);
    }
  };

  const openStatusReport = async () => {
    try {
      const data = await getStatusReport(caseData.case_id);

      if (Array.isArray(data)) {
        setStatusReport(data);
        setShowReport(true);
      } else {
        console.error("Invalid report response", data);
      }

    } catch (e) {
      console.error("Failed to load status report", e);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {

      const form = new FormData();

      form.append("file", file);
      form.append("case_id", caseData.case_id);
      form.append("subcategory", subcategory || "");
      form.append("upload_mode", uploadMode);

      const res = await uploadDocument(form);

      if (res.error) {
        alert(res.error);
        return;
      }

      alert(
        uploadMode === "verification_photo"
          ? "Verification photo uploaded successfully"
          : "Document uploaded successfully"
      );

      loadData();

    } catch (err) {

      console.error(err);

      alert("Upload failed");

    }

    e.target.value = "";
  };

  const loadUsers = async () => {
    const res = await getUsers();
    if (res.users) {
      setUsers(res.users);
    }
  };

  const fetchCaseById = async () => {
    try {
      const res = await getCaseById(id);

      if (res.case) {
        setCaseData(res.case);
      }

    } catch (err) {
      console.error("Error fetching case:", err);
    }
  };

  // ✅ UPDATE HANDLER
  const handleUpdate = async () => {
    try {
      const res = await updateCase(caseData.id, {
        case_status: caseStatus,
        fraud_flag: fraudFlag,
        fraud_reason: fraudReason,
        fraud_evidence: fraudEvidence
      });

      if (res.message) {
        alert("Updated successfully ✅");

        // 🔥 REFRESH CASE DATA
        await fetchCaseById();
      } else {
        alert("Update failed ❌");
      }

    } catch (err) {
      console.error(err);
      alert("Error updating case ❌");
    }
  };

  const [editingIndex, setEditingIndex] = useState(null);
  const [editedTranscript, setEditedTranscript] = useState("");

  if (!caseData) return <p>No case selected</p>;
  if (loading) return <p>Loading...</p>;



  return (
    <div className="page">
      <div className="container">
        <div className="card">

          {/* <h2>Case Details</h2> */}
          <div className="case-summary-card">
  <div>
    <h2>{caseData.case_id}</h2>
    <p>{caseData.claim_type?.toUpperCase()} CLAIM</p>
  </div>

  <div className="status-badge">
    {caseData.case_status || "Pending"}
  </div>
</div>
          {/* 🔘 TOP ACTION BUTTONS (NEW - SAFE SHIFT) */}
          <div className="section-card case-actions" style={{ marginBottom: "15px" }}>

            <button
              className="secondary-btn"
              onClick={() => setShowReassign(!showReassign)}
            >
              Reassign Case
            </button>

            {caseData.claim_type === "motor" && (
              <button
                className="secondary-btn"
                onClick={openStatusReport}
              >
                View Status Report
              </button>
            )}

          </div>
          {showReassign && (
            <div style={{ marginTop: "10px" }}>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">Select Investigator</option>

                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>

              <button
                onClick={async () => {
                  if (!selectedUserId) {
                    alert("Please select a user");
                    return;
                  }

                  const res = await reassignCase(caseData.id, selectedUserId);

                  if (res.error) {
                    alert(res.error);
                  } else {
                    alert("Case reassigned");
                    setShowReassign(false);
                    
                  }
                }}
              >
                Confirm
              </button>
            </div>
          )}
          {caseData.claim_type === "motor" && (
                <div style={{ marginBottom: "15px" }}>
                  <label>Select Subcategory:</label>

                  <select
                    value={subcategory}
                    onChange={(e) => setSubcategory((e.target.value || "").trim())}
                  >
                    <option value="">Select</option>

                    {motorCategories.map((cat, i) => (
                      <option key={i} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              )}


          {/* 🧾 CASE INFO */}
          <details className="section-card accordion-card" open>
            <summary>Case Information</summary>

            <div className="accordion-content">

             <div className="info-grid">

    <div className="info-item">
      <span>Case ID</span>
      <strong>{caseData.case_id}</strong>
    </div>

    <div className="info-item">
      <span>Bagic No</span>
      <strong>{caseData.bagic_number || "N/A"}</strong>
    </div>

    <div className="info-item">
      <span>District</span>
      <strong>{caseData.district || "N/A"}</strong>
    </div>

    <div className="info-item">
      <span>Police Station</span>
      <strong>{caseData.police_station || "N/A"}</strong>
    </div>

    <div className="info-item">
      <span>FIR No</span>
      <strong>{caseData.fir_no || "N/A"}</strong>
    </div>

    <div className="info-item">
      <span>Unique ID</span>
      <strong>{caseData.id}</strong>
    </div>

  </div>


            </div>
          </details>

          {/* 🚨 FRAUD SECTION */}
          <details className="section-card accordion-card">
            <summary>Investigation</summary>

            <div className="accordion-content">

            <h3>Fraud Identification</h3>

            <div className="info-grid">

  <div className="info-item">
    <span>Fraud Flag</span>
    <strong>{caseData.fraud_flag || "N/A"}</strong>
  </div>

  <div className="info-item">
    <span>Reason</span>
    <strong>{caseData.fraud_reason || "N/A"}</strong>
  </div>

  <div className="info-item">
    <span>Evidence</span>
    <strong>{caseData.fraud_evidence || "N/A"}</strong>
  </div>

</div>

            </div>

            {/* ✏️ UPDATE CASE */}
            <div className="section-card update-section">

              <h3>Update Case</h3>

              <label>Status:</label>
              <select value={caseStatus} onChange={(e) => setCaseStatus(e.target.value)}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="fraud">Fraud</option>
              </select>

              <label>Fraud:</label>
              <select value={fraudFlag} onChange={(e) => setFraudFlag(e.target.value)}>
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="suspected">Suspected</option>
              </select>

              <input
                type="text"
                placeholder="Fraud Reason"
                value={fraudReason}
                onChange={(e) => setFraudReason(e.target.value)}
              />

              <input
                type="text"
                placeholder="Fraud Evidence"
                value={fraudEvidence}
                onChange={(e) => setFraudEvidence(e.target.value)}
              />

              <button onClick={handleUpdate}>
                Save Changes
              </button>

            </div>
          </details>

          


          


          <details className="section-card accordion-card">
            <summary>Interviews & Evidence</summary>

            <div className="accordion-content">

            



              {/* 🎥 VIDEO SECTION */}
              <h3>Videos</h3>
              <div className="section-card">

              {videos.length === 0 && <p>No videos available</p>}

              {videos.length > 0 && (
                <div className="video-carousel">

                  <button className="nav-btn" onClick={() =>
                    setCurrentVideo(prev => prev === 0 ? videos.length - 1 : prev - 1)
                  }>◀</button>

                  <div className="video-wrapper">
                    <video key={currentVideo} controls>
                      <source src={videos[currentVideo]?.video_url} type="video/webm" />
                    </video>

                    {isProcessing && !videos[currentVideo]?.fraud_result && (
                      <div style={{
                        marginTop: "10px",
                        padding: "10px",
                        borderRadius: "8px",
                        background: "#fff3cd",
                        color: "#856404",
                        fontSize: "14px"
                      }}>
                        ⏳ Processing  results... Please wait
                      </div>
                    )}

                    {videos[currentVideo]?.liveness_result && (
                      <div style={{
                        marginTop: "10px",
                        padding: "10px",
                        borderRadius: "8px",
                        background: "#f1f5f9",
                        fontSize: "14px"
                      }}>
                        <b>Status:</b> {videos[currentVideo].liveness_result.status} <br />
                        <b>Confidence:</b> {videos[currentVideo].liveness_result.confidence} <br />
                        <b>Liveness:</b> {
                          (() => {
                            const lr = videos[currentVideo].liveness_result;
                            const parsed = typeof lr === "string" ? JSON.parse(lr) : lr;
                            return parsed?.liveness ? "Live" : "Spoof";
                          })()
                        }
                      </div>
                    )}

                    {videos[currentVideo]?.audio_result && (() => {
                      const ar = videos[currentVideo].audio_result;
                      const parsed = typeof ar === "string" ? JSON.parse(ar) : ar;

                      return (
                        <div style={{
                          marginTop: "10px",
                          padding: "10px",
                          borderRadius: "8px",
                          background: "#eef6ff",
                          fontSize: "14px"
                        }}>
                          <b>Trust Score:</b> {parsed?.trust_score} <br />
                          <b>Stress:</b> {parsed?.stress} <br />
                          <b>Hesitation:</b> {parsed?.hesitation}
                        </div>
                      );
                    })()}

                    {videos[currentVideo]?.fraud_result && (() => {
                      const fr = videos[currentVideo].fraud_result;
                      const parsed = typeof fr === "string" ? JSON.parse(fr) : fr;

                      const riskColor =
                        parsed?.risk === "Low Risk" ? "#16a34a" :
                        parsed?.risk === "Medium Risk" ? "#eab308" :
                        "#dc2626";

                      return (
                        <div style={{
                          marginTop: "10px",
                          padding: "12px",
                          borderRadius: "10px",
                          background: "#fef3c7",
                          fontSize: "15px",
                          fontWeight: "500"
                        }}>
                          <b>Fraud Score:</b> {parsed?.fraud_score} <br />
                          <b style={{ color: riskColor }}>
                            Risk: {parsed?.risk}
                          </b>
                        </div>
                      );
                    })()}

                    <p className="video-index">
                      {currentVideo + 1} / {videos.length}
                    </p>
                  </div>

                  <button className="nav-btn" onClick={() =>
                    setCurrentVideo(prev => prev === videos.length - 1 ? 0 : prev + 1)
                  }>▶</button>

                </div>
              )}
              </div>

              {/* 🧾 INTERVIEWS */}
              <h3>Interview Transcript</h3>

              {interviews.length === 0 && <p>No interviews</p>}

              <div className="interview-list">
                {interviews.map((intv, idx) => (
                  <div key={idx} className="interview-card">

                    <div className="interview-header">
                      <span>Interview #{idx + 1}</span>
                      <span className="status">{intv.status}</span>
                    </div>

                    <p className="location">
                      📍 {intv.location_text || "N/A"}
                    </p>

                    <div className="transcript-box">

                      {editingIndex === idx ? (
                        <>
                          <textarea
                            value={editedTranscript}
                            onChange={(e) => setEditedTranscript(e.target.value)}
                            rows={5}
                          />

                          <button
                            onClick={async () => {
                              const res = await updateInterview(intv.id, {
                                full_transcript: editedTranscript
                              });

                              if (res.message) {
                                alert("Transcript updated ✅");
                                setEditingIndex(null);
                                loadData(); // refresh
                              } else {
                                alert("Update failed ❌");
                              }
                            }}
                          >
                            Save
                          </button>

                          <button onClick={() => setEditingIndex(null)}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          {intv.full_transcript || "No transcript"}

                          <button
                            onClick={() => {
                              setEditingIndex(idx);
                              setEditedTranscript(intv.full_transcript || "");
                            }}
                          >
                            Edit
                          </button>
                        </>
                      )}

                    </div>

                    {intv.qa_script && (
                      <div className="qa-box">
                        <b>Q&A:</b>

                        {(() => {
                          try {
                            let text = intv.qa_script;
                            if (text.includes("[")) {
                              text = text.substring(text.indexOf("["));
                            }

                            const parsed = JSON.parse(text);

                            if (Array.isArray(parsed)) {
                              return parsed.map((q, i) => (
                                <div key={i}>
                                  <p><b>Q:</b> {q.question}</p>
                                  <p><b>A:</b> {q.answer}</p>
                                </div>
                              ));
                            }

                            return <p>No valid Q&A</p>;

                          } catch {
                            return <p>No valid Q&A</p>;
                          }
                        })()}

                      </div>
                    )}

                  </div>
                ))}
              </div>

              {documents.some(
                d => d.subcategory === "verification_photo"
              ) && (
                <div
                  style={{
                    marginBottom: "10px",
                    padding: "10px",
                    background: "#dcfce7",
                    borderRadius: "8px"
                  }}
                >
                  Verification Photo Uploaded ✅
                </div>
              )}

              <h3>Documents</h3>

              {documents.length === 0 && <p>No documents</p>}

              <div className="doc-list">
                {documents.map((doc, i) => (
                  <a key={i} href={doc.file_url} target="_blank" rel="noreferrer" className="doc-item">
                    📄 {doc.file_type}
                  </a>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap"
                }}
              >

                <button
                  onClick={() =>
                    navigate(
                      `/case/${caseData.case_id}/document-analysis`
                    )
                  }
                >
                  Analyze Documents
                </button>

                <button
                  onClick={() =>
                    navigate(
                      `/case/${caseData.case_id}/statement-analysis`
                    )
                  }
                >
                  Analyze Statements
                </button>

              </div>

            </div>
          </details>


          <details className="section-card accordion-card">
            <summary>Case Timeline</summary>

            <div className="accordion-content">

              {/* 🕒 CASE TIMELINE */}
              <h3>Case Timeline</h3>

              {logs.length === 0 && <p>No activity yet</p>}

              <div>
               <div className="timeline">
  {logs.map((log, i) => (
    <div key={i} className="timeline-item">

      <div className="timeline-dot"></div>

      <div className="timeline-content">
        <h4>{log.action.replaceAll("_", " ")}</h4>

        <p>{log.description}</p>

        <small>
          {formatToIST(log.created_at)}
        </small>
      </div>

    </div>
  ))}
</div>
              </div>

            </div>
          </details> 

         <div className="remarks-card">
  <h3>Remarks</h3>

  {remarks.length === 0 ? (
    <p>No remarks available</p>
  ) : (
    remarks.map((r) => (
      <div key={r.id} className="remark-item">
        <p>{r.text}</p>
      </div>
    ))
  )}
</div>

         <div className="remarks-card">
  <h3>Remarks</h3>

  {remarks.length === 0 ? (
    <p>No remarks available</p>
  ) : (
    remarks.map((r) => (
      <div key={r.id} className="remark-item">

        <p className="remark-text">
          {r.text}
        </p>

        <p className="remark-author">
  Added by {r.created_by || "Unknown"}
</p>

        <button
          className="remark-edit-btn"
          onClick={() => {
            setEditingRemarkId(r.id);
            setRemarkText(r.text);
            setShowRemarkModal(true);
          }}
        >
          Edit
        </button>

      </div>
    ))
  )}
</div>
          {/* 🔘 ACTION BUTTONS */}
          <div className="section-card case-actions">

            

            


            <button
              className="secondary-btn"
              onClick={() => setShowRemarkModal(true)}
            >
              Add Remarks
            </button>

            <button
              onClick={() => setShowUploadChoice(true)}
            >
              Add Documents
            </button>

            <button
              className="secondary-btn"
              onClick={() => {

  // ✅ HEALTH CASE → ALWAYS DIRECT
  if (caseData.claim_type === "health") {
    navigate("/interview", {
      state: {
        ...caseData,
        category: "health",
        subcategory: null,
        fromCaseDetails: true
      }
    });
    return;
  }

  // ✅ MOTOR CASE
  if (caseData.claim_type === "motor") {

    // 🔴 MUST SELECT SUBCATEGORY
    if (!subcategory) {
      alert("Please select subcategory first");
      return;
    }

    const selectedSub = subcategory.trim().toLowerCase();

    // ✅ CHECK IF INTERVIEW EXISTS FOR THIS SUBCATEGORY
    const hasInterviewForSubcategory =
      interviews &&
      interviews.some(
        (i) =>
          (i.subcategory || "").trim().toLowerCase() === selectedSub
      );

    // ✅ ALWAYS GO DIRECT (NO NEW-CASE)
    navigate("/interview", {
      state: {
        ...caseData,
        category: "motor",
        subcategory: selectedSub,
        fromCaseDetails: true,
        hasPreviousInterview: hasInterviewForSubcategory // safe flag
      }
    });

    return;
  }

}}
            >
              New Interview
            </button>

            <input
              ref={fileInputRef}
              type="file"
              style={{ display: "none" }}
              accept={
                uploadMode === "verification_photo"
                  ? "image/*"
                  : "*"
              }
              capture={
                uploadMode === "verification_photo"
                  ? "user"
                  : undefined
              }
              onChange={handleUpload}
            />

          </div>

          {showRemarkModal && (
            <div style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999
            }}>
              <div style={{
                background: "#1e1e1e",
                padding: "20px",
                borderRadius: "10px",
                width: "90%",
                maxWidth: "400px"
              }}>
                <h3>Add Remark</h3>

                <textarea
                  placeholder="Enter remark..."
                  value={remarkText}
                  onChange={(e) => setRemarkText(e.target.value)}
                  style={{ width: "100%", marginBottom: "10px" }}
                />

               <button
  onClick={async () => {

    if (editingRemarkId) {

      await updateRemark(editingRemarkId, {
        text: remarkText
      });

    } else {

      await addRemark(caseData.case_id, {
        text: remarkText,
        created_by:
          user?.name ||
          JSON.parse(localStorage.getItem("user"))?.name ||
          "Unknown"
      });

    }

    setRemarkText("");
    setEditingRemarkId(null);
    setShowRemarkModal(false);

    loadData();
  }}
>
  {editingRemarkId ? "Save Changes" : "Add Remark"}
</button>

                <button
                  style={{ marginTop: "10px" }}
                  onClick={() => setShowRemarkModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}



          {showReport && (
            <div style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999
            }}>
              <div style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "10px",
                width: "90%",
                maxWidth: "400px"
              }}>
                <h3>Status Report</h3>

                {statusReport.map((item) => (
                  <div key={item.subcategory} style={{ marginBottom: "8px" }}>
                    <b>{item.subcategory}</b> →{" "}
                    {item.status === "completed" ? "✅ Completed" : "❌ Pending"}
                  </div>
                ))}

                <button
                  style={{ marginTop: "10px" }}
                  onClick={() => setShowReport(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}


          {showUploadChoice && (

            <div className="modal-overlay">

              <div className="modal-box">

                <h3>Select Upload Type</h3>

                <button
                  onClick={() => {

                    setUploadMode("document");

                    setShowUploadChoice(false);

                    fileInputRef.current.click();
                  }}
                >
                  Upload Document
                </button>

                <button
                  onClick={() => {

                    setUploadMode("verification_photo");

                    setShowUploadChoice(false);

                    fileInputRef.current.click();
                  }}
                >
                  Upload Verification Photo
                </button>

                <button
                  className="secondary-btn"
                  onClick={() => setShowUploadChoice(false)}
                >
                  Cancel
                </button>

              </div>

            </div>

          )}

          

        </div>
      </div>
    </div>
  );
}