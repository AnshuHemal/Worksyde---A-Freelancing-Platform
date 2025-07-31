import React, { useEffect, useState } from "react";
import Header1 from "../../components/Header1";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BsArrowRight,
  BsCheckCircle,
  BsLightning,
  BsPeople,
  BsRocket,
} from "react-icons/bs";
import axios from "axios";
import clientProfile from "../../assets/client_profile.svg";

const ClientWelcomePage = () => {
  const [user, setUser] = useState({ name: "Hemal", role: "Client" });
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
        className="d-flex justify-content-center align-items-center min-vh-100"
        style={{ background: "#fff" }}
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

  const features = [
    {
      icon: <BsPeople size={24} />,
      title: "Skilled Talent Pool",
      description:
        "Access thousands of verified freelancers with diverse expertise",
      color: "#007674",
    },
    {
      icon: <BsLightning size={24} />,
      title: "Quick Matching",
      description:
        "AI-powered matching to find the perfect fit for your project",
      color: "#ff6b35",
    },
    {
      icon: <BsCheckCircle size={24} />,
      title: "Quality Assurance",
      description: "Built-in quality checks and milestone-based payments",
      color: "#28a745",
    },
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
              {/* Main Welcome Section */}
              <div className="row align-items-center justify-content-center mb-5">
                <div className="col-lg-6 mb-4">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    <h1
                      className="display-5 fw-semibold mb-4"
                      style={{ color: "#121212" }}
                    >
                      Welcome, {user.name.split(" ")[0]}! 👋
                    </h1>
                    <h2
                      className="h3 fw-semibold mb-4"
                      style={{
                        fontSize: "2rem",
                        color: "#007674",
                        lineHeight: "1.3",
                      }}
                    >
                      Let's create your first job post and find the right talent
                    </h2>
                    <p
                      className="lead mb-5"
                      style={{
                        fontSize: "1.25rem",
                        color: "#666",
                        lineHeight: "1.6",
                        fontWeight: 500,
                      }}
                    >
                      Find skilled freelancers without the hassle. AI simplifies
                      the process so you can focus on your goals.
                    </p>

                    <Link to={"/job-post/instant/title"}>
                      <motion.button
                        className="btn fw-semibold px-5 py-3"
                        style={{
                          borderRadius: "50px",
                          background:
                            "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                          color: "#fff",
                          fontSize: "1.1rem",
                          boxShadow: "0 6px 20px rgba(0, 118, 116, 0.3)",
                          border: "none",
                          transition: "all 0.3s ease",
                        }}
                        whileHover={{
                          scale: 1.05,
                          boxShadow: "0 8px 25px rgba(0, 118, 116, 0.4)",
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <BsRocket className="me-2" />
                        Get Started, Quickly
                        <BsArrowRight className="ms-2" />
                      </motion.button>
                    </Link>
                  </motion.div>
                </div>

                <div className="col-lg-6">
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-center"
                  >
                    <img
                      src={clientProfile}
                      alt="Client Profile"
                      className="img-fluid"
                      style={{
                        maxWidth: "500px",
                        filter:
                          "drop-shadow(0 10px 30px rgba(0, 118, 116, 0.1))",
                      }}
                    />
                  </motion.div>
                </div>
              </div>

              {/* Features Section */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="row justify-content-center mb-5"
              >
                <div className="col-12 text-center mb-5">
                  <h3
                    className="fw-bold mb-3"
                    style={{ color: "#121212", fontSize: "2.5rem" }}
                  >
                    Why Choose Worksyde?
                  </h3>
                  <p
                    className="lead"
                    style={{
                      fontSize: "1.25rem",
                      color: "#666",
                      maxWidth: "600px",
                      margin: "0 auto",
                    }}
                  >
                    Experience the future of freelancing with our innovative
                    platform
                  </p>
                </div>

                <div className="col-lg-10">
                  <div className="row g-4">
                    {features.map((feature, index) => (
                      <div key={index} className="col-lg-4 col-md-6">
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.6,
                            delay: 0.6 + index * 0.1,
                          }}
                          className="card border-0 shadow-lg h-100"
                          style={{
                            borderRadius: "25px",
                            background:
                              "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                            border: "1px solid rgba(0, 118, 116, 0.1)",
                            transition: "all 0.3s ease",
                          }}
                          whileHover={{
                            transform: "translateY(-10px)",
                            boxShadow: "0 20px 40px rgba(0, 118, 116, 0.15)",
                          }}
                        >
                          <div className="card-body p-5 text-center">
                            <div
                              className="mb-4 mx-auto d-flex align-items-center justify-content-center"
                              style={{
                                width: "80px",
                                height: "80px",
                                borderRadius: "50%",
                                background: `linear-gradient(135deg, ${feature.color}20 0%, ${feature.color}10 100%)`,
                                color: feature.color,
                              }}
                            >
                              {feature.icon}
                            </div>
                            <h4
                              className="fw-bold mb-3"
                              style={{ color: "#121212" }}
                            >
                              {feature.title}
                            </h4>
                            <p
                              className="mb-0"
                              style={{
                                fontSize: "1.1rem",
                                color: "#666",
                                lineHeight: "1.6",
                              }}
                            >
                              {feature.description}
                            </p>
                          </div>
                        </motion.div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Quick Start Guide */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="row justify-content-center"
              >
                <div className="col-lg-8">
                  <div
                    className="card border-0 shadow-lg"
                    style={{
                      borderRadius: "25px",
                      background:
                        "linear-gradient(135deg, #e8f4f4 0%, #f0f9f9 100%)",
                      border: "1px solid rgba(0, 118, 116, 0.1)",
                    }}
                  >
                    <div className="card-body p-5">
                      <h3
                        className="fw-bold text-center mb-4"
                        style={{ color: "#007674" }}
                      >
                        Quick Start Guide
                      </h3>
                      <div className="row g-4">
                        <div className="col-md-4 text-center">
                          <div
                            className="mb-3 mx-auto d-flex align-items-center justify-content-center"
                            style={{
                              width: "60px",
                              height: "60px",
                              borderRadius: "50%",
                              background:
                                "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                              color: "#fff",
                              fontSize: "1.5rem",
                              fontWeight: "bold",
                            }}
                          >
                            1
                          </div>
                          <h5
                            className="fw-semibold mb-2"
                            style={{ color: "#121212" }}
                          >
                            Create Job Post
                          </h5>
                          <p
                            style={{
                              fontSize: "1rem",
                              color: "#666",
                              lineHeight: "1.5",
                            }}
                          >
                            Describe your project requirements and budget
                          </p>
                        </div>
                        <div className="col-md-4 text-center">
                          <div
                            className="mb-3 mx-auto d-flex align-items-center justify-content-center"
                            style={{
                              width: "60px",
                              height: "60px",
                              borderRadius: "50%",
                              background:
                                "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                              color: "#fff",
                              fontSize: "1.5rem",
                              fontWeight: "bold",
                            }}
                          >
                            2
                          </div>
                          <h5
                            className="fw-semibold mb-2"
                            style={{ color: "#121212" }}
                          >
                            Review Proposals
                          </h5>
                          <p
                            style={{
                              fontSize: "1rem",
                              color: "#666",
                              lineHeight: "1.5",
                            }}
                          >
                            Get proposals from qualified freelancers
                          </p>
                        </div>
                        <div className="col-md-4 text-center">
                          <div
                            className="mb-3 mx-auto d-flex align-items-center justify-content-center"
                            style={{
                              width: "60px",
                              height: "60px",
                              borderRadius: "50%",
                              background:
                                "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                              color: "#fff",
                              fontSize: "1.5rem",
                              fontWeight: "bold",
                            }}
                          >
                            3
                          </div>
                          <h5
                            className="fw-semibold mb-2"
                            style={{ color: "#121212" }}
                          >
                            Start Working
                          </h5>
                          <p
                            style={{
                              fontSize: "1rem",
                              color: "#666",
                              lineHeight: "1.5",
                            }}
                          >
                            Hire the best match and begin your project
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientWelcomePage;
