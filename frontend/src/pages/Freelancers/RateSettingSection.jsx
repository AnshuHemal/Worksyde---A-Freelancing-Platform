import React, { useEffect, useState } from "react";
import Header1 from "../../components/Header1";
import rate from "../../assets/rate.svg";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  BsArrowRight,
  BsLightbulb,
  BsCheckCircle,
  BsCurrencyDollar,
  BsInfoCircle,
  BsCalculator,
} from "react-icons/bs";
import axios from "axios";

const RateSettingSection = () => {
  const [hourlyRate, setHourlyRate] = useState("");
  const [platformFee, setPlatformFee] = useState(0);
  const [estimatedEarnings, setEstimatedEarnings] = useState(0);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = "http://localhost:5000/api/auth";
  const MIN_RATE = 200;
  const MAX_RATE = 9999;

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/current-user/`, {
          withCredentials: true,
        });
        setUserId(res.data.user._id);
        setDataLoading(false);
      } catch (error) {
        toast.error("Failed to fetch user.");
        console.error(error);
        setDataLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleRateChange = (e) => {
    const input = e.target.value;

    // Allow only numbers or an empty string
    if (!/^\d*$/.test(input)) return;

    setHourlyRate(input);

    const value = parseInt(input, 10);
    if (!isNaN(value)) {
      if (value < MIN_RATE || value > MAX_RATE) {
        setPlatformFee(0);
        setEstimatedEarnings(0);
        return;
      }

      const fee = value >= 5000 ? value * 0.02 : value * 0.1;
      setPlatformFee(fee.toFixed(2));
      setEstimatedEarnings((value - fee).toFixed(2));
    } else {
      setPlatformFee(0);
      setEstimatedEarnings(0);
    }
  };

  const handleNext = async () => {
    if (hourlyRate === "" || hourlyRate < MIN_RATE || hourlyRate > MAX_RATE) {
      toast.error(`You can add hourly rate in ₹${MIN_RATE} - ₹${MAX_RATE}.`);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/add-hourlyrate/`, {
        userId,
        hourlyRate,
      });

      if (response.status === 200) {
        // toast.success("Hourly rate saved successfully!");
        setTimeout(() => {
        navigate("/create-profile/location");
        }, 100);
      }
    } catch (error) {
      console.error("Error saving rate:", error.message);
      toast.error("Failed to save hourly rate.");
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedRates = [
    { rate: "500", label: "Entry Level" },
    { rate: "1000", label: "Mid Level" },
    { rate: "2000", label: "Senior Level" },
    { rate: "3500", label: "Expert Level" },
  ];

  const isRateValid = hourlyRate >= MIN_RATE && hourlyRate <= MAX_RATE;

  return (
    <>
      <style>
        {`
          .rate-input {
            border: 2px solid #e3e3e3;
            border-radius: 12px;
            padding: 15px 20px;
            font-size: 1.1rem;
            font-family: Urbanist, sans-serif;
            font-weight: 500;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }
          
          .rate-input:focus {
            outline: none;
            border-color: #007674;
            box-shadow: 0 6px 20px rgba(0, 118, 116, 0.15), 0 3px 8px rgba(0, 0, 0, 0.08);
            background: #ffffff;
            transform: translateY(-2px);
          }
          
          .rate-input::placeholder {
            color: #999;
            font-weight: 400;
          }
          
          .suggested-rate {
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .suggested-rate:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 118, 116, 0.1);
          }
          
          .input-group-text {
            background: linear-gradient(135deg, #007674 0%, #005a58 100%);
            border: 2px solid #007674;
            color: white;
            font-weight: 600;
            border-radius: 12px 0 0 12px;
          }
          
          .input-group .form-control {
            border-radius: 0 12px 12px 0;
            border-left: none;
          }
        `}
      </style>
      <Header1 />

      {/* Loading Screen */}
      {dataLoading && (
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
              Loading Profile Setup
          </h3>
            <p className="mb-0" style={{ color: "#666", fontSize: "1rem" }}>
              Preparing your rate setting section...
          </p>
          </div>
            </div>
      )}

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
                  {/* Header Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mb-5"
                  >
                    <div className="d-flex align-items-center mb-4">
                      <div>
                        <h2
                          className="fw-semibold mb-2"
                          style={{ color: "#121212", fontSize: "2rem" }}
                        >
                          Set Your Hourly Rate
                        </h2>
                        <p
                          className="mb-0"
                          style={{
                            fontSize: "1.1rem",
                            color: "#666",
                            lineHeight: "1.5",
                          }}
                        >
                          Choose a rate that reflects your expertise and value.
                          Clients will see this rate on your profile.
                        </p>
                      </div>
                  </div>
                  </motion.div>

                  {/* Rate Input Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="mb-5"
                  >
                    <div className="mb-4">
                      <label
                        className="form-label fw-semibold mb-3"
                        style={{ color: "#121212", fontSize: "1.2rem" }}
                      >
                        Your Hourly Rate
                      </label>
                      <div className="input-group">
                    <span className="input-group-text">₹</span>
                    <input
                      type="number"
                          min={MIN_RATE}
                          max={MAX_RATE}
                          className="rate-input form-control"
                          placeholder="Enter your rate"
                      value={hourlyRate}
                      onChange={handleRateChange}
                    />
                    <span className="input-group-text">/hr</span>
                  </div>
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <small style={{ color: "#666" }}>
                          Range: ₹{MIN_RATE} - ₹{MAX_RATE}
                        </small>
                        {isRateValid && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="d-flex align-items-center"
                          >
                            <BsCheckCircle
                              size={16}
                              style={{ color: "#007674", marginRight: "5px" }}
                            />
                            <small
                              style={{ color: "#007674", fontWeight: 600 }}
                            >
                              Valid rate!
                            </small>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Suggested Rates */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="mb-5"
                  >
                    <h5
                      className="fw-semibold mb-3"
                      style={{ color: "#121212" }}
                    >
                      Suggested Rates
                    </h5>
                    <div className="row g-3">
                      {suggestedRates.map((suggestion, index) => (
                        <motion.div
                          key={index}
                          className="col-md-6"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: 0.7 + index * 0.1,
                            duration: 0.3,
                          }}
                        >
                          <div
                            className="suggested-rate p-3 rounded-3 border h-100 d-flex flex-column justify-content-center align-items-center"
                            style={{
                              backgroundColor: "#f8f9fa",
                              borderColor: "#e3e3e3",
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                              minHeight: "100px",
                            }}
                            onClick={() => setHourlyRate(suggestion.rate)}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = "#e8f4f4";
                              e.target.style.borderColor = "#007674";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = "#f8f9fa";
                              e.target.style.borderColor = "#e3e3e3";
                            }}
                          >
                            <h6
                              className="fw-bold mb-1"
                              style={{ color: "#007674" }}
                            >
                              ₹{suggestion.rate}/hr
                            </h6>
                            <small
                              style={{ color: "#666", fontSize: "0.9rem" }}
                            >
                              {suggestion.label}
                            </small>
                          </div>
                        </motion.div>
                      ))}
                </div>
                  </motion.div>

                  {/* Rate Breakdown */}
                  {isRateValid && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                      className="mb-5"
                    >
                      <h5
                        className="fw-semibold mb-3"
                        style={{ color: "#121212" }}
                      >
                        Rate Breakdown
                      </h5>
                      <div className="row g-3">
                        <div className="col-md-4">
                          <div
                            className="p-3 rounded-3 border text-center"
                            style={{
                              backgroundColor: "#f8f9fa",
                              borderColor: "#e3e3e3",
                            }}
                          >
                            <h6
                              className="fw-semibold mb-1"
                              style={{ color: "#121212" }}
                            >
                              Client Pays
                            </h6>
                            <h5
                              className="fw-bold mb-0"
                              style={{ color: "#007674" }}
                            >
                              ₹{hourlyRate}
                            </h5>
                            <small style={{ color: "#666" }}>
                              Total amount
                            </small>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div
                            className="p-3 rounded-3 border text-center"
                            style={{
                              backgroundColor: "#f8f9fa",
                              borderColor: "#e3e3e3",
                            }}
                          >
                            <h6
                              className="fw-semibold mb-1"
                              style={{ color: "#121212" }}
                            >
                              Platform Fee
                            </h6>
                            <h5
                              className="fw-bold mb-0"
                              style={{ color: "#da8535" }}
                            >
                              ₹{platformFee}
                            </h5>
                            <small style={{ color: "#666" }}>
                              {parseInt(hourlyRate) >= 5000 ? "2%" : "10%"}{" "}
                              service fee
                    </small>
                  </div>
                        </div>
                        <div className="col-md-4">
                          <div
                            className="p-3 rounded-3 border text-center"
                            style={{
                              backgroundColor: "#f8f9fa",
                              borderColor: "#e3e3e3",
                            }}
                          >
                            <h6
                              className="fw-semibold mb-1"
                              style={{ color: "#121212" }}
                            >
                              You Earn
                            </h6>
                            <h5
                              className="fw-bold mb-0"
                              style={{ color: "#28a745" }}
                            >
                              ₹{estimatedEarnings}
                            </h5>
                            <small style={{ color: "#666" }}>After fees</small>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* CTA Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.5 }}
                    className="text-center"
                  >
                    <button
                      className="login-button border-0 px-5 py-3 fw-semibold"
                      style={{
                        fontSize: "1.1rem",
                        borderRadius: "50px",
                        background: isRateValid
                          ? "linear-gradient(135deg, #007674 0%, #005a58 100%)"
                          : "linear-gradient(135deg, #cccccc 0%, #bbbbbb 100%)",
                        color: "#fff",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        opacity: isRateValid ? 1 : 0.6,
                        cursor: isRateValid ? "pointer" : "not-allowed",
                        boxShadow: isRateValid
                          ? "0 6px 20px rgba(0, 118, 116, 0.3), 0 3px 8px rgba(0, 0, 0, 0.1)"
                          : "0 2px 8px rgba(0, 0, 0, 0.1)",
                      }}
                      onClick={handleNext}
                      disabled={isLoading || !isRateValid}
                      onMouseEnter={(e) => {
                        if (isRateValid) {
                          e.target.style.background =
                            "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                          e.target.style.boxShadow =
                            "0 8px 25px rgba(18, 18, 18, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)";
                          e.target.style.transform = "translateY(-2px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isRateValid) {
                          e.target.style.background =
                            "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                          e.target.style.boxShadow =
                            "0 6px 20px rgba(0, 118, 116, 0.3), 0 3px 8px rgba(0, 0, 0, 0.1)";
                          e.target.style.transform = "translateY(0)";
                        }
                      }}
                    >
                      {isLoading ? (
                        <div className="d-flex align-items-center">
                          <div
                            className="spinner-border spinner-border-sm me-2"
                            style={{ color: "#fff" }}
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          Saving...
                  </div>
                      ) : (
                        <>
                          Next, Profile Photo & Location
                          <BsArrowRight className="ms-2" size={20} />
                        </>
                      )}
                    </button>

                    {!isRateValid && hourlyRate !== "" && (
                      <p
                        className="mt-3 mb-0"
                        style={{ color: "#666", fontSize: "0.9rem" }}
                      >
                        Please enter a rate between ₹{MIN_RATE} and ₹{MAX_RATE}
                      </p>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Tips & Guidance */}
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
                  {/* Rate Strategy */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mb-4"
                  >
                    <div className="d-flex align-items-center mb-3">
                      <h4
                        className="fw-semibold mb-0"
                        style={{ color: "#121212", fontSize: "1.4rem" }}
                      >
                        Rate Strategy
                      </h4>
                    </div>

                    <div className="space-y-3">
                      <div className="d-flex align-items-start mb-3">
                        <div>
                          <h6
                            className="fw-semibold mb-1"
                            style={{ color: "#121212" }}
                          >
                            ● Research Market Rates
                          </h6>
                          <p className="text-muted small mb-0">
                            Check what others in your field are charging
                          </p>
                        </div>
                      </div>
                      <div className="d-flex align-items-start mb-3">
                        <div>
                          <h6
                            className="fw-semibold mb-1"
                            style={{ color: "#121212" }}
                          >
                            ● Consider Your Experience
                          </h6>
                          <p className="text-muted small mb-0">
                            Factor in your skills, expertise, and track record
                          </p>
                        </div>
                      </div>
                      <div className="d-flex align-items-start">
                        <div>
                          <h6
                            className="fw-semibold mb-1"
                            style={{ color: "#121212" }}
                          >
                            ● Start Competitive
                          </h6>
                          <p className="text-muted small mb-0">
                            You can always increase your rate as you build
                            reputation
                          </p>
                        </div>
                      </div>
                  </div>
                  </motion.div>

                  {/* Platform Fee Info */}
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
                      Platform Fee Structure
                    </h5>
                    <div
                      className="p-4 rounded-3"
                      style={{
                        backgroundColor: "rgba(0, 118, 116, 0.05)",
                        border: "1px solid rgba(0, 118, 116, 0.1)",
                      }}
                    >
                      <div className="mb-3">
                        <h6
                          className="fw-semibold mb-2"
                          style={{ color: "#007674" }}
                        >
                          Standard Rate: 10%
                        </h6>
                        <p className="text-muted small mb-0">
                          Applied to all earnings up to ₹5,000 with a client
                        </p>
                      </div>
                      <div>
                        <h6
                          className="fw-semibold mb-2"
                          style={{ color: "#007674" }}
                        >
                          Reduced Rate: 2%
                        </h6>
                        <p className="text-muted small mb-0">
                          Applied once you earn ₹5,000+ with a client
                        </p>
                      </div>
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

export default RateSettingSection;
