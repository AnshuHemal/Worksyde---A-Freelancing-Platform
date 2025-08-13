import React, { useEffect, useState } from "react";
import Header1 from "../../components/Header1";
import { RiChatSmileAiLine } from "react-icons/ri";
import { BsArrowRight, BsLightbulb, BsCheckCircle } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import jobTitle from "../../assets/job_skills.svg";
import axios from "axios";
import toast from "react-hot-toast";

const ClientJobTitlePage = () => {
  const [title, setTitle] = useState("");
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = "http://localhost:5000/api/auth";

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/current-user/`, {
          withCredentials: true,
        });
        setUserId(res.data.user._id);
      } catch (error) {
        toast.error("Failed to fetch user.");
        console.error(error);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleNext = async () => {
    if (title.trim().length === 0) {
      toast.error("Please enter a job title.");
      return;
    }

    if (title.trim().length < 10) {
      toast.error("Job title should be at least 10 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      const jobIdRes = await axios.post(`${API_URL}/jobposts/draft/`, {
        userId,
      });
      const jobId = jobIdRes.data.jobPostId;

      const res = await axios.post(`${API_URL}/add-job-post-title/`, {
        jobId,
        title,
      });

      if (res.status === 200) {
        // toast.success("Title saved successfully!");
        navigate("/job-post/instant/skills");
      }
    } catch (err) {
      console.error("Error saving title", err);
      toast.error("An error occurred while saving your title.");
    } finally {
      setIsLoading(false);
    }
  };

  const exampleTitles = [
    "Need a MERN Stack Developer for Web App Enhancements",
    "Need Creative Graphic Designer for Marketing Collateral",
    "Hire a Social Media Manager for Instagram & LinkedIn",
    "AR experience needed for virtual product demos (ARCore)",
    // "Looking for UI/UX Designer for Mobile App Redesign",
    // "Seeking Python Developer for Data Analysis Project",
  ];

  return (
    <>
      <Header1 />
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center section-container"
        style={{
          backgroundColor: "#fff",
          padding: "40px 0",
          fontFamily: "Urbanist, sans-serif",
          fontWeight: 500,
        }}
      >
        <div className="container-fluid px-4">
          <div className="row justify-content-center">
            <div className="col-12">
              {/* Header Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-5"
              >
                <h2
                  className="display-5 fw-semibold mb-3"
                  style={{ color: "#121212", letterSpacing: '0.3px' }}
                >
                  Create Your Job Post
                </h2>
                <p
                  className="lead mb-4"
                  style={{
                    fontSize: "1.25rem",
                    color: "#121212",
                    fontWeight: 600,
                    letterSpacing: '0.3px'
                  }}
                >
                  Step 1: Let's start with a compelling title
                </p>
              </motion.div>

              {/* Main Content */}
              <div className="row justify-content-center align-items-start">
                <div className="col-lg-5 mb-4">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    {/* Examples Card */}
                    <div
                      className="cardd border-0 shadow-lg h-100"
                      style={{
                        borderRadius: "25px",
                        border: "1px solid rgba(0, 118, 116, 0.1)",
                      }}
                    >
                      <div className="card-body p-5">
                        <div className="d-flex align-items-center mb-4">
                          <BsLightbulb
                            size={24}
                            style={{ color: "#007674", marginRight: "12px" }}
                          />
                          <h4
                            className="fw-bold mb-0"
                            style={{ color: "#121212", letterSpacing: '0.3px' }}
                          >
                            Example Job Titles
                          </h4>
                        </div>
                        <p
                          className="mb-4"
                          style={{
                            fontSize: "1rem",
                            color: "#121212",
                            lineHeight: "1.6",
                          }}
                        >
                          Get inspired with these proven job title examples that
                          attract top talent.
                        </p>
                        <div className="space-y-3">
                          {exampleTitles.map((example, index) => (
                            <div
                              key={index}
                              className="p-4 rounded"
                              style={{
                                background: "#fff",
                                border: "1px solid #e3e3e3",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                marginBottom: "12px",
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background =
                                  "#fff";
                                e.target.style.transform = "translateY(-3px)";
                                
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background =
                                  "#fff";
                                e.target.style.transform = "translateY(0)";
                              }}
                              onClick={() => setTitle(example)}
                            >
                              <p
                                className="mb-0"
                                style={{
                                  fontSize: "1rem",
                                  color: "#121212",
                                  fontWeight: 500,
                                  lineHeight: "1.5",
                                }}
                              >
                                {example}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="col-lg-7">
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    {/* Main Form Card */}
                    <div
                      className="cardd border-0 shadow-lg"
                      style={{
                        borderRadius: "25px",
                        border: "1px solid rgba(0, 118, 116, 0.1)",
                      }}
                    >
                      <div className="card-body p-5">
                        <h3
                          className="fw-semibold mb-4"
                          style={{ color: "#121212", letterSpacing: '0.3px' }}
                        >
                          Great, Let's start with a strong title
                        </h3>
                        <p
                          className="mb-4"
                          style={{
                            fontSize: "1.1rem",
                            color: "#121212",
                            lineHeight: "1.6",
                          }}
                        >
                          Your job post title is more than just a label — it's
                          your opportunity to stand out in a sea of listings.
                          Write something specific and inviting to catch the eye
                          of top-tier candidates.
                        </p>

                        <div className="mb-4">
                          <label
                            className="fw-semibold mb-3 d-block"
                            style={{ color: "#121212", letterSpacing: '0.3px' }}
                          >
                            Job Title
                          </label>
                          <div className="position-relative">
                            <input
                              type="text"
                              required
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              className="form-control"
                              placeholder="e.g., Need a MERN Stack Developer for Web App"
                              style={{
                                fontSize: "1.1rem",
                                fontWeight: 500,
                                borderRadius: "15px",
                                border: "2px solid #e3e3e3",
                                padding: "15px 20px",
                                background: "#fcfafd",
                                transition: "all 0.3s ease",
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = "#007674";
                                e.target.style.boxShadow =
                                  "0 0 0 0.2rem rgba(0, 118, 116, 0.1)";
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = "#e3e3e3";
                                e.target.style.boxShadow = "none";
                              }}
                            />
                            {title.length > 0 && (
                              <div className="position-absolute top-50 end-0 translate-middle-y pe-3">
                                <BsCheckCircle
                                  size={20}
                                  style={{
                                    color:
                                      title.length >= 10
                                        ? "#28a745"
                                        : "#ffc107",
                                  }}
                                />
                              </div>
                            )}
                          </div>
                          <div className="d-flex justify-content-between align-items-center mt-2">
                            <small
                              className="text-muted"
                              style={{ fontSize: "0.9rem" }}
                            >
                              {title.length}/100 characters
                            </small>
                            <button
                              type="button"
                              className="btn btn-link p-0 text-decoration-none text-end"
                              style={{
                                color: "#007674",
                                fontSize: "1rem",
                                fontWeight: 600,
                              }}
                            >
                              <RiChatSmileAiLine className="me-1" />
                              Generate with AI
                            </button>
                          </div>
                        </div>

                        <motion.button
                          className="btn fw-semibold px-5 py-3 w-100"
                          style={{
                            borderRadius: "50px",
                            background:
                              title.length >= 10
                                ? "linear-gradient(135deg, #007674 0%, #005a58 100%)"
                                : "#ccc",
                            color: "#fff",
                            fontSize: "1.1rem",
                            boxShadow:
                              title.length >= 10
                                ? "0 6px 20px rgba(0, 118, 116, 0.3)"
                                : "none",
                            border: "none",
                            transition: "all 0.3s ease",
                          }}
                          disabled={title.length < 10 || isLoading}
                          onClick={handleNext}
                          whileHover={
                            title.length >= 10
                              ? {
                                  scale: 1.02,
                                  boxShadow:
                                    "0 8px 25px rgba(0, 118, 116, 0.4)",
                                }
                              : {}
                          }
                          whileTap={{ scale: 0.98 }}
                        >
                          {isLoading ? (
                            <div
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                            >
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </div>
                          ) : (
                            <>
                              Next, Add Skills
                              <BsArrowRight className="ms-2" />
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientJobTitlePage;
