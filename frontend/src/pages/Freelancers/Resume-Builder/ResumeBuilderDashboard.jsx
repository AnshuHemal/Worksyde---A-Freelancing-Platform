import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsPlus,
  BsFileEarmarkText,
  BsPencil,
  BsTrash,
  BsEye,
  BsCalendar,
  BsGlobe,
} from "react-icons/bs";
import { RiAiGenerate } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ResumeBuilderDashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [resumeTitle, setResumeTitle] = useState("");
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch resumes on component mount
  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/ai-resumes/", {
        withCredentials: true,
      });
      setDrafts(response.data || []);
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResume = async () => {
    if (resumeTitle.trim()) {
      try {
        // Create the resume with just the title
        const response = await axios.post(
          "/api/ai-resumes/",
          { title: resumeTitle },
          { withCredentials: true }
        );
        const newResume = response.data;
        setResumeTitle("");
        setShowModal(false);
        
        // Refresh the resumes list
        await fetchResumes();
        
        if (newResume && (newResume._id || newResume.id)) {
          const id = newResume._id || newResume.id;
          navigate(`/ws/ai-tools/ai-resume/${id}`);
        }
      } catch (error) {
        console.error("Failed to create resume:", error);
        // You can add a toast notification here to show the error to the user
      }
    }
  };

  const handlePortfolioClick = () => {
    navigate("/ws/ai-tools/ai-portfolio-web");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
          fontFamily: "Urbanist, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #f3f4f6",
              borderTop: "4px solid #007674",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "#6b7280", fontSize: "16px" }}>Loading resumes...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="section-container"
      style={{ 
        background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)", 
        padding: "32px 24px 0 24px",
        fontFamily: "Urbanist, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          width: "100%",
          borderBottom: "1px solid #e5e7eb",
          background: "#fff",
          top: 0,
          zIndex: 10,
          borderRadius: "16px 16px 0 0",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div
          className="d-flex align-items-center justify-content-between py-4 px-4"
        >
          <div className="d-flex align-items-center gap-2">
            <RiAiGenerate
              size={28}
              color="#007674"
              style={{ marginRight: 10 }}
            />
            <span
              style={{
                fontFamily: "Urbanist, sans-serif",
                fontWeight: 600,
                fontSize: 24,
                color: "#121212",
                letterSpacing: "0.3px",
              }}
            >
              AI Resume Builder
            </span>
          </div>
          <button
            onClick={handlePortfolioClick}
            className="btn"
            style={{
              border: "2px solid #007674",
              color: "#007674",
              borderRadius: "12px",
              fontWeight: 600,
              fontFamily: "Urbanist, sans-serif",
              fontSize: 16,
              padding: "12px 24px",
              background: "#fff",
              transition: "all 0.3s ease",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              whiteSpace: "nowrap",
              minWidth: 0,
              boxSizing: "border-box",
              width: "auto",
              flex: "none",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#007674";
              e.target.style.color = "#ffffff";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 8px 24px rgba(0, 118, 116, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#fff";
              e.target.style.color = "#007674";
              e.target.style.borderColor = "#007674";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.05)";
            }}
          >
            <BsGlobe style={{ marginRight: 6 }} /> AI Portfolio Web
          </button>
        </div>
      </div>

      <div
        className="container-fluid"
        style={{ width: "100%", padding: "40px 0 0 0", maxWidth: "100vw" }}
      >
        {/* Create New Resume Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="d-flex flex-column align-items-center mb-5"
        >
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: 320,
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "36px 0 28px 0",
              cursor: "pointer",
              marginBottom: 10,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#007674";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(0, 118, 116, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.05)";
            }}
            onClick={() => setShowModal(true)}
          >
            <BsPlus size={38} color="#007674" style={{ marginBottom: 10 }} />
            <span
              style={{
                fontWeight: 600,
                fontSize: 18,
                color: "#121212",
                fontFamily: "Urbanist, sans-serif",
                letterSpacing: "0.3px",
              }}
            >
              Create New Resume
            </span>
          </motion.div>
          <span
            style={{
              color: "#6b7280",
              fontSize: 15,
              fontFamily: "Urbanist, sans-serif",
              fontWeight: "500",
            }}
          >
            Start building your professional resume with AI assistance
          </span>
        </motion.div>

        {/* Drafts Section */}
        <div
          className="mb-3"
          style={{ display: "flex", alignItems: "center", gap: 10 }}
        >
          <h2
            style={{
              color: "#121212",
              fontSize: 20,
              fontWeight: 600,
              fontFamily: "Urbanist, sans-serif",
              margin: 0,
              letterSpacing: "0.3px",
            }}
          >
            Your Drafts
          </h2>
          <div
            style={{
              flex: 1,
              height: 1,
              background: "#e5e7eb",
              borderRadius: 2,
            }}
          />
        </div>
        {drafts.length === 0 ? (
          <div
            className="text-center p-5"
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            }}
          >
            <BsFileEarmarkText size={50} color="#ccc" className="mb-3" />
            <p style={{ 
              color: "#6b7280", 
              fontSize: 17,
              fontWeight: "500",
              fontFamily: "Urbanist, sans-serif",
            }}>
              No drafts yet. Create your first resume to get started!
            </p>
          </div>
        ) : (
          <div className="row g-4">
            {drafts.map((draft, index) => (
              <motion.div
                key={draft.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="col-12 col-md-6 col-lg-4"
              >
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "pointer",
                    minHeight: 120,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "22px 24px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#007674";
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(0, 118, 116, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.05)";
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "12px",
                        background: "#f8f9fa",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <BsFileEarmarkText size={20} color="#007674" />
                    </div>
                    <div>
                                              <div
                          style={{
                            color: "#121212",
                            fontWeight: 600,
                            fontSize: 16,
                            fontFamily: "Urbanist, sans-serif",
                          }}
                        >
                          {draft.title}
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <BsCalendar size={13} color="#6b7280" />
                          <span
                            style={{
                              color: "#6b7280",
                              fontSize: 13,
                              fontFamily: "Urbanist, sans-serif",
                              fontWeight: "500",
                            }}
                          >
                            {formatDate(draft.updatedAt || draft.createdAt)}
                          </span>
                        </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                                         <button
                       className="btn btn-link p-0"
                       style={{ color: "#007674" }}
                       title="Edit"
                       onClick={() => navigate(`/ws/ai-tools/ai-resume/${draft._id || draft.id}`)}
                     >
                       <BsPencil size={18} />
                     </button>
                     <button
                       className="btn btn-link p-0"
                       style={{ color: "#007674" }}
                       title="Preview"
                       onClick={() => navigate(`/ws/ai-tools/ai-resume/${draft._id || draft.id}`)}
                     >
                       <BsEye size={18} />
                     </button>
                     <button
                       className="btn btn-link p-0"
                       style={{ color: "#dc3545" }}
                       title="Delete"
                       onClick={async () => {
                         if (window.confirm("Are you sure you want to delete this resume?")) {
                           try {
                             await axios.delete(`/api/ai-resumes/${draft._id || draft.id}/`, {
                               withCredentials: true,
                             });
                             await fetchResumes();
                           } catch (error) {
                             console.error("Failed to delete resume:", error);
                           }
                         }
                       }}
                     >
                       <BsTrash size={18} />
                     </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Resume Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="modal-overlay"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className="modal-content"
              style={{
                background: "#fff",
                borderRadius: "20px",
                padding: "40px",
                maxWidth: "540px",
                width: "90%",
                boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                border: "1px solid #e5e7eb",
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                className="fw-semibold mb-4 text-center"
                style={{
                  color: "#121212",
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  letterSpacing: "0.3px",
                  fontFamily: "Urbanist, sans-serif",
                }}
              >
                Create New Resume
              </h3>
              <div className="mb-4">
                <label
                  className="form-label fw-semibold"
                  style={{
                    color: "#121212",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    marginBottom: "8px",
                    fontFamily: "Urbanist, sans-serif",
                  }}
                >
                  Resume Title
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter resume title (e.g., Software Developer Resume)"
                  value={resumeTitle}
                  onChange={(e) => setResumeTitle(e.target.value)}
                  style={{
                    border: "2px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    fontSize: "1rem",
                    transition: "all 0.3s ease",
                    fontFamily: "Urbanist, sans-serif",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#007674";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(0, 118, 116, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
              <div className="d-flex gap-3 justify-content-end mt-2">
                <button
                  className="btn flex-fill"
                  onClick={() => setShowModal(false)}
                  style={{
                    background: "#f8f9fa",
                    color: "#374151",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "12px 24px",
                    fontSize: "1rem",
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                    fontFamily: "Urbanist, sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#e5e7eb";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#f8f9fa";
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn flex-fill"
                  onClick={handleCreateResume}
                  disabled={!resumeTitle.trim()}
                  style={{
                    background:
                      "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px 24px",
                    fontSize: "1rem",
                    fontWeight: "600",
                    boxShadow: "0 4px 16px rgba(0, 118, 116, 0.2)",
                    opacity: resumeTitle.trim() ? 1 : 0.6,
                    transition: "all 0.3s ease",
                    fontFamily: "Urbanist, sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    if (resumeTitle.trim()) {
                      e.target.style.background =
                        "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                      e.target.style.boxShadow =
                        "0 8px 25px rgba(18, 18, 18, 0.4)";
                      e.target.style.transform = "translateY(-2px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (resumeTitle.trim()) {
                      e.target.style.background =
                        "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                      e.target.style.boxShadow =
                        "0 4px 16px rgba(0, 118, 116, 0.2)";
                      e.target.style.transform = "translateY(0)";
                    }
                  }}
                >
                  Create Resume
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeBuilderDashboard;
