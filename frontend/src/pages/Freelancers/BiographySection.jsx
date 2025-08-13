import React, { useEffect, useState } from "react";
import Header1 from "../../components/Header1";
import bio from "../../assets/bio.svg";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BsArrowRight,
  BsLightbulb,
  BsCheckCircle,
  BsStar,
  BsHeart,
  BsRocket,
} from "react-icons/bs";
import axios from "axios";

const BiographySection = () => {
  const [bioText, setBioText] = useState("");
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = "http://localhost:5000/api/auth";
  const MIN_CHARS = 100;
  const MAX_CHARS = 4000;

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

  const handleBioChange = (e) => {
    setBioText(e.target.value);
  };

  const handleNext = async () => {
    if (bioText.trim().length < MIN_CHARS) {
      toast.error("Your bio must be at least 100 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/add-biography/`, {
        userId,
        bio: bioText,
      });

      if (response.status === 200) {
        // toast.success("Biography saved successfully!");
        setTimeout(() => {
          navigate("/create-profile/rate");
        }, 100);
      }
    } catch (error) {
      console.error("Error saving bio:", error.message);
      toast.error("Failed to save biography.");
    } finally {
      setIsLoading(false);
    }
  };

  const exampleBios = [
    "I'm a passionate Full-Stack Developer with 5+ years of experience creating scalable web applications. I specialize in React, Node.js, and cloud technologies. My approach combines technical expertise with creative problem-solving to deliver exceptional user experiences.",
    "As a UI/UX Designer, I transform ideas into beautiful, functional interfaces. With expertise in user research, wireframing, and prototyping, I create designs that not only look great but also solve real user problems.",
    "I'm a dedicated Content Writer and SEO Specialist who helps businesses connect with their audience through compelling storytelling. My content strategies drive organic traffic and engagement while maintaining brand voice.",
    "With 8+ years in Mobile App Development, I've built apps used by millions. I specialize in React Native and Flutter, creating cross-platform solutions that deliver native performance and user experience.",
    "As a Data Scientist, I turn complex data into actionable insights. My expertise in machine learning, statistical analysis, and data visualization helps businesses make data-driven decisions.",
    "I'm a Digital Marketing Specialist focused on growth hacking and conversion optimization. I've helped startups scale from 0 to 100K+ users through strategic marketing campaigns and funnel optimization.",
  ];

  return (
    <>
      <style>
        {`
          .bio-textarea {
            border: 2px solid #e3e3e3;
            border-radius: 15px;
            padding: 20px 25px;
            font-size: 1.1rem;
            font-family: Urbanist, sans-serif;
            font-weight: 500;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            resize: none;
          }
          
          .bio-textarea:focus {
            outline: none;
            border-color: #007674;
            box-shadow: 0 6px 20px rgba(0, 118, 116, 0.15), 0 3px 8px rgba(0, 0, 0, 0.08);
            background: #ffffff;
            transform: translateY(-2px);
          }
          
          .bio-textarea::placeholder {
            color: #999;
            font-weight: 400;
          }
          
          .example-bio {
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .example-bio:hover {
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
              style={{
                color: "#121212",
                fontSize: "1.8rem",
                letterSpacing: "0.3px",
              }}
            >
              Loading Profile Setup
            </h3>
            <p
              className="mb-0"
              style={{ color: "#121212", fontSize: "1.2rem" }}
            >
              Preparing your biography section...
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
                          Tell Your Story
                        </h2>
                        <p
                          className="mb-0"
                          style={{
                            fontSize: "1.1rem",
                            color: "#121212",
                            lineHeight: "1.5",
                          }}
                        >
                          Share your journey, skills, and what makes you unique.
                          This is your chance to connect with potential clients
                          and showcase your expertise.
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
                        style={{ color: "#121212", fontSize: "1.2rem" }}
                      >
                        Your Biography
                      </label>
                      <textarea
                        value={bioText}
                        onChange={handleBioChange}
                        className="bio-textarea w-100"
                        placeholder="Share your story, skills, and what drives you. What problems do you solve? What makes you passionate about your work? Include your achievements and what clients can expect when working with you..."
                        rows="12"
                        maxLength={MAX_CHARS}
                      />
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <div className="d-flex align-items-center">
                          {bioText.length < MIN_CHARS ? (
                            <span className="text-danger small">
                              <i className="fas fa-exclamation-circle me-1"></i>
                              At least {MIN_CHARS} characters required
                            </span>
                          ) : (
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
                                Minimum requirement met!
                              </small>
                            </motion.div>
                          )}
                        </div>
                        <small style={{ color: "#121212", fontSize: "1.1rem" }}>
                          {bioText.length}/{MAX_CHARS} characters
                        </small>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-2">
                        <div
                          className="progress"
                          style={{ height: "6px", borderRadius: "10px" }}
                        >
                          <div
                            className={`progress-bar ${
                              bioText.length >= MIN_CHARS
                                ? "bg-success"
                                : "bg-danger"
                            }`}
                            style={{
                              width: `${Math.min(
                                (bioText.length / MIN_CHARS) * 100,
                                100
                              )}%`,
                              borderRadius: "10px",
                              transition: "width 0.3s ease",
                            }}
                          ></div>
                        </div>
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
                      style={{ color: "#121212", fontSize: "1.2rem" }}
                    >
                      Inspiration Examples
                    </h5>
                    <div className="row g-3">
                      {exampleBios.map((example, index) => (
                        <motion.div
                          key={index}
                          className="col-md-6"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: 0.7 + index * 0.1,
                            duration: 0.3,
                          }}
                        >
                          <div
                            className="example-bio p-3 rounded-3 border h-100 d-flex align-items-center"
                            style={{
                              backgroundColor: "#fff",
                              borderColor: "#e3e3e3",
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                              minHeight: "140px",
                            }}
                            onClick={() => setBioText(example)}
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
                          bioText.length >= MIN_CHARS
                            ? "linear-gradient(135deg, #007674 0%, #005a58 100%)"
                            : "linear-gradient(135deg, #cccccc 0%, #bbbbbb 100%)",
                        color: "#fff",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        opacity: bioText.length >= MIN_CHARS ? 1 : 0.6,
                        cursor:
                          bioText.length >= MIN_CHARS
                            ? "pointer"
                            : "not-allowed",
                        boxShadow:
                          bioText.length >= MIN_CHARS
                            ? "0 6px 20px rgba(0, 118, 116, 0.3), 0 3px 8px rgba(0, 0, 0, 0.1)"
                            : "0 2px 8px rgba(0, 0, 0, 0.1)",
                      }}
                      onClick={handleNext}
                      disabled={isLoading || bioText.length < MIN_CHARS}
                      onMouseEnter={(e) => {
                        if (bioText.length >= MIN_CHARS) {
                          e.target.style.background =
                            "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                          e.target.style.boxShadow =
                            "0 8px 25px rgba(18, 18, 18, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)";
                          e.target.style.transform = "translateY(-2px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (bioText.length >= MIN_CHARS) {
                          e.target.style.background =
                            "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                          e.target.style.boxShadow =
                            "0 6px 20px rgba(0, 118, 116, 0.3), 0 3px 8px rgba(0, 0, 0, 0.1)";
                          e.target.style.transform = "translateY(0)";
                        }
                      }}
                    >
                      {isLoading ? (
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
                          Next, Add Your Rate
                          <BsArrowRight className="ms-2" size={20} />
                        </>
                      )}
                    </button>

                    {bioText.length < MIN_CHARS && bioText.length > 0 && (
                      <p
                        className="mt-3 mb-0"
                        style={{ color: "#666", fontSize: "0.9rem" }}
                      >
                        Your biography should be at least {MIN_CHARS} characters
                        long
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
                  {/* Why Bio Matters */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mb-4"
                  >
                    <div className="d-flex align-items-center mb-3">
                      <h4
                        className="fw-semibold mb-0"
                        style={{
                          color: "#121212",
                          fontSize: "1.4rem",
                          letterSpacing: "0.3px",
                        }}
                      >
                        Why a Great Bio Matters
                      </h4>
                    </div>

                    <div className="space-y-3">
                      <div className="d-flex align-items-start mb-3">
                        <div>
                          <h6
                            className="fw-semibold mb-1"
                            style={{ color: "#121212", fontSize: "1.2rem" }}
                          >
                            ● Showcase Expertise
                          </h6>
                          <p className="text-muted small mb-0">
                            Highlight your skills and experience in a compelling
                            way
                          </p>
                        </div>
                      </div>
                      <div className="d-flex align-items-start mb-3">
                        <div>
                          <h6
                            className="fw-semibold mb-1"
                            style={{ color: "#121212", fontSize: "1.2rem" }}
                          >
                            ● Connect Personally
                          </h6>
                          <p className="text-muted small mb-0">
                            Let clients see the person behind the skills
                          </p>
                        </div>
                      </div>
                      <div className="d-flex align-items-start">
                        <div>
                          <h6
                            className="fw-semibold mb-1"
                            style={{ color: "#121212", fontSize: "1.2rem" }}
                          >
                            ● Stand Out
                          </h6>
                          <p className="text-muted small mb-0">
                            Differentiate yourself from other freelancers
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Pro Tips */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="mb-4"
                  >
                    <h5
                      className="fw-semibold mb-3"
                      style={{ color: "#121212", fontSize: "1.2rem" }}
                    >
                      Pro Tips
                    </h5>
                    <div
                      className="p-4 rounded-3"
                      style={{
                        border: "1px solid rgba(0, 118, 116, 0.1)",
                      }}
                    >
                      <ul
                        className="mb-0"
                        style={{ color: "#121212", fontSize: "1rem" }}
                      >
                        <li className="mb-2">Start with a compelling hook</li>
                        <li className="mb-2">Include specific achievements</li>
                        <li className="mb-2">Mention your unique approach</li>
                        <li className="mb-2">Add a personal touch</li>
                        <li className="mb-0">End with a call to action</li>
                      </ul>
                    </div>
                  </motion.div>

                  {/* Best Practices */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="mb-4"
                  >
                    <h5
                      className="fw-semibold mb-3"
                      style={{ color: "#121212", fontSize: "1.2rem" }}
                    >
                      Best Practices
                    </h5>
                    <div className="space-y-3">
                      <div
                        className="p-3 rounded-3 border"
                        style={{
                          backgroundColor: "#fff",
                          borderColor: "#e3e3e3",
                        }}
                      >
                        <h6
                          className="fw-semibold mb-1"
                          style={{ color: "#007674", fontSize: "1.2rem" }}
                        >
                          Do's
                        </h6>
                        <small style={{ color: "#121212", fontSize: "1.1rem" }}>
                          - Be authentic and genuine
                          <br />
                          - Include specific examples
                          <br />- Show passion for your work
                        </small>
                      </div>

                      <div
                        className="p-3 mt-3 rounded-3 border"
                        style={{
                          backgroundColor: "#fff",
                          borderColor: "#e3e3e3",
                        }}
                      >
                        <h6
                          className="fw-semibold mb-1"
                          style={{ color: "#da8535", fontSize: "1.2rem" }}
                        >
                          Don'ts
                        </h6>
                        <small style={{ color: "#121212", fontSize: "1.1rem" }}>
                          - Don't be too generic
                          <br />
                          - Avoid excessive jargon
                          <br />- Don't make it too long
                        </small>
                      </div>
                    </div>
                  </motion.div>

                  {/* Character Guide */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
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
                            {MIN_CHARS} chars
                          </span>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <span>Optimal:</span>
                          <span style={{ color: "#007674", fontWeight: 600 }}>
                            300-800 chars
                          </span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>Maximum:</span>
                          <span style={{ color: "#007674", fontWeight: 600 }}>
                            {MAX_CHARS} chars
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

export default BiographySection;
