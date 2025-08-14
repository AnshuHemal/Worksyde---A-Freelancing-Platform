import React, { useEffect, useState } from "react";
import Header1 from "../../components/Header1";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsBriefcase,
  BsClock,
  BsPerson,
  BsCurrencyDollar,
  BsPeople,
  BsGeoAlt,
  BsCalendar,
  BsArrowRight,
  BsCheckCircle,
  BsCurrencyRupee,
} from "react-icons/bs";

const metaStyle = {
  color: "#121212",
  fontSize: "1rem",
  display: "flex",
  alignItems: "center",
  gap: 6,
};
const cardSection = {
  background:
    "linear-gradient(135deg, rgba(0, 118, 116, 0.05) 0%, rgba(0, 118, 116, 0.02) 100%)",
  border: "1px solid rgba(0, 118, 116, 0.1)",
  borderRadius: 18,
  marginBottom: 24,
  padding: 24,
};
const skillTag = {
  display: "inline-block",
  background: "rgba(0, 118, 116, 0.1)",
  color: "#007674",
  borderRadius: "25px",
  padding: "8px 18px",
  fontWeight: 600,
  fontSize: "1rem",
  margin: "0 10px 10px 0",
  border: "1px solid rgba(0, 118, 116, 0.2)",
};
const rightCard = {
  background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
  borderLeft: "1px solid rgba(0, 118, 116, 0.1)",
  borderRadius: 18,
  padding: 30,
  height: "100%",
};

const skeletonBox = (h, w, r = 8) => (
  <div
    className="skeleton mb-2"
    style={{ height: h, width: w, borderRadius: r, background: "#e3e3e3" }}
  />
);

