import React, { useEffect, useRef, useState } from "react";
import innovate from "../../assets/innovate.svg";
import { HiOutlineDocumentCurrencyRupee } from "react-icons/hi2";
import { IoCalendarOutline, IoDocumentAttach } from "react-icons/io5";
import toast from "react-hot-toast";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { BsArrowLeft, BsUpload, BsX, BsCheckCircle } from "react-icons/bs";
import Header1 from "../../components/Header1";

const JobProposalEdit = () => {
  const location = useLocation();
  const { jobId: routeJobId } = useParams();
  const pathParts = location.pathname.split("/");

  // Extract proposal ID from state (passed from JobProposalSubmit)
  let jobProposalId = location.state?.jobProposalId;
  
  // Fallback: try to get proposal ID from URL if not in state
  if (!jobProposalId && pathParts.length >= 4) {
    const possibleProposalId = pathParts[3];
    if (/^[a-fA-F0-9]{24}$/.test(possibleProposalId)) {
      jobProposalId = possibleProposalId;
    }
  }
  
  // Additional fallback: if we're coming from /ws/proposals/:proposalId, extract from current URL
  if (!jobProposalId && pathParts.length >= 4 && pathParts[2] === "proposals") {
    const possibleProposalId = pathParts[3];
    if (/^[a-fA-F0-9]{24}$/.test(possibleProposalId)) {
      jobProposalId = possibleProposalId;
    }
  }
  
  // Fallback: try to get proposal ID from URL query parameters
  if (!jobProposalId) {
    const urlParams = new URLSearchParams(location.search);
    const queryProposalId = urlParams.get('proposalId');
    if (queryProposalId && /^[a-fA-F0-9]{24}$/.test(queryProposalId)) {
      jobProposalId = queryProposalId;
    }
  }
  
  // Extract job ID from route parameter (remove ~ prefix if present)
  const jobId = routeJobId && routeJobId.startsWith("~") ? routeJobId.slice(1) : routeJobId;

  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proposalLoading, setProposalLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [scopeOfWork, setScopeOfWork] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [serviceFee, setServiceFee] = useState(0);
  const [youReceive, setYouReceive] = useState(0);
  const [projectDuration, setProjectDuration] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [milestones, setMilestones] = useState([
    { title: "", dueDate: "", amount: "" }, // First milestone (non-removable)
  ]);

  // Debug state changes removed in production

  const [showFirstModal, setShowFirstModal] = useState(false);
  const [showSecondModal, setShowSecondModal] = useState(false);
  const [acceptFirstPolicy, setAcceptFirstPolicy] = useState(false);
  const [acceptSecondPolicy, setAcceptSecondPolicy] = useState(false);

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

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/jobposts/fetchJobById?jobId=${jobId}`
        );
        
        if (response.data.success) {
        setJobData(response.data.data);
        } else {
          console.error("Job fetch failed:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching job post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  useEffect(() => {
    const fetchProposalDetails = async () => {
      let proposal = null;
      
      if (!jobProposalId) {
        console.error("No proposal ID found");
        toast.error("Proposal ID not found. Please check the URL.");
        return;
      }
      
      if (!user || !user._id) {
        
        return;
      }
      
      if (!/^[a-fA-F0-9]{24}$/.test(jobProposalId)) {
        console.error("Invalid proposal ID format:", jobProposalId);
        toast.error("Invalid proposal ID format.");
        return;
      }

      setProposalLoading(true);
      try {
        
        // Try the direct API call first
        try {
          const res = await axios.post(`${API_URL}/jobproposalsbyid/fetch/`, {
            userId: user._id,
            jobProposalId,
          });

          if (res.data && res.data.success) {
            proposal = res.data.data;
          }
        } catch (directError) {
          // ignore and fallback
        }

        // Fallback: fetch all proposals and find the specific one
        if (!proposal) {
          try {
            const allProposalsRes = await axios.get(`${API_URL}/jobproposals/freelancer/`, {
              withCredentials: true,
            });

            if (allProposalsRes.data && allProposalsRes.data.success && allProposalsRes.data.proposals) {
              const foundProposal = allProposalsRes.data.proposals.find(
                p => p.id === jobProposalId
              );

              if (foundProposal) {
                proposal = foundProposal;
              } else {
                console.error("Proposal not found in all proposals list");
                toast.error("Proposal not found. Please check the URL.");
                return;
              }
            }
          } catch (fallbackError) {
            console.error("Fallback approach also failed:", fallbackError);
            toast.error("Failed to fetch proposal details. Please try again.");
            return;
          }
        }

        if (!proposal) {
          toast.error("Could not fetch proposal details");
          return;
        }

        

        // Pre-fill the states with proper data handling
        const scopeValue = proposal.projectScope || "";
        const bidValue = proposal.bidAmount ? parseFloat(proposal.bidAmount) : "";
        const feeValue = proposal.serviceFee ? parseFloat(proposal.serviceFee) : 0;
        const receiveValue = proposal.youReceive ? parseFloat(proposal.youReceive) : 0;
        const durationValue = proposal.projectDuration || "";
        const letterValue = proposal.coverLetter || "";

        setScopeOfWork(scopeValue);
        setBidAmount(bidValue);
        setServiceFee(feeValue);
        setYouReceive(receiveValue);
        setProjectDuration(durationValue);
        setCoverLetter(letterValue);

        // Handle milestones
        if (proposal.projectScope === "By Milestone" && proposal.milestones && proposal.milestones.length > 0) {
          // Convert milestone dates from ISO string to YYYY-MM-DD format for input fields
          const formattedMilestones = proposal.milestones.map(milestone => ({
            title: milestone.title || "",
            dueDate: milestone.dueDate ? new Date(milestone.dueDate).toISOString().split('T')[0] : "",
            amount: milestone.amount ? parseFloat(milestone.amount) : ""
          }));
          setMilestones(formattedMilestones);
        }

        // Handle attachments
        if (proposal.attachment) {
          setUploadedFiles([
            { 
              name: proposal.attachment.split('/').pop() || "attachment.pdf", 
              url: proposal.attachment 
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching job proposal details:", error);
        toast.error("Failed to fetch proposal details. Please try again.");
      } finally {
        setProposalLoading(false);
      }
    };

    fetchProposalDetails();
  }, [jobProposalId, user]);

  const handleContinue = async () => {
    const formData = new FormData();
    formData.append("jobId", jobId);
    formData.append("userId", user._id);
    formData.append("projectScope", scopeOfWork);
    formData.append("bidAmount", bidAmount);
    formData.append("serviceFee", serviceFee);
    formData.append("youReceive", youReceive);
    formData.append("projectDuration", projectDuration);
    formData.append("coverLetter", coverLetter);

    if (scopeOfWork === "By Milestone") {
      formData.append("milestones", JSON.stringify(milestones));
    }

    if (uploadedFiles.length > 0) {
      formData.append("file", uploadedFiles[0]);
    }

    try {
      const response = await axios.post(
        `${API_URL}/jobproposals/create/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const proposalId = response.data?.data?._id;
      toast.success("Proposal submitted successfully!");

      if (proposalId) {
        navigate(`/ws/proposals/${proposalId}`);
      } else {
        toast.error("Proposal submitted but could not redirect.");
      }
    } catch (err) {
      console.error("Error submitting proposal:", err);
      toast.error("Failed to submit proposal.");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0]; // Only one file
    if (!file) return;

    const isPDF = file.type === "application/pdf";
    const isSizeValid = file.size <= 50 * 1024 * 1024;

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

  const handleAddMilestone = () => {
    setMilestones([...milestones, { title: "", dueDate: "", amount: "" }]);
  };

  const handleRemoveMilestone = (index) => {
    const updated = [...milestones];
    updated.splice(index, 1);
    setMilestones(updated);

    const totalAmount = updated.reduce(
      (sum, m) => sum + (parseFloat(m.amount) || 0),
      0
    );
    setBidAmount(totalAmount);
    const fee = totalAmount * 0.1;
    setServiceFee(fee);
    setYouReceive(totalAmount - fee);
  };

  const handleBidAmountChange = (e) => {
    const value = e.target.value;
    setBidAmount(value);

    const fee = value ? value * 0.1 : 0;
    setServiceFee(fee);
    setYouReceive(value ? value - fee : 0);
  };

  const handleMilestoneChange = (index, field, value) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);

    // Recalculate total bid amount if milestone amounts change
    if (field === "amount") {
      const totalAmount = updated.reduce(
        (sum, m) => sum + (parseFloat(m.amount) || 0),
        0
      );
      setBidAmount(totalAmount);
      const fee = totalAmount * 0.1;
      setServiceFee(fee);
      setYouReceive(totalAmount - fee);
    }
  };

  const formatPostDate = (dateString) => {
    const createdDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (d1, d2) =>
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();

    if (isSameDay(createdDate, today)) {
      return "Today";
    } else if (isSameDay(createdDate, yesterday)) {
      return "Yesterday";
    } else {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(createdDate);
    }
  };

  const handleProposalSubmit = () => {
    if (!scopeOfWork) {
      toast.error("Please select Project Scope.");
      return;
    }

    if (scopeOfWork === "By Milestone") {
      const allMilestonesFilled = milestones.every(
        (m) => m.title.trim() && m.dueDate && m.amount && Number(m.amount) > 0
      );
      if (!allMilestonesFilled) {
        toast.error("Please fill out all milestone fields properly.");
        return;
      }
    }

    if (!bidAmount || Number(bidAmount) <= 0) {
      toast.error("Please enter a Valid Bid Amount.");
      return;
    }

    if (!projectDuration) {
      toast.error("Please select Project Duration.");
      return;
    }

    if (!coverLetter.trim()) {
      toast.error("Please write a cover letter.");
      return;
    }

    setShowFirstModal(true);
  };

  // Test helper removed in production
  const testSetData = () => {};

  // Debug helper removed in production
  const setManualProposalId = () => {};

  // Debug helper removed in production
  const setProposalDataFromAPI = async () => {};

  if (loading || proposalLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center min-vh-100"
        style={{ background: "#fff" }}
      >
        <div className="text-center">
        <div
            className="spinner-border mb-3"
          style={{ color: "#007674" }}
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
          </div>
          <p style={{ color: "#666" }}>
            {loading ? "Loading job details..." : "Loading proposal data..."}
          </p>
        </div>
      </div>
    );
  }

  // Check if we have all required data
  if (!jobData) {
    return (
      <div
        className="d-flex justify-content-center align-items-center min-vh-100"
        style={{ background: "#fff" }}
      >
        <div className="text-center">
          <h5 style={{ color: "#666" }}>Job data not found</h5>
          <p style={{ color: "#999" }}>Unable to load job details for editing</p>
        </div>
      </div>
    );
  }

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
          <div className="row justify-content-center">
            {/* Left: Editable Proposal Form */}
            <div className="col-lg-8 mb-4">
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
                  <h2 className="fw-semibold mb-4" style={{ color: "#121212" }}>
                    Edit Proposal
                  </h2>
                  

                  {/* Section: Terms & Payment */}
                  <h5
                    className="fw-semibold mb-3 mt-4"
                    style={{ color: "#121212" }}
                  >
                    Terms & Payment
                  </h5>
                  <div className="mb-4">
                    <label
                      className="fw-semibold mb-2"
                      style={{ color: "#121212" }}
                    >
                      How do you want to be paid?
                    </label>
                    <div className="d-flex gap-4 flex-wrap">
                      {["By Milestone", "By Project"].map((option) => (
                        <div key={option} className="form-check me-4">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="scope"
                            id={`scope-${option}`}
                            value={option}
                            checked={scopeOfWork === option}
                            onChange={(e) => setScopeOfWork(e.target.value)}
                            style={{
                              accentColor: "#007674",
                              width: 20,
                              height: 20,
                            }}
                          />
                          <label
                            className="form-check-label ms-2"
                            htmlFor={`scope-${option}`}
                            style={{
                              fontWeight: 600,
                              fontSize: "1.1rem",
                              color:
                                scopeOfWork === option ? "#007674" : "#121212",
                            }}
                          >
                            {option}
                          </label>
                          <div
                            className="text-muted ms-4"
                            style={{ fontSize: "0.98rem" }}
                          >
                            {option === "By Milestone"
                              ? "Divide the project into smaller segments, called Milestones. You'll be paid for milestones as they are completed and approved."
                              : "Get your entire payment at the end, when all work has been delivered."}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {scopeOfWork === "By Milestone" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="mb-4"
                    >
                      <h6
                        className="fw-semibold mb-2"
                        style={{ color: "#007674" }}
                      >
                        Add Milestones
                      </h6>
                      <p className="mb-3" style={{ color: "#666" }}>
                        Break the project into stages and define deliverables +
                        payments.
                      </p>
                      {milestones.map((milestone, index) => (
                        <div
                          className="row g-3 align-items-end mb-2"
                          key={index}
                        >
                          <div className="col-md-5">
                            <label className="form-label">
                              Milestone Title
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="E.g. Landing Page UI"
                              value={milestone.title}
                              onChange={(e) =>
                                handleMilestoneChange(
                                  index,
                                  "title",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label">Due Date</label>
                            <input
                              type="date"
                              className="form-control"
                              value={milestone.dueDate}
                              onChange={(e) =>
                                handleMilestoneChange(
                                  index,
                                  "dueDate",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label">Amount (₹)</label>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="e.g. 500"
                              value={milestone.amount}
                              onChange={(e) =>
                                handleMilestoneChange(
                                  index,
                                  "amount",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          {index !== 0 && (
                            <div className="col-md-1 d-flex align-items-end">
                              <button
                                className="btn btn-outline-danger px-2 py-1"
                                style={{ borderRadius: "50%" }}
                                onClick={() => handleRemoveMilestone(index)}
                              >
                                <BsX size={20} />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                      <button
                        className="btn btn-outline-primary mt-2"
                        style={{
                          borderRadius: "25px",
                          color: "#007674",
                          borderColor: "#007674",
                          background:
                            "linear-gradient(135deg, #e8f4f4 0%, #fff 100%)",
                          boxShadow: "0 2px 8px rgba(0, 118, 116, 0.08)",
                          fontWeight: 600,
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          outline: "none",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background =
                            "linear-gradient(135deg, #c6f0f0 0%, #e8f4f4 100%)";
                          e.target.style.boxShadow =
                            "0 6px 20px rgba(0, 118, 116, 0.15)";
                          e.target.style.transform = "scale(1.04)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background =
                            "linear-gradient(135deg, #e8f4f4 0%, #fff 100%)";
                          e.target.style.boxShadow =
                            "0 2px 8px rgba(0, 118, 116, 0.08)";
                          e.target.style.transform = "scale(1)";
                        }}
                        onClick={handleAddMilestone}
                      >
                        + Add Another Milestone
                      </button>
                    </motion.div>
                  )}

                  {/* Bid, Fee, Receive */}
                  <div className="row g-4 mt-4">
                    <div className="col-md-4">
                      <label
                        className="fw-semibold mb-1"
                        style={{ color: "#121212" }}
                      >
                        Bid
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">₹</span>
                        <input
                          type="number"
                          min="200"
                          max="9999"
                          value={bidAmount}
                          onChange={handleBidAmountChange}
                          className="form-control text-end"
                          placeholder="0.00"
                        style={{
                          border: bidAmount ? "2px solid #007674" : "1px solid #ccc",
                          backgroundColor: bidAmount ? "#f8f9fa" : "#fff"
                        }}
                        />
                      </div>
                      <small className="text-muted">
                        Total amount the client will see on your proposal.
                      </small>
                    </div>
                    <div className="col-md-4">
                      <label
                        className="fw-semibold mb-1"
                        style={{ color: "#121212" }}
                      >
                        10% Service Fee
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">₹</span>
                        <input
                          type="number"
                          value={serviceFee.toFixed(2)}
                          readOnly
                          className="form-control text-end"
                        />
                      </div>
                      <small className="text-muted">
                        This fee is fixed for the life of the contract.
                      </small>
                    </div>
                    <div className="col-md-4">
                      <label
                        className="fw-semibold mb-1"
                        style={{ color: "#121212" }}
                      >
                        You'll Receive
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">₹</span>
                        <input
                          type="number"
                          value={youReceive.toFixed(2)}
                          readOnly
                          className="form-control text-end"
                        />
                      </div>
                      <small className="text-muted">
                        The estimated amount you'll receive after service fees.
                      </small>
                    </div>
                  </div>

                  {/* Project Duration */}
                  <h5
                    className="fw-semibold mb-3 mt-5"
                    style={{ color: "#121212" }}
                  >
                    Project Duration
                  </h5>
                  <div className="mb-4">
                    <label
                      className="fw-semibold mb-2"
                      style={{ color: "#121212" }}
                    >
                      How long will this project take?
                    </label>
                    <select
                      className="form-select"
                      value={projectDuration}
                      onChange={(e) => setProjectDuration(e.target.value)}
                      style={{
                        border: projectDuration ? "2px solid #007674" : "1px solid #ccc",
                        borderRadius: "8px",
                        padding: "10px",
                        fontSize: "1rem",
                        fontWeight: 500,
                        color: "#333",
                        backgroundColor: projectDuration ? "#f8f9fa" : "#fff",
                      }}
                    >
                      <option value="" disabled>
                        Select duration
                      </option>
                      <option value="Less than 1 month">
                        Less than 1 month
                      </option>
                      <option value="1 to 3 months">1 to 3 months</option>
                      <option value="3 to 6 months">3 to 6 months</option>
                      <option value="More than 6 months">
                        More than 6 months
                      </option>
                    </select>
                  </div>

                  {/* Cover Letter & Attachments */}
                  <h5
                    className="fw-semibold mb-3 mt-5"
                    style={{ color: "#121212" }}
                  >
                    Cover Letter & Attachments
                  </h5>
                  <div className="mb-4">
                    <label
                      htmlFor="coverLetter"
                      className="fw-semibold mb-2"
                      style={{ color: "#121212" }}
                    >
                      Cover Letter
                    </label>
                    <textarea
                      id="coverLetter"
                      className="form-control mb-3"
                      rows={7}
                      placeholder="Write your cover letter here..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 500,
                        borderRadius: "12px",
                        border: coverLetter ? "2px solid #007674" : "1.5px solid #e3e3e3",
                        background: coverLetter ? "#f8f9fa" : "#fff",
                      }}
                    />
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <small className="text-muted">
                        {coverLetter.length}/2000 characters
                      </small>
                      {coverLetter.length >= 100 && (
                        <span className="text-success d-flex align-items-center">
                          <BsCheckCircle className="me-1" /> Looks good!
                        </span>
                      )}
                    </div>
                    <label
                      className="fw-semibold mb-2"
                      style={{ color: "#121212" }}
                    >
                      Attachments
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-3 p-4 text-center mb-3`}
                      style={{
                        borderColor: "#dee2e6",
                        backgroundColor: "#f8f9fa",
                        transition: "all 0.3s ease",
                        cursor: "pointer"
                      }}
                      onClick={handleUploadClick}
                    >
                      <BsUpload 
                        size={32} 
                        style={{ color: "#007674", marginBottom: "10px" }}
                      />
                      <h6 className="fw-semibold mb-2" style={{ color: "#121212" }}>
                        Drop your PDF here or click to browse
                      </h6>
                      <p className="mb-0" style={{ color: "#666", fontSize: "0.9rem" }}>
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
                                         {uploadedFiles.map((file, index) => {
                        // Helper function to get file display info
                        const getFileDisplayInfo = (file) => {
                          if (file instanceof File) {
                            // It's a real file object
                            return {
                              name: file.name,
                              size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                              type: 'file'
                            };
                          } else if (typeof file === 'object' && file.url) {
                            // It's a file object with URL (from API)
                            return {
                              name: file.name || file.url.split('/').pop() || "attachment.pdf",
                              size: "PDF Attachment",
                              type: 'url'
                            };
                          } else if (typeof file === 'string') {
                            // It's a URL string
                            return {
                              name: file.split('/').pop() || "attachment.pdf",
                              size: "PDF Attachment",
                              type: 'url'
                            };
                          } else {
                            // Fallback
                            return {
                              name: "Unknown File",
                              size: "Unknown Size",
                              type: 'unknown'
                            };
                          }
                        };

                        const fileInfo = getFileDisplayInfo(file);
                        
                        return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 p-3 rounded d-flex align-items-center justify-content-between"
                        style={{ backgroundColor: "#f8f9fa", border: "1px solid #e3e3e3", maxWidth: 400 }}
                      >
                           <div className="d-flex align-items-center" style={{ flex: 1, cursor: "pointer" }}>
                          <BsUpload size={24} style={{ color: "#007674", marginRight: "10px" }} />
                             <div 
                               onClick={() => {
                                 // Handle file opening based on type
                                 if (fileInfo.type === 'url' && file.url) {
                                   // For API files, open the URL
                                   window.open(file.url, '_blank');
                                 } else if (file instanceof File) {
                                   // For uploaded files, create object URL
                                   const objectUrl = URL.createObjectURL(file);
                                   window.open(objectUrl, '_blank');
                                   // Clean up the object URL after a delay
                                   setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
                                 }
                               }}
                               style={{ 
                                 cursor: "pointer",
                                 transition: "color 0.2s ease"
                               }}
                               onMouseEnter={(e) => {
                                 e.target.style.color = "#007674";
                               }}
                               onMouseLeave={(e) => {
                                 e.target.style.color = "#121212";
                               }}
                             >
                            <h6 className="fw-semibold mb-1" style={{ color: "#121212" }}>
                                 {fileInfo.name}
                            </h6>
                            <small style={{ color: "#666" }}>
                                 {fileInfo.size}
                            </small>
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
                      </motion.div>
                       );
                     })}
                    {!uploadedFiles.length && (
                      <p className="mt-2 mb-0" style={{ color: "#666", fontSize: "0.85rem" }}>
                        Please upload a PDF file to attach to your proposal.
                      </p>
                    )}
                  </div>

                  {/* Submit/Cancel */}
                  <div className="d-flex gap-3 align-items-center mt-4">
                    <button
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
                      onClick={handleProposalSubmit}
                      onMouseEnter={(e) => {
                        e.target.style.background =
                          "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow =
                          "0 8px 25px rgba(18, 18, 18, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background =
                          "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow =
                          "0 6px 20px rgba(0, 118, 116, 0.3)";
                      }}
                    >
                      Submit Proposal
                    </button>
                    <button
                      className="btn btn-outline-secondary px-5 py-3"
                      style={{
                        borderRadius: "50px",
                        fontSize: "1.1rem",
                        color: "#007674",
                        borderColor: "#007674",
                        background:
                          "linear-gradient(135deg, #e8f4f4 0%, #fff 100%)",
                        boxShadow: "0 2px 8px rgba(0, 118, 116, 0.08)",
                        fontWeight: 600,
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        outline: "none",
                      }}
                      onClick={() => navigate(-1)}
                      onMouseEnter={(e) => {
                        e.target.style.background =
                          "linear-gradient(135deg, #c6f0f0 0%, #e8f4f4 100%)";
                        e.target.style.boxShadow =
                          "0 6px 20px rgba(0, 118, 116, 0.15)";
                        e.target.style.transform = "scale(1.04)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background =
                          "linear-gradient(135deg, #e8f4f4 0%, #fff 100%)";
                        e.target.style.boxShadow =
                          "0 2px 8px rgba(0, 118, 116, 0.08)";
                        e.target.style.transform = "scale(1)";
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
            {/* Right: Job Summary, Client Info, Pro Tips */}
            <div className="col-lg-4 sticky-sidebar">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="card border-0 shadow-lg mb-4"
                style={{
                  borderRadius: "25px",
                  background: "#fff",
                  border: "1px solid rgba(0, 118, 116, 0.1)",
                }}
              >
                <div className="card-body p-4">
                  <h5 className="fw-semibold mb-3" style={{ color: "#121212" }}>
                    Job Summary
                  </h5>
                  <div className="mb-3">
                    <h6
                      className="fw-semibold mb-1"
                      style={{ color: "#007674" }}
                    >
                      {jobData.title}
                    </h6>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <IoCalendarOutline
                        size={18}
                        style={{ color: "#007674" }}
                      />
                      <span
                        className="text-muted"
                        style={{ fontSize: "0.98rem" }}
                      >
                        Posted {formatPostDate(jobData.createdAt)}
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <img
                        src={innovate}
                        alt="innovation"
                        style={{ width: 22, height: 22 }}
                      />
                      <span
                        className="text-muted"
                        style={{ fontSize: "0.98rem" }}
                      >
                        {jobData.experienceLevel} • Experience
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <HiOutlineDocumentCurrencyRupee
                        size={18}
                        style={{ color: "#007674" }}
                      />
                      <span
                        className="text-muted"
                        style={{ fontSize: "0.98rem" }}
                      >
                        ₹500.00 • Fixed Price
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <IoCalendarOutline
                        size={18}
                        style={{ color: "#007674" }}
                      />
                      <span
                        className="text-muted"
                        style={{ fontSize: "0.98rem" }}
                      >
                        {jobData.duration}
                      </span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <h6
                      className="fw-semibold mb-2"
                      style={{ color: "#121212" }}
                    >
                      Skills & Expertise
                    </h6>
                    <div className="d-flex flex-wrap gap-2">
                      {jobData.skills.map((skill, i) => (
                        <span key={i} className="skill-tag">
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="card border-0 shadow-lg mb-4"
                style={{
                  borderRadius: "25px",
                  background: "#fff",
                  border: "1px solid rgba(0, 118, 116, 0.1)",
                }}
              >
                <div className="card-body p-4">
                  <h5 className="fw-semibold mb-3" style={{ color: "#121212" }}>
                    Client Info
                  </h5>
                  <div className="mb-2 d-flex align-items-center gap-2">
                    <BsCheckCircle size={18} style={{ color: "#15acec" }} />
                    <span className="fw-semibold" style={{ color: "#15acec" }}>
                      Payment Verified
                    </span>
                  </div>
                  <div className="mb-2 d-flex align-items-center gap-2">
                    <span className="text-muted">Total Spent:</span>
                    <span className="fw-semibold" style={{ color: "#121212" }}>
                      ₹{jobData.totalSpent || 0}+
                    </span>
                  </div>
                  <div className="mb-2 d-flex align-items-center gap-2">
                    <span className="text-muted">Member Since:</span>
                    <span className="fw-semibold" style={{ color: "#121212" }}>
                      {jobData.clientSince || "N/A"}
                    </span>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="card border-0 shadow-lg"
                style={{
                  borderRadius: "25px",
                  background: "#fff",
                  border: "1px solid rgba(0, 118, 116, 0.1)",
                }}
              >
                <div className="card-body p-4">
                  <h5 className="fw-semibold mb-3" style={{ color: "#121212" }}>
                    Pro Tips
                  </h5>
                  <ul
                    className="mb-0"
                    style={{ color: "#666", fontSize: "1rem" }}
                  >
                    <li className="mb-2">
                      Tailor your cover letter to the job requirements
                    </li>
                    <li className="mb-2">
                      Highlight relevant experience and skills
                    </li>
                    <li className="mb-2">
                      Be clear about your process and deliverables
                    </li>
                    <li className="mb-0">
                      Attach work samples to strengthen your proposal
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showFirstModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <button
              className="modal-close"
              onClick={() => setShowFirstModal(false)}
            >
              ×
            </button>
            <h3>Stay safe & build your reputation</h3>
            <ul className="modal-list">
              <li style={{ fontSize: "17px" }}>
                Only accept payment through the platform, ensuring Payment
                Protection.
              </li>
              <li style={{ fontSize: "17px" }}>
                Receiving payment outside violates our{" "}
                <a href="#">user agreement</a> and can result in suspension.
              </li>
            </ul>
            <div className="modal-checkbox">
              <input
                type="checkbox"
                id="policyAgree"
                checked={acceptFirstPolicy}
                onChange={(e) => setAcceptFirstPolicy(e.target.checked)}
              />
              <label htmlFor="policyAgree" style={{ fontSize: "17px" }}>
                I understand and agree to the policies.
              </label>
            </div>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                style={{
                  borderRadius: "50px",
                  fontSize: "1.05rem",
                  color: "#007674",
                  border: "1.5px solid #007674",
                  background: "linear-gradient(135deg, #e8f4f4 0%, #fff 100%)",
                  fontWeight: 600,
                  padding: "10px 32px",
                  marginRight: "10px",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                onClick={() => setShowFirstModal(false)}
                onMouseEnter={(e) => {
                  e.target.style.background =
                    "linear-gradient(135deg, #c6f0f0 0%, #e8f4f4 100%)";
                  e.target.style.transform = "scale(1.04)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background =
                    "linear-gradient(135deg, #e8f4f4 0%, #fff 100%)";
                  e.target.style.transform = "scale(1)";
                }}
              >
                Cancel
              </button>
              <button
                className={`submit-btn ${acceptFirstPolicy ? "active" : ""}`}
                style={{
                  borderRadius: "50px",
                  fontSize: "1.05rem",
                  color: "#fff",
                  background: acceptFirstPolicy
                    ? "linear-gradient(135deg, #007674 0%, #005a58 100%)"
                    : "#ccc",
                  border: "none",
                  fontWeight: 600,
                  padding: "10px 32px",
                  transition: "all 0.3s ease",
                }}
                disabled={!acceptFirstPolicy}
                onClick={() => {
                  setShowFirstModal(false);
                  setShowSecondModal(true);
                }}
                onMouseEnter={(e) => {
                  if (acceptFirstPolicy) {
                    e.target.style.background =
                      "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow =
                      "0 8px 25px rgba(18, 18, 18, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (acceptFirstPolicy) {
                    e.target.style.background =
                      "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                  }
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {showSecondModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <button
              className="modal-close"
              onClick={() => setShowSecondModal(false)}
            >
              ×
            </button>

            <h3>3 things you need to know</h3>
            <p>You're submitting for a fixed-price project...</p>
            <div className="modal-scrollable-content">
              <ol className="modal-list">
                <li>
                  <strong
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#121212",
                    }}
                  >
                    Fixed-price projects have a Dispute Assistance Program
                  </strong>
                  <br />
                  Before you start the project, you and the client must agree to
                  requirements, a budget and milestones. Worksyde charges the
                  client at the beginning of the project, and the money for each
                  milestone will be held securely in project funds.
                </li>
                <li>
                  <strong
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#121212",
                    }}
                  >
                    Project Funds are released when the client approves work.
                  </strong>
                  <br />
                  When milestones are completed, the client can either approve
                  work or request modifications to the work. Clients can also
                  request that you approve the return of funds held.
                </li>
                <li>
                  <strong
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#121212",
                    }}
                  >
                    Worksyde offers mediation services
                  </strong>
                  <br />
                  If you do the work and the client refuses to pay, Worksyde can
                  help mediate the dispute.
                </li>
              </ol>
              <p>
                <strong
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#121212",
                  }}
                >
                  Please note:
                </strong>{" "}
                Only funds deposited for an active milestone are covered by
                Dispute Assistance.
              </p>
              <div className="modal-sticky-footer">
                <div className="modal-checkbox">
                  <input
                    type="checkbox"
                    id="finalAgree"
                    checked={acceptSecondPolicy}
                    onChange={(e) => setAcceptSecondPolicy(e.target.checked)}
                  />
                  <label htmlFor="finalAgree">Yes, I understand.</label>
                </div>
                <div className="modal-actions">
                  <button
                    className="cancel-btn"
                    style={{
                      borderRadius: "50px",
                      fontSize: "1.05rem",
                      color: "#007674",
                      border: "1.5px solid #007674",
                      background:
                        "linear-gradient(135deg, #e8f4f4 0%, #fff 100%)",
                      fontWeight: 600,
                      padding: "10px 32px",
                      marginRight: "10px",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                    onClick={() => setShowSecondModal(false)}
                    onMouseEnter={(e) => {
                      e.target.style.background =
                        "linear-gradient(135deg, #c6f0f0 0%, #e8f4f4 100%)";
                      e.target.style.transform = "scale(1.04)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background =
                        "linear-gradient(135deg, #e8f4f4 0%, #fff 100%)";
                      e.target.style.transform = "scale(1)";
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className={`submit-btn ${
                      acceptSecondPolicy ? "active" : ""
                    }`}
                    style={{
                      borderRadius: "50px",
                      fontSize: "1.05rem",
                      color: "#fff",
                      background: acceptSecondPolicy
                        ? "linear-gradient(135deg, #007674 0%, #005a58 100%)"
                        : "#ccc",
                      border: "none",
                      fontWeight: 600,
                      padding: "10px 32px",
                      transition: "all 0.3s ease",
                    }}
                    disabled={!acceptSecondPolicy}
                    onClick={() => {
                      setShowSecondModal(false);
                      handleContinue();
                    }}
                    onMouseEnter={(e) => {
                      if (acceptSecondPolicy) {
                        e.target.style.background =
                          "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow =
                          "0 8px 25px rgba(18, 18, 18, 0.4)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (acceptSecondPolicy) {
                        e.target.style.background =
                          "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "none";
                      }
                    }}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default JobProposalEdit;
