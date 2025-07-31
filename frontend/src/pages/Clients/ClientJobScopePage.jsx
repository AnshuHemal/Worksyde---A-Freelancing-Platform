import React, { useEffect, useState } from "react";
import Header1 from "../../components/Header1";
import image from "../../assets/scope_of_work.svg";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BsArrowRight, BsCheckCircle, BsClock, BsPerson, BsBriefcase, BsLightbulb } from "react-icons/bs";
import axios from "axios";
import toast from "react-hot-toast";

const ClientJobScopePage = () => {
  const [userId, setUserId] = useState("");
  const [scopeOfWork, setScopeOfWork] = useState("Large");
  const [duration, setDuration] = useState("1 to 3 months");
  const [experienceLevel, setExperienceLevel] = useState("Entry");
  const [contractToHire, setContractToHire] = useState("No, not at this time");
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
    setIsLoading(true);
    try {
      const jobIdRes = await axios.post(`${API_URL}/jobposts/draft/`, {
        userId,
      });
      const jobId = jobIdRes.data.jobPostId;
      const res = await axios.post(`${API_URL}/add-job-scope-details/`, {
        jobId,
        scopeOfWork,
        duration,
        experienceLevel,
        contractToHire,
      });

      if (res.status === 200) {
        navigate("/job-post/instant/budget");
      }
    } catch (err) {
      toast.error("An error occurred while saving your Job scope.");
    } finally {
      setIsLoading(false);
    }
  };

  const scopeOptions = [
    {
      value: "Large",
      title: "Large",
      description: "Longer term or complex initiatives (ex. design and build a full website)",
      icon: <BsBriefcase size={20} />
    },
    {
      value: "Medium",
      title: "Medium",
      description: "Well-defined projects (ex. a landing page)",
      icon: <BsBriefcase size={20} />
    },
    {
      value: "Small",
      title: "Small",
      description: "Quick and straightforward tasks (ex. update text and images on a webpage)",
      icon: <BsBriefcase size={20} />
    }
  ];

  const durationOptions = [
    "More than 6 months",
    "3 to 6 months",
    "1 to 3 months",
    "Less than 1 month"
  ];

  const experienceOptions = [
    {
      value: "Entry",
      title: "Entry",
      description: "Looking for someone relatively new to this field.",
      icon: <BsPerson size={20} />
    },
    {
      value: "Intermediate",
      title: "Intermediate",
      description: "Looking for substantial experience in this field.",
      icon: <BsPerson size={20} />
    },
    {
      value: "Expert",
      title: "Expert",
      description: "Looking for comprehensive and deep expertise in this field.",
      icon: <BsPerson size={20} />
    }
  ];

  const contractOptions = [
    {
      value: "Yes, this could become full time",
      title: "Yes, this could become full time",
      description: "After a trial period, you can pay a one-time fee to convert the contract."
    },
    {
      value: "No, not at this time",
      title: "No, not at this time",
      description: "This is a project-based contract only."
    }
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
                  style={{ color: "#121212" }}
                >
                  Create Your Job Post
                </h2>
                <p
                  className="lead mb-4"
                  style={{
                    fontSize: "1.25rem",
                    color: "#007674",
                    fontWeight: 600,
                  }}
                >
                  Step 3: Define the scope and requirements of your project
                </p>
              </motion.div>

              {/* Main Content */}
              <div className="row justify-content-center align-items-start">
                {/* Left Column: Scope of Work & Duration */}
                <div className="col-lg-5 mb-4">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    <div
                      className="cardd border-0 shadow-lg h-100"
                      style={{
                        borderRadius: "25px",
                        background:
                          "linear-gradient(135deg, #e8f4f4 0%, #f0f9f9 100%)",
                        border: "1px solid rgba(0, 118, 116, 0.1)",
                      }}
                    >
                      <div className="card-body p-5">
                        <h3 className="fw-semibold mb-4" style={{ color: "#121212" }}>
                          Project Scope
                        </h3>
                        {/* Scope of Work Section */}
                        <div className="mb-5">
                          <h5 className="fw-semibold mb-4" style={{ color: "#007674" }}>
                            <BsBriefcase className="me-2" />
                            Scope of Work
                          </h5>
                          <div className="row g-3">
                            {scopeOptions.map((option) => (
                              <div key={option.value} className="col-12">
                                <div
                                  className={`p-4 rounded cursor-pointer border-2 ${
                                    scopeOfWork === option.value ? "border-primary" : "border-light"
                                  }`}
                                  style={{
                                    background: scopeOfWork === option.value
                                      ? "rgba(0, 118, 116, 0.05)"
                                      : "#fff",
                                    border: scopeOfWork === option.value
                                      ? "2px solid #007674"
                                      : "2px solid #e3e3e3",
                                    transition: "all 0.3s ease",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => setScopeOfWork(option.value)}
                                  onMouseEnter={(e) => {
                                    if (scopeOfWork !== option.value) {
                                      e.target.style.background = "rgba(0, 118, 116, 0.02)";
                                      e.target.style.borderColor = "#007674";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (scopeOfWork !== option.value) {
                                      e.target.style.background = "#fff";
                                      e.target.style.borderColor = "#e3e3e3";
                                    }
                                  }}
                                >
                                  <div className="d-flex align-items-start">
                                    <input
                                      type="radio"
                                      name="scope"
                                      value={option.value}
                                      checked={scopeOfWork === option.value}
                                      onChange={(e) => setScopeOfWork(e.target.value)}
                                      style={{
                                        accentColor: "#007674",
                                        width: 20,
                                        height: 20,
                                        marginTop: "2px",
                                      }}
                                    />
                                    <div className="ms-3">
                                      <h6 className="fw-semibold mb-2" style={{ color: "#121212" }}>
                                        {option.title}
                                      </h6>
                                      <p className="mb-0" style={{ fontSize: "1rem", color: "#666", lineHeight: "1.5" }}>
                                        {option.description}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Duration Section */}
                        <div className="mb-5">
                          <h5 className="fw-semibold mb-4" style={{ color: "#007674" }}>
                            <BsClock className="me-2" />
                            How long will your work take?
                          </h5>
                          <div className="row g-3">
                            {durationOptions.map((option) => (
                              <div key={option} className="col-md-6">
                                <div
                                  className={`p-3 rounded cursor-pointer border-2 ${
                                    duration === option ? "border-primary" : "border-light"
                                  }`}
                                  style={{
                                    minHeight: "64px", // Ensures consistent height
                                    background: duration === option
                                      ? "rgba(0, 118, 116, 0.05)"
                                      : "#fff",
                                    border: duration === option
                                      ? "2px solid #007674"
                                      : "2px solid #e3e3e3",
                                    transition: "all 0.3s ease",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center"
                                  }}
                                  onClick={() => setDuration(option)}
                                  onMouseEnter={(e) => {
                                    if (duration !== option) {
                                      e.target.style.background = "rgba(0, 118, 116, 0.02)";
                                      e.target.style.borderColor = "#007674";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (duration !== option) {
                                      e.target.style.background = "#fff";
                                      e.target.style.borderColor = "#e3e3e3";
                                    }
                                  }}
                                >
                                  <div className="d-flex align-items-center w-100">
                                    <input
                                      type="radio"
                                      name="duration"
                                      value={option}
                                      checked={duration === option}
                                      onChange={(e) => setDuration(e.target.value)}
                                      style={{
                                        accentColor: "#007674",
                                        width: 18,
                                        height: 18,
                                      }}
                                    />
                                    <span className="ms-3 fw-medium" style={{ color: "#121212" }}>
                                      {option}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Right Column: Experience Level & Contract to Hire */}
                <div className="col-lg-7">
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <div
                      className="cardd border-0 shadow-lg"
                      style={{
                        borderRadius: "25px",
                        background:
                          "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                        border: "1px solid rgba(0, 118, 116, 0.1)",
                      }}
                    >
                      <div className="card-body p-5">
                        <h3 className="fw-semibold mb-4" style={{ color: "#121212" }}>
                          Additional Details
                        </h3>
                        {/* Experience Level Section */}
                        <div className="mb-5">
                          <h5 className="fw-semibold mb-3" style={{ color: "#007674" }}>
                            <BsPerson className="me-2" />
                            What level of experience will it need?
                          </h5>
                          <p className="mb-4" style={{ fontSize: "1rem", color: "#666", lineHeight: "1.5" }}>
                            This won't restrict any proposals, but helps match expertise to your budget.
                          </p>
                          <div className="row g-3">
                            {experienceOptions.map((option) => (
                              <div key={option.value} className="col-12">
                                <div
                                  className={`p-4 rounded cursor-pointer border-2 ${
                                    experienceLevel === option.value ? "border-primary" : "border-light"
                                  }`}
                                  style={{
                                    background: experienceLevel === option.value
                                      ? "rgba(0, 118, 116, 0.05)"
                                      : "#fff",
                                    border: experienceLevel === option.value
                                      ? "2px solid #007674"
                                      : "2px solid #e3e3e3",
                                    transition: "all 0.3s ease",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => setExperienceLevel(option.value)}
                                  onMouseEnter={(e) => {
                                    if (experienceLevel !== option.value) {
                                      e.target.style.background = "rgba(0, 118, 116, 0.02)";
                                      e.target.style.borderColor = "#007674";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (experienceLevel !== option.value) {
                                      e.target.style.background = "#fff";
                                      e.target.style.borderColor = "#e3e3e3";
                                    }
                                  }}
                                >
                                  <div className="d-flex align-items-start">
                                    <input
                                      type="radio"
                                      name="experienceLevel"
                                      value={option.value}
                                      checked={experienceLevel === option.value}
                                      onChange={(e) => setExperienceLevel(e.target.value)}
                                      style={{
                                        accentColor: "#007674",
                                        width: 20,
                                        height: 20,
                                        marginTop: "2px",
                                      }}
                                    />
                                    <div className="ms-3">
                                      <h6 className="fw-semibold mb-2" style={{ color: "#121212" }}>
                                        {option.title}
                                      </h6>
                                      <p className="mb-0" style={{ fontSize: "1rem", color: "#666", lineHeight: "1.5" }}>
                                        {option.description}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Contract to Hire Section */}
                        <div className="mb-5">
                          <h5 className="fw-semibold mb-3" style={{ color: "#007674" }}>
                            <BsBriefcase className="me-2" />
                            Is this job a contract-to-hire opportunity?
                          </h5>
                          <p className="mb-4" style={{ fontSize: "1rem", color: "#666", lineHeight: "1.5" }}>
                            This helps set expectations with talent and won't restrict who can submit proposals.
                          </p>
                          <div className="row g-3">
                            {contractOptions.map((option) => (
                              <div key={option.value} className="col-12">
                                <div
                                  className={`p-4 rounded cursor-pointer border-2 ${
                                    contractToHire === option.value ? "border-primary" : "border-light"
                                  }`}
                                  style={{
                                    background: contractToHire === option.value
                                      ? "rgba(0, 118, 116, 0.05)"
                                      : "#fff",
                                    border: contractToHire === option.value
                                      ? "2px solid #007674"
                                      : "2px solid #e3e3e3",
                                    transition: "all 0.3s ease",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => setContractToHire(option.value)}
                                  onMouseEnter={(e) => {
                                    if (contractToHire !== option.value) {
                                      e.target.style.background = "rgba(0, 118, 116, 0.02)";
                                      e.target.style.borderColor = "#007674";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (contractToHire !== option.value) {
                                      e.target.style.background = "#fff";
                                      e.target.style.borderColor = "#e3e3e3";
                                    }
                                  }}
                                >
                                  <div className="d-flex align-items-start">
                                    <input
                                      type="radio"
                                      name="contractToHire"
                                      value={option.value}
                                      checked={contractToHire === option.value}
                                      onChange={(e) => setContractToHire(e.target.value)}
                                      style={{
                                        accentColor: "#007674",
                                        width: 20,
                                        height: 20,
                                        marginTop: "2px",
                                      }}
                                    />
                                    <div className="ms-3">
                                      <h6 className="fw-semibold mb-2" style={{ color: "#121212" }}>
                                        {option.title}
                                      </h6>
                                      <p className="mb-0" style={{ fontSize: "1rem", color: "#666", lineHeight: "1.5" }}>
                                        {option.description}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <motion.button
                          className="btn fw-semibold px-5 py-3 w-100"
                          style={{
                            borderRadius: "50px",
                            background:
                              !isLoading
                                ? "linear-gradient(135deg, #007674 0%, #005a58 100%)"
                                : "#ccc",
                            color: "#fff",
                            fontSize: "1.1rem",
                            boxShadow: !isLoading
                              ? "0 6px 20px rgba(0, 118, 116, 0.3)"
                              : "none",
                            border: "none",
                            transition: "all 0.3s ease",
                          }}
                          disabled={isLoading}
                          onClick={handleNext}
                          whileHover={
                            !isLoading
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
                            <div className="spinner-border spinner-border-sm me-2" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          ) : (
                            <>
                              Next, Add Budget
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

export default ClientJobScopePage;