const ClientJobReviewPage = () => {
  const [userId, setUserId] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const API_URL = "http://localhost:5000/api/auth";

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/current-user/`, {
          withCredentials: true,
        });
        const fetchedUserId = res.data.user._id;
        setUserId(fetchedUserId);
        const jobIdRes = await axios.post(`${API_URL}/jobposts/draft/`, {
          userId: fetchedUserId,
        });
        const fetchedJobId = jobIdRes.data.jobPostId;
        setJobId(fetchedJobId);
        fetchJobDetails(fetchedJobId);
      } catch (error) {
        toast.error("Failed to fetch user or job data.");
      }
    };
    const fetchJobDetails = async (jobId) => {
      try {
        const response = await axios.get(`${API_URL}/jobpost/${jobId}/`);
        setJobDetails(response.data);
      } catch (error) {
        toast.error("Failed to fetch job details.");
      }
    };
    fetchCurrentUser();
  }, []);

  const handleNext = async () => {
    if (!userId || !jobId) {
      toast.error("Job is still loading. Please wait a moment.");
      return;
    }
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/jobpost/send-verification-email/`, {
        userId,
        jobId,
      });
      toast.success("Verification email sent. Please check your inbox.");
      navigate("/job-post/instant/verify-email");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send verification email."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Skeleton loader for preview
  const PreviewSkeleton = () => (
    <div className="row g-0">
      <div className="col-lg-8 p-4">
        {skeletonBox(32, 320)}
        <div className="d-flex flex-wrap mb-3 mt-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>{skeletonBox(32, 120, 16)}</div>
          ))}
        </div>
        {skeletonBox(20, 180)}
        {skeletonBox(80, "100%", 12)}
        <div className="d-flex flex-wrap mb-3 mt-3">
          {[1, 2, 3].map((i) => (
            <div key={i}>{skeletonBox(28, 80, 12)}</div>
          ))}
        </div>
      </div>
      <div className="col-lg-4 p-4">
        {skeletonBox(40, 200, 12)}
        {skeletonBox(80, "100%", 12)}
        {skeletonBox(40, 200, 12)}
      </div>
    </div>
  );

  // Helper for date and time
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);

    // Format date: "8 Jun, 2025"
    const day = d.getDate();
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const year = d.getFullYear();

    // Format time: "8:30 am"
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");

    return `${day} ${month}, ${year} - ${displayHours}:${displayMinutes} ${ampm}`;
  };

  return (
    <>
      <Header1 />
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
            {!jobDetails ? (
              <PreviewSkeleton />
            ) : (
              <div className="row g-0">
                {/* Left Column - Job Details */}
                <div className="col-lg-8" style={{ padding: 30 }}>
                  {/* Header */}
                  <div className="mb-4">
                    <h2
                      className="fw-semibold mb-3"
                      style={{
                        color: "#121212",
                        fontSize: "2rem",
                        lineHeight: "1.3",
                        letterSpacing: "0.3px",
                      }}
                    >
                      {jobDetails.title}
                    </h2>
                    <div className="d-flex align-items-center gap-4 flex-wrap mb-2">
                      <div style={metaStyle}>
                        <BsCalendar size={16} style={{ color: "#007674" }} />
                        <span>Posted {formatDate(jobDetails.updatedAt)}</span>
                      </div>
                      <div style={metaStyle}>
                        <BsGeoAlt size={16} style={{ color: "#007674" }} />
                        <span>Remote</span>
                      </div>
                    </div>
                  </div>
                  {/* Overview Cards */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <div style={cardSection} className="h-100">
                        <div className="d-flex align-items-center gap-3 mb-3">
                          <div
                            style={{
                              width: 50,
                              height: 50,
                              borderRadius: "50%",
                              background:
                                "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                            }}
                          >
                            <BsCurrencyRupee size={24} />
                          </div>
                          <div>
                            <h6
                              className="fw-semibold mb-1"
                              style={{ color: "#121212" }}
                            >
                              {jobDetails.budgetType === "fixed"
                                ? "Fixed Price"
                                : "Hourly Rate"}
                            </h6>
                            <p
                              className="mb-0"
                              style={{
                                color: "#007674",
                                fontSize: "1.1rem",
                                fontWeight: "600",
                              }}
                            >
                              {jobDetails.budgetType === "fixed"
                                ? `₹${
                                    jobDetails.fixedRate ||
                                    jobDetails.hourlyRateFrom ||
                                    0
                                  }`
                                : `₹${jobDetails.hourlyRateFrom || 0} - ₹${
                                    jobDetails.hourlyRateTo || 0
                                  }`}
                            </p>
                            <small
                              style={{ color: "#121212", fontSize: "1rem" }}
                            >
                              {jobDetails.budgetType === "fixed"
                                ? "Total project budget"
                                : "Per hour"}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div style={cardSection} className="h-100">
                        <div className="d-flex align-items-center gap-3 mb-3">
                          <div
                            style={{
                              width: 50,
                              height: 50,
                              borderRadius: "50%",
                              background:
                                "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                            }}
                          >
                            <BsPeople size={24} />
                          </div>
                          <div>
                            <h6
                              className="fw-semibold mb-1"
                              style={{ color: "#121212" }}
                            >
                              Applicants
                            </h6>
                            <p
                              className="mb-0"
                              style={{
                                color: "#007674",
                                fontSize: "1.1rem",
                                fontWeight: "600",
                              }}
                            >
                              {jobDetails.applicants || 0} proposals
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Description */}
                  <div className="mb-4">
                    <h5
                      className="fw-semibold mb-3"
                      style={{ color: "#121212", fontSize: "1.4rem" }}
                    >
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
                          margin: 0,
                        }}
                      >
                        {jobDetails.description}
                      </p>
                    </div>
                  </div>
                  {/* Skills & Expertise */}
                  <div className="mb-4">
                    <h5
                      className="fw-semibold mb-3"
                      style={{ color: "#121212", fontSize: "1.4rem" }}
                    >
                      Skills & Expertise
                    </h5>
                    <div className="d-flex flex-wrap gap-2">
                      {Array.isArray(jobDetails.skills) &&
                      jobDetails.skills.length > 0 ? (
                        jobDetails.skills.map((tag, i) => (
                          <motion.span
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              delay: 0.6 + i * 0.05,
                              duration: 0.3,
                            }}
                            className="badge px-3 py-2"
                            style={skillTag}
                          >
                            {tag.name}
                          </motion.span>
                        ))
                      ) : (
                        <span style={{ color: "#666", fontSize: "1rem" }}>
                          No skills listed
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Project Details */}
                  <div className="mb-4">
                    <h5
                      className="fw-semibold mb-3"
                      style={{ color: "#121212", fontSize: "1.4rem" }}
                    >
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
                            <BsBriefcase
                              size={16}
                              style={{ color: "#007674" }}
                            />
                            <span
                              className="fw-semibold"
                              style={{ color: "#121212" }}
                            >
                              Scope
                            </span>
                          </div>
                          <p
                            className="mb-0"
                            style={{ color: "#666", fontSize: "1rem" }}
                          >
                            {jobDetails.scopeOfWork}
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
                            <span
                              className="fw-semibold"
                              style={{ color: "#121212" }}
                            >
                              Duration
                            </span>
                          </div>
                          <p
                            className="mb-0"
                            style={{ color: "#666", fontSize: "1rem" }}
                          >
                            {jobDetails.duration}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Right Column - Summary, Tips, Action */}
                <div className="col-lg-4" style={rightCard}>
                  {/* Post My Job Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="mb-4"
                  >
                    <button
                      onClick={handleNext}
                      className="btn w-100 py-3 fw-semibold"
                      style={{
                        background:
                          "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                        color: "#fff",
                        borderRadius: "15px",
                        fontSize: "1.1rem",
                        border: "none",
                        transition: "all 0.3s ease",
                        boxShadow: "0 6px 20px rgba(0, 118, 116, 0.3)",
                      }}
                      disabled={isLoading}
                      onMouseEnter={(e) => {
                        e.target.style.background =
                          "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow =
                          "0 8px 25px rgba(18, 18, 18, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background =
                          "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow =
                          "0 6px 20px rgba(0, 118, 116, 0.3)";
                      }}
                    >
                      {isLoading ? (
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        />
                      ) : (
                        <>
                          Post My Job <BsArrowRight className="ms-2" />
                        </>
                      )}
                    </button>
                  </motion.div>
                  {/* Summary Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="mb-4"
                  >
                    <h5
                      className="fw-semibold mb-3"
                      style={{ color: "#121212", fontSize: "1.3rem" }}
                    >
                      Job Summary
                    </h5>
                    <div
                      className="p-4 rounded-4"
                      style={{
                        background: "#fff",
                        border: "1px solid #e3e3e3",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <BsCheckCircle size={20} style={{ color: "#007674" }} />
                        <span
                          className="fw-semibold"
                          style={{ color: "#007674" }}
                        >
                          Ready to Post
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <span style={{ color: "#121212", fontSize: "1.1rem" }}>
                            Category:
                          </span>
                          <span
                            className="fw-semibold"
                            style={{ color: "#121212" }}
                          >
                            {jobDetails.category ? jobDetails.category.name : 'Not specified'}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span style={{ color: "#121212", fontSize: "1.1rem" }}>
                            Experience:
                          </span>
                          <span
                            className="fw-semibold"
                            style={{ color: "#121212" }}
                          >
                            {jobDetails.experienceLevel}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span style={{ color: "#121212", fontSize: "1.1rem" }}>
                            Duration:
                          </span>
                          <span
                            className="fw-semibold"
                            style={{ color: "#121212" }}
                          >
                            {jobDetails.duration}
                          </span>
                        </div>

                        <div className="d-flex justify-content-between align-items-center">
                          <span style={{ color: "#121212", fontSize: "1.1rem" }}>
                            Budget:
                          </span>
                          <span
                            className="fw-semibold"
                            style={{ color: "#121212" }}
                          >
                            {jobDetails.budgetType === "fixed"
                              ? `₹${
                                  jobDetails.fixedRate ||
                                  jobDetails.hourlyRateFrom ||
                                  0
                                } (Fixed)`
                              : `₹${jobDetails.hourlyRateFrom || 0} - ₹${
                                  jobDetails.hourlyRateTo || 0
                                } (Hourly)`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  {/* Pro Tips */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                  >
                    <h5
                      className="fw-semibold mb-3"
                      style={{ color: "#121212", fontSize: "1.3rem" }}
                    >
                      Pro Tips
                    </h5>
                    <div
                      className="p-4 rounded-4"
                      style={{
                        border: "1px solid #e3e3e3",
                      }}
                    >
                      <ul
                        className="mb-0"
                        style={{ color: "#121212", fontSize: "1.1rem" }}
                      >
                        <li className="mb-2">
                          Double-check your job details for accuracy
                        </li>
                        <li className="mb-2">
                          Well-presented jobs attract better freelancers
                        </li>
                        <li className="mb-2">
                          Be specific about your needs and expectations
                        </li>
                        <li className="mb-0">
                          You can always update your post later
                        </li>
                      </ul>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ClientJobReviewPage;
