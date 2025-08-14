import React, { useEffect, useRef, useState } from "react";
import Header1 from "../../components/Header1";
import image from "../../assets/project_desc.svg";
import { IoDocumentAttach } from "react-icons/io5";
import { RiChatSmileAiLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { motion } from "framer-motion";
import { BsCheckCircle, BsX } from "react-icons/bs";

const ClientJobDescPage = () => {
  const [userId, setUserId] = useState("");
  const [bioText, setBioText] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [attachmentDetails, setAttachmentDetails] = useState(null);
  const fileInputRef = useRef(null);
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

  const handleBioChange = (e) => {
    setBioText(e.target.value);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0]; // Only one file
    if (!file) return;

    const isPDF = file.type === "application/pdf";
    const isSizeValid = file.size <= 50 * 1024 * 1024; // 50MB

    if (!isPDF || !isSizeValid) {
      toast.error("Only a single PDF file under 50MB is allowed.");
      fileInputRef.current.value = null;
      return;
    }

    setUploadedFiles([file]); // Replace with new file
    fileInputRef.current.value = null;
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
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
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File size must be less than or equal to 50MB.");
        return;
      }
      setUploadedFiles([file]); // Replace with new file
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fetchAttachmentDetails = async (attachmentId) => {
    try {
      const response = await axios.get(`${API_URL}/jobposts/attachments/${attachmentId}/details/`);
      if (response.status === 200) {
        setAttachmentDetails(response.data);
      }
    } catch (error) {
      console.error("Error fetching attachment details:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      // Get the job ID
      const jobIdRes = await axios.post(`${API_URL}/jobposts/draft/`, {
        userId,
      });
      const jobId = jobIdRes.data.jobPostId;

      // Create FormData for the upload endpoint
      const formData = new FormData();
      formData.append("jobId", jobId);
      formData.append("description", bioText);

      // Only append file if one is uploaded
      if (uploadedFiles.length > 0 && uploadedFiles[0]) {
        formData.append("file", uploadedFiles[0]);
      }

      // Send to upload endpoint (handles both description and file)
      const response = await axios.post(
        `${API_URL}/upload-attachments/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        // Store attachment details if file was uploaded
        if (response.data.attachmentId) {
          setAttachmentDetails(response.data);
          toast.success("Job description and file uploaded successfully!");
        } else {
          toast.success("Job description saved successfully!");
        }
        navigate("/job-post/instant/review");
      }
      
    } catch (error) {
      console.error("Error saving job description:", error.response?.data || error.message);
      
      // Handle specific error cases
      if (error.response?.data?.message === "No file uploaded") {
        toast.error("Please upload a file or contact support if you don't need to attach a file.");
      } else {
        toast.error("Failed to save job description. Please try again.");
      }
    }
  };

  const MIN_CHARS = 100;
  const MAX_CHARS = 4000;
  const exampleDescs = [
    "We need a React developer to build a responsive dashboard for our SaaS product. The ideal candidate has experience with REST APIs, authentication, and modern UI/UX best practices.",
    "Looking for a content writer to create SEO-optimized blog posts in the fintech space. Must be able to research topics and deliver engaging, well-structured articles.",
    "Seeking a designer to revamp our mobile app's onboarding flow. You should have a strong portfolio in mobile UI/UX and be comfortable working with Figma or Sketch.",
  ];
  const isDescValid = bioText.trim().length >= MIN_CHARS;

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
                          style={{
                            color: "#121212",
                            fontSize: "2rem",
                            letterSpacing: "0.3px",
                          }}
                        >
                          Project Description
                        </h2>
                        <p
                          className="mb-0"
                          style={{
                            fontSize: "1.1rem",
                            color: "#121212",
                            lineHeight: "1.5",
                          }}
                        >
                          Tell freelancers what you need, your goals, and any
                          important details. The more specific, the better!
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Input Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="mb-5"
                  >
                    <div className="mb-3">
                      <label
                        className="form-label fw-semibold"
                        style={{ color: "#121212", fontSize: "1.1rem" }}
                      >
                        What do you need done?
                      </label>
                      <textarea
                        value={bioText}
                        onChange={handleBioChange}
                        className="bio-textarea w-100"
                        placeholder="Describe your project, deliverables, and expectations..."
                        rows="10"
                        maxLength={MAX_CHARS}
                        style={{
                          border: "2px solid #e3e3e3",
                          borderRadius: "15px",
                          padding: "20px 25px",
                          fontSize: "1.1rem",
                          background:
                            "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                          resize: "none",
                        }}
                      />
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <div className="d-flex align-items-center">
                          {bioText.length < MIN_CHARS ? (
                            <span className="text-danger small">
                              At least {MIN_CHARS} characters required
                            </span>
                          ) : (
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
                                Minimum requirement met!
                              </small>
                            </motion.div>
                          )}
                        </div>
                        <small style={{ color: "#666" }}>
                          {bioText.length}/{MAX_CHARS} characters
                        </small>
                      </div>
                      {/* Progress Bar */}
                      <div className="mt-2">
                        <div
                          className="progress"
                          style={{ height: "6px", borderRadius: "10px" }}
                        >
                          <div
                            className={`progress-bar ${
                              bioText.length >= MIN_CHARS
                                ? "bg-success"
                                : "bg-danger"
                            }`}
                            style={{
                              width: `${Math.min(
                                (bioText.length / MIN_CHARS) * 100,
                                100
                              )}%`,
                              borderRadius: "10px",
                              transition: "width 0.3s ease",
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Example Descriptions */}
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
                      Example Descriptions
                    </h5>
                    <div className="row g-3">
                      {exampleDescs.map((example, index) => (
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
                            className="example-bio p-3 rounded-3 border h-100 d-flex align-items-center"
                            style={{
                              backgroundColor: "#fff",
                              borderColor: "#e3e3e3",
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                              minHeight: "120px",
                            }}
                            onClick={() => setBioText(example)}
                            onMouseEnter={(e) => {
                              e.target.style.borderColor = "#007674";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.borderColor = "#e3e3e3";
                            }}
                          >
                            <small
                              style={{
                                color: "#121212",
                                fontSize: "1.1rem",
                                lineHeight: "1.4",
                              }}
                            >
                              {example}
                            </small>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Attach File Section */}
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
                      Attach File (optional)
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
                      <IoDocumentAttach 
                        size={40} 
                        style={{ color: "#007674", marginBottom: "15px" }}
                      />
                      <h6 className="fw-semibold mb-2" style={{ color: "#121212" }}>
                        Drop your PDF file here or click to browse
                      </h6>
                      <p className="mb-0" style={{ color: "#666", fontSize: "1rem" }}>
                        Maximum file size: 50MB • PDF format only
                      </p>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      accept=".pdf"
                      onChange={handleFileChange}
                      multiple={false}
                    />

                    {/* File Preview */}
                    {uploadedFiles.map((file, index) => (
                      <motion.div
                        key={index}
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
                            <IoDocumentAttach 
                              size={24} 
                              style={{ color: "#007674", marginRight: "10px" }}
                            />
                            <div>
                              <h6 className="fw-semibold mb-1" style={{ color: "#121212" }}>
                                {file.name}
                              </h6>
                              <div className="d-flex flex-column">
                                <small style={{ color: "#666" }}>
                                  {formatFileSize(file.size)}
                                </small>
                                <small style={{ color: "#888", fontSize: "0.8rem" }}>
                                  PDF Document
                                </small>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveFile(index)}
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
                    ))}

                    {/* Uploaded Attachment Details (if available) */}
                    {attachmentDetails && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 p-3 rounded"
                        style={{ 
                          backgroundColor: "#e8f5e8",
                          border: "1px solid #28a745"
                        }}
                      >
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <IoDocumentAttach 
                              size={24} 
                              style={{ color: "#28a745", marginRight: "10px" }}
                            />
                            <div>
                              <h6 className="fw-semibold mb-1" style={{ color: "#155724" }}>
                                {attachmentDetails.fileName}
                              </h6>
                              <div className="d-flex flex-column">
                                <small style={{ color: "#155724" }}>
                                  {formatFileSize(attachmentDetails.fileSize)}
                                </small>
                                <small style={{ color: "#28a745", fontSize: "0.8rem" }}>
                                  Successfully uploaded
                                </small>
                              </div>
                            </div>
                          </div>
                          <div className="d-flex align-items-center">
                            <a
                              href={attachmentDetails.jobpostLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm me-2"
                              style={{
                                backgroundColor: "#28a745",
                                border: "none",
                                color: "#fff",
                                fontSize: "0.8rem",
                                padding: "4px 8px"
                              }}
                            >
                              View
                            </a>
                            <button
                              onClick={() => setAttachmentDetails(null)}
                              className="btn btn-sm"
                              style={{
                                backgroundColor: "#fff",
                                border: "1px solid #28a745",
                                color: "#28a745",
                                borderRadius: "50%",
                                width: "24px",
                                height: "24px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.7rem"
                              }}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>

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
                        background: isDescValid
                          ? "linear-gradient(135deg, #007674 0%, #005a58 100%)"
                          : "linear-gradient(135deg, #cccccc 0%, #bbbbbb 100%)",
                        color: "#fff",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        opacity: isDescValid ? 1 : 0.6,
                        cursor: isDescValid ? "pointer" : "not-allowed",
                        boxShadow: isDescValid
                          ? "0 6px 20px rgba(0, 118, 116, 0.3), 0 3px 8px rgba(0, 0, 0, 0.1)"
                          : "0 2px 8px rgba(0, 0, 0, 0.1)",
                      }}
                      onClick={handleSubmit}
                      disabled={!isDescValid}
                      onMouseEnter={(e) => {
                        if (isDescValid) {
                          e.target.style.background =
                            "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                          e.target.style.boxShadow =
                            "0 8px 25px rgba(18, 18, 18, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)";
                          e.target.style.transform = "translateY(-2px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isDescValid) {
                          e.target.style.background =
                            "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                          e.target.style.boxShadow =
                            "0 6px 20px rgba(0, 118, 116, 0.3), 0 3px 8px rgba(0, 0, 0, 0.1)";
                          e.target.style.transform = "translateY(0)";
                        }
                      }}
                    >
                      Finally, Review Your Post
                    </button>
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
                  {/* Why Description Matters */}
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
                        Why a Good Description Matters
                      </h4>
                    </div>
                    <div className="space-y-3">
                      <div className="d-flex align-items-start mb-3">
                        <div>
                          <h6
                            className="fw-semibold mb-1"
                            style={{ color: "#121212" }}
                          >
                            ● Attract the Right Talent
                          </h6>
                          <p className="text-muted small mb-0">
                            Clear, specific descriptions help you get better
                            proposals
                          </p>
                        </div>
                      </div>
                      <div className="d-flex align-items-start mb-3">
                        <div>
                          <h6
                            className="fw-semibold mb-1"
                            style={{ color: "#121212" }}
                          >
                            ● Set Expectations
                          </h6>
                          <p className="text-muted small mb-0">
                            Define deliverables, timelines, and communication
                            style
                          </p>
                        </div>
                      </div>
                      <div className="d-flex align-items-start">
                        <div>
                          <h6
                            className="fw-semibold mb-1"
                            style={{ color: "#121212" }}
                          >
                            ● Stand Out
                          </h6>
                          <p className="text-muted small mb-0">
                            A well-written description makes your project more
                            appealing
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Pro Tips */}
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
                      Pro Tips
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
                        <li className="mb-2">Start with your main goal</li>
                        <li className="mb-2">
                          List deliverables and requirements
                        </li>
                        <li className="mb-2">
                          Mention preferred skills or experience
                        </li>
                        <li className="mb-2">Be concise but specific</li>
                        <li className="mb-0">Invite questions for clarity</li>
                      </ul>
                    </div>
                  </motion.div>

                  {/* Character Guide */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    <div
                      className="p-3 rounded-3"
                      style={{
                        border: "1px solid #e3e3e3",
                      }}
                    >
                      <h6
                        className="fw-semibold mb-2"
                        style={{ color: "#da8535" }}
                      >
                        Character Guide
                      </h6>
                      <div style={{ fontSize: "1.1rem", color: "#121212" }}>
                        <div className="d-flex justify-content-between mb-1">
                          <span>Minimum:</span>
                          <span style={{ color: "#007674", fontWeight: 600 }}>
                            {MIN_CHARS} chars
                          </span>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <span>Optimal:</span>
                          <span style={{ color: "#007674", fontWeight: 600 }}>
                            300-800 chars
                          </span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>Maximum:</span>
                          <span style={{ color: "#007674", fontWeight: 600 }}>
                            {MAX_CHARS} chars
                          </span>
                        </div>
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

export default ClientJobDescPage;
