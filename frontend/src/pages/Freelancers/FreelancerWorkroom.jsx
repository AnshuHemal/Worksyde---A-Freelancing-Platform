import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BsThreeDots,
  BsCurrencyRupee,
  BsUpload,
  BsFileEarmarkPdf,
  BsX,
} from "react-icons/bs";
import { motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = "http://localhost:5000/api/auth";

const FreelancerWorkroom = () => {
  const { acceptedjobofferId } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitTitle, setSubmitTitle] = useState("");
  const [submitDesc, setSubmitDesc] = useState("");
  const [submitPdfLink, setSubmitPdfLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("full");
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const refreshContract = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/accepted-job-offer/${acceptedjobofferId}/`,
        { withCredentials: true }
      );
      if (response.data?.success) {
        const contractData = response.data.contract;
        const originalProjectAmount = parseFloat(
          contractData.financials?.projectPrice ||
            contractData.projectAmount ||
            0
        );
        const inEscrow = parseFloat(contractData.financials?.inEscrow || 0);
        const milestonesPaid = parseFloat(
          contractData.financials?.milestonesPaid || 0
        );
        const totalEarnings = parseFloat(
          contractData.financials?.totalEarnings || 0
        );
        const progressPercentage =
          originalProjectAmount > 0
            ? (milestonesPaid / originalProjectAmount) * 100
            : 0;
        const processedContractData = {
          ...contractData,
          financials: {
            ...contractData.financials,
            projectAmount: originalProjectAmount,
            inEscrow,
            milestonesPaid,
            totalEarnings,
            progressPercentage,
          },
        };
        setContract(processedContractData);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    const fetchContractDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_URL}/accepted-job-offer/${acceptedjobofferId}/`,
          { withCredentials: true }
        );

        if (response.data?.success) {
          const contractData = response.data.contract;

          // Ensure we have client details
          if (contractData) {
            console.log("Contract data:", contractData);

            // Process financial data
            console.log("Raw financial data:", contractData.financials);

            // Get the original project amount from the contract
            const originalProjectAmount = parseFloat(
              contractData.financials?.projectPrice ||
                contractData.projectAmount ||
                0
            );
            const inEscrow = parseFloat(contractData.financials?.inEscrow || 0);
            const milestonesPaid = parseFloat(
              contractData.financials?.milestonesPaid || 0
            );
            const totalEarnings = parseFloat(
              contractData.financials?.totalEarnings || 0
            );

            console.log("Original project amount:", originalProjectAmount);
            console.log("In escrow:", inEscrow);
            console.log("Milestones paid:", milestonesPaid);

            // Calculate progress percentage
            const progressPercentage =
              originalProjectAmount > 0
                ? (milestonesPaid / originalProjectAmount) * 100
                : 0;

            // Update contract data with processed financials
            const processedContractData = {
              ...contractData,
              financials: {
                ...contractData.financials,
                projectAmount: originalProjectAmount, // Use the original project amount
                inEscrow,
                milestonesPaid,
                totalEarnings,
                progressPercentage,
              },
            };

            setContract(processedContractData);
          } else {
            throw new Error("No contract data received");
          }
        } else {
          throw new Error("Failed to load contract details");
        }
      } catch (err) {
        console.error("Error fetching contract details:", err);
        setError("Failed to load contract details");
      } finally {
        setLoading(false);
      }
    };

    if (acceptedjobofferId) {
      fetchContractDetails();
    }
  }, [acceptedjobofferId]);

  const handleSubmitWork = () => {
    setShowSubmitModal(true);
  };

  const handleCloseModal = () => {
    setShowSubmitModal(false);
    setPaymentAmount("full");
    setCustomAmount("");
    setMessage("");
    setSelectedFile(null);
    setSubmitTitle("");
    setSubmitDesc("");
    setSubmitPdfLink("");
  };
  const handleSubmitProject = async () => {
    if (!message.trim() && !selectedFile) {
      toast.error("Add a message or attach a file");
      return;
    }
    try {
      setSubmitting(true);
      const form = new FormData();
      form.append("acceptedOfferId", acceptedjobofferId);
      form.append("title", "Work submission");
      form.append("description", message || "");
      if (selectedFile) form.append("pdfFile", selectedFile);
      await axios.post(`${API_URL}/submissions/submit/`, form, { withCredentials: true });
      toast.success("Submission sent to client");
      handleCloseModal();
      const res = await axios.get(`${API_URL}/accepted-job-offer/${acceptedjobofferId}/`, { withCredentials: true });
      if (res.data?.success) setContract(res.data.contract);
    } catch (e) {
      toast.error("Failed to submit work");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitPayment = () => {
    handleSubmitProject();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.size <= 25 * 1024 * 1024) {
      // 25MB limit
      setSelectedFile(file);
    } else {
      toast.error("File size must be less than 25MB");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
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
      if (file.size <= 25 * 1024 * 1024) {
        // 25MB limit
        setSelectedFile(file);
      } else {
        toast.error("File size must be less than 25MB");
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#ffffff",
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 20,
              height: 20,
              border: "2px solid #e5e7eb",
              borderTop: "2px solid #007674",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          Loading contract details...
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#ffffff",
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div style={{ color: "#dc2626", fontSize: 18 }}>
          {error || "Contract not found"}
        </div>
      </div>
    );
  }

  return (
    <div
      className="section-container"
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        paddingTop: "30px",
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 32px" }}>
        {/* Header with Project Info */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <div style={{ flex: 1 }}>
            {/* Client Info */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#007674",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                {contract.client?.name?.charAt(0) ||
                  contract.clientName?.charAt(0) ||
                  "C"}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: "#121212",
                    marginBottom: 2,
                  }}
                >
                  {contract.client?.name || contract.clientName || "Client"}
                </div>
                <div
                  style={{
                    fontSize: 16,
                    color: "#121212",
                  }}
                >
                  {contract.client?.location &&
                  contract.client.location !== "Location not specified"
                    ? contract.client.location
                    : "INDIA"}{" "}
                  ·{" "}
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  {new Date().toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>

            {/* Page Title */}
            <h1
              style={{
                fontSize: 34,
                fontWeight: 600,
                color: "#000000",
                letterSpacing: 0.3,
                margin: 0,
                marginTop: 22,
              }}
            >
              {contract.projectTitle || "Project"}
            </h1>
          </div>

          {/* Right - More Options */}
          <button
            style={{
              background: "transparent",
              border: "none",
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#6b7280",
            }}
          >
            <BsThreeDots size={20} />
          </button>
        </div>

        {/* Main Content - Two Column Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 32,
            marginBottom: 32,
          }}
        >
          {/* Left Panel - Milestone Timeline */}
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 24,
              marginBottom: 24,
              border: "1px solid #e9ecef",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <h2
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: "#000000",
                letterSpacing: 0.3,
                margin: "0 0 24px 0",
              }}
            >
              {contract.financials?.paymentType === "fixed_price"
                ? "Fixed Project Timeline"
                : "Milestone Timeline"}
            </h2>

            {/* Milestone Entry */}
            <div
              style={{
                display: "flex",
                gap: 16,
                marginBottom: 24,
              }}
            >
              {/* Timeline Circle */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "#007674",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 18,
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  {contract.financials?.paymentType === "fixed_price"
                    ? "✓"
                    : contract.financials?.milestonesCount || 1}
                </div>
                <div
                  style={{
                    width: 2,
                    height: 60,
                    background: "#e5e7eb",
                  }}
                ></div>
              </div>

              {/* Milestone Content */}
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: "#000000",
                    letterSpacing: 0.2,
                    margin: "0 0 12px 0",
                  }}
                >
                  {contract.financials?.paymentType === "fixed_price"
                    ? "Project Completion"
                    : contract.contractDetails?.workDescription
                    ? "Project Milestone"
                    : "Half way through build"}
                </h3>

                <p
                  style={{
                    fontSize: 16,
                    color: "#374151",
                    lineHeight: 1.6,
                    margin: "0 0 16px 0",
                  }}
                >
                  {contract.contractDetails?.workDescription ||
                    "Hello, I need help building a new website to sell art online. We will need pages created for up to 10 different artists with their paintings displayed on each page, with their product dimensions and prices. Ideally we would like an online shopping cart attached. It is going to be fairly basic to start with but we just want to get something up and running but looks contemporary and sleek and modern. Can you help"}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      color: "#000000",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <BsCurrencyRupee size={16} />
                    {(
                      contract.financials?.estimatedFreelancerPayout ??
                      Math.max(
                        0,
                        (contract.financials?.projectAmount ?? 0) -
                          ((contract.financials?.freelancerFee ?? ((contract.financials?.freelancerFeePercent ?? 10) / 100 * (contract.financials?.projectAmount ?? 0))))
                      )
                    ).toFixed(2)}
                  </span>
                  <span
                    style={{
                      background: "#007674",
                      color: "white",
                      padding: "4px 12px",
                      borderRadius: 20,
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {contract.financials?.paymentType === "fixed_price"
                      ? "Fixed Price Project"
                      : "Active & Funded"}
                  </span>
                </div>

                <button
                  onClick={handleSubmitWork}
                  style={{
                    background:
                      "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                    color: "#fff",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: 600,
                    border: "none",
                    padding: "12px 20px",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(0, 118, 116, 0.3)",
                    cursor: "pointer",
                    marginBottom: 16,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background =
                      "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow =
                      "0 6px 16px rgba(18, 18, 18, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background =
                      "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow =
                      "0 4px 12px rgba(0, 118, 116, 0.3)";
                  }}
                >
                  Submit Work
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Earnings */}
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 24,
              marginBottom: 24,
              border: "1px solid #e9ecef",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              height: "fit-content",
            }}
          >
            <h2
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: "#000000",
                letterSpacing: 0.3,
                margin: "0 0 24px 0",
              }}
            >
              Earnings
            </h2>

            {/* Progress Bar */}
            <div
              style={{
                width: "100%",
                height: 8,
                background: "#e5e7eb",
                borderRadius: 4,
                marginBottom: 24,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${contract.financials?.progressPercentage || 0}%`,
                  height: "100%",
                  background: "#007674",
                  borderRadius: 4,
                  transition: "width 0.3s ease",
                }}
              ></div>
            </div>

            {/* Earnings Breakdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: "#000000",
                  }}
                ></div>
                <span
                  style={{
                    fontSize: 16,
                    color: "#374151",
                  }}
                >
                  Received
                </span>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#000000",
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <BsCurrencyRupee size={14} />
                  {contract.financials?.milestonesPaid?.toFixed(2) || "0.00"}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: "#007674",
                  }}
                ></div>
                <span
                  style={{
                    fontSize: 16,
                    color: "#374151",
                  }}
                >
                  Funded (Worksyde Wallet)
                </span>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#000000",
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <BsCurrencyRupee size={14} />
                  {(contract.financials?.projectAmount ?? 0).toFixed(2)}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: "#6b7280",
                  }}
                ></div>
                <span
                  style={{
                    fontSize: 16,
                    color: "#374151",
                  }}
                >
                  Project Price (Client Subtotal)
                </span>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#000000",
                    marginLeft: "auto",
                    border: "2px solid #007674",
                    borderRadius: 4,
                    padding: "2px 8px",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <BsCurrencyRupee size={14} />
                  {(contract.financials?.projectAmount ?? 0).toFixed(2)}
                </span>
              </div>

              {/* Estimated Payout Row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 8,
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: "#059669",
                  }}
                ></div>
                <span
                  style={{
                    fontSize: 16,
                    color: "#374151",
                  }}
                >
                  Estimated Freelancer Payout
                </span>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#059669",
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <BsCurrencyRupee size={14} />
                  {(
                    contract.financials?.estimatedFreelancerPayout ??
                    Math.max(
                      0,
                      (contract.financials?.projectAmount ?? 0) -
                        ((contract.financials?.freelancerFee ?? ((contract.financials?.freelancerFeePercent ?? 10) / 100 * (contract.financials?.projectAmount ?? 0))))
                    )
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Recent files card (below Earnings) */}
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 24,
              marginBottom: 24,
              border: "1px solid #e9ecef",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              height: "fit-content",
            }}
          >
            {/* Header row with title and refresh */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: "#000000",
                  letterSpacing: 0.3,
                  margin: 0,
                }}
              >
                Recent files
              </h2>
              <div
                title="Refresh"
                style={{
                  width: 34,
                  height: 34,
                  border: "2px solid #e5e7eb",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#007674",
                  background: "#fff",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  cursor: "pointer",
                }}
                onClick={refreshContract}
              >
                ↻
              </div>
            </div>

            {contract?.recentFiles?.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {contract.recentFiles.map((file) => (
                  <div key={file.id}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                      padding: 14,
                      background: "#fafafa",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700, color: "#111827", fontSize: 16 }}>{file.title || "Submission"}</span>
                      <span style={{ marginLeft: "auto", fontSize: 12, padding: "2px 8px", borderRadius: 999, background: file.status === 'Completed' ? '#d1fae5' : file.status === 'Changes Requested' ? '#fee2e2' : '#e5e7eb', color: '#111827' }}>{file.status || 'Pending'}</span>
                    </div>
                    {file.description ? (
                      <div style={{ color: "#374151", fontSize: 14, marginTop: 6 }}>{file.description}</div>
                    ) : null}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, color: "#6b7280", fontSize: 12 }}>
                      <span>{file.createdAt ? new Date(file.createdAt).toLocaleString() : ''}</span>
                      {file.pdfLink ? (
                        <a href={file.pdfLink} target="_blank" rel="noreferrer" style={{ color: "#007674", textDecoration: "none" }}>View PDF</a>
                      ) : null}
                    </div>
                    {Array.isArray(file.comments) && file.comments.length ? (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ fontSize: 12, color: "#111827", fontWeight: 600, marginBottom: 4 }}>Feedback</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {file.comments.map((c, idx) => (
                            <div key={idx} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 8, color: "#374151", fontSize: 13 }}>
                              {c.text}
                              <div style={{ color: "#9ca3af", fontSize: 11, marginTop: 4 }}>{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 0" }}>
                  <div style={{ width: 120, height: 80, background: "linear-gradient(0deg,#007674,#005a58)", borderRadius: 8, position: "relative", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                    <div style={{ position: "absolute", left: 10, top: -14, width: 86, height: 28, background: " #007674", borderRadius: "6px 6px 0 0", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }} />
                  </div>
                </div>
                <div style={{ color: "#6b7280", fontSize: 14, textAlign: "center", lineHeight: 1.6 }}>
                  Files shared in messages, work submissions, or as part of the requirements, will be shown here
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Submit Work Modal */}
      {showSubmitModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={handleCloseModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, type: "spring", damping: 25 }}
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "24px",
              width: "100%",
              maxWidth: "800px",
              maxHeight: "90vh",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
              border: "1px solid #e6e6e6",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: "600",
                  letterSpacing: 0.2,
                  color: "#1a1a1a",
                }}
              >
                Submit work for payment
              </h3>
              <motion.button
                onClick={handleCloseModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  color: "#666",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
                whileHover={{
                  color: "#1a1a1a",
                  background: "#f8f9fa",
                }}
                whileTap={{ scale: 0.95 }}
              >
                ×
              </motion.button>
            </div>

            {/* Modal Body */}
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#000000",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <BsCurrencyRupee size={16} />
                  {(
                    contract.financials?.estimatedFreelancerPayout ??
                    Math.max(
                      0,
                      (contract.financials?.projectAmount ?? 0) -
                        ((contract.financials?.freelancerFee ?? ((contract.financials?.freelancerFeePercent ?? 10) / 100 * (contract.financials?.projectAmount ?? 0))))
                    )
                  ).toFixed(2)}
                </span>
                <span
                  style={{
                    background: "#007674",
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  Active & Funded
                </span>
              </div>

              {/* Removed Title, Description, PDF Link as per request. Use Message + optional file below. */}
            </div>

            {/* Payment Request Section */}
            <div style={{ marginBottom: "24px" }}>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#000000",
                  margin: "0 0 16px 0",
                  letterSpacing: 0.2,
                }}
              >
                Request a payment for this milestone
              </h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="paymentAmount"
                    value="full"
                    checked={paymentAmount === "full"}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    style={{ accentColor: "#007674" }}
                  />
                  <span
                    style={{
                      fontSize: "18px",
                      color: "#000000",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <BsCurrencyRupee size={16} />
                    {(
                      contract.financials?.estimatedFreelancerPayout ??
                      Math.max(
                        0,
                        (contract.financials?.projectAmount ?? 0) -
                          ((contract.financials?.freelancerFee ?? ((contract.financials?.freelancerFeePercent ?? 10) / 100 * (contract.financials?.projectAmount ?? 0))))
                      )
                    ).toFixed(2)}
                  </span>
                </label>

                {/* <label style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer"
                }}>
                  <input
                    type="radio"
                    name="paymentAmount"
                    value="custom"
                    checked={paymentAmount === "custom"}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    style={{ accentColor: "#007674" }}
                  />
                  <span style={{ fontSize: "16px", color: "#000000" }}>
                    Another amount
                  </span>
                </label> */}

                {paymentAmount === "custom" && (
                  <div style={{ marginLeft: "28px" }}>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      style={{
                        width: "100%",
                        maxWidth: "200px",
                        padding: "12px 16px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "16px",
                        outline: "none",
                        transition: "border-color 0.2s ease",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#007674";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#d1d5db";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Message Section */}
            <div style={{ marginBottom: "24px" }}>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#000000",
                  margin: "0 0 12px 0",
                  letterSpacing: 0.2,
                }}
              >
                Message to {contract.client?.name || "Client"}
              </h3>

              <textarea
                placeholder="Describe your work..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "18px",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                  boxSizing: "border-box",
                  minHeight: "100px",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#007674";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#d1d5db";
                }}
              />
            </div>

            {/* File Attachment Section */}
            <div style={{ marginBottom: "32px" }}>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#000000",
                  margin: "0 0 12px 0",
                  letterSpacing: 0.2,
                }}
              >
                Include a file (optional)
              </h3>

              <div
                style={{
                  border: `2px dashed ${dragActive ? "#007674" : "#dee2e6"}`,
                  borderRadius: "12px",
                  padding: "24px",
                  textAlign: "center",
                  backgroundColor: dragActive ? "#f8f9fa" : "transparent",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
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
                <h6
                  style={{
                    fontWeight: 600,
                    marginBottom: "8px",
                    color: "#121212",
                    fontSize: "16px",
                  }}
                >
                  Drop your file here or click to browse
                </h6>
                <p
                  style={{
                    margin: 0,
                    color: "#666",
                    fontSize: "14px",
                  }}
                >
                  Maximum file size: 25MB • All formats supported
                </p>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="*/*"
                onChange={handleFileChange}
              />

              {/* File Preview */}
              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginTop: "12px",
                    padding: "12px",
                    borderRadius: "8px",
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e3e3e3",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <BsFileEarmarkPdf
                        size={24}
                        style={{ color: "#007674", marginRight: "10px" }}
                      />
                      <div>
                        <h6
                          style={{
                            fontWeight: 600,
                            margin: "0 0 4px 0",
                            color: "#121212",
                            fontSize: "14px",
                          }}
                        >
                          {selectedFile.name}
                        </h6>
                        <small style={{ color: "#666", fontSize: "12px" }}>
                          {formatFileSize(selectedFile.size)}
                        </small>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      style={{
                        backgroundColor: "#fff",
                        border: "1px solid #e3e3e3",
                        color: "#666",
                        borderRadius: "50%",
                        width: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#f8f9fa";
                        e.target.style.color = "#dc2626";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#fff";
                        e.target.style.color = "#666";
                      }}
                    >
                      <BsX size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <motion.button
                onClick={handleCloseModal}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  background: "none",
                  color: "#007674",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  borderRadius: "6px",
                  transition: "all 0.2s ease",
                }}
                whileHover={{
                  background: "#f8f9fa",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleSubmitPayment}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  background: "#007674",
                  color: "#fff",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  borderRadius: "6px",
                  transition: "all 0.2s ease",
                }}
                whileHover={{
                  background: "#005a58",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Submit
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default FreelancerWorkroom;

