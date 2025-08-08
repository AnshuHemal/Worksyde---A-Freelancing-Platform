import React, { useEffect, useState } from "react";
import Header2 from "../../components/Header2";
import innovate from "../../assets/innovate.svg";
import { HiOutlineDocumentCurrencyRupee } from "react-icons/hi2";
import { IoCalendarOutline, IoDocumentAttach } from "react-icons/io5";
import { BsArrowLeft, BsCheckCircle, BsPencil, BsX, BsClock, BsBriefcase } from "react-icons/bs";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const JobProposalSubmit = () => {
  const location = useLocation();
  const pathParts = location.pathname.split("/");

  // ["", "ws", "proposals", "6842d69ab5d7d6f3b5cb99e8"]
  const jobProposalId = pathParts[3];

  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [optionalMessage, setOptionalMessage] = useState("");

  const withdrawReasons = [
    "Applied by mistake",
    "Rate too low",
    "Scheduling conflict with client",
    "Unresponsive client",
    "Inappropriate client behavior",
    "Other",
  ];

  const API_URL = "http://localhost:5000/api/auth";

  const formatPostDate = (dateString) => {
    const createdDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (d1, d2) =>
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();

    if (isSameDay(createdDate, today)) {
      return "Today";
    } else if (isSameDay(createdDate, yesterday)) {
      return "Yesterday";
    } else {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(createdDate);
    }
  };

  const handleEditProposal = () => {
    navigate(`/ws/proposals/job/~${jobData.jobId.id}/edit`, {
      state: { jobProposalId: jobData._id },
    });
  };

  useEffect(() => {
    axios
      .get(`${API_URL}/current-user`, { withCredentials: true })
      .then((res) => {
        setUser(res.data.user);
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
      });
  }, []);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await axios.post(
          `${API_URL}/jobproposalsbyid/fetch/`,
          {
            userId: user.id || user._id,
            jobProposalId: jobProposalId,
          }
        );
        setJobData(response.data.data);
      } catch (error) {
        console.error("Error fetching job post:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchJobDetails();
    }
  }, [jobProposalId, user]);

  if (loading || !jobData) {
    return (
      <div
        className="d-flex justify-content-center align-items-center min-vh-100"
        style={{ background: "#fff" }}
      >
        <div
          className="spinner-border"
          style={{ color: "#007674" }}
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header2 />
      <style>{`
  .skill-tag {
    background: linear-gradient(135deg, rgba(0, 118, 116, 0.1) 0%, rgba(0, 118, 116, 0.05) 100%);
    color: #007674;
    border: 1px solid rgba(0, 118, 116, 0.2);
    border-radius: 20px;
    padding: 6px 12px;
    font-size: 0.95rem;
    font-weight: 600;
    transition: all 0.3s ease;
    cursor: pointer;
    display: inline-block;
  }
  .skill-tag:hover {
    background: linear-gradient(135deg, #007674 0%, #005a58 100%);
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 118, 116, 0.3);
  }
  @media (min-width: 992px) {
    .sticky-sidebar {
      position: sticky;
      top: 40px;
    }
  }
`}</style>
      <div
        className="min-vh-100 section-container"
        style={{
          backgroundColor: "#f7f8fa",
          padding: "40px 0 80px 0",
          fontFamily: "Urbanist, sans-serif",
          fontWeight: 500,
        }}
      >
        <div className="container-fluid px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="row g-0">
              {/* Left Column - Proposal Details */}
              <div className="col-lg-8" style={{ padding: 30 }}>
                {/* Header */}
                <div className="mb-4">
                  <h2 className="fw-semibold mb-2" style={{ color: "#121212", fontSize: "2rem" }}>
                    Proposal Summary
                  </h2>
                  <p className="mb-0" style={{ fontSize: "1.1rem", color: "#666", lineHeight: "1.5" }}>
                    Review your submitted proposal and track its status.
                  </p>
                </div>
                {/* Action Bar */}
                <div className="d-flex gap-3 mb-4 flex-wrap">
                  <button
                    className="btn fw-semibold px-4 py-2"
                    style={{
                      borderRadius: "50px",
                      background: "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                      color: "#fff",
                      fontSize: "1rem",
                      boxShadow: "0 4px 15px rgba(0, 118, 116, 0.3)",
                      border: "none",
                      transition: "all 0.3s ease",
                    }}
                    onClick={handleEditProposal}
                    onMouseEnter={e => {
                      e.target.style.background = "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 6px 20px rgba(18, 18, 18, 0.4)";
                    }}
                    onMouseLeave={e => {
                      e.target.style.background = "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 4px 15px rgba(0, 118, 116, 0.3)";
                    }}
                  >
                    <BsPencil className="me-2" /> Edit Proposal
                  </button>
                  <button
                    className="btn fw-semibold px-4 py-2"
                    style={{
                      borderRadius: "50px",
                      color: "#dc3545",
                      borderColor: "#dc3545",
                      background: "linear-gradient(135deg, #fff5f5 0%, #fff 100%)",
                      boxShadow: "0 2px 8px rgba(220, 53, 69, 0.1)",
                      fontSize: "1rem",
                      transition: "all 0.3s ease",
                    }}
                    onClick={() => setShowModal(true)}
                    onMouseEnter={e => {
                      e.target.style.background = "linear-gradient(135deg, #ffe6e6 0%, #fff5f5 100%)";
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 6px 20px rgba(220, 53, 69, 0.2)";
                    }}
                    onMouseLeave={e => {
                      e.target.style.background = "linear-gradient(135deg, #fff5f5 0%, #fff 100%)";
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 2px 8px rgba(220, 53, 69, 0.1)";
                    }}
                  >
                    <BsX className="me-2" /> Withdraw Proposal
                  </button>
                </div>
                {/* Info Alert */}
                <div
                  className="alert alert-info border-0 mb-4 mx-auto"
                  style={{
                    maxWidth: "800px",
                    borderRadius: "15px",
                    background: "linear-gradient(135deg, #e8f4f4 0%, #f0f9f9 100%)",
                    border: "1px solid rgba(0, 118, 116, 0.2)",
                    color: "#007674",
                    fontSize: "1rem",
                    fontWeight: 500,
                  }}
                >
                  <BsCheckCircle className="me-2" />
                  You can edit any detail for up to 5 hours, or until your proposal is viewed.
                </div>
                {/* Proposal Details Card */}
                <div className="mb-4">
                  <div className="card border-0 shadow-lg h-100 mb-4" style={{ borderRadius: "25px", background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)", border: "1px solid rgba(0, 118, 116, 0.1)" }}>
                    <div className="card-body p-5">
                      <h4 className="fw-semibold mb-4" style={{ color: "#121212" }}>Job Details</h4>
                      <div className="d-flex flex-wrap align-items-center mb-3 gap-3">
                        <h5 className="fw-semibold mb-2" style={{ color: "#007674" }}>{jobData.jobId.title}</h5>
                        <span className="text-muted" style={{ fontSize: "0.95rem", fontWeight: 500 }}>
                          Posted {formatPostDate(jobData.createdAt)}
                        </span>
                      </div>
                      <p className="mb-4" style={{ fontSize: "1.1rem", fontWeight: 500, color: "#333", lineHeight: "1.6", whiteSpace: "pre-line" }}>{jobData.jobId.description}</p>
                      <div className="mb-3">
                        <span className="me-3" style={{ color: "#007674", fontWeight: 600 }}>
                          <BsClock className="me-1" /> {jobData.jobId.duration}
                        </span>
                        <span className="me-3" style={{ color: "#007674", fontWeight: 600 }}>
                          <BsBriefcase className="me-1" /> {jobData.jobId.experienceLevel}
                        </span>
                        <span className="me-3" style={{ color: "#007674", fontWeight: 600 }}>
                          <HiOutlineDocumentCurrencyRupee className="me-1" /> ₹{jobData.bidAmount}
                        </span>
                      </div>
                      <div className="d-flex flex-wrap gap-2 mb-2">
                        {jobData.jobId.skills.map((skill, i) => (
                          <span key={i} className="skill-tag">{skill.name}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Proposal Terms Card */}
                  <div className="card border-0 shadow-lg h-100 mb-4" style={{ borderRadius: "25px", background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)", border: "1px solid rgba(0, 118, 116, 0.1)" }}>
                    <div className="card-body p-5">
                      <h4 className="fw-semibold mb-4" style={{ color: "#007674" }}>Your Proposed Terms</h4>
                      <div className="row g-4">
                        <div className="col-md-6">
                          <div className="mb-4">
                            <h6 className="fw-semibold mb-2" style={{ color: "#121212" }}>Payment Method</h6>
                            <div className="p-3 rounded" style={{ background: "rgba(0, 118, 116, 0.05)", border: "1px solid rgba(0, 118, 116, 0.1)" }}>
                              <span className="fw-semibold" style={{ color: "#007674" }}>● {jobData.projectScope}</span>
                            </div>
                          </div>
                          {jobData.milestones && jobData.milestones.length > 0 && (
                            <div className="mb-4">
                              <h6 className="fw-semibold mb-3" style={{ color: "#121212" }}>Milestones</h6>
                              <div className="space-y-2">
                                {jobData.milestones.map((milestone, index) => (
                                  <div key={index} className="p-3 rounded mb-2" style={{ background: "rgba(0, 118, 116, 0.05)", border: "1px solid rgba(0, 118, 116, 0.1)" }}>
                                    <div className="d-flex justify-content-between align-items-center">
                                      <span className="fw-semibold" style={{ color: "#121212" }}>{milestone.title}</span>
                                      <span className="fw-semibold" style={{ color: "#007674" }}>₹{milestone.amount}.00</span>
                                    </div>
                                    <div className="text-muted" style={{ fontSize: "0.9rem" }}>Due: {formatPostDate(milestone.dueDate)}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="col-md-6">
                          <div className="mb-4">
                            <h6 className="fw-semibold mb-2" style={{ color: "#121212" }}>Total Project Price</h6>
                            <p className="text-muted mb-2" style={{ fontSize: "0.9rem" }}>This includes all milestones, and is the amount your client will see.</p>
                            <div className="p-3 rounded" style={{ background: "rgba(0, 118, 116, 0.05)", border: "1px solid rgba(0, 118, 116, 0.1)" }}>
                              <span className="fw-bold fs-5" style={{ color: "#007674" }}>₹{jobData.bidAmount}.00</span>
                            </div>
                          </div>
                          <div className="mb-4">
                            <h6 className="fw-semibold mb-2" style={{ color: "#121212" }}>You'll Receive</h6>
                            <p className="text-muted mb-2" style={{ fontSize: "0.9rem" }}>The estimated payment, after service fees.</p>
                            <div className="p-3 rounded" style={{ background: "rgba(0, 118, 116, 0.05)", border: "1px solid rgba(0, 118, 116, 0.1)" }}>
                              <span className="fw-bold fs-5" style={{ color: "#007674" }}>₹{jobData.youReceive}.00</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Cover Letter Card */}
                  <div className="card border-0 shadow-lg h-100" style={{ borderRadius: "25px", background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)", border: "1px solid rgba(0, 118, 116, 0.1)" }}>
                    <div className="card-body p-5">
                      <h4 className="fw-semibold mb-4" style={{ color: "#007674" }}>Cover Letter</h4>
                      <div className="p-4 rounded" style={{ background: "rgba(0, 118, 116, 0.02)", border: "1px solid rgba(0, 118, 116, 0.1)", minHeight: "120px" }}>
                        <p className="mb-0" style={{ fontSize: "1.1rem", fontWeight: 500, color: "#333", lineHeight: "1.6", whiteSpace: "pre-line" }}>{jobData.coverLetter}</p>
                      </div>
                      {jobData.attachment && (
                        <div className="mt-4">
                          <h6 className="fw-semibold mb-3" style={{ color: "#121212" }}>Attachments</h6>
                          <div className="d-flex align-items-center justify-content-between p-3 rounded" style={{ background: "rgba(0, 118, 116, 0.05)", border: "1px solid rgba(0, 118, 116, 0.1)", maxWidth: "400px" }}>
                            <div className="d-flex align-items-center gap-2">
                              <IoDocumentAttach size={20} style={{ color: "#007674" }} />
                              <span className="fw-medium" style={{ color: "#121212" }}>Attachment.pdf</span>
                            </div>
                            <a href={jobData.attachment} target="_blank" rel="noopener noreferrer">
                              <button className="btn btn-sm" style={{ borderRadius: "25px", background: "linear-gradient(135deg, #007674 0%, #005a58 100%)", color: "#fff", border: "none", fontSize: "0.9rem", fontWeight: 600, padding: "6px 16px", transition: "all 0.3s ease" }}
                                onMouseEnter={e => { e.target.style.background = "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)"; e.target.style.transform = "translateY(-1px)"; }}
                                onMouseLeave={e => { e.target.style.background = "linear-gradient(135deg, #007674 0%, #005a58 100%)"; e.target.style.transform = "translateY(0)"; }}
                              >View</button>
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* Right Column - Sidebar */}
              <div className="col-lg-4 sticky-sidebar" style={{ padding: 30 }}>
                {/* Proposal Status Card */}
                <div className="card border-0 shadow-lg mb-4" style={{ borderRadius: "25px", background: "#fff", border: "1px solid rgba(0, 118, 116, 0.1)" }}>
                  <div className="card-body p-4">
                    <h5 className="fw-semibold mb-3" style={{ color: "#121212" }}>Proposal Status</h5>
                    <div className="mb-3">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <BsCheckCircle size={18} style={{ color: "#28a745" }} />
                        <span className="fw-semibold" style={{ color: "#28a745" }}>Submitted Successfully</span>
                      </div>
                      <p className="mb-0" style={{ fontSize: "0.9rem", color: "#666" }}>
                        Your proposal has been sent to the client and is under review.
                      </p>
                    </div>
                    <div className="mb-3">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <div className="rounded-circle" style={{ width: 18, height: 18, background: "#ffc107" }} />
                        <span className="fw-semibold" style={{ color: "#856404" }}>Pending Response</span>
                      </div>
                      <p className="mb-0" style={{ fontSize: "0.9rem", color: "#666" }}>
                        Waiting for the client to review and respond to your proposal.
                      </p>
                    </div>
                  </div>
                </div>
                {/* Client Info Card */}
                <div className="card border-0 shadow-lg mb-4" style={{ borderRadius: "25px", background: "#fff", border: "1px solid rgba(0, 118, 116, 0.1)" }}>
                  <div className="card-body p-4">
                    <h5 className="fw-semibold mb-3" style={{ color: "#121212" }}>Client Information</h5>
                    <div className="mb-2 d-flex align-items-center gap-2">
                      <BsCheckCircle size={18} style={{ color: "#15acec" }} />
                      <span className="fw-semibold" style={{ color: "#15acec" }}>Payment Verified</span>
                    </div>
                    <div className="mb-2 d-flex align-items-center gap-2">
                      <span className="text-muted">Total Spent:</span>
                      <span className="fw-semibold" style={{ color: "#121212" }}>₹{jobData.jobId.totalSpent || 0}+</span>
                    </div>
                    <div className="mb-2 d-flex align-items-center gap-2">
                      <span className="text-muted">Member Since:</span>
                      <span className="fw-semibold" style={{ color: "#121212" }}>{jobData.jobId.clientSince || "N/A"}</span>
                    </div>
                  </div>
                </div>
                {/* Next Steps Card */}
                <div className="card border-0 shadow-lg" style={{ borderRadius: "25px", background: "#fff", border: "1px solid rgba(0, 118, 116, 0.1)" }}>
                  <div className="card-body p-4">
                    <h5 className="fw-semibold mb-3" style={{ color: "#121212" }}>Next Steps</h5>
                    <ul className="mb-0" style={{ color: "#666", fontSize: "0.95rem" }}>
                      <li className="mb-2">Client will review your proposal within 24-48 hours</li>
                      <li className="mb-2">You may receive questions or requests for clarification</li>
                      <li className="mb-2">If selected, you'll receive a contract to review</li>
                      <li className="mb-0">You can edit your proposal until it's viewed</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      {/* Withdraw Modal */}
      {showModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <button
              className="modal-close"
              onClick={() => setShowModal(false)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "none",
                border: "none",
                fontSize: "24px",
                color: "#666",
                cursor: "pointer",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(0, 0, 0, 0.1)";
                e.target.style.color = "#333";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "none";
                e.target.style.color = "#666";
              }}
            >
              ×
            </button>

            <h3
              className="fw-semibold mb-4"
              style={{ color: "#007674", fontSize: "1.5rem" }}
            >
              Withdraw Proposal
            </h3>

            <div className="modal-scrollable-content">
              <p
                className="mb-4"
                style={{
                  fontSize: "1rem",
                  color: "#666",
                  lineHeight: "1.6",
                }}
              >
                We will politely notify the client that you are not interested.
                The client will be able to view the reason you've withdrawn your
                proposal.
              </p>

              <div className="mb-4">
                <h6 className="fw-semibold mb-3" style={{ color: "#121212" }}>
                  Reason for Withdrawal
                </h6>
                <div className="space-y-2">
                  {withdrawReasons.map((reason) => (
                    <div key={reason} className="form-check">
                      <input
                        type="radio"
                        name="withdrawReason"
                        value={reason}
                        className="form-check-input"
                        checked={selectedReason === reason}
                        style={{
                          accentColor: "#007674",
                          width: 18,
                          height: 18,
                        }}
                        onChange={(e) => {
                          setSelectedReason(e.target.value);
                          setOtherReason("");
                        }}
                      />
                      <label
                        className="form-check-label ms-2"
                        style={{
                          fontWeight: 500,
                          color:
                            selectedReason === reason ? "#007674" : "#121212",
                          fontSize: "1rem",
                        }}
                      >
                        {reason}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {selectedReason === "Other" && (
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Enter your reason"
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    className="form-control"
                    style={{
                      borderRadius: "12px",
                      border: "1.5px solid #e3e3e3",
                      padding: "12px 16px",
                      fontSize: "1rem",
                      fontWeight: 500,
                    }}
                  />
                </div>
              )}

              <div className="mb-4">
                <h6 className="fw-semibold mb-2" style={{ color: "#121212" }}>
                  Optional Message
                </h6>
                <p
                  className="mb-3"
                  style={{ fontSize: "0.9rem", color: "#666" }}
                >
                  Add an optional message to share with the client when we
                  notify them that this proposal has been withdrawn.
                </p>
                <textarea
                  className="form-control"
                  placeholder="Message (Optional)"
                  value={optionalMessage}
                  onChange={(e) => setOptionalMessage(e.target.value)}
                  rows="6"
                  maxLength={50000}
                  style={{
                    borderRadius: "12px",
                    border: "1.5px solid #e3e3e3",
                    padding: "12px 16px",
                    fontSize: "1rem",
                    fontWeight: 500,
                    resize: "none",
                  }}
                />
              </div>
            </div>

            <div className="modal-actions d-flex gap-3 justify-content-end">
              <button
                className="btn fw-semibold px-4 py-2"
                style={{
                  borderRadius: "50px",
                  color: "#007674",
                  border: "1.5px solid #007674",
                  background: "linear-gradient(135deg, #e8f4f4 0%, #fff 100%)",
                  fontSize: "1rem",
                  transition: "all 0.3s ease",
                }}
                onClick={() => setShowModal(false)}
                onMouseEnter={(e) => {
                  e.target.style.background =
                    "linear-gradient(135deg, #c6f0f0 0%, #e8f4f4 100%)";
                  e.target.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background =
                    "linear-gradient(135deg, #e8f4f4 0%, #fff 100%)";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                Cancel
              </button>
              <button
                className={`btn fw-semibold px-4 py-2 ${
                  selectedReason && (selectedReason !== "Other" || otherReason)
                    ? ""
                    : "disabled"
                }`}
                style={{
                  borderRadius: "50px",
                  color: "#fff",
                  background:
                    selectedReason &&
                    (selectedReason !== "Other" || otherReason)
                      ? "linear-gradient(135deg, #dc3545 0%, #c82333 100%)"
                      : "#ccc",
                  border: "none",
                  fontSize: "1rem",
                  transition: "all 0.3s ease",
                }}
                disabled={
                  !selectedReason ||
                  (selectedReason === "Other" && !otherReason)
                }
                onClick={() => {
                  const finalReason =
                    selectedReason === "Other" ? otherReason : selectedReason;
                  console.log("Withdrawn with reason:", finalReason);
                  setShowModal(false);
                }}
                onMouseEnter={(e) => {
                  if (
                    selectedReason &&
                    (selectedReason !== "Other" || otherReason)
                  ) {
                    e.target.style.background =
                      "linear-gradient(135deg, #c82333 0%, #bd2130 100%)";
                    e.target.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (
                    selectedReason &&
                    (selectedReason !== "Other" || otherReason)
                  ) {
                    e.target.style.background =
                      "linear-gradient(135deg, #dc3545 0%, #c82333 100%)";
                    e.target.style.transform = "translateY(0)";
                  }
                }}
              >
                Withdraw Proposal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default JobProposalSubmit;
