import React, { useEffect, useState } from "react";
import Header1 from "../../components/Header1";
import profileOverview from "../../assets/profile-overview.jpg";
import profile from "../../assets/profile.svg";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BsArrowRight,
  BsLightbulb,
  BsCheckCircle,
  BsStar,
  BsClock,
  BsGeoAlt,
  BsCurrencyDollar,
  BsAward,
  BsBriefcase,
  BsBook,
} from "react-icons/bs";
import axios from "axios";
import toast from "react-hot-toast";

const SubmitProfile = () => {
  const [userDetails, setUserDetails] = useState({
    name: "Hemal",
    languages: [{ name: "English", proficiency: "Native" }],
  }); // Store fetched user data
  const [userId, setUserId] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const API_URL = "http://localhost:5000/api/auth";

  useEffect(() => {
    // Fetch current user and set userId
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/current-user/`, {
          withCredentials: true,
        });
        setUserId(res.data.user._id);
        fetchUserProfile(res.data.user._id); // Fetch user profile details
      } catch (error) {
        console.error("Failed to fetch user", error);
        setDataLoading(false);
      }
    };

    const fetchUserProfile = async (userId) => {
      try {
        const response = await axios.get(`${API_URL}/profile/${userId}/`);
        setUserDetails(response.data); // Assuming this returns full user profile data
        setDataLoading(false);
      } catch (error) {
        console.error("Failed to fetch profile", error);
        setDataLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleNext = async () => {
    setIsSubmitting(true);
    try {
      const res = await axios.post(
        `${API_URL}/profile/submit-application-for-review/`,
        {
          userId: userId,
        }
      );

      toast.success(res.data.message);
      setTimeout(() => {
        navigate("/create-profile/finish");
      }, 100);
    } catch (error) {
      console.error("Error submitting for review:", error.message);
      toast.error("There was an issue submitting your application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date) => {
    const options = { year: "numeric", month: "long" };
    return new Date(date).toLocaleDateString("en-US", options);
  };

  if (dataLoading) {
    return (
      <>
        <Header1 />
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
              style={{ color: "#121212", fontSize: "1.8rem" }}
            >
              Loading Profile Preview
            </h3>
            <p className="mb-0" style={{ color: "#666", fontSize: "1rem" }}>
              Preparing your profile for submission...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>
        {`
          .profile-preview-card {
            border: 2px solid #e3e3e3;
            border-radius: 20px;
            padding: 30px;
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
          }
          
          .profile-preview-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
          }
          
          .profile-avatar {
            width: 120px;
            height: 120px !important;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid #007674;
            box-shadow: 0 8px 25px rgba(0, 118, 116, 0.2);
          }
          
          .skill-tag {
            display: inline-block;
            background: linear-gradient(135deg, #007674 0%, #005a58 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            margin: 4px;
            font-size: 0.9rem;
            font-weight: 500;
            transition: all 0.3s ease;
          }
          
          .skill-tag:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 118, 116, 0.3);
          }
          
          .section-card {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
            border: 1px solid #e3e3e3;
            transition: all 0.3s ease;
          }
          
          .section-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
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
            {/* Left Column - Profile Preview */}
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
                    <div className="text-center mb-4">
                      <h2
                        className="fw-semibold mb-2"
                        style={{ color: "#121212", fontSize: "2rem" }}
                      >
                        Profile Preview Ready!
                      </h2>
                      <p
                        className="mb-0"
                        style={{
                          fontSize: "1.1rem",
                          color: "#666",
                          lineHeight: "1.5",
                        }}
                      >
                        Your profile is all set for submission. Take a final
                        look and submit when you're ready.
                      </p>
                    </div>
                  </motion.div>

                  {/* Profile Preview Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="profile-preview-card mb-5"
                  >
                    <div className="row align-items-start">
                      <div className="col-md-3 text-center">
                        <img
                          src={userDetails.photograph || profile}
                          alt="Profile"
                          className="profile-avatar mb-3"
                        />
                      </div>
                      <div className="col-md-9">
                        <div className="row">
                          <div className="col-md-8">
                            <h3
                              className="fw-bold mb-2"
                              style={{ color: "#121212", fontSize: "1.8rem" }}
                            >
                              {userDetails.name || "Hemal Katariya"}
                            </h3>
                            <div className="d-flex align-items-center mb-2">
                              <BsGeoAlt
                                className="me-2"
                                style={{ color: "#007674" }}
                              />
                              <span style={{ color: "#666", fontSize: "1rem" }}>
                                {userDetails.city || "Ahmedabad, GJ"}
                              </span>
                            </div>
                            <div className="d-flex align-items-center">
                              <BsClock
                                className="me-2"
                                style={{ color: "#007674" }}
                              />
                              <span style={{ color: "#666", fontSize: "1rem" }}>
                                {userDetails.time || "5:35 PM"}
                              </span>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <h5
                              className="fw-semibold mb-2"
                              style={{ color: "#121212" }}
                            >
                              Languages
                            </h5>
                            {userDetails.languages ? (
                              userDetails.languages.map((language, index) => (
                                <p
                                  key={index}
                                  className="mb-1"
                                  style={{ color: "#666", fontSize: "0.9rem" }}
                                >
                                  {language.name}: {language.proficiency}
                                </p>
                              ))
                            ) : (
                              <p
                                className="mb-1"
                                style={{ color: "#666", fontSize: "0.9rem" }}
                              >
                                No languages added
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr className="my-4" />

                    <div className="mb-4">
                      <h4
                        className="fw-semibold mb-2"
                        style={{ color: "#007674", fontSize: "1.4rem" }}
                      >
                        {userDetails.title ||
                          "WordPress Developer | WooCommerce Expert"}
                      </h4>
                      <p
                        style={{
                          color: "#666",
                          fontSize: "1.1rem",
                          lineHeight: "1.6",
                        }}
                      >
                        {userDetails.bio || "Bio..."}
                      </p>
                    </div>

                    <div className="d-flex align-items-center mb-4">
                      <div>
                        <h4
                          className="fw-bold mb-0"
                          style={{ color: "#28a745", fontSize: "1.5rem" }}
                        >
                          ₹{userDetails.hourlyRate || "250"}.00
                        </h4>
                        <p
                          className="mb-0"
                          style={{ color: "#666", fontSize: "0.9rem" }}
                        >
                          Hourly Rate
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Skills Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="section-card"
                  >
                    <h4
                      className="fw-semibold mb-3"
                      style={{ color: "#121212" }}
                    >
                      <BsStar className="me-2" style={{ color: "#007674" }} />
                      Your Skills
                    </h4>
                    <div className="selected-skills">
                      {userDetails.skills && userDetails.skills.length > 0 ? (
                        userDetails.skills.map((skill, index) => (
                          <span key={index} className="skill-tag">
                            {skill.name}
                          </span>
                        ))
                      ) : (
                        <p className="text-muted">No skills added yet</p>
                      )}
                    </div>
                  </motion.div>

                  {/* Education Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="section-card"
                  >
                    <h4
                      className="fw-semibold mb-3"
                      style={{ color: "#121212" }}
                    >
                      <BsBook className="me-2" style={{ color: "#007674" }} />
                      Your Education
                    </h4>
                    {userDetails.education ? (
                      userDetails.education.map((edu, index) => (
                        <div key={index} className="mb-3">
                          <h6
                            className="fw-semibold mb-1"
                            style={{ color: "#007674" }}
                          >
                            {edu.school}
                          </h6>
                          <p
                            className="mb-0"
                            style={{ color: "#666", fontSize: "0.95rem" }}
                          >
                            {edu.degree}, {edu.fieldOfStudy} - {edu.startYear} -{" "}
                            {edu.endYear}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted">No education details added</p>
                    )}
                  </motion.div>

                  {/* Work Experience Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="section-card"
                  >
                    <h4
                      className="fw-semibold mb-3"
                      style={{ color: "#121212" }}
                    >
                      <BsBriefcase
                        className="me-2"
                        style={{ color: "#007674" }}
                      />
                      Your Work Experience
                    </h4>
                    {userDetails.workExperience ? (
                      userDetails.workExperience.map((work, index) => {
                        const startDateFormatted = formatDate(work.startDate);
                        let endDateFormatted = "Present";
                        if (work.endDate && work.endDate !== "Present") {
                          endDateFormatted = formatDate(work.endDate);
                        }
                        return (
                          <div key={index} className="mb-3">
                            <h6
                              className="fw-semibold mb-1"
                              style={{ color: "#007674" }}
                            >
                              {work.title} | {work.company}
                            </h6>
                            <p
                              className="mb-1"
                              style={{ color: "#666", fontSize: "0.9rem" }}
                            >
                              {startDateFormatted} - {endDateFormatted}
                            </p>
                            <p
                              className="mb-0"
                              style={{ color: "#666", fontSize: "0.95rem" }}
                            >
                              {work.description}
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-muted">No work experience added</p>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Submission Actions */}
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
                  {/* Submission Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mb-4"
                  >
                    <div className="text-center mb-4">
                      <h4
                        className="fw-semibold mb-2"
                        style={{ color: "#121212" }}
                      >
                        Ready to Submit
                      </h4>
                      <p className="text-muted small mb-0">
                        Your profile will be reviewed by our team
                      </p>
                    </div>
                  </motion.div>

                  {/* What Happens Next */}
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
                      What Happens Next?
                    </h5>
                    <div
                      className="p-4 rounded-3"
                      style={{
                        backgroundColor: "rgba(0, 118, 116, 0.05)",
                        border: "1px solid rgba(0, 118, 116, 0.1)",
                      }}
                    >
                      <div className="d-flex align-items-center mb-3">
                        <div 
                          className="bg-primary bg-opacity-10 rounded-circle me-3 mt-1 d-flex align-items-center justify-content-center"
                          style={{
                            width: "32px",
                            height: "32px",
                            minWidth: "32px",
                            minHeight: "32px"
                          }}
                        >
                          <span className="fw-semibold text-primary" style={{ fontSize: "0.9rem" }}>1</span>
                        </div>
                        <div>
                          <h6
                            className="fw-semibold mb-1"
                            style={{ color: "#121212" }}
                          >
                            Review Process
                          </h6>
                          <p className="text-muted small mb-0">
                            Our team will review your profile within 24-48 hours
                          </p>
                        </div>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <div 
                          className="bg-primary bg-opacity-10 rounded-circle me-3 mt-1 d-flex align-items-center justify-content-center"
                          style={{
                            width: "32px",
                            height: "32px",
                            minWidth: "32px",
                            minHeight: "32px"
                          }}
                        >
                          <span className="fw-semibold text-primary" style={{ fontSize: "0.9rem" }}>2</span>
                        </div>
                        <div>
                          <h6
                            className="fw-semibold mb-1"
                            style={{ color: "#121212" }}
                          >
                            Approval
                          </h6>
                          <p className="text-muted small mb-0">
                            Once approved, your profile goes live on the
                            platform
                          </p>
                        </div>
                      </div>
                      <div className="d-flex align-items-center">
                        <div 
                          className="bg-primary bg-opacity-10 rounded-circle me-3 mt-1 d-flex align-items-center justify-content-center"
                          style={{
                            width: "32px",
                            height: "32px",
                            minWidth: "32px",
                            minHeight: "32px"
                          }}
                        >
                          <span className="fw-semibold text-primary" style={{ fontSize: "0.9rem" }}>3</span>
                        </div>
                        <div>
                          <h6
                            className="fw-semibold mb-1"
                            style={{ color: "#121212" }}
                          >
                            Start Earning
                          </h6>
                          <p className="text-muted small mb-0">
                            Begin receiving job opportunities and client
                            requests
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Tips */}
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
                      Pro Tips
                    </h5>
                    <div
                      className="p-3 rounded-3 border"
                      style={{
                        backgroundColor: "#f8f9fa",
                        borderColor: "#e3e3e3",
                      }}
                    >
                      <ul
                        className="mb-0"
                        style={{ color: "#666", fontSize: "0.95rem" }}
                      >
                        <li className="mb-2">
                          Keep your profile updated regularly
                        </li>
                        <li className="mb-2">
                          Respond to client messages promptly
                        </li>
                        <li className="mb-2">
                          Maintain high-quality work standards
                        </li>
                        <li className="mb-0">
                          Build positive client relationships
                        </li>
                      </ul>
                    </div>
                  </motion.div>

                  {/* CTA Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                    className="text-center"
                  >
                    <button
                      className="login-button border-0 px-5 py-3 fw-semibold w-100"
                      style={{
                        fontSize: "1.1rem",
                        borderRadius: "50px",
                        background:
                          "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                        color: "#fff",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        boxShadow:
                          "0 6px 20px rgba(0, 118, 116, 0.3), 0 3px 8px rgba(0, 0, 0, 0.1)",
                      }}
                      onClick={handleNext}
                      disabled={isSubmitting}
                      onMouseEnter={(e) => {
                        e.target.style.background =
                          "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                        e.target.style.boxShadow =
                          "0 8px 25px rgba(18, 18, 18, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)";
                        e.target.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background =
                          "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                        e.target.style.boxShadow =
                          "0 6px 20px rgba(0, 118, 116, 0.3), 0 3px 8px rgba(0, 0, 0, 0.1)";
                        e.target.style.transform = "translateY(0)";
                      }}
                    >
                      {isSubmitting ? (
                        <div className="d-flex align-items-center justify-content-center">
                          <div
                            className="spinner-border spinner-border-sm me-2"
                            style={{ color: "#fff" }}
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          Submitting...
                        </div>
                      ) : (
                        <>
                          Submit For Review
                          <BsArrowRight className="ms-2" size={20} />
                        </>
                      )}
                    </button>

                    <p
                      className="mt-3 mb-0"
                      style={{ color: "#666", fontSize: "0.9rem" }}
                    >
                      You can edit your profile anytime after submission
                    </p>
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

export default SubmitProfile;
