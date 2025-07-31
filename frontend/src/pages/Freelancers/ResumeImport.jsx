import React, { useEffect, useRef, useState } from "react";
import Header1 from "../../components/Header1";
import resume from "../../assets/resume.jpg";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { motion } from "framer-motion";
import {
  BsUpload,
  BsFileEarmarkPdf,
  BsX,
  BsArrowRight,
  BsMagic,
  BsCheckCircle,
  BsClock,
} from "react-icons/bs";

const ResumeImport = () => {
  const fileInputRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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

  const handleContinue = async () => {
    if (!uploadedFile) {
      toast.error("Please upload your resume or use AI Builder.");
      return;
    }

    if (!userId) {
      toast.error("User not identified.");
      return;
    }
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile); 
      formData.append("userId", userId);

      const response = await axios.post(`${API_URL}/upload-resume/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // toast.success("Resume uploaded successfully!");
      setTimeout(() => {
        navigate("/create-profile/categories");
      }, 1000);
    } catch (err) {
      console.error("Error during upload:", err.response?.data || err.message);
      toast.error(
        `Upload failed. Error: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than or equal to 5MB.");
      return;
    }

    setUploadedFile(file);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    fileInputRef.current.value = "";
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are allowed.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than or equal to 5MB.");
        return;
      }
      setUploadedFile(file);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          fontWeight: 500
        }}
      >
        <div className="container-fluid px-4">
          <div className="row justify-content-center">
            <div className="col-12">
              <div className="row g-4">
                {/* Left Column - Resume Preview */}
                <div className="col-lg-5">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="h-100"
                  >
                    <div className="text-center mb-4">
                      <h3 
                        className="fw-semibold mb-2"
                        style={{ color: "#121212" }}
                      >
                        Professional Resume Preview
                      </h3>
                      <p 
                        className="mb-0"
                        style={{ color: "#666", fontSize: "0.95rem" }}
                      >
                        See how your resume will look to potential clients
                      </p>
                    </div>

                    <div 
                      className="cardd border-0 shadow-lg"
                      style={{ borderRadius: "15px", overflow: "hidden" }}
                    >
                      <div className="card-body p-0">
                        <div 
                          style={{ 
                            width: "100%",
                            height: "400px",
                            overflow: "hidden",
                            borderRadius: "15px"
                          }}
                        >
                          <img 
                            src={resume} 
                            alt="resume preview" 
                            className="w-100 h-100"
                            style={{ 
                              objectFit: "cover",
                              objectPosition: "top center"
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Resume Tips */}
                    <div className="mt-4 p-3 rounded" style={{ backgroundColor: "#f8f9fa", border: "1px solid #e3e3e3" }}>
                      <h6 className="fw-semibold mb-2" style={{ color: "#121212" }}>
                        💡 Resume Tips
                      </h6>
                      <ul className="mb-0" style={{ fontSize: "1rem", color: "#666" }}>
                        <li>Keep your resume updated with recent experience</li>
                        <li>Highlight relevant skills for your target jobs</li>
                        <li>Use clear, professional formatting</li>
                      </ul>
                    </div>
                  </motion.div>
                </div>

                {/* Right Column - Upload Options */}
                <div className="col-lg-7">
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="h-100"
                  >
                    <div className="cardd border-0 shadow-lg h-100" style={{ borderRadius: "20px" }}>
                      <div className="card-body p-5">
                        {/* Header */}
                        <div className="text-center mb-5">
                          <h2 
                            className="fw-semibold mb-3"
                            style={{ 
                              color: "#121212",
                              fontSize: "2rem"
                            }}
                          >
                            Let's build your professional profile
                          </h2>
                          <p 
                            className="mb-0"
                            style={{ 
                              color: "#666",
                              fontSize: "1.1rem",
                              lineHeight: "1.6"
                            }}
                          >
                            Your resume is the first step toward unlocking opportunities. 
                            Choose to upload your existing resume or let our AI builder help 
                            you create one from scratch.
                          </p>
                        </div>

                        {/* Upload Section */}
                        <div className="mb-5">
                          <h5 
                            className="fw-semibold mb-3"
                            style={{ color: "#121212" }}
                          >
                            Upload Your Resume
                          </h5>
                          
                          <div
                            className={`border-2 border-dashed rounded-3 p-4 text-center ${
                              dragActive ? 'border-primary bg-light' : 'border-muted'
                            }`}
                            style={{
                              borderColor: dragActive ? "#007674" : "#dee2e6",
                              backgroundColor: dragActive ? "#f8f9fa" : "transparent",
                              transition: "all 0.3s ease",
                              cursor: "pointer"
                            }}
                            onClick={handleUploadClick}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                          >
                            <BsUpload 
                              size={40} 
                              style={{ color: "#007674", marginBottom: "15px" }}
                            />
                            <h6 className="fw-semibold mb-2" style={{ color: "#121212" }}>
                              Drop your PDF resume here or click to browse
                            </h6>
                            <p className="mb-0" style={{ color: "#666", fontSize: "0.9rem" }}>
                              Maximum file size: 5MB • PDF format only
                            </p>
                          </div>

                          <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            accept=".pdf"
                            onChange={handleFileChange}
                          />

                          {/* File Preview */}
                          {uploadedFile && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-3 p-3 rounded"
                              style={{ 
                                backgroundColor: "#f8f9fa",
                                border: "1px solid #e3e3e3"
                              }}
                            >
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center">
                                  <BsFileEarmarkPdf 
                                    size={24} 
                                    style={{ color: "#007674", marginRight: "10px" }}
                                  />
                                  <div>
                                    <h6 className="fw-semibold mb-1" style={{ color: "#121212" }}>
                                      {uploadedFile.name}
                                    </h6>
                                    <small style={{ color: "#666" }}>
                                      {formatFileSize(uploadedFile.size)}
                                    </small>
                                  </div>
                                </div>
                                <button
                                  onClick={handleRemoveFile}
                                  className="btn btn-sm"
                                  style={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #e3e3e3",
                                    color: "#666",
                                    borderRadius: "50%",
                                    width: "32px",
                                    height: "32px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                  }}
                                >
                                  <BsX size={16} />
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {/* Divider */}
                        <div className="text-center mb-4">
                          <span style={{ color: "#666", fontSize: "0.9rem" }}>OR</span>
                        </div>

                        {/* AI Builder Option */}
                        <div className="mb-5">
                          <div 
                            className="p-4 rounded-3 border"
                            style={{ 
                              borderColor: "#e3e3e3",
                              backgroundColor: "#f8f9fa",
                              cursor: "pointer",
                              transition: "all 0.3s ease"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = "#007674";
                              e.currentTarget.style.backgroundColor = "#fff";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = "#e3e3e3";
                              e.currentTarget.style.backgroundColor = "#f8f9fa";
                            }}
                          >
                            <div className="d-flex align-items-center">
                              <div 
                                className="d-flex align-items-center justify-content-center me-3"
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  borderRadius: "50%",
                                  backgroundColor: "#da8535",
                                  color: "white"
                                }}
                              >
                                <BsMagic size={24} />
                              </div>
                              <div className="flex-grow-1">
                                <h6 className="fw-semibold mb-1" style={{ color: "#121212" }}>
                                  AI Resume Builder
                                </h6>
                                <p className="mb-0" style={{ color: "#666", fontSize: "0.9rem" }}>
                                  Create a professional resume from scratch with our AI assistant
                                </p>
                              </div>
                              <BsArrowRight style={{ color: "#007674" }} />
                            </div>
                          </div>
                        </div>

                        {/* Continue Button */}
                        <div className="text-center">
                          <button
                            className="login-button border-0 px-5 py-3 fw-bold"
                            style={{
                              fontSize: "1.1rem",
                              borderRadius: "50px",
                              background: "#007674",
                              color: "#fff",
                              transition: "0.3s background-color",
                              opacity: uploadedFile ? 1 : 0.6,
                              cursor: uploadedFile ? "pointer" : "not-allowed"
                            }}
                            onClick={handleContinue}
                            disabled={loading || !uploadedFile}
                            onMouseEnter={(e) => {
                              if (uploadedFile) {
                                e.target.style.backgroundColor = "#121212";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (uploadedFile) {
                                e.target.style.backgroundColor = "#007674";
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
                                Processing...
                              </div>
                            ) : (
                              <>
                                Continue to Next Step
                                <BsArrowRight className="ms-2" size={20} />
                              </>
                            )}
                          </button>
                          
                          {!uploadedFile && (
                            <p className="mt-2 mb-0" style={{ color: "#666", fontSize: "0.85rem" }}>
                              Please upload a resume or use AI Builder to continue
                            </p>
                          )}
                        </div>
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

export default ResumeImport;
