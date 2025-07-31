import React from "react";
import Header1 from "../../components/Header1";
import success from "../../assets/success1.jpg";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BsCheckCircle,
  BsEnvelope,
  BsBriefcase,
  BsClock,
  BsStar,
  BsRocket,
  BsArrowRight,
  BsLightbulb,
} from "react-icons/bs";

const FinishProfileSection = () => {
  const navigate = useNavigate();

  const handleCheckMail = () => {
    window.open("https://mail.google.com", "_blank");
  };

  const handleBrowseJobs = () => {
    navigate("/home");
  };

  return (
    <>
      <style>
        {`
          .success-card {
            border: 2px solid #e3e3e3;
            border-radius: 20px;
            padding: 25px;
            font-family: Urbanist, sans-serif;
            font-weight: 500;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
            cursor: pointer;
          }
          
          .success-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0, 118, 116, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1);
            border-color: #007674;
          }
          
          .action-button {
            border-radius: 50px;
            padding: 12px 30px;
            font-weight: 600;
            font-size: 1rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: none;
            cursor: pointer;
          }
          
          .action-button:hover {
            transform: translateY(-2px);
          }
        `}
      </style>
      <Header1 />

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
                  {/* Success Header */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-center mb-5"
                  >
                    <h1
                      className="fw-semibold mb-3"
                      style={{
                        color: "#121212",
                        fontSize: "2.5rem",
                        letterSpacing: "1.25px",
                      }}
                    >
                      Profile Submitted Successfully!
                    </h1>
                    <p
                      className="mb-0"
                      style={{
                        fontSize: "1.2rem",
                        color: "#666",
                        lineHeight: "1.6",
                        maxWidth: "600px",
                        margin: "0 auto",
                      }}
                    >
                      Awesome work! Your profile has been sent for review.
                      You're all set to start your freelancing journey.
                    </p>
                  </motion.div>

                  {/* Review Process Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="mb-5"
                  >
                    <div
                      className="p-4 rounded-3"
                      style={{
                        backgroundColor: "rgba(0, 118, 116, 0.05)",
                        border: "1px solid rgba(0, 118, 116, 0.1)",
                      }}
                    >
                      <h4
                        className="fw-semibold mb-3"
                        style={{ color: "#007674", fontSize: "1.3rem" }}
                      >
                        <BsClock className="me-2" />
                        What Happens Next?
                      </h4>
                      <p
                        style={{
                          fontSize: "1.1rem",
                          color: "#666",
                          lineHeight: "1.6",
                          marginBottom: "1.5rem",
                        }}
                      >
                        Your application is under review. Once the{" "}
                        <strong style={{ color: "#007674" }}>
                          Worksyde team
                        </strong>{" "}
                        completes the review, you'll receive an email
                        notification. After that, you can proceed to your
                        dashboard and browse a wide range of jobs that best
                        match your skills and interests.
                      </p>
                      <p
                        style={{
                          fontSize: "1rem",
                          color: "#666",
                          lineHeight: "1.6",
                          marginBottom: "0",
                        }}
                      >
                        Our team carefully evaluates each profile to ensure
                        quality and alignment with client needs. While you wait,
                        feel free to prepare your portfolio or explore how
                        Worksyde works through our help center.
                      </p>
                    </div>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.5 }}
                    className="text-center"
                  >
                    <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
                      <button
                        className="action-button"
                        style={{
                          background:
                            "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                          color: "#fff",
                          boxShadow: "0 6px 20px rgba(0, 118, 116, 0.3)",
                        }}
                        onClick={handleCheckMail}
                        onMouseEnter={(e) => {
                          e.target.style.background =
                            "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                          e.target.style.boxShadow =
                            "0 8px 25px rgba(18, 18, 18, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background =
                            "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                          e.target.style.boxShadow =
                            "0 6px 20px rgba(0, 118, 116, 0.3)";
                        }}
                      >
                        <BsEnvelope className="me-2" />
                        Check Email
                      </button>
                      <button
                        className="action-button"
                        style={{
                          background:
                            "linear-gradient(135deg, #da8535 0%, #f39c12 100%)",
                          color: "#fff",
                          boxShadow: "0 6px 20px rgba(218, 133, 53, 0.3)",
                        }}
                        onClick={handleBrowseJobs}
                        onMouseEnter={(e) => {
                          e.target.style.background =
                            "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                          e.target.style.boxShadow =
                            "0 8px 25px rgba(18, 18, 18, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background =
                            "linear-gradient(135deg, #da8535 0%, #f39c12 100%)";
                          e.target.style.boxShadow =
                            "0 6px 20px rgba(218, 133, 53, 0.3)";
                        }}
                      >
                        <BsBriefcase className="me-2" />
                        Browse Jobs
                        <BsArrowRight className="ms-2" />
                      </button>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Tips & Next Steps */}
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
                  {/* Quick Actions */}
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
                      While You Wait
                    </h5>
                    <div className="space-y-3">
                      <div
                        className="success-card mb-2"
                        onClick={() => navigate("/home")}
                      >
                        <div className="d-flex align-items-center">
                          <div
                            className="d-flex align-items-center justify-content-center me-3"
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              background: "rgba(40, 167, 69, 0.1)",
                              color: "#28a745",
                            }}
                          >
                            <BsBriefcase size={20} />
                          </div>
                          <div>
                            <h6
                              className="fw-semibold mb-1"
                              style={{ color: "#121212" }}
                            >
                              Explore Jobs
                            </h6>
                            <p
                              className="mb-0"
                              style={{ color: "#666", fontSize: "1rem" }}
                            >
                              Browse available opportunities
                            </p>
                          </div>
                        </div>
                      </div>

                      <div
                        className="success-card"
                        onClick={() => window.open("/help", "_blank")}
                      >
                        <div className="d-flex align-items-center">
                          <div
                            className="d-flex align-items-center justify-content-center me-3"
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              background: "rgba(218, 133, 53, 0.1)",
                              color: "#da8535",
                            }}
                          >
                            <BsLightbulb size={20} />
                          </div>
                          <div>
                            <h6
                              className="fw-semibold mb-1"
                              style={{ color: "#121212" }}
                            >
                              Learn More
                            </h6>
                            <p
                              className="mb-0"
                              style={{ color: "#666", fontSize: "1rem" }}
                            >
                              Visit our help center
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Review Timeline */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="mb-4"
                  >
                    <h5
                      className="fw-semibold mb-3"
                      style={{ color: "#121212" }}
                    >
                      Review Timeline
                    </h5>
                    <div
                      className="p-3 rounded-3"
                      style={{
                        backgroundColor: "rgba(40, 167, 69, 0.05)",
                        border: "1px solid rgba(40, 167, 69, 0.1)",
                      }}
                    >
                      <div className="d-flex align-items-center mb-2">
                        <BsClock
                          className="me-2"
                          style={{ color: "#28a745" }}
                        />
                        <span
                          className="fw-semibold"
                          style={{ color: "#28a745" }}
                        >
                          24-48 Hours
                        </span>
                      </div>
                      <p
                        className="mb-0"
                        style={{ color: "#666", fontSize: "1rem" }}
                      >
                        Typical review time for new profiles
                      </p>
                    </div>
                  </motion.div>

                  {/* Success Tips */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                  >
                    <h5
                      className="fw-semibold mb-3"
                      style={{ color: "#121212" }}
                    >
                      <BsStar className="me-2" style={{ color: "#007674" }} />
                      Success Tips
                    </h5>
                    <div
                      className="p-3 rounded-3"
                      style={{
                        backgroundColor: "rgba(0, 118, 116, 0.05)",
                        border: "1px solid rgba(0, 118, 116, 0.1)",
                      }}
                    >
                      <ul
                        className="mb-0"
                        style={{ color: "#666", fontSize: "1rem" }}
                      >
                        <li className="mb-2">Keep your profile updated</li>
                        <li className="mb-2">Respond to messages promptly</li>
                        <li className="mb-2">Maintain high work quality</li>
                        <li className="mb-0">Build positive relationships</li>
                      </ul>
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

export default FinishProfileSection;
