import React, { useState, useCallback, useEffect } from "react";
import Header1 from "../../components/Header1";
import profile from "../../assets/profile.svg";
import Cropper from "react-easy-crop";
import { Modal, Button } from "react-bootstrap";
import getCroppedImg from "../../utils/cropImage";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BsArrowRight,
  BsLightbulb,
  BsCheckCircle,
  BsCamera,
  BsGeoAlt,
  BsPhone,
  BsCalendar,
  BsX,
} from "react-icons/bs";
import axios from "axios";

const PhotoAndLocationSection = () => {
  const [countryCode, setCountryCode] = useState("+91");
  const [rawPhoneNumber, setRawPhoneNumber] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [userId, setUserId] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [formData, setFormData] = useState({
    dob: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });
  const [loading, setLoading] = useState(false);
  const [ageError, setAgeError] = useState("");
  const navigate = useNavigate();

  const API_URL = "http://localhost:5000/api/auth";

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/current-user/`, {
          withCredentials: true,
        });
        setUserId(res.data.user._id);
        setDataLoading(false);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setDataLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleCountryCodeChange = (e) => setCountryCode(e.target.value);

  const handlePhoneChange = (e) => {
    let input = e.target.value.replace(/\D/g, ""); // only digits
    setRawPhoneNumber(input);
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const isUser18Plus = (birthDate) => {
    if (!birthDate) return false;
    const age = calculateAge(birthDate);
    return age >= 18;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear age error when DOB changes
    if (name === 'dob') {
      setAgeError("");
    }
  };

  const readFile = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // Handle crop area complete
  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Read file input and set image source
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
      setShowModal(true);
    }
  };

  const handleUpload = async () => {
    const croppedImgBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

    const reader = new FileReader();
    reader.readAsDataURL(croppedImgBlob);
    reader.onloadend = () => {
      const base64data = reader.result;
      setCroppedImage(base64data);
      setShowModal(false);
    };
  };

  const handleNext = async () => {
    // Validate age before proceeding
    if (formData.dob && !isUser18Plus(formData.dob)) {
      setAgeError("You must be at least 18 years old to create a freelancer profile.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/add-photo-location-details/`,
        {
          userId,
          ...formData,
          photo: croppedImage, // Send the uploaded photo URL
          phone: `${countryCode}${rawPhoneNumber}`,
        }
      );

      if (response.status === 200) {
        // toast.success("Profile details saved successfully!");
        setTimeout(() => {
          navigate("/create-profile/submit");
        }, 100);
      }
    } catch (error) {
      console.error("Error submitting data:", error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    // Check if user is 18+
    if (formData.dob && !isUser18Plus(formData.dob)) {
      return false;
    }
    
    return (
      croppedImage &&
      formData.dob &&
      formData.street &&
      formData.city &&
      formData.state &&
      formData.postalCode &&
      rawPhoneNumber.length === 10
    );
  };

  return (
    <>
      <style>
        {`
          .form-input {
            border: 2px solid #e3e3e3;
            border-radius: 12px;
            padding: 15px 20px;
            font-size: 1rem;
            font-family: Urbanist, sans-serif;
            font-weight: 500;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            width: 100%;
          }
          
          .form-input:focus {
            outline: none;
            border-color: #007674;
            box-shadow: 0 6px 20px rgba(0, 118, 116, 0.15), 0 3px 8px rgba(0, 0, 0, 0.08);
            background: #ffffff;
            transform: translateY(-2px);
          }
          
          .form-input::placeholder {
            color: #999;
            font-weight: 400;
          }
          
          .photo-upload-area {
            border: 3px dashed #e3e3e3;
            border-radius: 20px;
            padding: 40px 20px;
            text-align: center;
            transition: all 0.3s ease;
            cursor: pointer;
            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          }
          
          .photo-upload-area:hover {
            border-color: #007674;
            background: linear-gradient(135deg, #e8f4f4 0%, #f8f9fa 100%);
            transform: translateY(-2px);
          }
          
          .profile-preview {
            width: 280px;
            height: 280px !important;
            border-radius: 50%;
            object-fit: cover;
            border: 5px solid #007674;
            box-shadow: 0 15px 45px rgba(0, 118, 116, 0.3);
            transition: all 0.3s ease;
          }
          
          .profile-preview:hover {
            transform: scale(1.05);
            box-shadow: 0 20px 50px rgba(0, 118, 116, 0.4);
          }
          
          .phone-input-group {
            display: flex;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }
          
          .country-code-select {
            background: linear-gradient(135deg, #007674 0%, #005a58 100%);
            border: 2px solid #007674;
            color: white;
            font-weight: 600;
            padding: 15px 20px;
            border-radius: 12px 0 0 12px;
            border-right: none;
          }
          
          .phone-input {
            border: 2px solid #e3e3e3;
            border-left: none;
            border-radius: 0 12px 12px 0;
            padding: 15px 20px;
            font-size: 1rem;
            font-family: Urbanist, sans-serif;
            font-weight: 500;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            flex: 1;
          }
          
          .phone-input:focus {
            outline: none;
            border-color: #007674;
            box-shadow: 0 6px 20px rgba(0, 118, 116, 0.15), 0 3px 8px rgba(0, 0, 0, 0.08);
            background: #ffffff;
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
              style={{ color: "#121212", fontSize: "1.8rem", letterSpacing: '0.3px' }}
            >
              Loading Profile Setup
            </h3>
            <p className="mb-0" style={{ color: "#121212", fontSize: "1.2rem" }}>
              Preparing your photo and location section...
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
            {/* Left Column - Photo Upload */}
            <div className="col-lg-6">
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
                          style={{ color: "#121212", fontSize: "2rem", letterSpacing: '0.3px' }}
                        >
                          Profile Photo
                        </h2>
                        <p
                          className="mb-0"
                          style={{
                            fontSize: "1.1rem",
                            color: "#121212",
                            lineHeight: "1.5",
                          }}
                        >
                          A professional photo helps you make a strong first
                          impression with potential clients.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Photo Upload Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="mb-5"
                  >
                    <div className="text-center">
                      {croppedImage ? (
                        <div className="mb-4 position-relative">
                          <img
                            src={croppedImage}
                            alt="Profile Preview"
                            className="profile-preview mb-3"
                          />
                          
                          {/* Delete Icon Button */}
                          <button
                            className="btn position-absolute"
                            onClick={() => {
                              setCroppedImage(null);
                              setImageSrc(null);
                              setCroppedAreaPixels(null);
                            }}
                            style={{
                              top: "10px",
                              right: "10px",
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              background: "linear-gradient(135deg, #dc3545 0%, #c82333 100%)",
                              color: "#fff",
                              border: "none",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              boxShadow: "0 4px 15px rgba(220, 53, 69, 0.3)",
                              zIndex: 10,
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = "linear-gradient(135deg, #c82333 0%, #a71e2a 100%)";
                              e.target.style.transform = "scale(1.1)";
                              e.target.style.boxShadow = "0 6px 20px rgba(220, 53, 69, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = "linear-gradient(135deg, #dc3545 0%, #c82333 100%)";
                              e.target.style.transform = "scale(1)";
                              e.target.style.boxShadow = "0 4px 15px rgba(220, 53, 69, 0.3)";
                            }}
                            title="Remove Photo"
                          >
                            <BsX size={20} />
                          </button>
                          
                          <div className="d-flex gap-3 justify-content-center">
                            <button
                              className="btn px-4 py-3 fw-semibold"
                              onClick={() =>
                                document.getElementById("fileInput").click()
                              }
                              style={{
                                borderRadius: "15px",
                                background:
                                  "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                                color: "#fff",
                                border: "none",
                                transition:
                                  "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                boxShadow:
                                  "0 6px 20px rgba(0, 118, 116, 0.3), 0 3px 8px rgba(0, 0, 0, 0.1)",
                              }}
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
                              <BsCamera className="me-2" size={18} />
                              Change Photo
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="photo-upload-area mb-4"
                          onClick={() =>
                            document.getElementById("fileInput").click()
                          }
                        >
                          <BsCamera
                            size={48}
                            className="mb-3"
                            style={{ color: "#007674" }}
                          />
                          <h5
                            className="fw-semibold mb-2"
                            style={{ color: "#121212" }}
                          >
                            Upload Your Photo
                          </h5>
                          <p className="text-muted mb-0">
                            Click to select a photo or drag and drop
                          </p>
                        </div>
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        id="fileInput"
                        onChange={handleFileChange}
                        hidden
                      />
                    </div>
                  </motion.div>

                  {/* Photo Guidelines */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <h5
                      className="fw-semibold mb-3"
                      style={{ color: "#121212" }}
                    >
                      Photo Guidelines
                    </h5>
                    <div
                      className="p-4 rounded-3"
                      style={{
                        border: "1px solid #e3e3e3",
                      }}
                    >
                      <ul
                        className="mb-0"
                        style={{ color: "#121212", fontSize: "1.1rem" }}
                      >
                        <li className="mb-2">
                          Clearly feature your face, taken from a short distance
                        </li>
                        <li className="mb-2">
                          Show your full face without visual obstructions
                        </li>
                        <li className="mb-2">
                          Be sharp, well-lit, and high quality
                        </li>
                        <li className="mb-0">
                          Have a simple, uncluttered background
                        </li>
                      </ul>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Location Details */}
            <div className="col-lg-6">
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
                  {/* Header Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mb-5"
                  >
                    <div className="d-flex align-items-center mb-4">
                      <div>
                        <h2
                          className="fw-semibold mb-2"
                          style={{ color: "#121212", fontSize: "2rem", letterSpacing: '0.3px' }}
                        >
                          Personal Details
                        </h2>
                        <p
                          className="mb-0"
                          style={{
                            fontSize: "1.1rem",
                            color: "#121212",
                            lineHeight: "1.5",
                          }}
                        >
                          We need your basic details for secure payments and
                          account verification.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Form Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    {/* DOB & Country */}
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <label
                          className="form-label fw-semibold mb-2"
                          style={{ color: "#121212" }}
                        >
                          <BsCalendar className="me-2" />
                          Date of Birth *
                        </label> <br />
                        <input
                          type="date"
                          className="form-input"
                          name="dob"
                          value={formData.dob}
                          onChange={handleFormChange}
                          max={new Date().toISOString().split('T')[0]} // Prevent future dates
                        />
                        {ageError && (
                          <div className="mt-2">
                            <small style={{ color: "#dc3545", fontSize: "0.9rem" }}>
                              {ageError}
                            </small>
                          </div>
                        )}
                      </div>
                      <div className="col-md-6">
                        <label
                          className="form-label fw-semibold mb-2"
                          style={{ color: "#121212" }}
                        >
                          <BsGeoAlt className="me-2" />
                          Country *
                        </label>
                        <select
                          className="form-input"
                          name="country"
                          value={formData.country}
                          onChange={handleFormChange}
                        >
                          <option value="India">🇮🇳 India</option>
                        </select>
                      </div>
                    </div>

                    {/* Street Address */}
                    <div className="mb-4">
                      <label
                        className="form-label fw-semibold mb-2"
                        style={{ color: "#121212" }}
                      >
                        <BsGeoAlt className="me-2" />
                        Street Address *
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        name="street"
                        value={formData.street}
                        onChange={handleFormChange}
                        placeholder="Enter your street address"
                      />
                    </div>

                    {/* City, State, Postal Code */}
                    <div className="row mb-4">
                      <div className="col-md-4">
                        <label
                          className="form-label fw-semibold mb-2"
                          style={{ color: "#121212" }}
                        >
                          City *
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          name="city"
                          value={formData.city}
                          onChange={handleFormChange}
                          placeholder="City"
                        />
                      </div>
                      <div className="col-md-4">
                        <label
                          className="form-label fw-semibold mb-2"
                          style={{ color: "#121212" }}
                        >
                          State *
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          name="state"
                          value={formData.state}
                          onChange={handleFormChange}
                          placeholder="State"
                        />
                      </div>
                      <div className="col-md-4">
                        <label
                          className="form-label fw-semibold mb-2"
                          style={{ color: "#121212" }}
                        >
                          Postal Code *
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleFormChange}
                          placeholder="PIN Code"
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="mb-4">
                      <label
                        className="form-label fw-semibold mb-2"
                        style={{ color: "#121212" }}
                      >
                        <BsPhone className="me-2" />
                        Phone Number *
                      </label>
                      <div className="phone-input-group">
                        <select
                          className="country-code-select"
                          value={countryCode}
                          onChange={handleCountryCodeChange}
                        >
                          <option value="+91">🇮🇳 +91</option>
                        </select>
                        <input
                          type="tel"
                          className="phone-input"
                          minLength={10}
                          maxLength={10}
                          value={rawPhoneNumber}
                          onChange={handlePhoneChange}
                          placeholder="Enter mobile number"
                        />
                      </div>
                      {rawPhoneNumber.length > 0 &&
                        rawPhoneNumber.length < 10 && (
                          <small className="text-danger mt-1">
                            Please enter a valid 10-digit mobile number
                          </small>
                        )}
                    </div>
                  </motion.div>

                  {/* CTA Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="text-center mt-5"
                  >
                    <button
                      className="login-button border-0 px-5 py-3 fw-semibold"
                      style={{
                        fontSize: "1.1rem",
                        borderRadius: "50px",
                        background: isFormValid()
                          ? "linear-gradient(135deg, #007674 0%, #005a58 100%)"
                          : "linear-gradient(135deg, #cccccc 0%, #bbbbbb 100%)",
                        color: "#fff",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        opacity: isFormValid() ? 1 : 0.6,
                        cursor: isFormValid() ? "pointer" : "not-allowed",
                        boxShadow: isFormValid()
                          ? "0 6px 20px rgba(0, 118, 116, 0.3), 0 3px 8px rgba(0, 0, 0, 0.1)"
                          : "0 2px 8px rgba(0, 0, 0, 0.1)",
                      }}
                      onClick={handleNext}
                      disabled={loading || !isFormValid()}
                      onMouseEnter={(e) => {
                        if (isFormValid()) {
                          e.target.style.background =
                            "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                          e.target.style.boxShadow =
                            "0 8px 25px rgba(18, 18, 18, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)";
                          e.target.style.transform = "translateY(-2px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isFormValid()) {
                          e.target.style.background =
                            "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                          e.target.style.boxShadow =
                            "0 6px 20px rgba(0, 118, 116, 0.3), 0 3px 8px rgba(0, 0, 0, 0.1)";
                          e.target.style.transform = "translateY(0)";
                        }
                      }}
                    >
                      {loading ? (
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
                          Next, Check & Submit Profile
                          <BsArrowRight className="ms-2" size={20} />
                        </>
                      )}
                    </button>

                    {!isFormValid() && (
                      <p
                        className="mt-3 mb-0"
                        style={{ color: "#121212", fontSize: "1.1rem" }}
                      >
                        Please fill in all required fields and upload a photo.
                      </p>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Crop Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
        dialogClassName="custom-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Crop your image</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: "400px", position: "relative" }}>
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-center gap-4">
            <button className="post-button" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button className="login-button border-0" onClick={handleUpload}>
              Upload
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PhotoAndLocationSection;
