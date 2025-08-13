import React, { useEffect, useState } from "react";
import Header1 from "../../components/Header1";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BsArrowRight, BsLightbulb, BsCheckCircle } from "react-icons/bs";
import axios from "axios";
import { RxCross2 } from "react-icons/rx";
import { TiTick } from "react-icons/ti";


const UserTitle = () => {
  const [title, setTitle] = useState("");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = "http://localhost:5000/api/auth";

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/current-user/`, {
          withCredentials: true,
        });
        setUserId(res.data.user._id);
        setDataLoading(false);
      } catch (error) {
        toast.error("Failed to fetch user.");
        console.error(error);
        setDataLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleNext = async () => {
    if (title.trim().length === 0) {
      toast.error("Please enter your professional headline.");
      return;
    }

    if (title.trim().length < 10) {
      toast.error("Your headline should be at least 10 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/save-title/`, {
        userId,
        title,
      });

      if (res.status === 200) {
        // toast.success("Professional headline saved successfully!");
        setTimeout(() => {
          navigate("/create-profile/experience");
        }, 100);
      }
    } catch (err) {
      console.error("Error saving title", err);
      toast.error("An error occurred while saving your headline.");
    } finally {
      setLoading(false);
    }
  };

  const exampleTitles = [
    "Full-Stack Developer | React & Node.js Expert",
    "UI/UX Designer | Creating Beautiful Digital Experiences",
    "Content Writer | SEO Specialist & Copywriter",
    "Mobile App Developer | iOS & Android Expert",
    "Data Scientist | Machine Learning & Analytics",
    "Digital Marketing Specialist | Growth Hacker",
  ];

  return (
    <>
      <style>
        {`
          .title-input {
            border: 2px solid #e3e3e3;
            border-radius: 15px;
            padding: 20px 25px;
            font-size: 1.1rem;
            font-family: Urbanist, sans-serif;
            font-weight: 500;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }
          
          .title-input:focus {
            outline: none;
            border-color: #007674;
            box-shadow: 0 6px 20px rgba(0, 118, 116, 0.15), 0 3px 8px rgba(0, 0, 0, 0.08);
            background: #ffffff;
            transform: translateY(-2px);
          }
          
          .title-input::placeholder {
            color: #999;
            font-weight: 400;
          }
          
          .example-title {
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .example-title:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 118, 116, 0.1);
          }
        `}
      </style>
      <Header1 />

      {/* Loading Screen */}
      {dataLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            fontFamily: "Urbanist, sans-serif",
          }}
        >
          <div className="text-center">
            <div
              className="d-inline-flex align-items-center justify-content-center mb-4"
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                color: "white",
                boxShadow: "0 8px 25px rgba(0, 118, 116, 0.3)",
              }}
            >
              <BsLightbulb size={40} />
            </div>
            <h3
              className="fw-semibold mb-3"
              style={{ color: "#121212", fontSize: "1.8rem", letterSpacing: '0.3px' }}
            >
              Loading Profile Setup
            </h3>
            <p className="mb-0" style={{ color: "#121212", fontSize: "1.2rem" }}>
              Preparing your profile creation experience...
            </p>
          </div>
        </div>
      )}

      <div
        className="min-vh-100 section-container"
        style={{
          backgroundColor: "#fff",
          padding: "40px 0",
          fontFamily: "Urbanist, sans-serif",
          fontWeight: 500,
        }}
      >
        <div className="container-fluid px-4">
          <div className="row g-4">
            {/* Left Column - Main Content */}
            <div className="col-lg-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="card border-0 shadow-lg h-100"
                style={{
                  borderRadius: "25px",
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                  border: "1px solid rgba(0, 118, 116, 0.1)",
                }}
              >
                <div className="card-body p-5">
                  {/* Header Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mb-5"
                  >
                    <div className="d-flex align-items-center mb-4">
                      <div>
                        <h2
                          className="fw-semibold mb-2"
                          style={{
                            color: "#121212",
                            fontSize: "2rem",
                            letterSpacing: "0.3px",
                          }}
                        >
                          Your Professional Headline
                        </h2>
                        <p
                          className="mb-0"
                          style={{
                            fontSize: "1.1rem",
                            color: "#121212",
                            lineHeight: "1.5",
                          }}
                        >
                          This is the first thing clients see—make it count!
                          Highlight your expertise and what makes you unique.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Input Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="mb-5"
                  >
                    <div className="mb-3">
                      <label
                        className="form-label fw-semibold"
                        style={{ color: "#121212", fontSize: "1.1rem" }}
                      >
                        Professional Headline
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="title-input w-100"
                        placeholder="Example: Full-Stack Developer | React & Node.js Expert"
                        maxLength={100}
                      />
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <small style={{ color: "#666" }}>
                          {title.length}/100 characters
                        </small>
                        {title.length >= 10 && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="d-flex align-items-center"
                          >
                            <BsCheckCircle
                              size={16}
                              style={{ color: "#007674", marginRight: "5px" }}
                            />
                            <small
                              style={{ color: "#007674", fontWeight: 600 }}
                            >
                              Good length!
                            </small>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Examples Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="mb-5"
                  >
                    <h5
                      className="fw-semibold mb-3"
                      style={{ color: "#121212" }}
                    >
                      Inspiration Examples
                    </h5>
                    <div className="row g-3">
                      {exampleTitles.map((example, index) => (
                        <motion.div
                          key={index}
                          className="col-md-6 col-lg-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: 0.7 + index * 0.1,
                            duration: 0.3,
                          }}
                        >
                          <div
                            className="example-title p-3 rounded-3 border"
                            style={{
                              backgroundColor: "#f8f9fa",
                              borderColor: "#121212",
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                              minHeight: "80px",
                              display: "flex",
                              alignItems: "center",
                            }}
                            onClick={() => setTitle(example)}
                            onMouseEnter={(e) => {
                              e.target.style.borderColor = "#007674";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.borderColor = "#e3e3e3";
                            }}
                          >
                            <small
                              style={{
                                color: "#121212",
                                fontSize: "1rem",
                                lineHeight: "1.4",
                              }}
                            >
                              {example}
                            </small>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* CTA Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.5 }}
                    className="text-center"
                  >
                    <button
                      className="login-button border-0 px-5 py-3 fw-semibold"
                      style={{
                        fontSize: "1.1rem",
                        borderRadius: "50px",
                        background:
                          title.length >= 10
                            ? "linear-gradient(135deg, #007674 0%, #005a58 100%)"
                            : "linear-gradient(135deg, #cccccc 0%, #bbbbbb 100%)",
                        color: "#fff",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        opacity: title.length >= 10 ? 1 : 0.6,
                        cursor: title.length >= 10 ? "pointer" : "not-allowed",
                        boxShadow:
                          title.length >= 10
                            ? "0 6px 20px rgba(0, 118, 116, 0.3), 0 3px 8px rgba(0, 0, 0, 0.1)"
                            : "0 2px 8px rgba(0, 0, 0, 0.1)",
                      }}
                      onClick={handleNext}
                      disabled={loading || title.length < 10}
                      onMouseEnter={(e) => {
                        if (title.length >= 10) {
                          e.target.style.background =
                            "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                          e.target.style.boxShadow =
                            "0 8px 25px rgba(18, 18, 18, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)";
                          e.target.style.transform = "translateY(-2px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (title.length >= 10) {
                          e.target.style.background =
                            "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                          e.target.style.boxShadow =
                            "0 6px 20px rgba(0, 118, 116, 0.3), 0 3px 8px rgba(0, 0, 0, 0.1)";
                          e.target.style.transform = "translateY(0)";
                        }
                      }}
                    >
                      {loading ? (
                        <div className="d-flex align-items-center">
                          <div
                            className="spinner-border spinner-border-sm me-2"
                            style={{ color: "#fff" }}
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          Saving...
                        </div>
                      ) : (
                        <>
                          Next, Add Experience
                          <BsArrowRight className="ms-2" size={20} />
                        </>
                      )}
                    </button>

                    {title.length < 10 && title.length > 0 && (
                      <p
                        className="mt-3 mb-0"
                        style={{ color: "#666", fontSize: "0.9rem" }}
                      >
                        Your headline should be at least 10 characters long
                      </p>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Tips & Guidance */}
            <div className="col-lg-4">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="card border-0 shadow-lg h-100"
                style={{
                  borderRadius: "25px",
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                  border: "1px solid rgba(0, 118, 116, 0.1)",
                }}
              >
                <div className="card-body p-4">
                  {/* Tips Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mb-4"
                  >
                    <div className="d-flex align-items-center mb-3">
                      <h4
                        className="fw-semibold mb-0"
                        style={{ color: "#121212", fontSize: "1.4rem" }}
                      >
                        Pro Tips
                      </h4>
                    </div>

                    <div
                      className="p-4 rounded-3"
                      style={{
                        border: "1px solid #e3e3e3",
                      }}
                    >
                      <ul
                        className="mb-0"
                        style={{ color: "#121212", fontSize: "1.0rem" }}
                      >
                        <li className="mb-2">
                          Include your primary skill or expertise
                        </li>
                        <li className="mb-2">Add a unique value proposition</li>
                        <li className="mb-2">
                          Keep it concise (10-60 characters ideal)
                        </li>
                        <li className="mb-2">Use action words and keywords</li>
                        <li className="mb-0">Make it memorable and unique</li>
                      </ul>
                    </div>
                  </motion.div>

                  {/* Best Practices */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="mb-4"
                  >
                    <h5
                      className="fw-semibold mb-3"
                      style={{ color: "#121212" }}
                    >
                      Best Practices
                    </h5>
                    <div className="space-y-3">
                      <div
                        className="p-3 rounded-3 border"
                        style={{
                          backgroundColor: "#f8f9fa",
                          borderColor: "#e3e3e3",
                        }}
                      >
                        <h6
                          className="fw-semibold mb-1"
                          style={{ color: "#007674", fontSize: "1rem" }}
                        >
                          <TiTick size={20}/> Do's
                        </h6>
                        <small style={{ color: "#121212", fontSize: "1rem" }}>
                          - Be specific about your expertise
                          <br />
                          - Include relevant keywords
                          <br />- Keep it professional yet engaging
                        </small>
                      </div>

                      <div
                        className="mt-3 p-3 rounded-3 border"
                        style={{
                          backgroundColor: "#f8f9fa",
                          borderColor: "#e3e3e3",
                        }}
                      >
                        <h6
                          className="fw-semibold mb-1"
                          style={{ color: "#da8535", fontSize: "1rem" }}
                        >
                          <RxCross2 size={20}/> Don'ts
                        </h6>
                        <small style={{ color: "#121212", fontSize: "1rem" }}>
                          - Avoid generic terms like "expert"
                          <br />
                          - Don't make it too long
                          <br />- Avoid jargon or buzzwords
                        </small>
                      </div>
                    </div>
                  </motion.div>

                  {/* Character Counter Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    <div
                      className="p-3 rounded-3"
                      style={{
                        border: "1px solid #e3e3e3",
                      }}
                    >
                      <h6
                        className="fw-semibold mb-2"
                        style={{ color: "#da8535" }}
                      >
                        Character Guide
                      </h6>
                      <div style={{ fontSize: "1rem", color: "#121212" }}>
                        <div className="d-flex justify-content-between mb-1">
                          <span>Minimum:</span>
                          <span style={{ color: "#007674", fontWeight: 600 }}>
                            10 chars
                          </span>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <span>Optimal:</span>
                          <span style={{ color: "#007674", fontWeight: 600 }}>
                            30-50 chars
                          </span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>Maximum:</span>
                          <span style={{ color: "#007674", fontWeight: 600 }}>
                            100 chars
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserTitle;
