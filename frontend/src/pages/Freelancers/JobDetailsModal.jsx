import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BsArrowLeft, 
  BsBookmark, 
  BsBookmarkFill, 
  BsCurrencyDollar, 
  BsPeople, 
  BsClock, 
  BsGeoAlt, 
  BsCalendar, 
  BsLightning, 
  BsStar, 
  BsCheckCircle,
  BsFlag,
  BsShare,
  BsX,
  BsCurrencyRupee
} from "react-icons/bs";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

const JobDetailsModal = ({ show, onClose, job }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (show) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [show]);

  if (!show || !job) return null;

  // Helper to safely access nested properties
  const getValue = (value) => {
    if (typeof value === "object" && value !== null) {
      return value.name || JSON.stringify(value);
    }
    return value;
  };

  const handleApplyClick = () => {
    navigate(`/ws/proposals/job/~${job.id}/apply`);
  };

  const handleBookmarkClick = () => {
    // Toggle bookmark functionality
  };

  const handleShareClick = () => {
    // Share functionality
  };

  const handleFlagClick = () => {
    // Flag functionality
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="modal-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(8px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            fontFamily: "Urbanist, sans-serif",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ duration: 0.4, type: "spring", damping: 25 }}
            className="modal-content"
            style={{
              width: "100%",
              maxWidth: "1200px",
              maxHeight: "90vh",
              backgroundColor: "#fff",
              borderRadius: "25px",
              overflow: "hidden",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(0, 118, 116, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="modal-header"
              style={{
                padding: "25px 30px",
                borderBottom: "1px solid rgba(0, 118, 116, 0.1)",
                background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3 flex-grow-1">
                  <button
                    onClick={onClose}
                    className="btn btn-outline-secondary border-0"
                    style={{
                      width: "45px",
                      height: "45px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(0, 118, 116, 0.1)",
                      color: "#007674",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "rgba(0, 118, 116, 0.2)";
                      e.target.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "rgba(0, 118, 116, 0.1)";
                      e.target.style.transform = "scale(1)";
                    }}
                  >
                    <BsArrowLeft size={20} />
                  </button>
                  <div>
                    <h4
                      className="fw-semibold mb-1"
                      style={{ color: "#121212", fontSize: "1.3rem" }}
                    >
                      Job Details
                    </h4>
                    <p className="mb-0" style={{ color: "#666", fontSize: "0.95rem" }}>
                      Review and apply for this opportunity
                    </p>
                  </div>
                </div>
                
                <div className="d-flex align-items-center gap-2 flex-shrink-1">
                  <button
                    onClick={handleBookmarkClick}
                    className="btn btn-outline-secondary border-0"
                    style={{
                      width: "45px",
                      height: "45px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(0, 118, 116, 0.1)",
                      color: "#007674",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "rgba(0, 118, 116, 0.2)";
                      e.target.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "rgba(0, 118, 116, 0.1)";
                      e.target.style.transform = "scale(1)";
                    }}
                  >
                    <BsBookmark size={18} />
                  </button>
                  <button
                    onClick={handleShareClick}
                    className="btn btn-outline-secondary border-0"
                    style={{
                      width: "45px",
                      height: "45px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(0, 118, 116, 0.1)",
                      color: "#007674",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "rgba(0, 118, 116, 0.2)";
                      e.target.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "rgba(0, 118, 116, 0.1)";
                      e.target.style.transform = "scale(1)";
                    }}
                  >
                    <BsShare size={18} />
                  </button>
                  <button
                    onClick={handleFlagClick}
                    className="btn btn-outline-secondary border-0"
                    style={{
                      width: "45px",
                      height: "45px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(0, 118, 116, 0.1)",
                      color: "#007674",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "rgba(0, 118, 116, 0.2)";
                      e.target.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "rgba(0, 118, 116, 0.1)";
                      e.target.style.transform = "scale(1)";
                    }}
                  >
                    <BsFlag size={18} />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Content */}
            <div className="modal-body" style={{ padding: "0", maxHeight: "calc(90vh - 100px)", overflow: "auto" }}>
              <div className="container-fluid p-0">
                <div className="row g-0">
                  {/* Left Column - Job Details */}
                  <div className="col-lg-8">
                    <div style={{ padding: "30px" }}>
                      {/* Job Title */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="mb-4"
                      >
                        <h2
                          className="fw-semibold mb-3"
                          style={{ 
                            color: "#121212", 
                            fontSize: "2rem", 
                            lineHeight: "1.3",
                            letterSpacing: "0.3px"
                          }}
                        >
                          {job.title}
                        </h2>
                        <div className="d-flex align-items-center gap-4 flex-wrap">
                          <div className="d-flex align-items-center gap-2">
                            <BsCalendar size={16} style={{ color: "#007674" }} />
                            <span style={{ color: "#666", fontSize: "1rem" }}>
                              Posted {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <BsGeoAlt size={16} style={{ color: "#007674" }} />
                            <span style={{ color: "#666", fontSize: "1rem" }}>
                              {getValue(job.location)} • Remote
                            </span>
                          </div>
                        </div>
                      </motion.div>

                      {/* Job Overview Cards */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="row g-3 mb-4"
                      >
                        <div className="col-md-6">
                          <div
                            className="p-4 rounded-4 h-100"
                            style={{
                              background: "linear-gradient(135deg, rgba(0, 118, 116, 0.05) 0%, rgba(0, 118, 116, 0.02) 100%)",
                              border: "1px solid rgba(0, 118, 116, 0.1)",
                            }}
                          >
                            <div className="d-flex align-items-center gap-3 mb-3">
                              <div
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  borderRadius: "50%",
                                  background: "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "white",
                                }}
                              >
                                <BsCurrencyRupee size={24} />
                              </div>
                              <div>
                                <h6 className="fw-semibold mb-1" style={{ color: "#121212" }}>
                                  {job.budgetType === "fixed" ? "Fixed Price" : "Hourly Rate"}
                                </h6>
                                <p className="mb-0" style={{ color: "#007674", fontSize: "1.1rem", fontWeight: "600" }}>
                                  {job.budgetType === "fixed" ? (
                                    `₹${job.fixedRate || 0}`
                                  ) : (
                                    `₹${job.hourlyRateFrom || 0} - ₹${job.hourlyRateTo || 0}`
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div
                            className="p-4 rounded-4 h-100"
                            style={{
                              background: "linear-gradient(135deg, rgba(0, 118, 116, 0.05) 0%, rgba(0, 118, 116, 0.02) 100%)",
                              border: "1px solid rgba(0, 118, 116, 0.1)",
                            }}
                          >
                            <div className="d-flex align-items-center gap-3 mb-3">
                              <div
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  borderRadius: "50%",
                                  background: "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "white",
                                }}
                              >
                                <BsPeople size={24} />
                              </div>
                              <div>
                                <h6 className="fw-semibold mb-1" style={{ color: "#121212" }}>
                                  Applicants
                                </h6>
                                <p className="mb-0" style={{ color: "#007674", fontSize: "1.1rem", fontWeight: "600" }}>
                                  {job.applicants || 0} proposals
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Job Description */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                        className="mb-4"
                      >
                        <h5 className="fw-semibold mb-3" style={{ color: "#121212", fontSize: "1.4rem" }}>
                          Job Description
                        </h5>
                        <div
                          className="p-4 rounded-4"
                          style={{
                            background: "#f8f9fa",
                            border: "1px solid #e3e3e3",
                            lineHeight: "1.7",
                          }}
                        >
                          <p
                            style={{
                              color: "#333",
                              fontSize: "1.1rem",
                              whiteSpace: "pre-wrap",
                              margin: "0",
                            }}
                          >
                            {job.description}
                          </p>
                        </div>
                      </motion.div>

                      {/* Skills & Expertise */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                        className="mb-4"
                      >
                        <h5 className="fw-semibold mb-3" style={{ color: "#121212", fontSize: "1.4rem" }}>
                          Skills & Expertise
                        </h5>
                        <div className="d-flex flex-wrap gap-2">
                          {Array.isArray(job.skills) && job.skills.length > 0 ? (
                            job.skills.map((tag, i) => (
                              <motion.span
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 + i * 0.05, duration: 0.3 }}
                                className="badge px-3 py-2"
                                style={{
                                  backgroundColor: "rgba(0, 118, 116, 0.1)",
                                  color: "#007674",
                                  fontSize: "1rem",
                                  fontWeight: "600",
                                  borderRadius: "25px",
                                  border: "1px solid rgba(0, 118, 116, 0.2)",
                                }}
                              >
                                {getValue(tag)}
                              </motion.span>
                            ))
                          ) : (
                            <span style={{ color: "#666", fontSize: "1rem" }}>No skills listed</span>
                          )}
                        </div>
                      </motion.div>

                      {/* Project Details */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.4 }}
                        className="mb-4"
                      >
                        <h5 className="fw-semibold mb-3" style={{ color: "#121212", fontSize: "1.4rem" }}>
                          Project Details
                        </h5>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <div
                              className="p-3 rounded-3"
                              style={{
                                background: "#f8f9fa",
                                border: "1px solid #e3e3e3",
                              }}
                            >
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <BsLightning size={16} style={{ color: "#007674" }} />
                                <span className="fw-semibold" style={{ color: "#121212" }}>
                                  Experience Level
                                </span>
                              </div>
                              <p className="mb-0" style={{ color: "#666", fontSize: "1rem" }}>
                                {job.experienceLevel}
                              </p>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div
                              className="p-3 rounded-3"
                              style={{
                                background: "#f8f9fa",
                                border: "1px solid #e3e3e3",
                              }}
                            >
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <BsClock size={16} style={{ color: "#007674" }} />
                                <span className="fw-semibold" style={{ color: "#121212" }}>
                                  Project Type
                                </span>
                              </div>
                              <p className="mb-0" style={{ color: "#666", fontSize: "1rem" }}>
                                {job.projectType || "One Time Project"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Connects Information */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.4 }}
                        className="mb-4"
                      >
                        <div
                          className="p-4 rounded-4"
                          style={{
                            background: "linear-gradient(135deg, rgba(218, 133, 53, 0.05) 0%, rgba(218, 133, 53, 0.02) 100%)",
                            border: "1px solid rgba(218, 133, 53, 0.1)",
                          }}
                        >
                          <h6 className="fw-semibold mb-3" style={{ color: "#da8535" }}>
                            Application Requirements
                          </h6>
                          <div className="row g-3">
                            <div className="col-md-6">
                              <div className="d-flex justify-content-between align-items-center">
                                <span style={{ color: "#666", fontSize: "1rem" }}>
                                  Required Connects:
                                </span>
                                <span className="fw-semibold" style={{ color: "#da8535" }}>
                                  {job.requiredConnects || "10"}
                                </span>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="d-flex justify-content-between align-items-center">
                                <span style={{ color: "#666", fontSize: "1rem" }}>
                                  Your Connects:
                                </span>
                                <span className="fw-semibold" style={{ color: "#da8535" }}>
                                  {job.connectsAvailable || "100"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Right Column - Client Info & Apply */}
                  <div className="col-lg-4">
                    <div
                      style={{
                        padding: "30px",
                        background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
                        borderLeft: "1px solid rgba(0, 118, 116, 0.1)",
                        height: "100%",
                      }}
                    >
                      {/* Apply Button */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="mb-4"
                      >
                        <button
                          onClick={handleApplyClick}
                          className="btn w-100 py-3 fw-semibold"
                          style={{
                            background: "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                            color: "#fff",
                            borderRadius: "15px",
                            fontSize: "1.1rem",
                            border: "none",
                            transition: "all 0.3s ease",
                            boxShadow: "0 6px 20px rgba(0, 118, 116, 0.3)",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow = "0 8px 25px rgba(18, 18, 18, 0.4)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "0 6px 20px rgba(0, 118, 116, 0.3)";
                          }}
                        >
                          Apply Now
                        </button>
                      </motion.div>

                      {/* Client Information */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                        className="mb-4"
                      >
                        <h5 className="fw-semibold mb-3" style={{ color: "#121212", fontSize: "1.3rem" }}>
                          About the Client
                        </h5>
                        <div
                          className="p-4 rounded-4"
                          style={{
                            background: "#fff",
                            border: "1px solid #e3e3e3",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                          }}
                        >
                          <div className="d-flex align-items-center gap-2 mb-3">
                            <RiVerifiedBadgeFill 
                              size={20} 
                              style={{ 
                                color: job.clientDetails?.paymentVerified ? "#28a745" : "#6c757d" 
                              }} 
                            />
                            <span className="fw-semibold" style={{ 
                              color: job.clientDetails?.paymentVerified ? "#28a745" : "#6c757d" 
                            }}>
                              {job.clientDetails?.paymentVerified ? "Payment Verified" : "Payment Not Verified"}
                            </span>
                          </div>
                          <div className="space-y-3">
                            <div className="d-flex justify-content-between align-items-center">
                              <span style={{ color: "#666", fontSize: "1rem" }}>
                                Total Spent:
                              </span>
                              <span className="fw-semibold" style={{ color: "#121212" }}>
                                ₹{job.clientDetails?.totalSpent || 0}+
                              </span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <span style={{ color: "#666", fontSize: "1rem" }}>
                                Hires:
                              </span>
                              <span className="fw-semibold" style={{ color: "#121212" }}>
                                {job.clientDetails?.hires || 0}
                              </span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <span style={{ color: "#666", fontSize: "1rem" }}>
                                Phone Verified:
                              </span>
                              <span className="fw-semibold" style={{ 
                                color: job.clientDetails?.phoneVerified ? "#28a745" : "#6c757d" 
                              }}>
                                {job.clientDetails?.phoneVerified ? "Yes" : "No"}
                              </span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <span style={{ color: "#666", fontSize: "1rem" }}>
                                Member Since:
                              </span>
                              <span className="fw-semibold" style={{ color: "#121212" }}>
                                {job.clientDetails?.memberSince || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Job Activity */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                        className="mb-4"
                      >
                        <h5 className="fw-semibold mb-3" style={{ color: "#121212", fontSize: "1.3rem" }}>
                          Job Activity
                        </h5>
                        <div
                          className="p-4 rounded-4"
                          style={{
                            background: "#fff",
                            border: "1px solid #e3e3e3",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                          }}
                        >
                          <div className="space-y-3">
                            <div className="d-flex justify-content-between align-items-center">
                              <span style={{ color: "#666", fontSize: "1rem" }}>
                                Applicants:
                              </span>
                              <span className="fw-semibold" style={{ color: "#121212" }}>
                                {job.applicants || 0}
                              </span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <span style={{ color: "#666", fontSize: "1rem" }}>
                                Last Viewed:
                              </span>
                              <span className="fw-semibold" style={{ color: "#121212" }}>
                                {job.lastViewed || job.postedTime || "Recently"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Tips */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.4 }}
                      >
                        <h5 className="fw-semibold mb-3" style={{ color: "#121212", fontSize: "1.3rem" }}>
                          Pro Tips
                        </h5>
                        <div
                          className="p-4 rounded-4"
                          style={{
                            background: "linear-gradient(135deg, rgba(0, 118, 116, 0.05) 0%, rgba(0, 118, 116, 0.02) 100%)",
                            border: "1px solid rgba(0, 118, 116, 0.1)",
                          }}
                        >
                          <ul className="mb-0" style={{ color: "#666", fontSize: "1rem" }}>
                            <li className="mb-2">Customize your proposal for this specific job</li>
                            <li className="mb-2">Highlight relevant experience and skills</li>
                            <li className="mb-2">Include examples of similar work</li>
                            <li className="mb-0">Ask thoughtful questions about the project</li>
                          </ul>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default JobDetailsModal;
