import React from "react";
import { motion } from "framer-motion";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  BsFileEarmarkText,
  BsGlobe,
  BsArrowRight,
  BsCheckCircle,
} from "react-icons/bs";
import { RiAiGenerate } from "react-icons/ri";

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
        background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
        minHeight: "100vh",
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
                // background: "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "20px",
                boxShadow: "0 8px 24px rgba(0, 118, 116, 0.2)",
              }}
            >
              <RiAiGenerate size={40} color="#007674" />
            </div>
            <h1
              className="fw-bold mb-0"
              style={{
                color: "#121212",
                fontSize: "2.5rem",
                fontFamily: "Urbanist, sans-serif",
              }}
            >
              AI Tools Hub
            </h1>
          </div>
          <p
            className="lead mb-0"
            style={{
              color: "#666",
              fontSize: "1.2rem",
              maxWidth: "600px",
              margin: "0 auto",
              fontFamily: "Urbanist, sans-serif",
            }}
          >
            Leverage the power of AI to create professional resumes and stunning
            portfolio websites
          </p>
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
                background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                borderRadius: "25px",
                padding: "40px",
                border: "2px solid #e3e3e3",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
              }}
              onMouseEnter={(e) => {
                // e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.borderColor = "#007674";
                e.currentTarget.style.boxShadow =
                  "0 16px 48px rgba(0, 118, 116, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "#e3e3e3";
                e.currentTarget.style.boxShadow =
                  "0 8px 32px rgba(0, 0, 0, 0.08)";
              }}
            >
              {/* Icon */}
              <div
                className="text-center mb-4"
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "20px",
                  // background:
                  //   "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  boxShadow: "0 8px 24px rgba(0, 118, 116, 0.2)",
                }}
              >
                <BsFileEarmarkText size={35} color="#007674" />
              </div>

              {/* Content */}
              <div className="text-center">
                <h3
                  className="fw-semibold mb-3"
                  style={{
                    color: "#121212",
                    fontSize: "1.8rem",
                    fontFamily: "Urbanist, sans-serif",
                  }}
                >
                  Build a Resume
                </h3>
                <p
                  className="mb-4"
                  style={{
                    color: "#666",
                    fontSize: "1.05rem",
                    lineHeight: "1.6",
                    fontFamily: "Urbanist, sans-serif",
                  }}
                >
                  Create a professional, ATS-friendly resume tailored to your
                  skills and experience. Our AI helps you highlight your
                  achievements and optimize for job applications.
                </p>

                {/* Features List */}
                <div className="text-start mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <BsCheckCircle
                      size={16}
                      color="#007674"
                      className="me-2"
                      style={{ flexShrink: 0 }}
                    />
                    <span
                      style={{
                        color: "#555",
                        fontSize: "1rem",
                        fontFamily: "Urbanist, sans-serif",
                      }}
                    >
                      ATS-optimized formatting
                    </span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <BsCheckCircle
                      size={16}
                      color="#007674"
                      className="me-2"
                      style={{ flexShrink: 0 }}
                    />
                    <span
                      style={{
                        color: "#555",
                        fontSize: "1rem",
                        fontFamily: "Urbanist, sans-serif",
                      }}
                    >
                      AI-powered content suggestions
                    </span>
                  </div>
                  <div className="d-flex align-items-center">
                    <BsCheckCircle
                      size={16}
                      color="#007674"
                      className="me-2"
                      style={{ flexShrink: 0 }}
                    />
                    <span
                      style={{
                        color: "#555",
                        fontSize: "1rem",
                        fontFamily: "Urbanist, sans-serif",
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
                    borderRadius: "18px",
                    padding: "15px 24px",
                    fontSize: "1rem",
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
                      "linear-gradient(135deg, #121212 0%, #121212 100%)";
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
                background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                borderRadius: "25px",
                padding: "40px",
                border: "2px solid #e3e3e3",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
              }}
              onMouseEnter={(e) => {
                // e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.borderColor = "#007674";
                e.currentTarget.style.boxShadow =
                  "0 16px 48px rgba(0, 118, 116, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "#e3e3e3";
                e.currentTarget.style.boxShadow =
                  "0 8px 32px rgba(0, 0, 0, 0.08)";
              }}
            >
              {/* Icon */}
              <div
                className="text-center mb-4"
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "20px",
                  // background:
                  //   "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  boxShadow: "0 8px 24px rgba(0, 118, 116, 0.2)",
                }}
              >
                <BsGlobe size={35} color="#007674" />
              </div>

              {/* Content */}
              <div className="text-center">
                <h3
                  className="fw-semibold mb-3"
                  style={{
                    color: "#121212",
                    fontSize: "1.8rem",
                    fontFamily: "Urbanist, sans-serif",
                  }}
                >
                  Build Portfolio Website
                </h3>
                <p
                  className="mb-4"
                  style={{
                    color: "#666",
                    fontSize: "1.06rem",
                    lineHeight: "1.6",
                    fontFamily: "Urbanist, sans-serif",
                  }}
                >
                  Design a stunning portfolio website that showcases your work
                  and skills. Our AI generates personalized layouts and content
                  to make you stand out.
                </p>

                {/* Features List */}
                <div className="text-start mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <BsCheckCircle
                      size={16}
                      color="#007674"
                      className="me-2"
                      style={{ flexShrink: 0 }}
                    />
                    <span
                      style={{
                        color: "#555",
                        fontSize: "1rem",
                        fontFamily: "Urbanist, sans-serif",
                      }}
                    >
                      Responsive design templates
                    </span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <BsCheckCircle
                      size={16}
                      color="#007674"
                      className="me-2"
                      style={{ flexShrink: 0 }}
                    />
                    <span
                      style={{
                        color: "#555",
                        fontSize: "1rem",
                        fontFamily: "Urbanist, sans-serif",
                      }}
                    >
                      AI-generated content & layouts
                    </span>
                  </div>
                  <div className="d-flex align-items-center">
                    <BsCheckCircle
                      size={16}
                      color="#007674"
                      className="me-2"
                      style={{ flexShrink: 0 }}
                    />
                    <span
                      style={{
                        color: "#555",
                        fontSize: "1rem",
                        fontFamily: "Urbanist, sans-serif",
                      }}
                    >
                      Custom domain & hosting included
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
                    borderRadius: "18px",
                    padding: "15px 24px",
                    fontSize: "1rem",
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
                      "linear-gradient(135deg, #121212 0%, #121212 100%)";
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

        {/* Bottom Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-5"
        >
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(0, 118, 116, 0.05) 0%, rgba(0, 118, 116, 0.02) 100%)",
              borderRadius: "20px",
              padding: "30px",
              border: "1px solid rgba(0, 118, 116, 0.1)",
              maxWidth: "100vw",
              margin: "0 auto",
            }}
          >
            <p
              className="mb-0"
              style={{
                color: "#666",
                fontSize: "1rem",
                fontFamily: "Urbanist, sans-serif",
              }}
            >
              <strong style={{ color: "#007674", marginRight: "5px" }}>
                Powered by AI:
              </strong>{" "}
              Both tools use advanced artificial intelligence to create
              personalized, professional content that helps you stand out in
              your career.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AiToolsOverview;
