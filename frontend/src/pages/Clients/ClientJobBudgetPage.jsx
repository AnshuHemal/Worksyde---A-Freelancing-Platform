import React, { useEffect, useState } from "react";
import Header1 from "../../components/Header1";
import budget from "../../assets/project_budget.svg";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { BsCheckCircle } from "react-icons/bs";

const ClientJobBudgetPage = () => {
  const [userId, setUserId] = useState("");
  const [hourlyRateFrom, setHourlyRateFrom] = useState(0.0);
  const [hourlyRateTo, setHourlyRateTo] = useState(0.0);
  const [budgetType, setBudgetType] = useState("hourly"); // 'hourly' or 'fixed'
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
    if (!isBudgetValid) {
      toast.error("Please enter a valid budget range.");
      return;
    }
    try {
      const jobIdRes = await axios.post(`${API_URL}/jobposts/draft/`, {
        userId,
      });
      const jobId = jobIdRes.data.jobPostId;
      const res = await axios.post(`${API_URL}/add-job-budget/`, {
        jobId,
        hourlyRateFrom,
        hourlyRateTo,
        budgetType, // Pass the selected type
      });

      if (res.status === 200) {
        navigate("/job-post/instant/add-description");
      }
    } catch (err) {
      toast.error("An error occurred while saving your budget.");
    }
  };

  const MIN_RATE = 200;
  const MAX_RATE = 9999;

  const isBudgetValid =
    hourlyRateFrom &&
    hourlyRateTo &&
    !isNaN(hourlyRateFrom) &&
    !isNaN(hourlyRateTo) &&
    Number(hourlyRateFrom) >= MIN_RATE &&
    Number(hourlyRateTo) <= MAX_RATE &&
    Number(hourlyRateFrom) <= Number(hourlyRateTo);

  const averageRate =
    isBudgetValid
      ? ((Number(hourlyRateFrom) + Number(hourlyRateTo)) / 2).toFixed(2)
      : null;

  return (
    <>
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
            {/* Left Column - Tips & Illustration */}
            <div className="col-lg-4">
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
                <div className="card-body p-4 d-flex flex-column align-items-center justify-content-center">
                  <img
                    src={budget}
                    alt="Budget Illustration"
                    className="img-fluid mb-4"
                    style={{ maxWidth: "180px", borderRadius: "18px", boxShadow: "0 2px 8px rgba(0, 118, 116, 0.08)" }}
                  />
                  <h4 className="fw-semibold mb-3 text-center" style={{ color: "#121212" }}>
                    Budget Tips
                  </h4>
                  <ul className="mb-0" style={{ color: "#666", fontSize: "1rem", lineHeight: 1.7 }}>
                    <li>Research what others are paying for similar work.</li>
                    <li>Set a range to attract a wider pool of talent.</li>
                    <li>Be realistic—higher budgets attract more experienced freelancers.</li>
                  </ul>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Budget Form */}
            <div className="col-lg-8">
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
                <div className="card-body p-5">
                  {/* Budget Type Toggle */}
                  <div className="mb-4 d-flex gap-3 align-items-center">
                    <label className="fw-semibold mb-0" style={{ color: '#121212', fontSize: '1.1rem' }}>Budget Type:</label>
                    <div className="btn-group" role="group" aria-label="Budget Type">
                      <button
                        type="button"
                        className={`btn btn-sm ${budgetType === 'hourly' ? 'btn-primary' : 'btn-outline-primary'}`}
                        style={{ borderRadius: '20px 0 0 20px', fontWeight: 600 }}
                        onClick={() => setBudgetType('hourly')}
                      >
                        Hourly Rate
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${budgetType === 'fixed' ? 'btn-primary' : 'btn-outline-primary'}`}
                        style={{ borderRadius: '0 20px 20px 0', fontWeight: 600 }}
                        onClick={() => setBudgetType('fixed')}
                      >
                        Fixed Price
                      </button>
                    </div>
                  </div>
                  <div className="mb-5">
                    <h2 className="fw-semibold mb-2" style={{ color: "#121212" }}>
                      {budgetType === 'hourly' ? 'Set Your Hourly Rate Range' : 'Set Your Fixed Price Range'}
                    </h2>
                    <p className="mb-0" style={{ fontSize: "1.1rem", color: "#666", lineHeight: "1.6" }}>
                      {budgetType === 'hourly'
                        ? 'This will help us match you to the right talent within your hourly range.'
                        : 'This will help us match you to the right talent for your project budget.'}
                    </p>
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold mb-2" style={{ color: "#121212", fontSize: "1.1rem" }}>
                      {budgetType === 'hourly' ? 'Your Hourly Rate Range' : 'Your Fixed Price Range'}
                    </label>
                    <div className="row g-3 align-items-end">
                      <div className="col-md-5">
                        <div className="input-group">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            min={MIN_RATE}
                            max={MAX_RATE}
                            className="rate-input form-control"
                            placeholder={budgetType === 'hourly' ? 'From (per hour)' : 'From (total)'}
                            value={hourlyRateFrom}
                            onChange={e => setHourlyRateFrom(e.target.value)}
                          />
                          <span className="input-group-text">{budgetType === 'hourly' ? '/hr' : ''}</span>
                        </div>
                      </div>
                      <div className="col-md-2 text-center fw-bold" style={{ fontSize: "1.2rem", color: "#007674" }}>
                        to
                      </div>
                      <div className="col-md-5">
                        <div className="input-group">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            min={MIN_RATE}
                            max={MAX_RATE}
                            className="rate-input form-control"
                            placeholder={budgetType === 'hourly' ? 'To (per hour)' : 'To (total)'}
                            value={hourlyRateTo}
                            onChange={e => setHourlyRateTo(e.target.value)}
                          />
                          <span className="input-group-text">{budgetType === 'hourly' ? '/hr' : ''}</span>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <small style={{ color: "#666" }}>
                        Range: ₹{MIN_RATE} - ₹{MAX_RATE} {budgetType === 'hourly' ? 'per hour' : 'total'}
                      </small>
                      {isBudgetValid && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="d-flex align-items-center"
                        >
                          <BsCheckCircle size={16} style={{ color: "#007674", marginRight: "5px" }} />
                          <small style={{ color: "#007674", fontWeight: 600 }}>
                            Valid {budgetType === 'hourly' ? 'hourly' : 'fixed'} range!
                          </small>
                        </motion.div>
                      )}
                    </div>
                  </div>
                  {/* Budget Breakdown */}
                  {isBudgetValid && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="mb-4"
                    >
                      <h5 className="fw-semibold mb-3" style={{ color: "#121212" }}>
                        {budgetType === 'hourly' ? 'Hourly Rate Breakdown' : 'Fixed Price Breakdown'}
                      </h5>
                      <div className="row g-3">
                        <div className="col-md-4">
                          <div className="p-3 rounded-3 border text-center" style={{ backgroundColor: "#f8f9fa", borderColor: "#e3e3e3" }}>
                            <h6 className="fw-semibold mb-1" style={{ color: "#121212" }}>From</h6>
                            <h5 className="fw-bold mb-0" style={{ color: "#007674" }}>₹{hourlyRateFrom}</h5>
                            <small style={{ color: "#666" }}>Minimum {budgetType === 'hourly' ? 'per hour' : 'total'}</small>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="p-3 rounded-3 border text-center" style={{ backgroundColor: "#f8f9fa", borderColor: "#e3e3e3" }}>
                            <h6 className="fw-semibold mb-1" style={{ color: "#121212" }}>To</h6>
                            <h5 className="fw-bold mb-0" style={{ color: "#007674" }}>₹{hourlyRateTo}</h5>
                            <small style={{ color: "#666" }}>Maximum {budgetType === 'hourly' ? 'per hour' : 'total'}</small>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="p-3 rounded-3 border text-center" style={{ backgroundColor: "#f8f9fa", borderColor: "#e3e3e3" }}>
                            <h6 className="fw-semibold mb-1" style={{ color: "#121212" }}>Average</h6>
                            <h5 className="fw-bold mb-0" style={{ color: "#28a745" }}>₹{averageRate}</h5>
                            <small style={{ color: "#666" }}>{budgetType === 'hourly' ? 'Per hour' : 'Total'}</small>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <motion.button
                    className="btn fw-semibold px-5 py-3 w-100 mt-2"
                    style={{
                      borderRadius: "50px",
                      background: isBudgetValid
                        ? "linear-gradient(135deg, #007674 0%, #005a58 100%)"
                        : "linear-gradient(135deg, #cccccc 0%, #bbbbbb 100%)",
                      color: "#fff",
                      fontSize: "1.1rem",
                      boxShadow: isBudgetValid
                        ? "0 6px 20px rgba(0, 118, 116, 0.3), 0 3px 8px rgba(0, 0, 0, 0.1)"
                        : "0 2px 8px rgba(0, 0, 0, 0.1)",
                      opacity: isBudgetValid ? 1 : 0.6,
                      cursor: isBudgetValid ? "pointer" : "not-allowed",
                      border: "none",
                      transition: "all 0.3s ease",
                    }}
                    onClick={handleNext}
                    disabled={!isBudgetValid}
                    whileHover={
                      isBudgetValid
                        ? {
                            scale: 1.02,
                            boxShadow:
                              "0 8px 25px rgba(0, 118, 116, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)",
                          }
                        : {}
                    }
                    whileTap={{ scale: 0.98 }}
                  >
                    Lastly, Add Description
                  </motion.button>
                  {!isBudgetValid && (hourlyRateFrom !== "" || hourlyRateTo !== "") && (
                    <p className="mt-3 mb-0" style={{ color: "#666", fontSize: "0.9rem" }}>
                      Please enter a valid range between ₹{MIN_RATE} and ₹{MAX_RATE} {budgetType === 'hourly' ? 'per hour' : 'total'}
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientJobBudgetPage;
