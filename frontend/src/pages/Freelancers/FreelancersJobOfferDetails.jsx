import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "../../contexts/UserContext";
import { motion } from "framer-motion";
import { BsPaperclip } from "react-icons/bs";
import toast from "react-hot-toast";

const API_URL = "http://localhost:5000/api/auth";

// Utility function to format file size
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const FreelancersJobOfferDetails = () => {
  const { jobofferid } = useParams();
  const { userData } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [jobOffer, setJobOffer] = useState(null);
  const [expandedFixedPrice, setExpandedFixedPrice] = useState(false);
  const [clientData, setClientData] = useState(null);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch job offer details using the correct API endpoint
        const offerResponse = await axios.get(
          `${API_URL}/job-offers/${jobofferid}/`,
          {
            withCredentials: true,
          }
        );

        const offerData = offerResponse.data?.jobOffer || offerResponse.data;

        if (!offerData) {
          throw new Error("No job offer data received");
        }

        setJobOffer(offerData);

        // Auto-redirect if offer is already accepted
        if (offerData.status === "accepted") {
          setRedirecting(true);
          navigate("/ws/proposals");
        }

        // Fetch additional client details if we have clientId
        if (offerData.clientId) {
          try {
            const clientResponse = await axios.get(
              `${API_URL}/client/profile/${offerData.clientId}/`,
              {
                withCredentials: true,
              }
            );
            setClientData(clientResponse.data);
          } catch (clientErr) {
            console.warn("Could not fetch client details:", clientErr);
            // Don't fail the whole request if client details fail
          }
        }

        // Fetch attachment details if attachments exist
        if (offerData.attachments) {
          setLoadingAttachments(true);
          try {
            const attachments = Array.isArray(offerData.attachments)
              ? offerData.attachments
              : [offerData.attachments];

            const detailsPromises = attachments.map(async (attachment) => {
              const details = await fetchAttachmentDetails(attachment);

              // If we don't have file size from backend, try HEAD request
              let fileSize = null;
              if (!details?.fileSize) {
                fileSize = await getFileSizeFromUrl(attachment);
              } else {
                fileSize = details.fileSize;
              }

              return { url: attachment, details, fileSize };
            });

            const attachmentDetailsResults = await Promise.all(detailsPromises);
            const detailsMap = {};
            const sizesMap = {};
            attachmentDetailsResults.forEach(({ url, details, fileSize }) => {
              if (details) {
                detailsMap[url] = details;
              }
              if (fileSize) {
                sizesMap[url] = fileSize;
              }
            });

            setAttachmentDetails(detailsMap);
            setFileSizes(sizesMap);
          } catch (error) {
            console.error("Error fetching attachment details:", error);
          } finally {
            setLoadingAttachments(false);
          }
        }
      } catch (err) {
        console.error("Failed to load job offer", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load job offer"
        );
        setJobOffer(null);
      } finally {
        setLoading(false);
      }
    };

    if (jobofferid) {
      fetchOffer();
    }
  }, [jobofferid]);

  // Enhanced data helpers with better validation and fallbacks
  const formatDate = (dateObj) => {
    if (!dateObj) return "-";
    try {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const d = new Date(dateObj);
      if (isNaN(d.getTime())) return "-";

      const month = months[d.getMonth()];
      const day = d.getDate().toString().padStart(2, "0");
      const year = d.getFullYear();
      return `${month} ${day}, ${year}`;
    } catch (e) {
      return "-";
    }
  };

  // Helpers to resolve milestone due dates from various possible fields
  const normalizeDateInput = (value) => {
    if (!value) return null;
    try {
      if (value instanceof Date) return value.getTime();
      if (typeof value === "number") {
        // Treat 10-digit numbers as seconds
        return value < 1000000000000 ? value * 1000 : value;
      }
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (/^\d{10}$/.test(trimmed)) return parseInt(trimmed, 10) * 1000;
        if (/^\d{13}$/.test(trimmed)) return parseInt(trimmed, 10);
        return value; // Assume parseable date string
      }
      return value;
    } catch (_) {
      return value;
    }
  };

  const getMilestoneOwnDueDate = (milestone) => {
    if (!milestone) return null;
    const raw = (
      milestone?.dueDate ||
      milestone?.due_date ||
      milestone?.deadline ||
      milestone?.endDate ||
      milestone?.end_date ||
      milestone?.due ||
      milestone?.timeline?.dueDate ||
      milestone?.timeline?.due_date ||
      null
    );
    return normalizeDateInput(raw);
  };

  const getMilestoneDisplayDueDate = (milestone) => {
    // Prefer milestone's own due date; fallback to overall job offer due date
    return getMilestoneOwnDueDate(milestone) || getJobOfferDueDate();
  };

  const getJobOfferDueDate = () => {
    const raw = (
      jobOffer?.dueDate ||
      jobOffer?.due_date ||
      jobOffer?.deadline ||
      jobOffer?.endDate ||
      jobOffer?.end_date ||
      null
    );
    return normalizeDateInput(raw);
  };

  // Parse arbitrary amount strings like "$1,234.56" or "1,234" -> number
  const parseAmountToNumber = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === "number") return value;
    if (typeof value !== "string") return 0;
    // remove currency symbols, commas, spaces
    const cleaned = value.replace(/[^0-9.-]/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const formatCurrency = (amount) => {
    const num =
      typeof amount === "number" ? amount : parseAmountToNumber(amount);
    return Number(num).toFixed(2);
  };

  // Enhanced data mapping with comprehensive fallbacks based on backend structure
  const contractTitle =
    jobOffer?.contractTitle ||
    jobOffer?.jobId?.title ||
    "Job title not available";

  const projectAmount =
    jobOffer?.projectAmount ||
    jobOffer?.bidAmount ||
    jobOffer?.amount ||
    jobOffer?.budget ||
    0;

  const jobCategory =
    jobOffer?.jobId?.category ||
    jobOffer?.jobCategory ||
    jobOffer?.category ||
    "General Virtual Assistance";

  const workDescription =
    jobOffer?.workDescription ||
    jobOffer?.description ||
    jobOffer?.jobDescription ||
    "No description provided";

  const attachments = jobOffer?.attachments || null;

  // Handle attachments - could be a single URL or an array
  const attachmentList = Array.isArray(attachments)
    ? attachments
    : attachments
    ? [attachments]
    : [];


  // Enhanced date handling based on backend structure
  const offerDateRaw =
    jobOffer?.createdAt ||
    jobOffer?.offerDate ||
    jobOffer?.createdDate ||
    jobOffer?.dateCreated;

  const offerDate = offerDateRaw ? new Date(offerDateRaw) : new Date();

  // Use the new offerExpires field from backend, fallback to calculated date
  const expiryDateRaw =
    jobOffer?.offerExpires ||
    jobOffer?.dueDate ||
    jobOffer?.offerExpiryDate ||
    jobOffer?.expiresAt ||
    jobOffer?.expiryDate ||
    jobOffer?.validUntil;

  const expiryDate = expiryDateRaw
    ? new Date(expiryDateRaw)
    : new Date(offerDate.getTime() + 7 * 24 * 60 * 60 * 1000);

  const status = (jobOffer?.status || "pending").toString();

  // Current user information
  const currentUserName =
    userData?.firstName || userData?.name || userData?.username || "You";

  // Calculate derived values using sanitized numeric amount
  const projectAmountNumber = parseAmountToNumber(projectAmount);
  const serviceFee = projectAmountNumber * 0.1;
  const netAmount = projectAmountNumber - serviceFee;

  // Accept offer modal state
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [acceptMessage, setAcceptMessage] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState(null);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedDeclineReason, setSelectedDeclineReason] = useState("");
  const [declineMessage, setDeclineMessage] = useState("");
  const [isDeclining, setIsDeclining] = useState(false);
  const [declineError, setDeclineError] = useState(null);
  const [declineSuccess, setDeclineSuccess] = useState(false);
  const [attachmentDetails, setAttachmentDetails] = useState({});
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [fileSizes, setFileSizes] = useState({});
  const [redirecting, setRedirecting] = useState(false);

  const declineReasons = [
    "Rate too low",
    "Timeline too tight",
    "Project scope unclear",
    "Scheduling conflict",
    "Not interested in this type of work",
    "Other",
  ];

  // Function to fetch attachment details
  const fetchAttachmentDetails = async (attachmentUrl) => {
    if (!attachmentUrl) return null;

    try {
      // Extract attachment ID from URL
      const attachmentId = attachmentUrl.split("/").pop()?.split("?")[0];
      if (!attachmentId) return null;

      // Fetch attachment details from the backend
      const response = await axios.get(
        `${API_URL}/jobposts/attachments/${attachmentId}/details/`,
        { withCredentials: true }
      );

      if (response.data && response.data.fileName) {
        return {
          fileName: response.data.fileName,
          fileSize: response.data.fileSize,
          contentType: response.data.contentType,
        };
      }
    } catch (error) {
      console.error("Error fetching attachment details:", error);
    }
    return null;
  };

  // Function to get file size from HEAD request
  const getFileSizeFromUrl = async (url) => {
    try {
      const response = await axios.head(url, { withCredentials: true });
      const contentLength = response.headers["content-length"];
      if (contentLength) {
        return parseInt(contentLength);
      }
    } catch (error) {
      console.error("Error getting file size from URL:", error);
    }
    return null;
  };

  const handleOpenAcceptModal = () => {
    setAcceptError("");
    setShowAcceptModal(true);
  };

  const handleCloseAcceptModal = () => {
    setShowAcceptModal(false);
    setAcceptMessage("");
    setAgreeToTerms(false);
    setAcceptError(null);
  };

  const handleOpenDeclineModal = () => {
    setShowDeclineModal(true);
    setSelectedDeclineReason("");
    setDeclineMessage("");
    setDeclineError(null);
    setDeclineSuccess(false);
  };

  const handleCloseDeclineModal = () => {
    setShowDeclineModal(false);
    setSelectedDeclineReason("");
    setDeclineMessage("");
    setDeclineError(null);
    setDeclineSuccess(false);
  };

  const handleConfirmDecline = async () => {
    if (!selectedDeclineReason) {
      setDeclineError("Please select a reason for declining");
      return;
    }

    setIsDeclining(true);
    setDeclineError(null);

    try {
      const response = await axios.post(
        `${API_URL}/job-offers/${jobofferid}/decline/`,
        {
          declineReason: selectedDeclineReason,
          declineMessage: declineMessage,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Show success message and confirm refund processed
        setDeclineSuccess(true);
        toast.success("Refund processed to client wallet.");
        // Redirect after brief delay to allow visibility
        setTimeout(() => navigate("/ws/proposals"), 1000);
      } else {
        setDeclineError(response.data.message || "Failed to decline offer");
      }
    } catch (error) {
      console.error("Error declining offer:", error);
      setDeclineError(
        error.response?.data?.message ||
          "Error declining offer. Please try again."
      );
    } finally {
      setIsDeclining(false);
    }
  };

  const handleConfirmAccept = async () => {
    if (!agreeToTerms) {
      setAcceptError("Please agree to the terms to continue.");
      return;
    }

    // Validate optional message (if provided, it should be at least 10 characters)
    if (acceptMessage.trim() && acceptMessage.trim().length < 10) {
      setAcceptError(
        "If you provide a message, it should be at least 10 characters long."
      );
      return;
    }

    try {
      setIsAccepting(true);
      setAcceptError("");

      // Calculate dates
      const now = new Date();
      const startDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // Start in 2 days
      const completionDate = new Date(now.getTime() + 32 * 24 * 60 * 60 * 1000); // Complete in 32 days

      // Prepare attachment details to send
      const attachmentDetailsToSend = {};
      if (attachmentList.length > 0) {
        attachmentList.forEach((attachment, index) => {
          const details = attachmentDetails[attachment];
          const fileSize = fileSizes[attachment];

          attachmentDetailsToSend[attachment] = {
            fileName: details?.fileName || `Attachment_${index + 1}`,
            fileSize: details?.fileSize || fileSize || null,
            contentType: details?.contentType || null,
            url: attachment,
          };
        });
      }


      const response = await axios.post(
        `${API_URL}/job-offers/${jobofferid}/accept/`,
        {
          acceptanceMessage:
            acceptMessage.trim() || "No additional message provided",
          expectedStartDate: startDate.toISOString(),
          estimatedCompletionDate: completionDate.toISOString(),
          termsAndConditions: "Standard terms and conditions apply",
          specialRequirements: "None",
          attachmentDetails: attachmentDetailsToSend,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Optimistically update local state
        setJobOffer((prev) => ({
          ...(prev || {}),
          status: "accepted",
          acceptedAt: new Date().toISOString(),
          fundedAmount: response.data?.fundedAmount ?? prev?.fundedAmount ?? 0,
        }));
        handleCloseAcceptModal();
        toast.success("Job Offer accepted.");
        // Redirect immediately
        navigate("/ws/proposals");
      }
    } catch (err) {
      console.error("Error accepting offer:", err);
      const errorMessage =
        err?.response?.data?.message ||
        "Failed to accept the offer. Please try again.";

      // Handle specific error cases
      if (errorMessage.includes("already been accepted")) {
        setAcceptError(
          "This job offer has already been accepted. You will be redirected to your proposals page."
        );
        navigate("/ws/proposals");
      } else if (errorMessage.includes("declined")) {
        setAcceptError(
          "This job offer has been declined and cannot be accepted."
        );
      } else if (errorMessage.includes("expired")) {
        setAcceptError("This job offer has expired and cannot be accepted.");
      } else {
        setAcceptError(errorMessage);
      }
    } finally {
      setIsAccepting(false);
    }
  };

  // Prepare milestones: treat empty or zero-only entries as "no milestones"
  const milestonesArray = Array.isArray(jobOffer?.milestones)
    ? jobOffer.milestones
    : [];
  const validMilestones = milestonesArray.filter((milestone) => {
    const title = (milestone?.title || "").trim();
    const amountNum = parseAmountToNumber(
      milestone?.amount ??
        milestone?.amountValue ??
        milestone?.price ??
        milestone?.budget ??
        milestone?.total ??
        0
    );
    const hasDueDate = Boolean(getMilestoneOwnDueDate(milestone));
    return title.length > 0 || amountNum > 0 || hasDueDate;
  });

  // Enhanced loading state
  if (loading) {
    return (
      <div
        className="section-container"
        style={{ maxWidth: 1400, margin: "60px auto 0 auto", padding: 24 }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px",
            gap: "20px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #007674",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          <div
            style={{ color: "#007674", fontSize: "18px", fontWeight: "500" }}
          >
            Loading job offer details...
          </div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Redirecting state for already accepted offers
  if (redirecting) {
    return (
      <div
        className="section-container"
        style={{ maxWidth: 1400, margin: "60px auto 0 auto", padding: 24 }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px",
            gap: "20px",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              background: "#d4edda",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
              color: "#155724",
            }}
          >
            ✅
          </div>
          <div
            style={{ color: "#155724", fontSize: "24px", fontWeight: "600" }}
          >
            Offer Already Accepted
          </div>
          <div
            style={{ color: "#6c757d", fontSize: "16px", textAlign: "center" }}
          >
            This job offer has already been accepted. Redirecting you to your
            proposals page...
          </div>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #007674",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginTop: "20px",
            }}
          ></div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="section-container"
        style={{ maxWidth: 1400, margin: "60px auto 0 auto", padding: 24 }}
      >
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            backgroundColor: "#fff",
            borderRadius: "8px",
            border: "1px solid #e0e0e0",
          }}
        >
          <div
            style={{ color: "#dc3545", fontSize: "24px", marginBottom: "16px" }}
          >
            ⚠️ Error Loading Job Offer
          </div>
          <div
            style={{ color: "#6c757d", fontSize: "16px", marginBottom: "24px" }}
          >
            {error}
          </div>
          <Link
            to="/ws/proposals"
            style={{
              color: "#007674",
              textDecoration: "underline",
              fontWeight: "600",
              fontSize: "16",
            }}
          >
            ← Back to proposals
          </Link>
        </div>
      </div>
    );
  }

  if (!jobOffer) {
    return (
      <div
        className="section-container"
        style={{ maxWidth: 1400, margin: "60px auto 0 auto", padding: 24 }}
      >
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            backgroundColor: "#fff",
            borderRadius: "8px",
            border: "1px solid #e0e0e0",
          }}
        >
          <div
            style={{ color: "#6c757d", fontSize: "24px", marginBottom: "16px" }}
          >
            📄 No Job Offer Found
          </div>
          <div
            style={{ color: "#6c757d", fontSize: "16px", marginBottom: "24px" }}
          >
            The job offer you're looking for doesn't exist or has been removed.
          </div>
          <Link
            to="/ws/proposals"
            style={{
              color: "#007674",
              textDecoration: "underline",
              fontWeight: "600",
              fontSize: "16",
            }}
          >
            ← Back to proposals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="section-container"
      style={{ maxWidth: 1400, margin: "60px auto 0 auto", padding: 24 }}
    >
      {/* Back to proposals link */}
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "flex-start",
          marginTop: 24,
        }}
      >
        <Link
          to="/ws/proposals"
          style={{
            color: "#007674",
            textDecoration: "underline",
            fontWeight: 600,
            fontSize: 18,
          }}
        >
          ← Back to proposals
        </Link>
      </div>
      {/* Accept Offer Modal */}
      {showAcceptModal && (
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
          onClick={() => setShowAcceptModal(false)}
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
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
              border: "1px solid #e6e6e6",
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
                  fontSize: "26px",
                  fontWeight: "600",
                  color: "#1a1a1a",
                  letterSpacing: "0.3px",
                }}
              >
                Accept offer
              </h3>
              <motion.button
                onClick={() => setShowAcceptModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  color: "#121212",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
                whileHover={{
                  color: "#121212",
                  background: "#fff",
                }}
                whileTap={{ scale: 0.95 }}
              >
                ×
              </motion.button>
            </div>

            {/* Modal Body */}
            <div style={{ marginBottom: "24px" }}>
              {/* Introductory Text */}
              <p
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "18px",
                  color: "#121212",
                  lineHeight: "1.5",
                }}
              >
                You're about to accept this job offer. Please review the terms
                and add any message you'd like to share with the client.
              </p>

              {/* Message Section */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#121212",
                    marginBottom: "8px",
                  }}
                >
                  Message to Client (Optional)
                </label>
                <p
                  style={{
                    fontSize: "18px",
                    color: "#121212",
                    marginBottom: "12px",
                  }}
                >
                  Add an optional message to share with the client when you
                  accept this offer.
                </p>
                <textarea
                  value={acceptMessage}
                  onChange={(e) => setAcceptMessage(e.target.value)}
                  placeholder="Optional message to the client..."
                  style={{
                    width: "100%",
                    minHeight: "100px",
                    padding: "12px 16px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "18px",
                    outline: "none",
                    transition: "border-color 0.2s ease",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#007674";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                  }}
                />
              </div>

              {/* Terms Section */}
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#121212",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    style={{
                      marginRight: "12px",
                      width: "18px",
                      height: "18px",
                      accentColor: "#007674",
                    }}
                  />
                  I agree to the terms and conditions of this offer
                </label>
              </div>

              {/* Error Message */}
              {acceptError && (
                <div
                  style={{
                    color: "#dc2626",
                    fontSize: "14px",
                    marginTop: "8px",
                    fontWeight: "500",
                    padding: "8px 12px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "6px",
                  }}
                >
                  {acceptError}
                </div>
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
                onClick={() => setShowAcceptModal(false)}
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
                onClick={handleConfirmAccept}
                disabled={isAccepting || !agreeToTerms}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  background: !agreeToTerms || isAccepting ? "#ccc" : "#007674",
                  color: "#fff",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor:
                    !agreeToTerms || isAccepting ? "not-allowed" : "pointer",
                  borderRadius: "6px",
                  transition: "all 0.2s ease",
                }}
                whileHover={
                  agreeToTerms && !isAccepting
                    ? {
                        background: "#005a58",
                      }
                    : {}
                }
                whileTap={agreeToTerms && !isAccepting ? { scale: 0.95 } : {}}
              >
                {isAccepting ? "Accepting..." : "Accept offer"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
      {/* Decline Offer Modal */}
      {showDeclineModal && (
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
          onClick={() => setShowDeclineModal(false)}
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
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
              border: "1px solid #e6e6e6",
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
                  fontSize: "26px",
                  fontWeight: "600",
                  color: "#1a1a1a",
                  letterSpacing: "0.3px",
                }}
              >
                Decline offer
              </h3>
              <motion.button
                onClick={() => !declineSuccess && setShowDeclineModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  color: declineSuccess ? "#ccc" : "#121212",
                  cursor: declineSuccess ? "not-allowed" : "pointer",
                  padding: "4px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
                whileHover={
                  !declineSuccess
                    ? {
                        color: "#121212",
                        background: "#fff",
                      }
                    : {}
                }
                whileTap={!declineSuccess ? { scale: 0.95 } : {}}
              >
                ×
              </motion.button>
            </div>

            {/* Modal Body */}
            <div style={{ marginBottom: "24px" }}>
              {/* Introductory Text */}
              <p
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "18px",
                  color: "#121212",
                  lineHeight: "1.5",
                }}
              >
                We will politely notify the client that you are not interested
                in this offer. The client will be able to view the reason you've
                declined.
              </p>

              {/* Reason Section */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#121212",
                    marginBottom: "12px",
                  }}
                >
                  Reason
                </label>
                <div>
                  {declineReasons.map((reason) => (
                    <div
                      key={reason}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <input
                        type="radio"
                        id={reason}
                        name="declineReason"
                        value={reason}
                        checked={selectedDeclineReason === reason}
                        onChange={(e) =>
                          setSelectedDeclineReason(e.target.value)
                        }
                        style={{
                          marginRight: "12px",
                          width: "16px",
                          height: "16px",
                          accentColor: "#007674",
                        }}
                      />
                      <label
                        htmlFor={reason}
                        style={{
                          color: "#1a1a1a",
                          fontSize: "18px",
                          cursor: "pointer",
                          margin: 0,
                        }}
                      >
                        {reason}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Section */}
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#121212",
                    marginBottom: "8px",
                  }}
                >
                  Message
                </label>
                <p
                  style={{
                    fontSize: "18px",
                    color: "#121212",
                    marginBottom: "12px",
                  }}
                >
                  Add an optional message to share with the client when we
                  notify them that this offer has been declined.
                </p>
                <textarea
                  value={declineMessage}
                  onChange={(e) => setDeclineMessage(e.target.value)}
                  placeholder="Message"
                  style={{
                    width: "100%",
                    minHeight: "100px",
                    padding: "12px 16px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "18px",
                    outline: "none",
                    transition: "border-color 0.2s ease",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#007674";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                  }}
                />
              </div>

              {/* Error Message */}
              {declineError && (
                <div
                  style={{
                    color: "#dc2626",
                    fontSize: "14px",
                    marginTop: "8px",
                    fontWeight: "500",
                    padding: "8px 12px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "6px",
                  }}
                >
                  {declineError}
                </div>
              )}

              {/* Success Message */}
              {declineSuccess && (
                <div
                  style={{
                    color: "#059669",
                    fontSize: "14px",
                    marginTop: "8px",
                    fontWeight: "500",
                    padding: "8px 12px",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "6px",
                  }}
                >
                  ✓ Offer declined successfully! Redirecting to proposals
                  page...
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {!declineSuccess ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                }}
              >
                <motion.button
                  onClick={() => setShowDeclineModal(false)}
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
                  onClick={handleConfirmDecline}
                  disabled={isDeclining || !selectedDeclineReason}
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    background:
                      !selectedDeclineReason || isDeclining
                        ? "#ccc"
                        : "#007674",
                    color: "#fff",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor:
                      !selectedDeclineReason || isDeclining
                        ? "not-allowed"
                        : "pointer",
                    borderRadius: "6px",
                    transition: "all 0.2s ease",
                  }}
                  whileHover={
                    selectedDeclineReason && !isDeclining
                      ? {
                          background: "#005a58",
                        }
                      : {}
                  }
                  whileTap={
                    selectedDeclineReason && !isDeclining ? { scale: 0.95 } : {}
                  }
                >
                  {isDeclining ? "Declining..." : "Decline offer"}
                </motion.button>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "10px 0",
                }}
              >
                <div
                  style={{
                    color: "#059669",
                    fontSize: "16px",
                    fontWeight: "500",
                  }}
                >
                  Redirecting in 2 seconds...
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
      {/* Global Processing Overlay */}
      {(isAccepting || isDeclining || redirecting) && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(2px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 24,
              width: "90%",
              maxWidth: 420,
              textAlign: "center",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid #e6e6e6",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  border: "3px solid #e5e7eb",
                  borderTop: "3px solid #007674",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
            </div>
            <div
              style={{
                fontWeight: 600,
                fontSize: 18,
                color: "#121212",
                marginBottom: 6,
              }}
            >
              Please wait
            </div>
            <div style={{ fontSize: 15, color: "#374151" }}>
              {isAccepting
                ? "Accepting offer and preparing your workroom..."
                : isDeclining
                ? "Declining offer and refunding client wallet..."
                : "Redirecting..."}
            </div>
          </div>
          <style>{`@keyframes spin {0% {transform: rotate(0deg);} 100% {transform: rotate(360deg);}}`}</style>
        </div>
      )}

      {/* Main Offer Container */}
      <div
        style={{
          backgroundColor: "#fff",
          minHeight: "100vh",
        }}
      >
        {/* Header Section with Envelope Icon */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            marginBottom: 30,
            gap: 24,
            padding: "32px 0",
          }}
        >
          {/* Envelope Icon with Sparkles */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div
              style={{
                width: 80,
                height: 80,
                background: "#f8f9fa",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #e9ecef",
                position: "relative",
              }}
            >
              {/* Envelope */}
              <div
                style={{
                  width: 44,
                  height: 30,
                  background: "#d1d3e2",
                  borderRadius: "6px 6px 0 0",
                  position: "relative",
                }}
              >
                {/* White letter peeking out */}
                <div
                  style={{
                    position: "absolute",
                    top: 4,
                    left: 4,
                    width: 36,
                    height: 24,
                    background: "#ffffff",
                    borderRadius: "3px 3px 0 0",
                    border: "1px solid #e9ecef",
                  }}
                ></div>
                {/* Green ribbon */}
                <div
                  style={{
                    position: "absolute",
                    top: -14,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 22,
                    height: 14,
                    background: "#28a745",
                    borderRadius: "7px 7px 0 0",
                  }}
                ></div>
              </div>
            </div>

            {/* Sparkles around envelope */}
            <div
              style={{
                position: "absolute",
                top: -12,
                right: -12,
                width: 18,
                height: 18,
                background: "#ffd700",
                borderRadius: "50%",
                transform: "rotate(45deg)",
                boxShadow: "0 0 10px rgba(255, 215, 0, 0.7)",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                top: 18,
                right: -14,
                width: 14,
                height: 14,
                background: "#ffd700",
                borderRadius: "50%",
                boxShadow: "0 0 8px rgba(255, 215, 0, 0.7)",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                bottom: 12,
                right: -8,
                width: 16,
                height: 16,
                background: "#ffd700",
                borderRadius: "50%",
                transform: "rotate(30deg)",
                boxShadow: "0 0 8px rgba(255, 215, 0, 0.7)",
              }}
            ></div>
          </div>

          {/* Header Text */}
          <div style={{ flex: 1, paddingTop: 8 }}>
            <h1
              style={{
                fontSize: 38,
                fontWeight: 600,
                color: "#121212",
                margin: "0 0 16px 0",
                lineHeight: 1.1,
                letterSpacing: 0.3,
              }}
            >
              {currentUserName.split(" ")[0]}, you received an offer!
            </h1>
            <p
              style={{
                fontSize: 18,
                color: "#6c757d",
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              Review the contract terms for your fixed-price offer from the
              Client.
            </p>
          </div>
        </div>

        {/* Job Title */}
        <div style={{ marginBottom: 30 }}>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: "#121212",
              margin: 0,
              lineHeight: 1.3,
              letterSpacing: 0.3,
            }}
          >
            {contractTitle}
          </h2>
        </div>

        {/* Main Content Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 420px",
            gap: 40,
            alignItems: "flex-start",
            marginBottom: 40,
          }}
        >
          {/* Left Column - Payment Details & Offer Description */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {/* Payment Details Section */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                padding: 32,
                position: "relative",
              }}
            >
              <h3
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: "#121212",
                  letterSpacing: 0.3,
                  margin: "0 0 24px 0",
                }}
              >
                Payment details
              </h3>

              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{ fontSize: 18, color: "#121212", fontWeight: 500 }}
                  >
                    Bid
                  </span>
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#121212",
                    }}
                  >
                    {formatCurrency(projectAmount)}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 16,
                    color: "#121212",
                    fontStyle: "italic",
                  }}
                >
                  (What the client will see)
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{ fontSize: 18, color: "#121212", fontWeight: 500 }}
                  >
                    10% Worksyde service fee
                  </span>
                  <span
                    style={{ fontSize: 18, color: "#121212", fontWeight: 600 }}
                  >
                    - {formatCurrency(serviceFee)}
                  </span>
                </div>
              </div>

              <div
                style={{
                  borderTop: "1px solid #f0f0f0",
                  paddingTop: 24,
                  marginTop: 24,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{ fontSize: 18, color: "#121212", fontWeight: 500 }}
                  >
                    Expected amount you'll receive
                    <span
                      style={{
                        marginLeft: 10,
                        color: "#121212",
                        cursor: "pointer",
                        width: 20,
                        height: 20,
                        background: "#f0f0f0",
                        borderRadius: "50%",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: "bold",
                        border: "1px solid #e3e3e3",
                      }}
                    >
                      ?
                    </span>
                  </span>
                  <span
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: "#007674",
                    }}
                  >
                    {formatCurrency(netAmount)}
                  </span>
                </div>
                <div style={{ fontSize: 16, color: "#121212", marginTop: 6 }}>
                  The first milestone has been funded (
                  {formatCurrency(projectAmount)})
                </div>
              </div>
            </div>

            {/* Offer Description Section */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                padding: 32,
              }}
            >
              <h3
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: "#121212",
                  margin: "0 0 24px 0",
                  letterSpacing: 0.3,
                }}
              >
                Offer description
              </h3>
              <div
                style={{
                  fontSize: 18,
                  lineHeight: 1.7,
                  color: "#121212",
                }}
              >
                {workDescription}
              </div>
            </div>

            {/* Attachments Section */}
            {attachmentList.length > 0 && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  padding: 32,
                }}
              >
                <h3
                  style={{
                    fontSize: 24,
                    fontWeight: 600,
                    color: "#121212",
                    margin: "0 0 24px 0",
                    letterSpacing: 0.3,
                  }}
                >
                  Attachments ({attachmentList.length})
                </h3>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {attachmentList.map((attachment, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "16px 20px",
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        border: "1px solid #e3e3e3",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        marginBottom:
                          index < attachmentList.length - 1 ? "12px" : "0",
                      }}
                      onClick={() => window.open(attachment, "_blank")}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor = "#007674";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = "#e0e0e0";
                      }}
                    >
                      {(() => {
                        // Get file extension and show appropriate icon
                        const url = attachment;
                        let fileExtension = "";

                        if (url) {
                          try {
                            const cleanUrl = url.split("?")[0];
                            const urlParts = cleanUrl.split("/");
                            const filename =
                              urlParts[urlParts.length - 1] || "";
                            fileExtension =
                              filename.split(".").pop()?.toLowerCase() || "";
                          } catch (error) {
                            console.error(
                              "Error parsing file extension:",
                              error
                            );
                          }
                        }

                        // Show different icons based on file type
                        let iconColor = "#007674";
                        let iconSize = 24;

                        if (fileExtension) {
                          if (["pdf"].includes(fileExtension)) {
                            iconColor = "#dc3545"; // Red for PDF
                          } else if (["doc", "docx"].includes(fileExtension)) {
                            iconColor = "#007bff"; // Blue for Word docs
                          } else if (["xls", "xlsx"].includes(fileExtension)) {
                            iconColor = "#28a745"; // Green for Excel
                          } else if (
                            ["jpg", "jpeg", "png", "gif", "webp"].includes(
                              fileExtension
                            )
                          ) {
                            iconColor = "#ffc107"; // Yellow for images
                          } else if (
                            ["zip", "rar", "7z"].includes(fileExtension)
                          ) {
                            iconColor = "#6f42c1"; // Purple for archives
                          }
                        }

                        return (
                          <BsPaperclip
                            style={{
                              color: iconColor,
                              fontSize: iconSize,
                              marginRight: 16,
                            }}
                          />
                        );
                      })()}
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 20,
                            color: "#121212",
                            fontWeight: 500,
                            marginBottom: 4,
                          }}
                        >
                          {(() => {
                            // Show loading state if attachments are being fetched
                            if (loadingAttachments) {
                              return "Loading filename...";
                            }

                            // First try to get filename from attachment details state
                            if (attachmentDetails[attachment]?.fileName) {
                              return attachmentDetails[attachment].fileName;
                            }

                            // Then try to get filename from job offer data
                            if (jobOffer?.attachmentDetails?.fileName) {
                              return jobOffer.attachmentDetails.fileName;
                            }

                            // Fallback: Extract filename from URL with better parsing
                            const url = attachment;
                            let filename = "Attachment";

                            if (url) {
                              try {
                                // Remove query parameters and get the last part of the URL
                                const cleanUrl = url.split("?")[0];
                                const urlParts = cleanUrl.split("/");
                                filename =
                                  urlParts[urlParts.length - 1] || "Attachment";

                                // Decode URL-encoded characters
                                filename = decodeURIComponent(filename);

                                // Check if the filename looks like an ID (24 character hex string)
                                const isId = /^[a-f0-9]{24}$/i.test(filename);

                                // If filename is empty, too short, looks like an ID, or just extension, try to get a better name
                                if (
                                  !filename ||
                                  filename.length < 3 ||
                                  filename.startsWith(".") ||
                                  isId
                                ) {
                                  if (contractTitle) {
                                    // Try to get file extension from URL
                                    const urlExtension = url
                                      .split(".")
                                      .pop()
                                      ?.split("?")[0];
                                    if (
                                      urlExtension &&
                                      urlExtension.length <= 5 &&
                                      !urlExtension.includes("/")
                                    ) {
                                      filename = `${contractTitle.replace(
                                        /[^a-zA-Z0-9]/g,
                                        "_"
                                      )}_attachment.${urlExtension}`;
                                    } else {
                                      filename = `${contractTitle.replace(
                                        /[^a-zA-Z0-9]/g,
                                        "_"
                                      )}_attachment`;
                                    }
                                  } else {
                                    filename = "Job_Offer_Attachment";
                                  }
                                }

                                // If filename doesn't have an extension, try to add one based on URL
                                if (!filename.includes(".")) {
                                  const extension = url
                                    .split(".")
                                    .pop()
                                    ?.split("?")[0];
                                  if (
                                    extension &&
                                    extension.length <= 5 &&
                                    !extension.includes("/")
                                  ) {
                                    filename = `${filename}.${extension}`;
                                  }
                                }
                              } catch (error) {
                                console.error(
                                  "Error parsing attachment URL:",
                                  error
                                );
                                filename = contractTitle
                                  ? `${contractTitle}_attachment`
                                  : "Job_Offer_Attachment";
                              }
                            }

                            return filename;
                          })()}
                        </div>
                        <div
                          style={{
                            fontSize: 16,
                            color: "#666",
                            marginBottom: 4,
                          }}
                        >
                          {(() => {
                            // Show loading state if attachments are being fetched
                            if (loadingAttachments) {
                              return "Loading file details...";
                            }

                            // First try to get file size from attachment details state
                            if (attachmentDetails[attachment]?.fileSize) {
                              return formatFileSize(
                                attachmentDetails[attachment].fileSize
                              );
                            }

                            // Then try to get file size from job offer data
                            if (jobOffer?.attachmentDetails?.fileSize) {
                              return formatFileSize(
                                jobOffer.attachmentDetails.fileSize
                              );
                            }

                            // Check if we have file size in job offer data
                            if (jobOffer?.attachmentSize) {
                              return formatFileSize(jobOffer.attachmentSize);
                            }

                            // Check if we have file size from HEAD request
                            if (fileSizes[attachment]) {
                              return formatFileSize(fileSizes[attachment]);
                            }

                            // Try to extract from URL if it contains size info
                            const url = attachment;
                            if (url) {
                              try {
                                const urlParams = new URLSearchParams(
                                  url.split("?")[1] || ""
                                );
                                const sizeParam =
                                  urlParams.get("size") ||
                                  urlParams.get("filesize");
                                if (sizeParam) {
                                  return formatFileSize(parseInt(sizeParam));
                                }
                              } catch (error) {
                                console.error(
                                  "Error parsing URL parameters:",
                                  error
                                );
                              }
                            }

                            // If no size available, show a placeholder
                            return "File size not available";
                          })()}
                        </div>
                        <div
                          style={{
                            fontSize: 16,
                            color: "#007674",
                            fontWeight: 500,
                          }}
                        >
                          Click to open file
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Milestones Section */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                padding: 0,
                overflow: "hidden",
              }}
            >
              <div style={{ padding: 24 }}>
                <h3
                  style={{
                    fontSize: 24,
                    fontWeight: 600,
                    color: "#121212",
                    margin: 0,
                    letterSpacing: 0.3,
                  }}
                >
                  Milestones
                </h3>
              </div>
              <div style={{ borderTop: "1px solid #f0f0f0" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr",
                    padding: "14px 24px",
                    color: "#121212",
                    fontWeight: 600,
                    fontSize: 18,
                  }}
                >
                  <div>Milestone</div>
                  <div style={{ textAlign: "center" }}>Due date</div>
                  <div style={{ textAlign: "right" }}>Amount</div>
                </div>
                {validMilestones.length > 0 ? (
                  validMilestones.map((milestone, index) => (
                    <div key={index} style={{ borderTop: "1px solid #f0f0f0" }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "2fr 1fr 1fr",
                          padding: "16px 24px",
                          alignItems: "center",
                          color: "#121212",
                        }}
                      >
                        <div style={{ lineHeight: 1.5 }}>
                          {milestone.title || contractTitle}
                        </div>
                        <div
                          style={{
                            fontSize: 18,
                            color: "#121212",
                            fontWeight: 500,
                            textAlign: "center",
                          }}
                        >
                          {(() => {
                            const due = getMilestoneDisplayDueDate(milestone);
                            if (!due) return "-";
                            const dt = typeof due === 'number' ? new Date(due) : new Date(due);
                            return formatDate(dt);
                          })()}
                        </div>
                        <div style={{ fontWeight: 600, textAlign: "right" }}>
                          {formatCurrency(
                            parseAmountToNumber(
                              milestone?.amount ??
                                milestone?.amountValue ??
                                milestone?.price ??
                                milestone?.budget ??
                                milestone?.total ??
                                0
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ borderTop: "1px solid #f0f0f0" }}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr 1fr",
                        padding: "16px 24px",
                        alignItems: "center",
                        color: "#121212",
                      }}
                    >
                      <div style={{ lineHeight: 1.5 }}>{contractTitle}</div>
                      <div
                        style={{
                          fontSize: 18,
                          color: "#121212",
                          fontWeight: 500,
                          textAlign: "center",
                        }}
                      >
                        {(() => {
                          const due = getJobOfferDueDate();
                          if (!due) return "-";
                          const dt = typeof due === 'number' ? new Date(due) : new Date(due);
                          return formatDate(dt);
                        })()}
                      </div>
                      <div style={{ fontWeight: 600, textAlign: "right" }}>
                        {formatCurrency(projectAmountNumber)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contract details Section */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                padding: 0,
                overflow: "hidden",
              }}
            >
              <div style={{ padding: 24 }}>
                <h3
                  style={{
                    fontSize: 24,
                    fontWeight: 600,
                    color: "#121212",
                    margin: 0,
                    letterSpacing: 0.3,
                  }}
                >
                  Contract details
                </h3>
              </div>
              <div style={{ borderTop: "1px solid #f0f0f0" }}>
                {/* Status Row */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr",
                    padding: "16px 24px",
                    alignItems: "center",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <div style={{ color: "#121212" }}>Status</div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        background: "#3b5bdb",
                        color: "#fff",
                        padding: "6px 12px",
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      {status}
                    </span>
                    <span style={{ color: "#121212", fontSize: 14 }}>
                      Expires on {formatDate(expiryDate)}
                    </span>
                  </div>
                </div>

                {/* Job category */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr",
                    padding: "16px 24px",
                    alignItems: "center",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <div style={{ color: "#121212" }}>Job category</div>
                  <div style={{ color: "#121212" }}>{jobCategory}</div>
                </div>

                {/* Offer expires */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr",
                    padding: "16px 24px",
                    alignItems: "center",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <div style={{ color: "#121212" }}>Offer expires</div>
                  <div style={{ color: "#121212" }}>
                    {formatDate(expiryDate)}
                  </div>
                </div>

                {/* Payment Schedule */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr",
                    padding: "16px 24px",
                    alignItems: "center",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <div style={{ color: "#121212" }}>Payment Schedule</div>
                  <div
                    style={{ color: "#121212", textTransform: "capitalize" }}
                  >
                    {jobOffer?.paymentSchedule || "Fixed Price"}
                  </div>
                </div>

                {/* Offer date */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr",
                    padding: "16px 24px",
                    alignItems: "center",
                  }}
                >
                  <div style={{ color: "#121212" }}>Offer date</div>
                  <div style={{ color: "#121212" }}>
                    {formatDate(offerDate)}
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed-price contracts explainer */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <div
                onClick={() => setExpandedFixedPrice(!expandedFixedPrice)}
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid #f0f0f0",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{ fontSize: 20, fontWeight: 600, color: "#121212" }}
                >
                  How do fixed-price contracts work?
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: "#666",
                    transform: expandedFixedPrice
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                >
                  ▼
                </span>
              </div>
              <div
                style={{
                  maxHeight: expandedFixedPrice ? "500px" : "0px",
                  overflow: "hidden",
                  transition: "max-height 0.3s ease-in-out",
                  backgroundColor: "#fff",
                }}
              >
                <div
                  style={{
                    padding: "20px",
                    opacity: expandedFixedPrice ? 1 : 0,
                    transform: expandedFixedPrice
                      ? "translateY(0)"
                      : "translateY(-10px)",
                    transition:
                      "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
                  }}
                >
                  <p
                    style={{
                      fontSize: 18,
                      color: "#121212",
                      lineHeight: 1.6,
                      margin: "0 0 16px 0",
                    }}
                  >
                    Fixed-price contracts differ from hourly contracts because
                    they have milestones, which break down larger projects into
                    manageable chunks. Before work begins, agree on milestones
                    with your client. The client deposits money into project
                    funds, a neutral holding place that protects the payment
                    while the work is in progress.
                  </p>
                  <p
                    style={{
                      fontSize: 18,
                      color: "#121212",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    Over the course of the contract, the client will release
                    funds for each approved milestone. If a milestone submission
                    isn’t addressed within 14 days, it’s deemed approved and
                    payment is automatically released.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Client Information Sidebar */}
          <div
            style={{
              backgroundColor: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              padding: 24,
              position: "sticky",
              top: 24,
            }}
          >
            <div
              style={{
                textAlign: "center",
                padding: "10px 0",
              }}
            >
              {/* Main Message */}
              <div
                style={{
                  fontSize: 18,
                  color: "#121212",
                  marginBottom: 32,
                  lineHeight: 1.5,
                }}
              >
                Once you accept, you can begin working right away.
              </div>

              {/* Action Buttons */}
              {status === "accepted" ? (
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      background: "#d4edda",
                      color: "#155724",
                      border: "1px solid #c3e6cb",
                      padding: "16px 20px",
                      borderRadius: "8px",
                      fontSize: 16,
                      fontWeight: 600,
                      marginBottom: 16,
                    }}
                  >
                    ✅ Offer Accepted
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "#6c757d",
                      lineHeight: 1.4,
                    }}
                  >
                    This job offer has been accepted. You can view your
                    proposals and active contracts.
                  </div>
                  <button
                    style={{
                      background: "#007674",
                      color: "white",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: "25px",
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: "pointer",
                      minWidth: 140,
                      marginTop: 16,
                      transition: "all 0.3s ease-in-out",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                    }}
                    onClick={() => navigate("/ws/proposals")}
                  >
                    Go to Proposals
                  </button>
                </div>
              ) : status === "declined" ? (
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      background: "#f8d7da",
                      color: "#721c24",
                      border: "1px solid #f5c6cb",
                      padding: "16px 20px",
                      borderRadius: "8px",
                      fontSize: 16,
                      fontWeight: 600,
                      marginBottom: 16,
                    }}
                  >
                    ❌ Offer Declined
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "#6c757d",
                      lineHeight: 1.4,
                    }}
                  >
                    This job offer has been declined and cannot be accepted.
                  </div>
                </div>
              ) : status === "expired" ? (
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      background: "#fff3cd",
                      color: "#856404",
                      border: "1px solid #ffeaa7",
                      padding: "16px 20px",
                      borderRadius: "8px",
                      fontSize: 16,
                      fontWeight: 600,
                      marginBottom: 16,
                    }}
                  >
                    ⏰ Offer Expired
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "#6c757d",
                      lineHeight: 1.4,
                    }}
                  >
                    This job offer has expired and can no longer be accepted.
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    gap: 20,
                    justifyContent: "center",
                    marginBottom: 24,
                  }}
                >
                  <button
                    style={{
                      background: "#007674",
                      color: "white",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: "25px",
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: "pointer",
                      minWidth: 140,
                      transition: "all 0.3s ease-in-out",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                    }}
                    onClick={handleOpenAcceptModal}
                  >
                    Accept offer
                  </button>
                  <button
                    style={{
                      background: "transparent",
                      color: "#007674",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: "25px",
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: "pointer",
                      minWidth: 140,
                      transition: "all 0.3s ease-in-out",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#f8f9fa";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "transparent";
                    }}
                    onClick={handleOpenDeclineModal}
                  >
                    Decline offer
                  </button>
                </div>
              )}

              {/* Offer Expiration */}
              <div
                style={{
                  fontSize: 16,
                  color: "#121212",
                  lineHeight: 1.4,
                }}
              >
                This offer expires {formatDate(expiryDate)}.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancersJobOfferDetails;
