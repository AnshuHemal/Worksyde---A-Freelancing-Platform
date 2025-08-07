import React from "react";
import { motion } from "framer-motion";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  BsFileEarmarkText,
  BsGlobe,
  BsArrowRight,
  BsCheckCircle,
  BsLightning,
  BsStar,
  BsRocket,
  BsGear,
  BsLightningFill,
} from "react-icons/bs";
import { RiAiGenerate } from "react-icons/ri";
import { FaRegFilePdf, FaRegFileWord, FaStar } from "react-icons/fa";

const AiToolsOverview = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleResumeClick = () => {
    navigate("/ws/ai-tools/ai-resume");
  };

  const handlePortfolioClick = () => {
    navigate("/ws/ai-tools/ai-portfolio-web");
  };

  if (
    location.pathname.includes("/ws/ai-tools/ai-resume") ||
    location.pathname.includes("/ws/ai-tools/ai-portfolio-web")
  ) {
    return <Outlet />;
  }

  return (
    <div
      style={{
        padding: "120px 20px 40px",
        background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
        minHeight: "100vh",
        fontFamily: "Urbanist, sans-serif",
      }}
    >
      <div className="container">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-5"
        >
          <div className="d-flex align-items-center justify-content-center mb-4">
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "20px",
                background: "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "20px",
                boxShadow: "0 8px 24px rgba(0, 118, 116, 0.2)",
              }}
            >
              <RiAiGenerate size={40} color="#fff" />
            </div>
            <h1
              className="fw-semibold mb-0"
              style={{
                color: "#121212",
                fontSize: "2.5rem",
                fontFamily: "Urbanist, sans-serif",
                letterSpacing: "0.3px",
              }}
            >
              AI Tools Hub
            </h1>
          </div>
          <p
            className="lead mb-0"
            style={{
              color: "#222",
              fontSize: "1.2rem",
              maxWidth: "100%",
              margin: "0 auto",
              fontWeight: "500",
              fontFamily: "Urbanist, sans-serif",
            }}
          >
            Leverage the power of AI to create professional resumes and stunning
            portfolio websites.
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="row justify-content-around align-items-center mb-5"
        >
          <div className="col-lg-8">
            <div className="row g-3 justify-content-between">
              <div className="col-md-4">
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "24px",
                    border: "1px solid #e5e7eb",
                    textAlign: "center",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      // borderRadius: "12px",
                      // border: "2px solid #007476",
                      // background: "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                    }}
                  >
                    <BsLightningFill size={28} color="#007476" />
                  </div>
                  <h3
                    style={{
                      color: "#121212",
                      fontSize: "1.5rem",
                      fontWeight: "600",
                      letterSpacing: "0.3px",
                      margin: "0 0 4px 0",
                    }}
                  >
                    10x Faster
                  </h3>
                  <p
                    style={{
                      color: "#121212",
                      fontSize: "1rem",
                      fontWeight: "500",
                      margin: "10px 0",
                    }}
                  >
                    Create content in minutes, not hours
                  </p>
                </div>
              </div>
              <div className="col-md-4">
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "24px",
                    border: "1px solid #e5e7eb",
                    textAlign: "center",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      // borderRadius: "12px",
                      // border: "2px solid #007476",
                      // background: "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                    }}
                  >
                    <FaStar size={28} color="#007476" />
                  </div>
                  <h3
                    style={{
                      color: "#121212",
                      fontSize: "1.5rem",
                      fontWeight: "600",
                      letterSpacing: "0.3px",
                      margin: "0 0 4px 0",
                    }}
                  >
                    ATS Optimized
                  </h3>
                  <p
                    style={{
                      color: "#121212",
                      fontSize: "1rem",
                      fontWeight: "500",
                      margin: "10px 0",
                    }}
                  >
                    Pass through applicant tracking systems
                  </p>
                </div>
              </div>
              <div className="col-md-4">
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "24px",
                    border: "1px solid #e5e7eb",
                    textAlign: "center",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      // borderRadius: "12px",
                      // border: "2px solid #007476",
                      // background: "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                    }}
                  >
                    <BsRocket size={28} color="#007476" />
                  </div>
                  <h3
                    style={{
                      color: "#121212",
                      fontSize: "1.5rem",
                      fontWeight: "600",
                      letterSpacing: "0.3px",
                      margin: "0 0 4px 0",
                    }}
                  >
                    Professional
                  </h3>
                  <p
                    style={{
                      color: "#121212",
                      fontSize: "1rem",
                      fontWeight: "500",
                      margin: "10px 0",
                    }}
                  >
                    Industry-standard templates and designs
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Options Grid */}
        <div className="row justify-content-center g-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="col-lg-6 col-md-8"
          >
            <div
              className="ai-option-card h-100"
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                padding: "32px",
                border: "1px solid #e5e7eb",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = "#007674";
                e.currentTarget.style.boxShadow =
                  "0 12px 32px rgba(0, 118, 116, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0, 0, 0, 0.05)";
              }}
            >
              {/* Icon */}
              <div
                className="text-center mb-4"
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "16px",
                  // background: "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  boxShadow: "0 8px 24px rgba(0, 118, 116, 0.2)",
                }}
              >
                <BsFileEarmarkText size={35} color="#007476" />
              </div>

              {/* Content */}
              <div className="text-center">
                <h3
                  className="fw-semibold mb-3"
                  style={{
                    color: "#121212",
                    fontSize: "1.8rem",
                    letterSpacing: "0.3px",
                    fontFamily: "Urbanist, sans-serif",
                  }}
                >
                  Build a Resume
                </h3>
                <p
                  className="py-4 "
                  style={{
                    color: "#222",
                    fontSize: "1.1rem",
                    lineHeight: "1.6",
                    fontFamily: "Urbanist, sans-serif",
                    fontWeight: "500",
                  }}
                >
                  Create a professional, ATS-friendly resume tailored to your
                  skills and experience. Our AI helps you highlight your
                  achievements and optimize for job applications.
                </p>

                {/* Features List */}
                <div className="text-start mb-4">
                  <div className="d-flex align-items-center mb-3">
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "6px",
                        // background: "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "12px",
                        flexShrink: 0,
                      }}
                    >
                      <BsCheckCircle size={20} color="#007476" />
                    </div>
                    <span
                      style={{
                        color: "#121212",
                        fontSize: "1.1rem",
                        fontFamily: "Urbanist, sans-serif",
                        fontWeight: "600",
                      }}
                    >
                      ATS-optimized formatting
                    </span>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "6px",
                        // background: "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "12px",
                        flexShrink: 0,
                      }}
                    >
                      <BsCheckCircle size={20} color="#007476" />
                    </div>
                    <span
                      style={{
                        color: "#121212",
                        fontSize: "1.1rem",
                        fontFamily: "Urbanist, sans-serif",
                        fontWeight: "600",
                      }}
                    >
                      AI-powered content suggestions
                    </span>
                  </div>
                  <div className="d-flex align-items-center">
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "6px",
                        // background: "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "12px",
                        flexShrink: 0,
                      }}
                    >
                      <BsCheckCircle size={20} color="#007476" />
                    </div>
                    <span
                      style={{
                        color: "#121212",
                        fontSize: "1.1rem",
                        fontFamily: "Urbanist, sans-serif",
                        fontWeight: "600",
                      }}
                    >
                      Multiple professional templates
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  className="btn btn-primary w-100"
                  onClick={handleResumeClick}
                  style={{
                    background:
                      "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                    border: "none",
                    borderRadius: "12px",
                    padding: "16px 24px",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    fontFamily: "Urbanist, sans-serif",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 16px rgba(0, 118, 116, 0.2)",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow =
                      "0 6px 20px rgba(0, 118, 116, 0.3)";
                    e.target.style.background =
                      "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow =
                      "0 4px 16px rgba(0, 118, 116, 0.2)";
                    e.target.style.background =
                      "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                  }}
                >
                  <BsArrowRight className="me-2" />
                  Start Building Resume
                </button>
              </div>
            </div>
          </motion.div>

          {/* Build Portfolio Website Option */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="col-lg-6 col-md-8"
          >
            <div
              className="ai-option-card h-100"
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                padding: "32px",
                border: "1px solid #e5e7eb",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = "#007674";
                e.currentTarget.style.boxShadow =
                  "0 12px 32px rgba(0, 118, 116, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0, 0, 0, 0.05)";
              }}
            >
              {/* Icon */}
              <div
                className="text-center mb-4"
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "16px",
                  // background: "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  boxShadow: "0 8px 24px rgba(0, 118, 116, 0.2)",
                }}
              >
                <BsGlobe size={35} color="#007476" />
              </div>

              {/* Content */}
              <div className="text-center">
                <h3
                  className="fw-semibold mb-3"
                  style={{
                    color: "#121212",
                    fontSize: "1.8rem",
                    letterSpacing: "0.3px",
                    fontFamily: "Urbanist, sans-serif",
                  }}
                >
                  Build Portfolio Website
                </h3>
                <p
                  className="py-4"
                  style={{
                    color: "#222",
                    fontSize: "1.1rem",
                    lineHeight: "1.6",
                    fontFamily: "Urbanist, sans-serif",
                    fontWeight: "500",
                  }}
                >
                  Create a stunning portfolio website to showcase your work and
                  attract potential clients. Our AI helps you design and optimize
                  for maximum impact.
                </p>

                {/* Features List */}
                <div className="text-start mb-4">
                  <div className="d-flex align-items-center mb-3">
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "6px",
                        // background: "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "12px",
                        flexShrink: 0,
                      }}
                    >
                      <BsCheckCircle size={20} color="#007476" />
                    </div>
                    <span
                      style={{
                        color: "#121212",
                        fontSize: "1.1rem",
                        fontFamily: "Urbanist, sans-serif",
                        fontWeight: "600",
                      }}
                    >
                      Responsive design templates
                    </span>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "6px",
                        // background: "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "12px",
                        flexShrink: 0,
                      }}
                    >
                      <BsCheckCircle size={20} color="#007476" />
                    </div>
                    <span
                      style={{
                        color: "#121212",
                        fontSize: "1.1rem",
                        fontFamily: "Urbanist, sans-serif",
                        fontWeight: "600",
                      }}
                    >
                      SEO-optimized content
                    </span>
                  </div>
                  <div className="d-flex align-items-center">
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "6px",
                        // background: "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "12px",
                        flexShrink: 0,
                      }}
                    >
                      <BsCheckCircle size={20} color="#007476" />
                    </div>
                    <span
                      style={{
                        color: "#121212",
                        fontSize: "1.1rem",
                        fontFamily: "Urbanist, sans-serif",
                        fontWeight: "600",
                      }}
                    >
                      Custom domain support
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  className="btn btn-primary w-100"
                  onClick={handlePortfolioClick}
                  style={{
                    background:
                      "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                    border: "none",
                    borderRadius: "12px",
                    padding: "16px 24px",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    fontFamily: "Urbanist, sans-serif",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 16px rgba(0, 118, 116, 0.2)",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow =
                      "0 6px 20px rgba(0, 118, 116, 0.3)";
                    e.target.style.background =
                      "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow =
                      "0 4px 16px rgba(0, 118, 116, 0.2)";
                    e.target.style.background =
                      "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                  }}
                >
                  <BsArrowRight className="me-2" />
                  Start Building Portfolio
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-5"
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "32px",
              border: "1px solid #e5e7eb",
              maxWidth: "100%",
              margin: "0 auto",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <BsGear size={24} color="#fff" />
            </div>
            <h4
              style={{
                color: "#121212",
                fontSize: "1.35rem",
                fontWeight: "600",
                marginBottom: "8px",
                letterSpacing: "0.2px",
              }}
            >
              Powered by Advanced AI
            </h4>
            <p
              style={{
                color: "#121212",
                fontSize: "1.1rem",
                margin: "0",
                lineHeight: "1.5",
                fontWeight: "500",
              }}
            >
              Our AI tools use cutting-edge technology to help you create
              professional content that stands out in today's competitive market.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AiToolsOverview;
