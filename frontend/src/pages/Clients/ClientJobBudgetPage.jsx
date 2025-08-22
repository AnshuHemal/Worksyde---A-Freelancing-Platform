import React, { useEffect, useState } from "react";
import Header1 from "../../components/Header1";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { BsCheckCircle, BsArrowRight, BsCalculator, BsCurrencyRupee } from "react-icons/bs";

const ClientJobBudgetPage = () => {
  const [userId, setUserId] = useState("");
  const [hourlyRateFrom, setHourlyRateFrom] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [predictedBudget, setPredictedBudget] = useState(null);

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
    if (!isBudgetValid) {
      toast.error("Please enter a valid budget range.");
      return;
    }

    setIsLoading(true);
    try {
      const jobIdRes = await axios.post(`${API_URL}/jobposts/draft/`, {
        userId,
      });
      const jobId = jobIdRes.data.jobPostId;
      // Prepare fixed price budget data
      const budgetData = {
        jobId,
        budgetType: 'fixed',
        hourlyRateFrom: hourlyRateFrom,
        hourlyRateTo: 0,
      };



      const res = await axios.post(`${API_URL}/add-job-budget/`, budgetData);

      if (res.status === 200) {
        toast.success(res.data.message || "Budget saved successfully!");
        navigate("/job-post/instant/add-description");
      }
    } catch (err) {
      console.error('Budget save error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("An error occurred while saving your budget.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPredictedBudget = async () => {
    try {
      setIsLoading(true);
      
      // Default fallback data
      let jobData = {
        description: "Web development project with standard features",
        category: "Web, Mobile & Software Dev",
        experience_level: "Intermediate",
        client_country: "India",
        payment_type: 'Fixed',
        applicants_num: 15.0,
        freelancers_num: 8.0
      };
      
      try {
        // Try to fetch job details from the database using the jobId
        if (userId) {
          const jobIdRes = await axios.post(`${API_URL}/jobposts/draft/`, {
            userId,
          });
          const jobId = jobIdRes.data.jobPostId;
          
          console.log("🔍 Fetching job details for jobId:", jobId);
          
          // Fetch job details from the database
          const jobDetailsRes = await axios.get(`${API_URL}/jobpost/${jobId}/`);
          console.log("📋 Raw job details response:", jobDetailsRes.data);
          
          if (jobDetailsRes.data.success && jobDetailsRes.data.jobPost) {
            const job = jobDetailsRes.data.jobPost;
            console.log("📋 Full job object:", job);
            
            // Extract actual job data with better field mapping
            jobData = {
              description: job.title || job.description || "Creative design project", // Use title as description if available
              category: job.categoryId?.name || job.category || "Design & Creative", // Better category fallback
              experience_level: job.experienceLevel || "Entry", // Use actual experience level
              client_country: "India", // Default for now
              payment_type: 'Fixed', // Default for now
              applicants_num: 15.0, // Default for now
              freelancers_num: 8.0 // Default for now
            };
            
            // If we have scope information, use it to enhance the description
            if (job.scopeOfWork) {
              jobData.description = `${jobData.description} - ${job.scopeOfWork} scope`;
            }
            
            // If we have duration, add it to description
            if (job.duration) {
              jobData.description = `${jobData.description} (${job.duration})`;
            }
            
            console.log("📋 Extracted and enhanced job data:", jobData);
          } else {
            console.log("⚠️ Job details response structure:", jobDetailsRes.data);
          }
        }
      } catch (fetchError) {
        console.log("⚠️ Could not fetch job details, using defaults:", fetchError.message);
        console.log("🔍 Fetch error details:", fetchError);
        // Continue with default values
      }
      
      console.log("🚀 Sending job data to AI prediction:", jobData);
      
      // Now make the budget prediction request
      const res = await axios.post(`${API_URL}/predict-budget/`, jobData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (res.data.success) {
        setPredictedBudget(res.data.predicted_budget);
        toast.success(`AI suggests budget: ₹${res.data.predicted_budget}`);
      } else {
        toast.error(res.data.message || "Failed to get budget prediction");
      }
    } catch (err) {
      console.error("Prediction error:", err);
      if (err.response) {
        console.error("Error response:", err.response.data);
        toast.error(`API Error: ${err.response.data.message || err.response.statusText}`);
      } else if (err.request) {
        console.error("No response received:", err.request);
        toast.error("No response from server. Is the Django server running?");
      } else {
        console.error("Request setup error:", err.message);
        toast.error("Error setting up the request");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const MIN_RATE = 200;
  const MAX_RATE = 9999;

  const isBudgetValid =
    hourlyRateFrom !== "" &&
    !isNaN(hourlyRateFrom) &&
    Number(hourlyRateFrom) >= MIN_RATE &&
    Number(hourlyRateFrom) <= MAX_RATE;

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
                  Step 4: Set your budget and payment terms
                </p>
              </motion.div>

              {/* Main Content */}
              <div className="row justify-content-center align-items-start">
                {/* Left Column: Budget Type & Tips */}
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
                        border: "1px solid rgba(0, 118, 116, 0.1)",
                      }}
                    >
                      <div className="card-body p-5">
                        <h3 className="fw-semibold mb-4" style={{ color: "#121212", letterSpacing: '0.3px' }}>
                          Budget Configuration
                        </h3>

                        {/* Budget Type Section removed: fixed price only */}

                        {/* Budget Tips Section */}
                        <div className="mb-4">
                          <h5 className="fw-semibold mb-3" style={{ color: "#007674", letterSpacing: '0.3px' }}>
                            <BsCalculator className="me-3" style={{ color: "#007674" }} size={20} />
                            Budget Tips
                          </h5>
                          <div className="p-3 rounded" style={{ backgroundColor: "#fff", border: "1px solid #e3e3e3" }}>
                            <ul className="mb-0" style={{ color: "#121212", fontSize: "1.1rem", lineHeight: 1.6 }}>
                              <li className="mb-2">Research what others are paying for similar work</li>
                              <li className="mb-2">Set a range to attract a wider pool of talent</li>
                              <li className="mb-0">Be realistic—higher budgets attract more experienced freelancers</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Right Column: Budget Form & Details */}
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
                        background: "#fff",
                        border: "1px solid rgba(0, 118, 116, 0.1)",
                      }}
                    >
                      <div className="card-body p-5">
                        <h3 className="fw-semibold mb-4" style={{ color: "#121212", letterSpacing: '0.3px' }}>
                          Set Your Project Budget
                        </h3>

                        <div className="mb-4">
                          <h5 className="fw-semibold mb-3" style={{ color: "#007674", letterSpacing: '0.3px' }}>
                            Fixed Price Budget
                          </h5>
                          <p className="mb-4" style={{ fontSize: "1rem", color: "#121212", lineHeight: "1.5" }}>
                            Set your total project budget to attract the right talent for your project.
                          </p>

                          {/* Fixed Price Single Input */}
                          <div className="row g-3 align-items-start">
                            <div className="col-md-8">
                              <label className="form-label fw-semibold mb-2" style={{ color: "#121212", fontSize: "0.95rem" }}>
                                Project Budget
                              </label>
                              <div className="input-group">
                                <span className="input-group-text" style={{ backgroundColor: "#f8f9fa", borderColor: "#e3e3e3" }}>₹</span>
                                <input
                                  type="number"
                                  min={MIN_RATE}
                                  max={MAX_RATE}
                                  className="form-control"
                                  placeholder="Enter your total project budget"
                                  value={hourlyRateFrom}
                                  onChange={e => {
                                    setHourlyRateFrom(e.target.value);
                                  }}
                                  style={{ borderColor: "#e3e3e3" }}
                                />
                                <span className="input-group-text" style={{ backgroundColor: "#f8f9fa", borderColor: "#e3e3e3" }}>
                                  total
                                </span>
                              </div>
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold mb-2" style={{ color: "#121212", fontSize: "0.95rem" }}>
                                AI Budget Suggestion
                              </label>
                              <button
                                type="button"
                                className="btn w-100 d-flex align-items-center justify-content-center"
                                style={{
                                  backgroundColor: "#007674",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "8px",
                                  padding: "12px",
                                  fontSize: "0.9rem",
                                  fontWeight: "600"
                                }}
                                onClick={() => fetchPredictedBudget()}
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <>
                                    <div className="spinner-border spinner-border-sm me-2" role="status">
                                      <span className="visually-hidden">Loading...</span>
                                    </div>
                                    Getting AI Suggestion...
                                  </>
                                ) : (
                                  <>
                                    <BsCalculator className="me-2" size={16} />
                                    Get AI Suggestion
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="d-flex justify-content-between align-items-center mt-3">
                            <small style={{ color: "#666" }}>
                              {`Budget: ₹${MIN_RATE} - ₹${MAX_RATE} total`}
                              {predictedBudget && (
                                <>
                                  <span style={{ marginLeft: "10px", color: "#28a745", fontWeight: "600" }}>
                                    (AI Suggested: ₹{predictedBudget})
                                  </span>
                                  <button
                                    type="button"
                                    className="btn btn-sm ms-2"
                                    style={{
                                      backgroundColor: "#28a745",
                                      color: "white",
                                      border: "none",
                                      borderRadius: "4px",
                                      fontSize: "0.8rem",
                                      padding: "2px 8px"
                                    }}
                                    onClick={() => {
                                      setHourlyRateFrom(predictedBudget.toString());
                                      toast.success("AI suggestion applied!");
                                    }}
                                  >
                                    Apply
                                  </button>
                                </>
                              )}
                            </small>
                            {isBudgetValid && hourlyRateFrom !== "" && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="d-flex align-items-center"
                              >
                                <BsCheckCircle size={16} style={{ color: "#007674", marginRight: "5px" }} />
                                <small style={{ color: "#007674", fontWeight: 600 }}>
                                  Valid fixed budget!
                                </small>
                              </motion.div>
                            )}
                          </div>

                          {/* Help Text */}
                          {hourlyRateFrom === "" && (
                            <div className="mt-2">
                              <small style={{ color: "#666", fontStyle: "italic" }}>
                                Enter your project budget to continue
                              </small>
                            </div>
                          )}
                        </div>

                        {/* Budget Breakdown */}
                        {isBudgetValid && hourlyRateFrom !== "" && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="mb-5"
                          >
                            <h5 className="fw-semibold mb-3" style={{ color: "#007674", letterSpacing: '0.3px' }}>
                              Project Budget Summary
                            </h5>
                            <div className="row g-3">
                              <div className="col-md-6 mx-auto">
                                <div className="p-4 rounded-3 border text-center" style={{ backgroundColor: "#f8f9fa", borderColor: "#e3e3e3" }}>
                                  <h6 className="fw-semibold mb-2" style={{ color: "#121212" }}>Total Project Budget</h6>
                                  <h4 className="fw-bold mb-0" style={{ color: "#007674" }}>₹{hourlyRateFrom}</h4>
                                  <small style={{ color: "#666" }}>Fixed price for entire project</small>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* Error Message */}
                        {!isBudgetValid && (hourlyRateFrom !== "") && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mb-4 p-3 rounded"
                            style={{ backgroundColor: "#fff3cd", border: "1px solid #ffeaa7", color: "#856404" }}
                          >
                            <small>
                              {`Please enter a valid budget between ₹${MIN_RATE} and ₹${MAX_RATE} total`}
                            </small>
                          </motion.div>
                        )}

                        <motion.button
                          className="btn fw-semibold px-5 py-3 w-100"
                          style={{
                            borderRadius: "50px",
                            background: hourlyRateFrom === "" ? "#6c757d" : "#007674",
                            color: "#fff",
                            fontSize: "1.1rem",
                            boxShadow: hourlyRateFrom === ""
                              ? "0 2px 8px rgba(0, 0, 0, 0.1)"
                              : "0 6px 20px rgba(0, 118, 116, 0.3)",
                            border: "none",
                            transition: "all 0.3s ease",
                            opacity: hourlyRateFrom === "" ? 0.8 : 1,
                            cursor: hourlyRateFrom === "" ? "not-allowed" : "pointer",
                          }}
                          disabled={hourlyRateFrom === "" || isLoading}
                          onClick={hourlyRateFrom === "" ? undefined : handleNext}
                          whileHover={
                            hourlyRateFrom !== "" && isBudgetValid
                              ? {
                                scale: 1.02,
                                boxShadow: "0 8px 25px rgba(0, 118, 116, 0.4)",
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
                              {hourlyRateFrom === ""
                                ? "Enter Budget to Continue"
                                : "Next, Add Description"
                              }
                              {hourlyRateFrom !== "" && <BsArrowRight className="ms-2" />}
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

export default ClientJobBudgetPage;
