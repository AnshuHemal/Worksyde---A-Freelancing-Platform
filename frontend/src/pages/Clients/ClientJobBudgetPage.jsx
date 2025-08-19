import React, { useEffect, useState } from "react";
import Header1 from "../../components/Header1";
import budget from "../../assets/project_budget.svg";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { BsCheckCircle, BsArrowRight, BsCurrencyDollar, BsClock, BsCalculator, BsCurrencyRupee } from "react-icons/bs";

const ClientJobBudgetPage = () => {
  const [userId, setUserId] = useState("");
  const [hourlyRateFrom, setHourlyRateFrom] = useState("");
  const [hourlyRateTo, setHourlyRateTo] = useState("");
  const [budgetType, setBudgetType] = useState("fixed"); // 'hourly' or 'fixed'
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
      // Prepare budget data based on type
      const budgetData = {
        jobId,
        budgetType,
        hourlyRateFrom: hourlyRateFrom, // Always send the amount (for fixed price, this is the total budget)
        hourlyRateTo: budgetType === 'hourly' ? hourlyRateTo : 0,
      };

      console.log('Sending budget data:', budgetData);
      console.log('Data types:', {
        jobId: typeof budgetData.jobId,
        budgetType: typeof budgetData.budgetType,
        hourlyRateFrom: typeof budgetData.hourlyRateFrom,
        hourlyRateTo: typeof budgetData.hourlyRateTo
      });

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

  const fetchPredictedBudget = async (jobData) => {
    try {
      console.log("Fetching budget prediction with data:", jobData);
      console.log("API URL:", `${API_URL}/predict-budget/`);
      
      const res = await axios.post(`${API_URL}/predict-budget/`, jobData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log("Prediction response:", res.data);
      
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
    }
  };

  const MIN_RATE = 200;
  const MAX_RATE = 9999;

  const isBudgetValid =
    budgetType === 'hourly'
      ? (hourlyRateFrom !== "" &&
        hourlyRateTo !== "" &&
        !isNaN(hourlyRateFrom) &&
        !isNaN(hourlyRateTo) &&
        Number(hourlyRateFrom) >= MIN_RATE &&
        Number(hourlyRateTo) <= MAX_RATE &&
        Number(hourlyRateFrom) <= Number(hourlyRateTo))
      : (hourlyRateFrom !== "" &&
        !isNaN(hourlyRateFrom) &&
        Number(hourlyRateFrom) >= MIN_RATE &&
        Number(hourlyRateFrom) <= MAX_RATE);

  const averageRate =
    isBudgetValid
      ? budgetType === 'hourly'
        ? ((Number(hourlyRateFrom) + Number(hourlyRateTo)) / 2).toFixed(2)
        : Number(hourlyRateFrom).toFixed(2)
      : null;

  const budgetTypeOptions = [
    {
      value: "hourly",
      title: "Hourly Rate",
      description: "Pay based on time spent on the project",
      icon: <BsClock size={20} />
    },
    {
      value: "fixed",
      title: "Fixed Price",
      description: "Pay a set amount for the entire project",
      icon: <BsCalculator size={20} />
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

                        {/* Budget Type Section */}
                        <div className="mb-5">
                          <h5 className="fw-semibold mb-4" style={{ color: "#007674", letterSpacing: '0.3px' }}>
                            <BsCurrencyRupee className="me-3" style={{ color: "#007674" }} size={20} />
                            Budget Type
                          </h5>
                          <div className="row g-3">
                            {budgetTypeOptions.map((option) => (
                              <div key={option.value} className="col-12">
                                <div
                                  className={`p-4 rounded cursor-pointer border-2 ${budgetType === option.value ? "#007674" : "border-light"
                                    }`}
                                  style={{
                                    background: budgetType === option.value
                                      ? "#fff"
                                      : "#fff",
                                    border: budgetType === option.value
                                      ? "2px solid #007674"
                                      : "2px solid #e3e3e3",
                                    transition: "all 0.3s ease",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => setBudgetType(option.value)}
                                  onMouseEnter={(e) => {
                                    if (budgetType !== option.value) {
                                      e.target.style.background = "#fff";
                                      e.target.style.borderColor = "#007674";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (budgetType !== option.value) {
                                      e.target.style.background = "#fff";
                                      e.target.style.borderColor = "#e3e3e3";
                                    }
                                  }}
                                >
                                  <div className="d-flex align-items-start">
                                    <input
                                      type="radio"
                                      name="budgetType"
                                      value={option.value}
                                      checked={budgetType === option.value}
                                      onChange={(e) => setBudgetType(e.target.value)}
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
                                      <p className="mb-0" style={{ fontSize: "1rem", color: "#121212", lineHeight: "1.5" }}>
                                        {option.description}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

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
                          Set Your Budget Range
                        </h3>

                        <div className="mb-4">
                          <h5 className="fw-semibold mb-3" style={{ color: "#007674", letterSpacing: '0.3px' }}>
                            {budgetType === 'hourly' ? 'Hourly Rate Range' : 'Fixed Price Budget'}
                          </h5>
                          <p className="mb-4" style={{ fontSize: "1rem", color: "#121212", lineHeight: "1.5" }}>
                            {budgetType === 'hourly'
                              ? 'This will help us match you to the right talent within your hourly range.'
                              : 'Set your total project budget to attract the right talent for your project.'}
                          </p>

                          {budgetType === 'hourly' ? (
                            // Hourly Rate Range Inputs
                            <div className="row g-3 align-items-end">
                              <div className="col-md-5">
                                <label className="form-label fw-semibold mb-2" style={{ color: "#121212", fontSize: "0.95rem" }}>
                                  From
                                </label>
                                <div className="input-group">
                                  <span className="input-group-text" style={{ backgroundColor: "#f8f9fa", borderColor: "#e3e3e3" }}>₹</span>
                                  <input
                                    type="number"
                                    min={MIN_RATE}
                                    max={MAX_RATE}
                                    className="form-control"
                                    placeholder="Min per hour"
                                    value={hourlyRateFrom}
                                    onChange={e => setHourlyRateFrom(e.target.value)}
                                    style={{ borderColor: "#e3e3e3" }}
                                  />
                                  <span className="input-group-text" style={{ backgroundColor: "#f8f9fa", borderColor: "#e3e3e3" }}>
                                    /hr
                                  </span>
                                </div>
                              </div>
                              <div className="col-md-2 text-center fw-bold" style={{ fontSize: "1.1rem", color: "#007674" }}>
                                to
                              </div>
                              <div className="col-md-5">
                                <label className="form-label fw-semibold mb-2" style={{ color: "#121212", fontSize: "0.95rem" }}>
                                  To
                                </label>
                                <div className="input-group">
                                  <span className="input-group-text" style={{ backgroundColor: "#f8f9fa", borderColor: "#e3e3e3" }}>₹</span>
                                  <input
                                    type="number"
                                    min={MIN_RATE}
                                    max={MAX_RATE}
                                    className="form-control"
                                    placeholder="Max per hour"
                                    value={hourlyRateTo}
                                    onChange={e => setHourlyRateTo(e.target.value)}
                                    style={{ borderColor: "#e3e3e3" }}
                                  />
                                  <span className="input-group-text" style={{ backgroundColor: "#f8f9fa", borderColor: "#e3e3e3" }}>
                                    /hr
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            // Fixed Price Single Input
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
                                      setHourlyRateTo(e.target.value); // Set both to same value for fixed price
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
                                  onClick={() => fetchPredictedBudget({
                                    description: "Sample project description",
                                    category: "Web Development",
                                    experience_level: "Intermediate",
                                    client_country: "India",
                                    payment_type: budgetType === 'hourly' ? 'Hourly' : 'Fixed'
                                  })}
                                >
                                  <BsCalculator className="me-2" size={16} />
                                  Get AI Suggestion
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="d-flex justify-content-between align-items-center mt-3">
                            <small style={{ color: "#666" }}>
                              {budgetType === 'hourly'
                                ? `Range: ₹${MIN_RATE} - ₹${MAX_RATE} per hour`
                                : `Budget: ₹${MIN_RATE} - ₹${MAX_RATE} total`
                              }
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
                                      if (budgetType === 'fixed') {
                                        setHourlyRateTo(predictedBudget.toString());
                                      }
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
                                  Valid {budgetType === 'hourly' ? 'hourly' : 'fixed'} budget!
                                </small>
                              </motion.div>
                            )}
                          </div>

                          {/* Help Text */}
                          {hourlyRateFrom === "" && (
                            <div className="mt-2">
                              <small style={{ color: "#666", fontStyle: "italic" }}>
                                {budgetType === 'hourly'
                                  ? "Enter your hourly rate range to continue"
                                  : "Enter your project budget to continue"
                                }
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
                              {budgetType === 'hourly' ? 'Budget Summary' : 'Project Budget Summary'}
                            </h5>
                            {budgetType === 'hourly' ? (
                              // Hourly Rate Breakdown
                              <div className="row g-3">
                                <div className="col-md-4">
                                  <div className="p-3 rounded-3 border text-center" style={{ backgroundColor: "#f8f9fa", borderColor: "#e3e3e3" }}>
                                    <h6 className="fw-semibold mb-1" style={{ color: "#121212" }}>From</h6>
                                    <h5 className="fw-bold mb-0" style={{ color: "#007674" }}>₹{hourlyRateFrom}</h5>
                                    <small style={{ color: "#666" }}>Minimum per hour</small>
                                  </div>
                                </div>
                                <div className="col-md-4">
                                  <div className="p-3 rounded-3 border text-center" style={{ backgroundColor: "#f8f9fa", borderColor: "#e3e3e3" }}>
                                    <h6 className="fw-semibold mb-1" style={{ color: "#121212" }}>To</h6>
                                    <h5 className="fw-bold mb-0" style={{ color: "#007674" }}>₹{hourlyRateTo}</h5>
                                    <small style={{ color: "#666" }}>Maximum per hour</small>
                                  </div>
                                </div>
                                <div className="col-md-4">
                                  <div className="p-3 rounded-3 border text-center" style={{ backgroundColor: "#f8f9fa", borderColor: "#e3e3e3" }}>
                                    <h6 className="fw-semibold mb-1" style={{ color: "#121212" }}>Average</h6>
                                    <h5 className="fw-bold mb-0" style={{ color: "#28a745" }}>₹{averageRate}</h5>
                                    <small style={{ color: "#666" }}>Per hour</small>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              // Fixed Price Breakdown
                              <div className="row g-3">
                                <div className="col-md-6 mx-auto">
                                  <div className="p-4 rounded-3 border text-center" style={{ backgroundColor: "#f8f9fa", borderColor: "#e3e3e3" }}>
                                    <h6 className="fw-semibold mb-2" style={{ color: "#121212" }}>Total Project Budget</h6>
                                    <h4 className="fw-bold mb-0" style={{ color: "#007674" }}>₹{hourlyRateFrom}</h4>
                                    <small style={{ color: "#666" }}>Fixed price for entire project</small>
                                  </div>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}

                        {/* Error Message */}
                        {!isBudgetValid && (hourlyRateFrom !== "" || hourlyRateTo !== "") && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mb-4 p-3 rounded"
                            style={{ backgroundColor: "#fff3cd", border: "1px solid #ffeaa7", color: "#856404" }}
                          >
                            <small>
                              {budgetType === 'hourly'
                                ? `Please enter a valid range between ₹${MIN_RATE} and ₹${MAX_RATE} per hour`
                                : `Please enter a valid budget between ₹${MIN_RATE} and ₹${MAX_RATE} total`
                              }
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
