import React, { useState } from "react";
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
  const [drafts, setDrafts] = useState([
    {
      id: 1,
      title: "Software Developer Resume",
      lastModified: "2024-01-15",
      status: "draft",
    },
    {
      id: 2,
      title: "UX Designer Portfolio",
      lastModified: "2024-01-10",
      status: "completed",
    },
    {
      id: 3,
      title: "Marketing Manager CV",
      lastModified: "2024-01-08",
      status: "draft",
    },
  ]);
  const navigate = useNavigate();

  const handleCreateResume = async () => {
    if (resumeTitle.trim()) {
      try {
        // Fetch userId from current-user API
        const userRes = await axios.get("/api/auth/current-user/", {
          withCredentials: true,
        });
        const userId = userRes.data?.user?._id || userRes.data?.user?.id;
        if (!userId) throw new Error("User not authenticated");

        // Create the resume with userId
        const response = await axios.post(
          "/api/ai-resumes/", // Adjust if your backend route is different
          { title: resumeTitle, userId },
          { withCredentials: true }
        );
        const newResume = response.data;
        setResumeTitle("");
        setShowModal(false);
        if (newResume && (newResume._id || newResume.id)) {
          const id = newResume._id || newResume.id;
          navigate(`/ws/ai-tools/ai-resume/${id}`);
        }
      } catch (error) {
        // Optionally show a toast or error message
        console.error("Failed to create resume:", error);
      }
    }
  };

  const handlePortfolioClick = () => {
    navigate("/ws/ai-tools/ai-portfolio-web");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className="section-container"
      style={{ background: "#f8f9fa", padding: "32px 24px 0 24px" }}
    >
      {/* Header */}
      <div
        style={{
          width: "100%",
          borderBottom: "1px solid #e3e3e3",
          background: "#fff",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          className="d-flex align-items-center justify-content-between py-4 px-4"
          // style={{ width: "100%" }}
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
                fontWeight: 700,
                fontSize: 24,
                color: "#121212",
              }}
            >
              AI Resume Builder
            </span>
          </div>
          <button
            onClick={handlePortfolioClick}
            className="btn"
            style={{
              border: "1.5px solid #007674",
              color: "#007674",
              borderRadius: 999,
              fontWeight: 600,
              fontFamily: "Urbanist, sans-serif",
              fontSize: 16,
              padding: "8px 18px",
              background: "#fff",
              transition: "all 0.2s",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              whiteSpace: "nowrap",
              minWidth: 0,
              boxSizing: "border-box",
              width: "auto",
              flex: "none",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#f8f9fa";
              e.target.style.color = "#005a58";
              e.target.style.borderColor = "#005a58";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#fff";
              e.target.style.color = "#007674";
              e.target.style.borderColor = "#007674";
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
              background: "#fff",
              border: "1.5px solid #e3e3e3",
              borderRadius: 18,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "36px 0 28px 0",
              cursor: "pointer",
              marginBottom: 10,
              boxShadow: "none",
              transition: "all 0.2s",
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
              }}
            >
              Create New Resume
            </span>
          </motion.div>
          <span
            style={{
              color: "#666",
              fontSize: 15,
              fontFamily: "Urbanist, sans-serif",
              opacity: 0.85,
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
              wordSpacing: "2px",
              letterSpacing: "0.5px",
            }}
          >
            Your Drafts
          </h2>
          <div
            style={{
              flex: 1,
              height: 1,
              background: "#e3e3e3",
              borderRadius: 2,
            }}
          />
        </div>
        {drafts.length === 0 ? (
          <div
            className="text-center p-5"
            style={{
              background: "#fff",
              borderRadius: 16,
              border: "1.5px solid #e3e3e3",
            }}
          >
            <BsFileEarmarkText size={50} color="#ccc" className="mb-3" />
            <p style={{ color: "#666", fontSize: 17 }}>
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
                    background: "#fff",
                    borderRadius: 14,
                    border: "1.5px solid #e3e3e3",
                    boxShadow: "none",
                    transition: "all 0.2s",
                    cursor: "pointer",
                    minHeight: 120,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "22px 24px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#007674";
                    e.currentTarget.style.transform = "scale(1.015)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e3e3e3";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
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
                        <BsCalendar size={13} color="#666" />
                        <span
                          style={{
                            color: "#666",
                            fontSize: 13,
                            fontFamily: "Urbanist, sans-serif",
                          }}
                        >
                          {formatDate(draft.lastModified)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button
                      className="btn btn-link p-0"
                      style={{ color: "#007674" }}
                      title="Edit"
                    >
                      <BsPencil size={18} />
                    </button>
                    <button
                      className="btn btn-link p-0"
                      style={{ color: "#007674" }}
                      title="Preview"
                    >
                      <BsEye size={18} />
                    </button>
                    <button
                      className="btn btn-link p-0"
                      style={{ color: "#dc3545" }}
                      title="Delete"
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
              background: "rgba(0, 0, 0, 0.18)",
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
                borderRadius: 18,
                padding: 36,
                maxWidth: 540,
                width: "90%",
                boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
                border: "1.5px solid #e3e3e3",
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
                  fontSize: 20,
                  fontFamily: "Urbanist, sans-serif",
                  wordSpacing: "2px",
                  letterSpacing: "0.5px",
                }}
              >
                Create New Resume
              </h3>
              <div className="mb-4">
                <label
                  className="form-label fw-semibold"
                  style={{
                    color: "#121212",
                    fontSize: 18,
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
                    border: "1.5px solid #e3e3e3",
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontSize: 16,
                    fontFamily: "Urbanist, sans-serif",
                    transition: "all 0.2s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#007674";
                    e.target.style.boxShadow =
                      "0 0 0 2px rgba(0, 118, 116, 0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e3e3e3";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
              <div className="d-flex gap-3 justify-content-end mt-2">
                <button
                  className="btn flex-fill"
                  onClick={() => setShowModal(false)}
                  style={{
                    background: "#f3f3f3",
                    color: "#222",
                    border: "none",
                    borderRadius: 50,
                    padding: "12px 28px",
                    fontSize: "1.05rem",
                    fontFamily: "Urbanist, sans-serif",
                    fontWeight: 600,
                    boxShadow: "none",
                    transition: "all 0.2s",
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
                    borderRadius: 50,
                    padding: "12px 28px",
                    fontSize: "1.05rem",
                    fontFamily: "Urbanist, sans-serif",
                    fontWeight: 600,
                    boxShadow: "0 6px 20px rgba(0, 118, 116, 0.3)",
                    opacity: resumeTitle.trim() ? 1 : 0.6,
                    transition: "all 0.3s ease",
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
                        "0 6px 20px rgba(0, 118, 116, 0.3)";
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
