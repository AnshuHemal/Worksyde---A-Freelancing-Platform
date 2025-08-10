import React, { useEffect, useState } from "react";
import Header1 from "../../components/Header1";
import { motion } from "framer-motion";
import {
  BsPatchQuestionFill,
  BsCameraFill,
  BsPenFill,
  BsBriefcaseFill,
  BsArrowRight,
  BsClock,
  BsCheckCircle,
} from "react-icons/bs";
import axios from "axios";
import { Link, redirect, useNavigate } from "react-router-dom";

const points = [
  {
    icon: <BsPatchQuestionFill size={32} />,
    title: "Quick Questions",
    text: "Tell us about your professional experience and skills",
    color: "#007674",
  },
  {
    icon: <BsCameraFill size={32} />,
    title: "Profile Photo",
    text: "Upload a professional photo that represents you",
    color: "#da8535",
  },
  {
    icon: <BsPenFill size={32} />,
    title: "Compelling Bio",
    text: "Create a bio that highlights your expertise",
    color: "#007674",
  },
  {
    icon: <BsBriefcaseFill size={32} />,
    title: "Portfolio & Rates",
    text: "Showcase your work and set competitive rates",
    color: "#da8535",
  },
];

const CreateProfileWelcome = () => {
  const [user, setUser] = useState({
    name: "Hemal Katariya",
    role: "freelancer",
  });
  const navigate = useNavigate();

  const API_URL = "http://localhost:5000/api/auth";

  useEffect(() => {
    axios
      .get(`${API_URL}/current-user`, { withCredentials: true })
      .then((res) => {
        setUser(res.data.user);
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
      });
  }, []);

  if (!user) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div
          className="spinner-border"
          style={{ color: "#007674" }}
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (user.role == "client") {
    navigate("/job-post/instant/welcome");
    return;
  }

  const handleNext = () => {
    navigate("/create-profile/quick-questions");
  };

  return (
    <>
      <Header1 />

      <div
        className="min-vh-100 d-flex align-items-center justify-content-center section-container"
        style={{
          backgroundColor: "#fff",
          padding: "20px 0",
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
                  style={{ color: "#121212" }}
                >
                  Welcome, {user.name.split(" ")[0]}! 😊
                </h2>
                <p
                  className="lead mb-4"
                  style={{
                    fontSize: "1.25rem",
                    color: "#007674",
                    fontWeight: 600,
                  }}
                >
                  Let's create your amazing freelancer profile
                </p>
                <div className="d-flex align-items-center justify-content-center">
                  <BsClock
                    size={20}
                    style={{ color: "#da8535", marginRight: "8px" }}
                  />
                  <span style={{ color: "#121212", fontSize: "1.1rem" }}>
                    Takes only 5-10 minutes to complete
                  </span>
                </div>
              </motion.div>

              {/* Main Content Grid */}
              <div className="row g-4 mb-5">
                {/* What you'll accomplish section */}
                <motion.div
                  className="col-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <div className="text-center mb-4">
                    <h2
                      className="fw-semibold mb-3"
                      style={{ color: "#121212", fontSize: "2rem" }}
                    >
                      What you'll accomplish today
                    </h2>
                    <p className="fs-5" style={{ color: "#666" }}>
                      Build a profile that showcases your skills and attracts
                      the right clients
                    </p>
                  </div>
                </motion.div>

                {/* Steps Grid */}
                {points.map((item, index) => (
                  <motion.div
                    key={index}
                    className="col-lg-6 col-xl-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  >
                    <div
                      className="card h-100"
                      style={{
                        borderRadius: "15px",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        cursor: "pointer",
                        border: "1px solid #e3e3e3",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-5px)";
                        e.currentTarget.style.boxShadow =
                          "0 8px 16px rgba(0, 0, 0, 0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 5px 15px rgba(0, 0, 0, 0.08)";
                      }}
                    >
                      <div className="card-body p-4 text-center">
                        <div
                          className="d-inline-flex align-items-center justify-content-center mb-3"
                          style={{
                            width: "70px",
                            height: "70px",
                            borderRadius: "50%",
                            backgroundColor: item.color,
                            color: "white",
                          }}
                        >
                          {item.icon}
                        </div>
                        <h5
                          className="fw-bold mb-2"
                          style={{ color: "#121212" }}
                        >
                          {item.title}
                        </h5>
                        <p className="mb-0" style={{ color: "#666" }}>
                          {item.text}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Benefits Section */}
              <motion.div
                className="row mb-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div className="col-12">
                  <div
                    className="p-4 rounded"
                    style={{
                      backgroundColor: "#f8f9fa",
                      border: "1px solid #e3e3e3",
                    }}
                  >
                    <div className="row align-items-center">
                      <div className="col-md-8">
                        <div className="d-flex align-items-center mb-2">
                          <BsCheckCircle
                            className="me-3 mt-3"
                            size={22}
                            style={{ color: "#007674" }}
                          />
                          <h6
                            className="fw-bold mb-0"
                            style={{ color: "#121212" }}
                          >
                            Progress Auto-Save
                          </h6>
                        </div>
                        <p className="mb-0" style={{ color: "#666" }}>
                          Don't worry about losing your progress. We
                          automatically save everything as you go.
                        </p>
                      </div>
                      <div className="col-md-4 text-md-end">
                        <div className="d-flex align-items-center justify-content-md-end">
                          <BsClock
                            className="me-2"
                            size={16}
                            style={{ color: "#da8535" }}
                          />
                          <small style={{ color: "#666" }}>
                            Quick & Easy Setup
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* CTA Section */}
              <motion.div
                className="row"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <div className="col-12 text-center">
                  <button
                    className="login-button border-0 px-5 py-3 fw-bold"
                    style={{
                      fontSize: "1.1rem",
                      borderRadius: "50px",
                      background: "#007674",
                      color: "#fff",
                      transition: "0.3s background-color",
                    }}
                    onClick={handleNext}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#121212";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#007674";
                    }}
                  >
                    Get Started Now
                    <BsArrowRight className="ms-2" size={20} />
                  </button>

                  <p className="mt-3 mb-3" style={{ color: "#121212", fontSize: '21px' }}>
                    <small>
                      You can always edit your profile later from your dashboard.
                    </small>
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateProfileWelcome;
