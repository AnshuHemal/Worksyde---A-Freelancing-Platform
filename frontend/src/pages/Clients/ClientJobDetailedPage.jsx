import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  BsPeople,
  BsCalendar,
  BsGeoAlt,
  BsPencil,
  BsEye,
  BsArrowRepeat,
  BsX,
  BsGlobe,
  BsCheckCircle,
  BsClock,
  BsCreditCard,
  BsQuestionCircle,
  BsPaperclip,
  BsInfoCircle,
  BsHandThumbsUp,
  BsHandThumbsDown,
} from "react-icons/bs";
import { MdEdit } from "react-icons/md";
import { FaStar, FaBolt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "http://localhost:5000/api/auth";

const steps = [
  "POST DETAILS",
  "INVITE FREELANCERS",
  "REVIEW PROPOSALS",
  "HIRE FREELANCERS",
];

const stepRoutes = ["/job-details", "/suggested", "/proposals", "/hired"];

function timeAgo(dateString) {
  if (!dateString) return "1 hour ago";
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 60000); // minutes
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff} minute${diff > 1 ? "s" : ""} ago`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

// Utility function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

const ClientJobDetailedPage = () => {
  // CSS Animations for filter section
  const filterAnimations = `
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
        max-height: 0;
      }
      to {
        opacity: 1;
        transform: translateY(0);
        max-height: 1000px;
      }
    }
    
    @keyframes slideUp {
      from {
        opacity: 1;
        transform: translateY(0);
        max-height: 1000px;
      }
      to {
        opacity: 0;
        transform: translateY(-20px);
        max-height: 0;
      }
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .filter-section-enter {
      animation: slideDown 0.3s ease-out;
    }
    
    .filter-section-exit {
      animation: slideUp 0.3s ease-out;
    }
  `;
  const { jobid } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [activeInviteTab, setActiveInviteTab] = useState("search");
  const [activeProposalTab, setActiveProposalTab] = useState("all");
  const [activeHireTab, setActiveHireTab] = useState("hired");
  const [freelancers, setFreelancers] = useState([]);
  const [freelancersLoading, setFreelancersLoading] = useState(false);
  const [freelancersError, setFreelancersError] = useState(null);
  const [inviteModalData, setInviteModalData] = useState(null);
  const [inviteMessage, setInviteMessage] = useState("");
  const [clientName, setClientName] = useState("User");
  const [invitedFreelancerIds, setInvitedFreelancerIds] = useState([]);
  const [expandedBios, setExpandedBios] = useState({});
  const [invitedCount, setInvitedCount] = useState(0);
  const [proposals, setProposals] = useState([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [proposalsError, setProposalsError] = useState(null);
  const [proposalActions, setProposalActions] = useState({});
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  // Add new state for billing method modal
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [billingMethods, setBillingMethods] = useState([]);
  const [checkingBilling, setCheckingBilling] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [loadingPaymentStatus, setLoadingPaymentStatus] = useState(true);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [loadingPhoneStatus, setLoadingPhoneStatus] = useState(true);
  const [clientDetails, setClientDetails] = useState(null);
  const [loadingClientDetails, setLoadingClientDetails] = useState(true);

  const openProposalModal = (proposal) => {
    setSelectedProposal(proposal);
    setIsProposalModalOpen(true);
  };

  const closeProposalModal = () => {
    setIsProposalModalOpen(false);
    setSelectedProposal(null);
  };

  const ProposalModal = ({ isOpen, onClose, proposal }) => {
    const [showFullBio, setShowFullBio] = useState(false);
    if (!isOpen || !proposal) return null;

    return (
      <div
        role="dialog"
        aria-modal="true"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 16,
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "min(1200px, 95vw)",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #e0e0e0",
            boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
            overflow: "hidden",
          }}
        >
          {/* Header Section */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "24px 32px",
              borderBottom: "1px solid #ececec",
              background: "#fff",
            }}
          >
            {/* Applicant Information */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ position: "relative" }}>
                <img
                  src={
                    proposal.freelancer?.id || proposal.freelancer?._id
                      ? `${API_URL}/profile-image/${proposal.freelancer.id || proposal.freelancer._id}/`
                      : `https://via.placeholder.com/56x56/4CAF50/FFFFFF?text=${
                          proposal.freelancer?.name?.charAt(0) || "F"
                        }`
                  }
                  alt={proposal.freelancer?.name || "Freelancer"}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/56x56/4CAF50/FFFFFF?text=${
                      proposal.freelancer?.name?.charAt(0) || "F"
                    }`;
                  }}
                />
                {/* Online Status Indicator */}
                <div
                  style={{
                    position: "absolute",
                    top: 2,
                    left: 2,
                    width: 12,
                    height: 12,
                    backgroundColor: "#4CAF50",
                    borderRadius: "50%",
                    border: "2px solid #fff",
                  }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 20,
                    color: "#121212",
                    marginBottom: 4,
                  }}
                >
                  {proposal.freelancer?.name || "Hemal K."}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "#666",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 4,
                  }}
                >
                  <BsGeoAlt style={{ fontSize: 14, color: "#666" }} />
                  {proposal.freelancer?.location || "Ahmedabad, India"} –{" "}
                  {new Date()
                    .toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                    .toLowerCase()}{" "}
                  local time
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "#007674",
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  View profile
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={onClose}
                style={{
                  width: 40,
                  height: 40,
                  border: "1px solid #007674",
                  borderRadius: "50%",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                <BsX size={20} />
              </button> 
            </div>
          </div>

          {/* Body Section */}
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            {/* Left Column */}
            <div
              style={{
                width: "320px",
                borderRight: "1px solid #ececec",
                padding: "32px",
              }}
            >
              {/* Applicant Section */}
              <div style={{ marginBottom: 32 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#121212",
                    marginBottom: 12,
                  }}
                >
                  Applicant
                </div>
                <div
                  style={{ fontSize: 14, color: "#121212", lineHeight: 1.5 }}
                >
                  {proposal.freelancer?.name || "Hemal K."} has applied to or
                  been invited to your or your company's job{" "}
                  <strong>
                    {job?.title || "Freelancing Website Development Project"}
                  </strong>
                </div>
              </div>

              {/* Get a second opinion Section */}
              <div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#121212",
                    marginBottom: 12,
                  }}
                >
                  Get a second opinion
                </div>
                <div
                  style={{ fontSize: 14, color: "#121212", marginBottom: 16 }}
                >
                  Invite coworkers to help you review freelancers
                </div>
                <button
                  style={{
                    border: "1px solid #007674",
                    color: "#007674",
                    background: "#fff",
                    borderRadius: 8,
                    padding: "10px 20px",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <BsPeople style={{ fontSize: 14 }} />
                  Invite
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ flex: 1, padding: "32px" }}>
              {/* Proposal Details Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 24,
                }}
              >
                <div
                  style={{ fontSize: 18, fontWeight: 700, color: "#121212" }}
                >
                  Proposal Details
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{ fontSize: 18, fontWeight: 700, color: "#121212" }}
                  >
                    ₹{Number(proposal.freelancer?.hourlyRate ?? 25).toFixed(2)}
                    /hr
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    Proposed Bid
                  </div>
                </div>
              </div>

              {/* Job Budget Information */}
              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#121212",
                    marginBottom: 8,
                  }}
                >
                  Job Budget
                </div>
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(0, 118, 116, 0.1) 0%, rgba(0, 118, 116, 0.05) 100%)",
                    border: "1px solid rgba(0, 118, 116, 0.2)",
                    borderRadius: 8,
                    padding: "12px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{ fontSize: 12, color: "#666", marginBottom: 2 }}
                    >
                      {job.budgetType === "fixed"
                        ? "Fixed Price"
                        : "Hourly Rate"}
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#007674",
                      }}
                    >
                      {job.budgetType === "fixed" && job.fixedRate
                        ? `₹${parseFloat(job.fixedRate).toFixed(2)}`
                        : job.budgetType === "hourly" &&
                          job.hourlyRateFrom &&
                          job.hourlyRateTo
                        ? `₹${parseFloat(job.hourlyRateFrom).toFixed(
                            2
                          )} - ₹${parseFloat(job.hourlyRateTo).toFixed(2)}`
                        : job.fixedRate
                        ? `₹${parseFloat(job.fixedRate).toFixed(2)}`
                        : job.hourlyRateFrom && job.hourlyRateTo
                        ? `₹${parseFloat(job.hourlyRateFrom).toFixed(
                            2
                          )} - ₹${parseFloat(job.hourlyRateTo).toFixed(2)}`
                        : "₹15.00 - ₹35.00"}
                      {job.budgetType === "hourly" && "/hr"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{ fontSize: 12, color: "#666", marginBottom: 2 }}
                    >
                      Project Duration
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#007674",
                      }}
                    >
                      {job.duration || "1 to 3 months"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#121212",
                    marginBottom: 8,
                  }}
                >
                  Cover letter
                </div>
                <div
                  style={{ fontSize: 15, color: "#121212", lineHeight: 1.6 }}
                >
                  {proposal.coverLetter || "Hello, this is the test message.."}
                </div>
              </div>

              {/* Attachments */}
              {proposal.attachment && (
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#121212",
                      marginBottom: 8,
                    }}
                  >
                    Attachments
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "12px",
                      border: "1px solid rgba(0, 118, 116, 0.1)",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "white";
                    }}
                    onClick={() => handleAttachmentClick(proposal.attachment)}
                  >
                    <div
                      style={{
                        background: "#007674",
                        borderRadius: "50%",
                        width: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <BsPaperclip style={{ color: "#fff", fontSize: 14 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          color: "#007674",
                          fontWeight: 600,
                          fontSize: 14,
                          marginBottom: 2,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {proposal.attachmentName || "Attachment"}
                      </div>
                      <div
                        style={{
                          color: "#666",
                          fontSize: 12,
                        }}
                      >
                        {proposal.attachmentSize
                          ? formatFileSize(proposal.attachmentSize)
                          : "Click to open"}
                      </div>
                    </div>
                    <div
                      style={{
                        color: "#007674",
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      →
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Get invite tab from URL path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/invites")) {
      setActiveInviteTab("invited");
    } else if (path.includes("/hires")) {
      setActiveInviteTab("hires");
    } else if (path.includes("/saved")) {
      setActiveInviteTab("saved");
    } else if (path.includes("/suggested")) {
      setActiveInviteTab("search");
    }
  }, [location.pathname]);

  // Handle invite tab changes with URL path updates
  const handleInviteTabChange = (tab) => {
    setActiveInviteTab(tab);

    // Get current search parameters to preserve them
    const urlParams = new URLSearchParams(location.search);
    const searchParams = urlParams.toString();

    // Navigate to different URL paths based on tab
    let newPath;
    switch (tab) {
      case "search":
        newPath = `/ws/client/applicants/${jobid}/suggested`;
        break;
      case "invited":
        newPath = `/ws/client/applicants/${jobid}/invites`;
        break;
      case "hires":
        newPath = `/ws/client/applicants/${jobid}/hires`;
        break;

      default:
        newPath = `/ws/client/applicants/${jobid}/suggested`;
    }

    // Add search parameters if they exist
    const newUrl = searchParams ? `${newPath}?${searchParams}` : newPath;
    navigate(newUrl, { replace: true });
  };

  // Handle proposal tab changes with URL path updates
  const handleProposalTabChange = (tab) => {
    setActiveProposalTab(tab);

    // Get current search parameters to preserve them
    const urlParams = new URLSearchParams(location.search);
    const searchParams = urlParams.toString();

    // Navigate to different URL paths based on tab
    let newPath;
    switch (tab) {
      case "all":
        newPath = `/ws/client/applicants/${jobid}/proposals`;
        break;
      case "messaged":
        newPath = `/ws/client/applicants/${jobid}/messaged`;
        break;
      default:
        newPath = `/ws/client/applicants/${jobid}/proposals`;
    }

    // Add search parameters if they exist
    const newUrl = searchParams ? `${newPath}?${searchParams}` : newPath;
    navigate(newUrl, { replace: true });
  };

  // Handle hire tab changes
  const handleHireTabChange = (tab) => {
    setActiveHireTab(tab);

    // Get current search parameters to preserve them
    const urlParams = new URLSearchParams(location.search);
    const searchParams = urlParams.toString();

    // Navigate to different URL paths based on tab
    let newPath;
    switch (tab) {
      case "offers":
        newPath = `/ws/client/applicants/${jobid}/offers`;
        break;
      case "hired":
        newPath = `/ws/client/applicants/${jobid}/hired`;
        break;
      default:
        newPath = `/ws/client/applicants/${jobid}/hired`;
    }

    // Add search parameters if they exist
    const newUrl = searchParams ? `${newPath}?${searchParams}` : newPath;
    navigate(newUrl, { replace: true });
  };

  // Determine current step based on URL path
  const getCurrentStep = () => {
    const path = location.pathname;
    if (path.includes("/job-details")) return 0;
    if (
      path.includes("/suggested") ||
      path.includes("/invites") ||
      path.includes("/hires")
    )
      return 1;
    if (
      path.includes("/proposals") ||
      path.includes("/messaged")
    )
      return 2;
    if (path.includes("/hired") || path.includes("/offers")) return 3;
    if (path.includes("/applicants")) return 2;
    return 0; // default to first step
  };

  const [currentStep, setCurrentStep] = useState(getCurrentStep());

  const handleStepClick = (stepIndex) => {
    setCurrentStep(stepIndex);
    const route = stepRoutes[stepIndex];
    navigate(`/ws/client/applicants/${jobid}${route}`);
  };

  // Get search term and page from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const q = urlParams.get("q");
    const page = urlParams.get("page");
    setSearchTerm(q || "");
    setCurrentPage(page ? parseInt(page) : 1);
  }, [location.search]);

  // Update currentStep when URL changes
  useEffect(() => {
    setCurrentStep(getCurrentStep());
  }, [location.pathname]);

  // Initialize activeProposalTab based on URL path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/messaged")) {
      setActiveProposalTab("messaged");
    } else if (path.includes("/proposals")) {
      setActiveProposalTab("all");
    } else {
      setActiveProposalTab("all");
    }
  }, [location.pathname]);



  const handleProposalAction = async (proposalId, action) => {
    try {
      if (action === "shortlist" || action === "unshortlist") {
        const response = await axios.post(
          `${API_URL}/jobproposals/shortlist/`,
          {
            proposalId: proposalId,
            action: action,
          },
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          // Update the proposal status in the local state
          setProposals((prev) =>
            prev.map((proposal) =>
              proposal.id === proposalId
                ? {
                    ...proposal,
                    status:
                      "submitted",
                  }
                : proposal
            )
          );
        }
      } else {
        // For other actions like like/dislike, just update local state
        setProposalActions((prev) => ({
          ...prev,
          [proposalId]: {
            ...prev[proposalId],
            [action]: !prev[proposalId]?.[action],
          },
        }));
      }
    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
      alert(`Failed to ${action} proposal`);
    }
  };

  const fetchProposals = async () => {
    if (!jobid) return;

    setProposalsLoading(true);
    setProposalsError(null);
    try {
      const response = await axios.get(
        `${API_URL}/jobproposals/job/${jobid}/`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setProposals(response.data.proposals || []);
      } else {
        setProposalsError(response.data.message || "Failed to fetch proposals");
        setProposals([]);
      }
    } catch (error) {
      console.error("Error fetching proposals:", error);
      setProposalsError("Failed to fetch proposals");
      setProposals([]);
    } finally {
      setProposalsLoading(false);
    }
  };

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_URL}/jobpost/${jobid}/`);
        if (res.data && res.data.id) {
          setJob(res.data);
        } else {
          setError("Job not found");
        }
      } catch (err) {
        setError("Failed to fetch job details");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobid]);



  // Fetch proposals when proposals tab is active
  useEffect(() => {
    if (currentStep === 2 && activeProposalTab === "all") {
      fetchProposals();
    }
  }, [currentStep, activeProposalTab, jobid]);

  // Fetch verified freelancers when Invite Freelancers > Search tab is active
  useEffect(() => {
    if (currentStep === 1 && activeInviteTab === "search") {
      setFreelancersLoading(true);
      setFreelancersError(null);
      axios
        .get("http://localhost:5000/api/auth/freelancers/verified/")
        .then((res) => {
          if (res.data && res.data.freelancers) {
            setFreelancers(res.data.freelancers);
          } else {
            setFreelancers([]);
          }
        })
        .catch((err) => {
          setFreelancersError("Failed to fetch freelancers");
          setFreelancers([]);
        })
        .finally(() => {
          setFreelancersLoading(false);
        });
    }
  }, [currentStep, activeInviteTab]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/auth/current-user/", {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data && res.data.user && res.data.user.name) {
          setClientName(res.data.user.name);
        }
      })
      .catch(() => setClientName("White T."));
  }, []);

  // Check verification status and fetch client details on component mount
  useEffect(() => {
    checkPaymentVerificationStatus();
    checkPhoneVerificationStatus();
    fetchClientDetails();
  }, []);

  // Refresh verification status and client details when page becomes visible (user returns from settings page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkPaymentVerificationStatus();
        checkPhoneVerificationStatus();
        fetchClientDetails();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Fetch invited freelancer IDs for this job and client
  useEffect(() => {
    if (!jobid) return;
    axios
      .get(`${API_URL}/job-invite/list/?jobId=${jobid}`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data && Array.isArray(res.data.invitedFreelancerIds)) {
          setInvitedFreelancerIds(res.data.invitedFreelancerIds);
          setInvitedCount(res.data.invitedFreelancerIds.length);
        }
      })
      .catch(() => {
        setInvitedFreelancerIds([]);
        setInvitedCount(0);
      });
  }, [jobid]);

  // Function to check if user has billing methods
  const checkBillingMethods = async () => {
    setCheckingBilling(true);
    try {
      const response = await axios.get(`${API_URL}/payment-cards/`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setBillingMethods(response.data.cards || []);
        return response.data.cards && response.data.cards.length > 0;
      }
      return false;
    } catch (error) {
      console.error("Error checking billing methods:", error);
      return false;
    } finally {
      setCheckingBilling(false);
    }
  };

  // Function to handle message button click
  const handleMessageClick = async (freelancer) => {
    setSelectedFreelancer(freelancer);

    // Check if user has billing methods
    const hasBillingMethods = await checkBillingMethods();

    if (hasBillingMethods) {
      // Show toast message
      setToastMessage("Billing method added.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      // Here you would typically navigate to the messaging page
      // navigate(`/ws/client/messages/${freelancer.id}`);
    } else {
      // Show billing modal
      setShowBillingModal(true);
    }
  };

  // Function to close billing modal
  const closeBillingModal = () => {
    setShowBillingModal(false);
    setSelectedFreelancer(null);
  };

  // Function to handle adding billing method
  const handleAddBillingMethod = () => {
    // Navigate to billing settings page
    navigate("/ws/client/deposit-method");
    closeBillingModal();
    // Refresh payment status after navigation
    setTimeout(() => {
      checkPaymentVerificationStatus();
    }, 1000);
  };

  // Function to handle phone verification click
  const handlePhoneVerificationClick = () => {
    // Navigate to phone verification page or open phone verification modal
    navigate("/ws/client/overview");
    // Refresh phone status after navigation
    setTimeout(() => {
      checkPhoneVerificationStatus();
    }, 1000);
  };

  // Function to handle attachment click
  const handleAttachmentClick = (attachmentUrl) => {
    if (!attachmentUrl) return;

    setAttachmentLoading(true);
    try {
      // Open the attachment in a new tab
      window.open(attachmentUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error opening attachment:", error);
    } finally {
      setAttachmentLoading(false);
    }
  };

  // Function to check payment verification status
  const checkPaymentVerificationStatus = async () => {
    setLoadingPaymentStatus(true);
    try {
      // Check both payment cards and PayPal accounts
      const [cardsResponse, paypalResponse] = await Promise.all([
        axios.get(`${API_URL}/payment-cards/`, {
          withCredentials: true,
        }),
        axios.get(`${API_URL}/paypal-accounts/`, {
          withCredentials: true,
        }),
      ]);

      let hasPaymentMethod = false;

      if (
        cardsResponse.data.success &&
        cardsResponse.data.cards &&
        cardsResponse.data.cards.length > 0
      ) {
        hasPaymentMethod = true;
      }

      if (
        !hasPaymentMethod &&
        paypalResponse.data.success &&
        paypalResponse.data.accounts &&
        paypalResponse.data.accounts.length > 0
      ) {
        hasPaymentMethod = true;
      }

      setPaymentVerified(hasPaymentMethod);
    } catch (error) {
      console.error("Error checking payment verification status:", error);
      setPaymentVerified(false);
    } finally {
      setLoadingPaymentStatus(false);
    }
  };

  // Function to check phone verification status
  const checkPhoneVerificationStatus = async () => {
    setLoadingPhoneStatus(true);
    try {
      // Get current user data to check phone verification status
      const userResponse = await axios.get(`${API_URL}/current-user/`, {
        withCredentials: true,
      });

      if (userResponse.data.success && userResponse.data.user) {
        const isPhoneVerified = userResponse.data.user.phoneVerified === true;
        setPhoneVerified(isPhoneVerified);
      } else {
        setPhoneVerified(false);
      }
    } catch (error) {
      console.error("Error checking phone verification status:", error);
      setPhoneVerified(false);
    } finally {
      setLoadingPhoneStatus(false);
    }
  };

  // Function to fetch comprehensive client details
  const fetchClientDetails = async () => {
    setLoadingClientDetails(true);
    try {
      // Get current user ID first
      const userResponse = await axios.get(`${API_URL}/current-user/`, {
        withCredentials: true,
      });

      if (!userResponse.data.success || !userResponse.data.user) {
        throw new Error("Failed to get current user");
      }

      const userId = userResponse.data.user._id;

      // Fetch client profile details
      const [clientProfileResponse, clientProfileDetailsResponse] = await Promise.all([
        axios.get(`${API_URL}/client/profile/${userId}/`, {
          withCredentials: true,
        }),
        axios.get(`${API_URL}/client/profile-details/${userId}/`, {
          withCredentials: true,
        }),
      ]);

      // Get all job posts by this client
      const jobPostsResponse = await axios.get(`${API_URL}/jobposts/client/${userId}/`, {
        withCredentials: true,
      });

      // Calculate client statistics
      const allJobPosts = jobPostsResponse.data.data || [];
      const activeJobs = allJobPosts.filter(job => job.status === "verified").length;
      const totalJobs = allJobPosts.length;
      
      // Calculate hiring rate
      const completedProposals = allJobPosts.flatMap(job => 
        job.proposals || []
      ).filter(proposal => proposal.status === "completed");
      
      const totalProposals = allJobPosts.flatMap(job => 
        job.proposals || []
      ).length;
      
      const hiringRate = totalProposals > 0 ? Math.round((completedProposals.length / totalProposals) * 100) : 0;

      // Format dates
      const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      };

      // Compile client details
      const details = {
        // Basic info
        name: userResponse.data.user.name,
        email: userResponse.data.user.email,
        createdAt: formatDate(userResponse.data.user.createdAt),
        
        // Company info
        companyName: clientProfileDetailsResponse.data.companyName || "Not specified",
        industry: clientProfileDetailsResponse.data.industry || "Not specified",
        companySize: clientProfileDetailsResponse.data.size || "Not specified",
        website: clientProfileDetailsResponse.data.website || "Not specified",
        
        // Job statistics
        activeJobs: activeJobs,
        totalJobs: totalJobs,
        hiringRate: hiringRate,
        
        // Financial info
        totalSpent: clientProfileResponse.data.spent || 0,
        totalHires: clientProfileResponse.data.hires || 0,
        
        // Online status
        onlineStatus: userResponse.data.user.onlineStatus || "offline",
        lastSeen: userResponse.data.user.lastSeen,
      };

      setClientDetails(details);
    } catch (error) {
      console.error("Error fetching client details:", error);
      // Set default values if fetch fails
      setClientDetails({
        name: "Client",
        email: "N/A",
        createdAt: "N/A",
        companyName: "Not specified",
        industry: "Not specified",
        companySize: "Not specified",
        website: "Not specified",
        activeJobs: 0,
        totalJobs: 0,
        hiringRate: 0,
        totalSpent: 0,
        totalHires: 0,
        onlineStatus: "offline",
        lastSeen: null,
      });
    } finally {
      setLoadingClientDetails(false);
    }
  };

  // Billing Method Modal Component
  const BillingMethodModal = ({
    isOpen,
    onClose,
    freelancer,
    onAddBilling,
  }) => {
    if (!isOpen || !freelancer) return null;

    return (
      <div
        role="dialog"
        aria-modal="true"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 16,
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "min(500px, 95vw)",
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #e0e0e0",
            boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "24px 32px",
              borderBottom: "1px solid #ececec",
              background: "#fff",
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 700, color: "#121212" }}>
              Send {freelancer.name || "Hemal K."} a message
            </div>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: 24,
                cursor: "pointer",
                color: "#666",
                padding: 0,
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BsX />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: "32px" }}>
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#121212",
                  marginBottom: 8,
                }}
              >
                Ready to chat with {freelancer.name || "Hemal"}? Add your
                preferred billing method.
              </div>
              <div style={{ fontSize: 14, color: "#666", lineHeight: 1.5 }}>
                You'll need a verified payment method to chat with freelancers
                on our platform. Don't worry, you'll only be charged for work
                you approve.
              </div>
            </div>

            {/* Action Button */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 24,
              }}
            >
              <button
                onClick={onAddBilling}
                style={{
                  background: "#007674",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "12px 24px",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#005a58";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#007674";
                }}
              >
                Add a billing method
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div style={{ padding: 32 }}>Loading job details...</div>;
  if (error) return <div style={{ padding: 32, color: "red" }}>{error}</div>;
  if (!job) return null;

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return "₹0";
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  // Search function to filter freelancers
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
    const urlParams = new URLSearchParams(location.search);
    if (term) {
      urlParams.set("q", term);
    } else {
      urlParams.delete("q");
    }
    urlParams.delete("page"); // Reset page when searching
    const newSearch = urlParams.toString();
    const newUrl = `${location.pathname}${newSearch ? "?" + newSearch : ""}`;
    navigate(newUrl, { replace: true });

    // Scroll to top when searching
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Pagination function
  const handlePageChange = (page) => {
    setCurrentPage(page);
    const urlParams = new URLSearchParams(location.search);
    if (page > 1) {
      urlParams.set("page", page.toString());
    } else {
      urlParams.delete("page");
    }
    const newSearch = urlParams.toString();
    const newUrl = `${location.pathname}${newSearch ? "?" + newSearch : ""}`;
    navigate(newUrl, { replace: true });

    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filter freelancers based on search term
  const filteredFreelancers = freelancers.filter((freelancer) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (freelancer.name &&
        freelancer.name.toLowerCase().includes(searchLower)) ||
      (freelancer.title &&
        freelancer.title.toLowerCase().includes(searchLower)) ||
      (freelancer.location &&
        freelancer.location.toLowerCase().includes(searchLower)) ||
      (freelancer.skills &&
        freelancer.skills.some(
          (skill) =>
            skill.name && skill.name.toLowerCase().includes(searchLower)
        ))
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredFreelancers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFreelancers = filteredFreelancers.slice(startIndex, endIndex);

  // Pagination component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 4;

      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 2) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push("...");
        } else if (currentPage >= totalPages - 1) {
          pages.push(1);
          pages.push("...");
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push("...");
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
          }
          pages.push("...");
        }
      }
      return pages;
    };

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Previous button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            width: 36,
            height: 36,
            border: "none",
            background: "transparent",
            color: currentPage === 1 ? "#ccc" : "#333",
            borderRadius: "50%",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
            fontSize: 18,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
            outline: "none",
          }}
        >
          ‹
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() =>
              typeof page === "number" ? handlePageChange(page) : null
            }
            disabled={page === "..."}
            style={{
              width: 36,
              height: 36,
              border: page === currentPage ? "2px solid #333" : "none",
              background: page === currentPage ? "transparent" : "transparent",
              color:
                page === currentPage
                  ? "#333"
                  : page === "..."
                  ? "#999"
                  : "#333",
              borderRadius: "50%",
              cursor: page === "..." ? "default" : "pointer",
              fontSize: 14,
              fontWeight: page === currentPage ? 600 : 400,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
              outline: "none",
            }}
          >
            {page}
          </button>
        ))}

        {/* Next button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            width: 36,
            height: 36,
            border: "none",
            background: "transparent",
            color: currentPage === totalPages ? "#ccc" : "#333",
            borderRadius: "50%",
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            fontSize: 18,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
            outline: "none",
          }}
        >
          ›
        </button>
      </div>
    );
  };

  // Tab content for each step
  const renderTabContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            {/* Summary Section */}
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 10 }}>
                Summary
              </div>
              <div style={{ color: "#222", fontSize: 18, lineHeight: 1.7 }}>
                {job.description || "No description provided."}
              </div>
            </div>
            {/* Job Details Row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 0,
                margin: "36px 0 0 0",
                paddingBottom: 36,
                borderBottom: "1px solid #ececec",
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,116,118,0.03)",
              }}
            >
              <div style={jobDetailColStyle}>
                <BsCalendar style={jobDetailIconStyle} />
                <div
                  style={{
                    fontWeight: 600,
                    color: "#222",
                    fontSize: 18,
                    marginBottom: 2,
                  }}
                >
                  {job.duration || "1 to 3 months"}
                </div>
                <div style={{ color: "#888", fontSize: 18 }}>Duration</div>
              </div>
              <div style={jobDetailColStyle}>
                <BsPeople style={jobDetailIconStyle} />
                <div
                  style={{
                    fontWeight: 600,
                    color: "#222",
                    fontSize: 18,
                    marginBottom: 2,
                  }}
                >
                  {job.experienceLevel || "Intermediate"}
                </div>
                <div style={{ color: "#888", fontSize: 18 }}>
                  I am looking for a mix of experience and value
                </div>
              </div>
              <div style={jobDetailColStyle}>
                <BsCreditCard style={jobDetailIconStyle} />
                <div
                  style={{
                    fontWeight: 600,
                    color: "#222",
                    fontSize: 18,
                    marginBottom: 2,
                  }}
                >
                  {job.budgetType === "fixed" && job.fixedRate
                    ? `₹${parseFloat(job.fixedRate).toFixed(2)}`
                    : job.budgetType === "hourly" &&
                      job.hourlyRateFrom &&
                      job.hourlyRateTo
                    ? `₹${parseFloat(job.hourlyRateFrom).toFixed(
                        2
                      )} - ₹${parseFloat(job.hourlyRateTo).toFixed(2)}`
                    : job.fixedRate
                    ? `₹${parseFloat(job.fixedRate).toFixed(2)}`
                    : job.hourlyRateFrom && job.hourlyRateTo
                    ? `₹${parseFloat(job.hourlyRateFrom).toFixed(
                        2
                      )} - ₹${parseFloat(job.hourlyRateTo).toFixed(2)}`
                    : "₹15.00 - ₹35.00"}
                </div>
                <div style={{ color: "#888", fontSize: 18 }}>
                  {job.budgetType === "fixed" ? "Fixed Price" : "Hourly Rate"}
                </div>
              </div>
            </div>
            {/* Attachment Section */}
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                padding: "28px 32px",
                margin: "32px 0 32px 0",
                border: "1px solid #ececec",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 22,
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                Attachment
              </div>
              {job.attachments ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "16px",
                    background:
                      "linear-gradient(135deg, rgba(0, 118, 116, 0.05) 0%, rgba(0, 118, 116, 0.02) 100%)",
                    border: "1px solid rgba(0, 118, 116, 0.1)",
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, rgba(0, 118, 116, 0.1) 0%, rgba(0, 118, 116, 0.05) 100%)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0, 118, 116, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, rgba(0, 118, 116, 0.05) 0%, rgba(0, 118, 116, 0.02) 100%)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  onClick={() => handleAttachmentClick(job.attachments)}
                >
                  <div
                    style={{
                      background: "#007674",
                      borderRadius: "50%",
                      width: "48px",
                      height: "48px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <BsPaperclip
                      style={{
                        color: "#fff",
                        fontSize: 20,
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        color: "#007674",
                        fontWeight: 600,
                        fontSize: 16,
                        marginBottom: 4,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {job.attachmentDetails?.fileName || "Document"}
                    </div>
                    <div
                      style={{
                        color: "#666",
                        fontSize: 14,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span>
                        {job.attachmentDetails?.fileSize
                          ? formatFileSize(job.attachmentDetails.fileSize)
                          : "PDF Document"}
                      </span>
                      <span>•</span>
                      <span>Click to open</span>
                    </div>
                  </div>
                  <div
                    style={{
                      color: "#007674",
                      fontSize: 16,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {attachmentLoading ? (
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid #007674",
                          borderTop: "2px solid transparent",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                    ) : (
                      "→"
                    )}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    color: "#888",
                    fontSize: 18,
                    padding: "16px",
                    background: "#f8f9fa",
                    border: "1px solid #e9ecef",
                    borderRadius: "12px",
                    textAlign: "center",
                  }}
                >
                  No attachment
                </div>
              )}
            </div>
            {/* Project Type Section */}
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                padding: "28px 32px",
                margin: "0 0 32px 0",
                border: "1px solid #ececec",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 20 }}>
                Project Type:{" "}
              </span>
              <span
                style={{
                  color: "#222",
                  fontSize: 20,
                  fontWeight: 400,
                  marginLeft: 8,
                }}
              >
                {job.scopeOfWork || "Ongoing project"}
              </span>
            </div>
            {/* Skills and Expertise Section */}
            <style>{`
              .skill-tag {
                background: linear-gradient(135deg, rgba(0, 118, 116, 0.1) 0%, rgba(0, 118, 116, 0.05) 100%);
                color: #007674;
                border: 1px solid rgba(0, 118, 116, 0.2);
                border-radius: 20px;
                padding: 10px 26px;
                font-size: 16px;
                font-weight: 600;
                display: inline-block;
                box-shadow: 0 1px 3px rgba(0,0,0,0.03);
                margin-bottom: 6px;
                margin-right: 6px;
                transition: all 0.3s ease;
                cursor: pointer;
              }
              .skill-tag:hover {
                background: linear-gradient(135deg, #007674 0%, #005a58 100%);
                color: white;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 118, 116, 0.3);
              }
            `}</style>
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                padding: "28px 32px",
                margin: "0 0 32px 0",
                border: "1px solid #ececec",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 15 }}>
                Skills and Expertise
              </div>
              <div
                style={{
                  color: "#222",
                  fontWeight: 500,
                  fontSize: 18,
                  marginBottom: 12,
                }}
              >
                Mandatory skills
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 0 }}>
                {(job.skills && job.skills.length > 0
                  ? job.skills
                  : [
                      { name: "Web Development" },
                      { name: "WordPress" },
                      { name: "Web Design" },
                      { name: "PHP" },
                      { name: "JavaScript" },
                    ]
                ).map((skill, i) => (
                  <span key={i} className="skill-tag">
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
            {/* Activity on this job Section */}
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                padding: "28px 32px",
                margin: "0 0 32px 0",
                border: "1px solid #ececec",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 14 }}>
                Activity on this job
              </div>
              <div style={{ color: "#222", fontSize: 18, marginBottom: 4 }}>
                Proposals:{" "}
                <span
                  style={{
                    color: "#007476",
                    fontWeight: 500,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <BsInfoCircle style={{ fontSize: 18, verticalAlign: -2 }} />{" "}
                  Less than 5
                </span>
              </div>
              <div style={{ color: "#222", fontSize: 18, marginBottom: 4 }}>
                Interviewing: 0
              </div>
              <div style={{ color: "#222", fontSize: 18, marginBottom: 4 }}>
                Invites sent: 0
              </div>
              <div style={{ color: "#222", fontSize: 18 }}>
                Unanswered invites: 0
              </div>
            </div>
          </>
        );
      case 1:
        // Invite Freelancers tab
        return (
          <div style={{ width: "100%", padding: "0 0px" }}>
            {/* Tabs */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 36,
                marginBottom: 24,
                marginTop: 10,
                position: "relative",
              }}
            >
              <span
                onClick={() => handleInviteTabChange("search")}
                style={{
                  fontWeight: activeInviteTab === "search" ? 600 : 600,
                  fontSize: activeInviteTab === "search" ? 20 : 20,
                  color: activeInviteTab === "search" ? "#222" : "#888",
                  borderBottom:
                    activeInviteTab === "search"
                      ? "2.5px solid #222"
                      : "2.5px solid transparent",
                  paddingBottom: 6,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  position: "relative",
                }}
              >
                Search
              </span>
              <span
                onClick={() => handleInviteTabChange("invited")}
                style={{
                  fontWeight: activeInviteTab === "invited" ? 600 : 600,
                  fontSize: activeInviteTab === "invited" ? 20 : 20,
                  color: activeInviteTab === "invited" ? "#222" : "#888",
                  borderBottom:
                    activeInviteTab === "invited"
                      ? "2.5px solid #222"
                      : "2.5px solid transparent",
                  paddingBottom: 6,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  position: "relative",
                }}
              >
                Invited Freelancers ({invitedCount})
              </span>
              <span
                onClick={() => handleInviteTabChange("hires")}
                style={{
                  fontWeight: activeInviteTab === "hires" ? 600 : 600,
                  fontSize: activeInviteTab === "hires" ? 20 : 20,
                  color: activeInviteTab === "hires" ? "#222" : "#888",
                  borderBottom:
                    activeInviteTab === "hires"
                      ? "2.5px solid #222"
                      : "2.5px solid transparent",
                  paddingBottom: 6,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  position: "relative",
                }}
              >
                My Hires
              </span>
            </div>

            {/* Tab Content */}
            {activeInviteTab === "search" && (
              <>
                {/* Search/filter row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    marginBottom: 24,
                  }}
                >
                  <div style={{ flex: 1, position: "relative" }}>
                    <input
                      type="text"
                      placeholder="Search freelancers by name, skills, or location..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 18px 12px 45px",
                        border: "1.5px solid #bbb",
                        borderRadius: 8,
                        fontSize: 17,
                        outline: "none",
                        background: "#fff",
                      }}
                    />
                    <svg
                      style={{
                        position: "absolute",
                        left: 15,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 20,
                        height: 20,
                      }}
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        stroke="#666"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <button
                    onClick={() => {
                      if (showFilters) {
                        // Start closing animation
                        setIsClosing(true);
                        // Wait for animation to complete before hiding
                        setTimeout(() => {
                          setShowFilters(false);
                          setIsClosing(false);
                        }, 300); // Match animation duration
                      } else {
                        setShowFilters(true);
                        setIsClosing(false);
                      }
                    }}
                    style={{
                      border: "1.5px solid #007476",
                      color: "#007476",
                      background: "#fff",
                      borderRadius: 8,
                      padding: "8px 22px",
                      fontWeight: 700,
                      fontSize: 18,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                    }}
                  >
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                      <path
                        d="M3 6h18M3 12h18M3 18h18"
                        stroke="#007476"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Filters
                  </button>
                </div>

                {/* Inline Filter Section */}
                {showFilters && !inviteModalData && (
                  <div
                    style={{
                      background: "#fff",
                      marginBottom: 24,
                      animation: isClosing
                        ? "slideUp 0.3s ease-out"
                        : "slideDown 0.3s ease-out",
                      overflow: "hidden",
                    }}
                  >
                    {/* Filter Categories in 4 Columns */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: 32,
                        marginBottom: 24,
                      }}
                    >
                      {/* Column 1 - Earned Amount */}
                      <div>
                        <h4
                          style={{
                            fontSize: 22,
                            fontWeight: 600,
                            color: "#222",
                            marginBottom: 16,
                          }}
                        >
                          Earned amount:
                        </h4>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                          }}
                        >
                          {[
                            "Any amount earned",
                            "₹1+ earned",
                            "₹100+ earned",
                            "₹1K+ earned",
                            "₹10K+ earned",
                            "No earnings yet",
                          ].map((option, index) => (
                            <label
                              key={index}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                cursor: "pointer",
                                fontSize: 18,
                              }}
                            >
                              <input
                                type="radio"
                                name="earnedAmount"
                                defaultChecked={index === 0}
                                style={{
                                  accentColor: "#007476",
                                  width: "20px",
                                  height: "20px",
                                }}
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Column 2 - Job Success */}
                      <div>
                        <h4
                          style={{
                            fontSize: 22,
                            fontWeight: 600,
                            color: "#222",
                            marginBottom: 16,
                          }}
                        >
                          Job Success:
                        </h4>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                          }}
                        >
                          {["Any job success", "80% & up", "90% & up"].map(
                            (option, index) => (
                              <label
                                key={index}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  cursor: "pointer",
                                  fontSize: 18,
                                }}
                              >
                                <input
                                  type="radio"
                                  name="jobSuccess"
                                  defaultChecked={index === 0}
                                  style={{
                                    accentColor: "#007476",
                                    width: "20px",
                                    height: "20px",
                                  }}
                                />
                                <span>{option}</span>
                              </label>
                            )
                          )}
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              cursor: "pointer",
                              fontSize: 18,
                            }}
                          >
                            <input
                              type="radio"
                              name="jobSuccess"
                              style={{
                                accentColor: "#007476",
                                width: "20px",
                                height: "20px",
                              }}
                            />
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              Top Rated Plus{" "}
                              <span style={{ color: "#e91e63", fontSize: 18 }}>
                                ⭐
                              </span>
                            </span>
                          </label>
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              cursor: "pointer",
                              fontSize: 18,
                            }}
                          >
                            <input
                              type="radio"
                              name="jobSuccess"
                              style={{
                                accentColor: "#007476",
                                width: "20px",
                                height: "20px",
                              }}
                            />
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              Top Rated{" "}
                              <span style={{ color: "#007bff", fontSize: 18 }}>
                                ⭐
                              </span>
                            </span>
                          </label>
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              cursor: "pointer",
                              fontSize: 18,
                            }}
                          >
                            <input
                              type="checkbox"
                              style={{
                                accentColor: "#007476",
                                width: "20px",
                                height: "20px",
                              }}
                            />
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              Rising Talent{" "}
                              <span style={{ color: "#28a745", fontSize: 18 }}>
                                ↗
                              </span>
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Column 3 - Hourly Rate */}
                      <div>
                        <h4
                          style={{
                            fontSize: 22,
                            fontWeight: 600,
                            color: "#222",
                            marginBottom: 16,
                          }}
                        >
                          Hourly Rate:
                        </h4>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                          }}
                        >
                          {[
                            "Any hourly rate",
                            "₹10 and below",
                            "₹10 - ₹30",
                            "₹30 - ₹60",
                            "₹60 & above",
                          ].map((option, index) => (
                            <label
                              key={index}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                cursor: "pointer",
                                fontSize: 18,
                              }}
                            >
                              <input
                                type="radio"
                                name="hourlyRate"
                                defaultChecked={index === 0}
                                style={{
                                  accentColor: "#007476",
                                  width: "20px",
                                  height: "20px",
                                }}
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Column 4 - Category */}
                      <div>
                        <h4
                          style={{
                            fontSize: 22,
                            fontWeight: 600,
                            color: "#222",
                            marginBottom: 16,
                          }}
                        >
                          Category:
                        </h4>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                          }}
                        >
                          {[
                            "Any category",
                            "Customer Service",
                            "Design & Creative",
                            "Web, Mobile & Software Dev",
                          ].map((option, index) => (
                            <label
                              key={index}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                cursor: "pointer",
                                fontSize: 18,
                              }}
                            >
                              <input
                                type="radio"
                                name="category"
                                defaultChecked={index === 0}
                                style={{
                                  accentColor: "#007476",
                                  width: "20px",
                                  height: "20px",
                                }}
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                          <button
                            style={{
                              background: "none",
                              border: "none",
                              color: "#007476",
                              fontSize: 18,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              padding: 0,
                            }}
                          >
                            See all categories <span>▼</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Close Filter Button */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-start",
                        borderBottom: "1px solid #eee",
                        paddingBottom: 16,
                      }}
                    >
                      <button
                        onClick={() => {
                          setIsClosing(true);
                          setTimeout(() => {
                            setShowFilters(false);
                            setIsClosing(false);
                          }, 300);
                        }}
                        style={{
                          background: "#007476",
                          border: "none",
                          borderRadius: 8,
                          padding: "12px 24px",
                          fontWeight: 700,
                          fontSize: 16,
                          cursor: "pointer",
                          color: "#fff",
                        }}
                      >
                        Close filters
                      </button>
                    </div>
                  </div>
                )}

                {/* Freelancer cards */}
                {freelancersLoading ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      color: "#888",
                      fontSize: 18,
                      background: "#fff",
                      borderRadius: 10,
                      border: "1px solid #eee",
                    }}
                  >
                    Loading freelancers...
                  </div>
                ) : freelancersError ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      color: "red",
                      fontSize: 18,
                      background: "#fff",
                      borderRadius: 10,
                      border: "1px solid #eee",
                    }}
                  >
                    {freelancersError}
                  </div>
                ) : filteredFreelancers.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      color: "#888",
                      fontSize: 18,
                      background: "#fff",
                      borderRadius: 10,
                      border: "1px solid #eee",
                    }}
                  >
                    {searchTerm
                      ? `No freelancers found matching "${searchTerm}"`
                      : "No freelancers available"}
                  </div>
                ) : (
                  <>
                    {paginatedFreelancers.map((freelancer, index) => (
                      <div
                        key={freelancer.id}
                        style={{
                          background: "#fff",
                          borderRadius: 10,
                          padding: 24,
                          marginBottom: index < freelancers.length - 1 ? 0 : 0,
                          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                          border: "1px solid #eee",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 20,
                        }}
                      >
                        {/* Avatar and star badge */}
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          <img
                            src={freelancer.avatar}
                            alt={freelancer.name}
                            style={{
                              width: 64,
                              height: 64,
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "3px solid #fff",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              bottom: -4,
                              right: -4,
                              background: "#fff",
                              borderRadius: "50%",
                              padding: 2,
                              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <FaStar
                              style={{ color: "#007bff", fontSize: 18 }}
                            />
                          </div>
                        </div>

                        {/* Main content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              marginBottom: 4,
                            }}
                          >
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: 18,
                                color: "#222",
                              }}
                            >
                              {freelancer.name}
                            </span>
                            {freelancer.boosted && (
                              <span
                                style={{
                                  color: "#6f42c1",
                                  fontWeight: 600,
                                  fontSize: 13,
                                  background: "#f3f0fa",
                                  borderRadius: 6,
                                  padding: "2px 8px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <FaBolt
                                  style={{ color: "#6f42c1", fontSize: 12 }}
                                />
                                Boosted
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: 18,
                              color: "#222",
                              fontWeight: 500,
                              marginBottom: 4,
                              lineHeight: 1.4,
                            }}
                          >
                            {freelancer.title}
                          </div>
                          <div
                            style={{
                              color: "#888",
                              fontSize: 15,
                              marginBottom: 8,
                            }}
                          >
                            {freelancer.location}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 24,
                              marginBottom: 8,
                            }}
                          >
                            <span
                              style={{
                                color: "#222",
                                fontWeight: 600,
                                fontSize: 18,
                              }}
                            >
                              ₹
                              {freelancer.rate
                                ? freelancer.rate.toFixed(2)
                                : "-"}
                              /hr
                            </span>
                            {freelancer.jobSuccess > 0 && (
                              <span
                                style={{
                                  color: "#28a745",
                                  fontWeight: 600,
                                  fontSize: 16,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <BsCheckCircle
                                  style={{
                                    color: "#28a745",
                                    fontSize: 18,
                                    marginRight: 4,
                                  }}
                                />
                                {freelancer.jobSuccess}% Job Success
                              </span>
                            )}
                            <span
                              style={{
                                color: "#888",
                                fontWeight: 600,
                                fontSize: 16,
                              }}
                            >
                              {freelancer.earned}
                            </span>
                          </div>

                          {freelancer.topSkills &&
                            freelancer.topSkills.length > 0 && (
                              <div style={{ marginTop: 12 }}>
                                <div
                                  style={{
                                    color: "#222",
                                    fontSize: 15,
                                    marginBottom: 8,
                                    fontWeight: 500,
                                  }}
                                >
                                  Here are their top{" "}
                                  {freelancer.topSkills.length} relevant skills
                                  to your job
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 8,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  {freelancer.topSkills.map((skill, i) => (
                                    <span
                                      key={i}
                                      style={{
                                        background: "#ededed",
                                        color: "#222",
                                        borderRadius: 16,
                                        padding: "6px 16px",
                                        fontWeight: 600,
                                        fontSize: 15,
                                      }}
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "flex-end",
                            gap: 12,
                            minWidth: 120,
                            flexShrink: 0,
                          }}
                        >
                          <button onClick={() => navigate(`/ws/client/offer/job-application/${freelancer.id}`, {
                              state: {
                                jobId: job?.id,
                                job: job,
                              },
                            })}
                            style={{
                              border: "1.5px solid #007476",
                              color: "#007476",
                              background: "#fff",
                              borderRadius: 8,
                              padding: "8px 22px",
                              fontWeight: 700,
                              fontSize: 18,
                              cursor: "pointer",
                              transition: "background 0.2s",
                              minWidth: 80,
                            }}
                          >
                            Hire
                          </button>
                          {invitedFreelancerIds.includes(freelancer.id) ? (
                            <button
                              style={{
                                border: "1.5px solid #bbb",
                                color: "#bbb",
                                background: "#eee",
                                borderRadius: 8,
                                padding: "8px 22px",
                                fontWeight: 700,
                                fontSize: 18,
                                minWidth: 120,
                                cursor: "not-allowed",
                              }}
                              disabled
                            >
                              Invited
                            </button>
                          ) : (
                            <button
                              style={{
                                border: "1.5px solid #007476",
                                color: "#fff",
                                background: "#007476",
                                borderRadius: 8,
                                padding: "8px 22px",
                                fontWeight: 700,
                                fontSize: 18,
                                cursor: "pointer",
                                transition: "background 0.2s",
                                minWidth: 120,
                              }}
                              onClick={() => {
                                if (showFilters) {
                                  setShowFilters(false);
                                  setIsClosing(false);
                                }
                                setInviteModalData(freelancer);
                                setInviteMessage(
                                  `Hey there! 👋!\n\nI'd love for you to check out the job I've posted. If it sounds like a good fit for you, feel free to send in a proposal — I'd be excited to hear from you!\n\n${clientName}.`
                                );
                              }}
                            >
                              Invite to Job
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Pagination - Right aligned */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 32,
                    padding: "20px 0",
                  }}
                >
                  <Pagination />
                </div>
              </>
            )}

            {/* Invited Freelancers Tab */}
            {activeInviteTab === "invited" && (
              <>
                {invitedFreelancerIds.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "80px 20px",
                      color: "#888",
                      fontSize: 18,
                      background: "#fff",
                      borderRadius: 10,
                      border: "1px solid #eee",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 26,
                        fontWeight: 600,
                        color: "#495057",
                        marginBottom: 12,
                      }}
                    >
                      No invited freelancers yet
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        color: "#6c757d",
                        marginBottom: 30,
                        textAlign: "center",
                      }}
                    >
                      Invite top talent before they're booked.
                    </div>

                    {/* Invite Button */}
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <button
                        onClick={() => handleInviteTabChange("search")}
                        style={{
                          background:
                            "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: 15,
                          padding: "12px 24px",
                          fontSize: "1rem",
                          fontWeight: 600,
                          transition: "all 0.3s ease",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          cursor: "pointer",
                          boxShadow: "0 6px 20px rgba(0, 118, 116, 0.3)",
                        }}
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
                        Invite Freelancers
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: "20px 0" }}>
                    {freelancers
                      .filter((freelancer) =>
                        invitedFreelancerIds.includes(freelancer.id)
                      )
                      .map((freelancer) => (
                        <div
                          key={freelancer.id}
                          style={{
                            background: "#fff",
                            borderRadius: 12,
                            padding: 24,
                            marginBottom: 20,
                            border: "1px solid #e9ecef",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 16,
                            }}
                          >
                            {/* Profile Picture */}
                            <div style={{ position: "relative" }}>
                              <img
                                src={
                                  freelancer.avatar ||
                                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                                }
                                alt={freelancer.name}
                                style={{
                                  width: 80,
                                  height: 80,
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                }}
                              />
                              {/* Online Status */}
                              <div
                                style={{
                                  position: "absolute",
                                  top: 4,
                                  left: 4,
                                  width: 16,
                                  height: 16,
                                  background:
                                    freelancer.onlineStatus === "online"
                                      ? "#28a745"
                                      : "#6c757d",
                                  borderRadius: "50%",
                                  border: "2px solid #fff",
                                }}
                              ></div>
                            </div>

                            {/* Freelancer Info */}
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                }}
                              >
                                <div>
                                  <h3
                                    style={{
                                      margin: "0 0 10px 0",
                                      fontSize: 24,
                                      fontWeight: 600,
                                      color: "#333",
                                      cursor: "pointer",
                                      letterSpacing: 0.3,
                                    }}
                                    onClick={() =>
                                      navigate(
                                        `/ws/freelancers/${freelancer.id}`
                                      )
                                    }
                                  >
                                    {freelancer.name}
                                  </h3>
                                  <p
                                    style={{
                                      margin: "0 0 8px 0",
                                      fontSize: 18,
                                      color: "#121212",
                                      fontWeight: 500,
                                    }}
                                  >
                                    {freelancer.title}
                                  </p>
                                  <p
                                    style={{
                                      margin: "0 0 8px 0",
                                      fontSize: 18,
                                      color: "#121212",
                                    }}
                                  >
                                    {freelancer.location}
                                  </p>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 16,
                                      marginBottom: 12,
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: 16,
                                        color: "#333",
                                        fontWeight: 600,
                                      }}
                                    >
                                      ₹{freelancer.rate}/hr
                                    </span>
                                    <span
                                      style={{ fontSize: 16, color: "#121212" }}
                                    >
                                      {freelancer.earned}
                                    </span>
                                    {freelancer.jobSuccess > 0 && (
                                      <span
                                        style={{
                                          fontSize: 14,
                                          color: "#28a745",
                                          fontWeight: 600,
                                        }}
                                      >
                                        {freelancer.jobSuccess}% Job Success
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 15,
                                    alignItems: "center",
                                  }}
                                >
                                  {/* Decline Button */}
                                  <button
                                    style={{
                                      border: "1px solid #007476",
                                      color: "#007476",
                                      background: "#fff",
                                      borderRadius: 8,
                                      padding: "8px 16px",
                                      fontWeight: 600,
                                      fontSize: 18,
                                      cursor: "pointer",
                                      transition: "all 0.2s",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.background = "#007476";
                                      e.target.style.color = "#fff";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.background = "#fff";
                                      e.target.style.color = "#007476";
                                    }}
                                    onClick={async () => {
                                      try {
                                        const res = await axios.delete(
                                          `${API_URL}/job-invite/delete/`,
                                          {
                                            data: {
                                              jobId: jobid,
                                              freelancerId: freelancer.id,
                                            },
                                            withCredentials: true,
                                          }
                                        );
                                        if (res.data && res.data.success) {
                                          setInvitedFreelancerIds((prev) =>
                                            prev.filter(
                                              (id) => id !== freelancer.id
                                            )
                                          );
                                          setInvitedCount(
                                            res.data.invitedCount
                                          );
                                        } else {
                                          alert(
                                            res.data && res.data.message
                                              ? res.data.message
                                              : "Failed to decline invitation"
                                          );
                                        }
                                      } catch (err) {
                                        alert("Failed to decline invitation");
                                      }
                                    }}
                                  >
                                    Decline
                                  </button>

                                  {/* Hire Button */}
                                  <button
                                    style={{
                                      border: "1px solid #007476",
                                      color: "#fff",
                                      background: "#007476",
                                      borderRadius: 8,
                                      padding: "8px 16px",
                                      fontWeight: 600,
                                      fontSize: 18,
                                      cursor: "pointer",
                                      transition: "all 0.2s",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.background = "#005a58";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.background = "#007476";
                                    }}
                                    onClick={() => navigate(`/ws/client/offer/job-application/${freelancer.id}`, {
                                      state: {
                                        jobId: job?.id,
                                        job: job,
                                      },
                                    })}
                                  >
                                    Hire
                                  </button>
                                </div>
                              </div>

                              {/* Invited Status Tag */}
                              <div
                                style={{
                                  display: "inline-block",
                                  background: "#e3f2fd",
                                  color: "#1976d2",
                                  padding: "4px 12px",
                                  borderRadius: 16,
                                  fontSize: 16,
                                  fontWeight: 600,
                                  marginBottom: 15,
                                }}
                              >
                                Invited
                              </div>

                              {/* Bio/Description */}
                              <p
                                style={{
                                  margin: "0 0 20px 0",
                                  fontSize: 18,
                                  color: "#121212",
                                  lineHeight: 1.5,
                                }}
                              >
                                {freelancer.bio &&
                                freelancer.bio.length > 180 ? (
                                  <>
                                    {expandedBios[freelancer.id]
                                      ? freelancer.bio
                                      : freelancer.bio.slice(0, 180) + "..."}
                                    <span
                                      style={{
                                        color: "#007674",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        marginLeft: 8,
                                        fontSize: 16,
                                      }}
                                      onClick={() =>
                                        setExpandedBios((prev) => ({
                                          ...prev,
                                          [freelancer.id]: !prev[freelancer.id],
                                        }))
                                      }
                                    >
                                      {expandedBios[freelancer.id]
                                        ? "Show less"
                                        : "Read more"}
                                    </span>
                                  </>
                                ) : (
                                  freelancer.bio || ""
                                )}
                              </p>

                              {/* Skills */}
                              {freelancer.skills &&
                                freelancer.skills.length > 0 && (
                                  <div style={{ marginTop: 16 }}>
                                    <h6
                                      style={{
                                        color: "#121212",
                                        fontSize: "1rem",
                                        fontWeight: 600,
                                        marginBottom: 12,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                      }}
                                    >
                                      <FaStar
                                        style={{ color: "#007674" }}
                                        size={14}
                                      />
                                      Top Skills
                                    </h6>
                                    <div
                                      style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 8,
                                      }}
                                    >
                                      {freelancer.skills
                                        .slice(0, 5)
                                        .map((skill, index) => (
                                          <span
                                            key={skill.id || index}
                                            style={{
                                              background:
                                                "linear-gradient(135deg, rgba(0, 118, 116, 0.1) 0%, rgba(0, 118, 116, 0.05) 100%)",
                                              color: "#007674",
                                              border:
                                                "1px solid rgba(0, 118, 116, 0.2)",
                                              borderRadius: 20,
                                              padding: "6px 12px",
                                              fontSize: "1rem",
                                              fontWeight: 600,
                                              transition: "all 0.3s ease",
                                              cursor: "pointer",
                                            }}
                                            onMouseEnter={(e) => {
                                              e.target.style.background =
                                                "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                                              e.target.style.color = "white";
                                              e.target.style.transform =
                                                "translateY(-1px)";
                                              e.target.style.boxShadow =
                                                "0 4px 12px rgba(0, 118, 116, 0.3)";
                                            }}
                                            onMouseLeave={(e) => {
                                              e.target.style.background =
                                                "linear-gradient(135deg, rgba(0, 118, 116, 0.1) 0%, rgba(0, 118, 116, 0.05) 100%)";
                                              e.target.style.color = "#007674";
                                              e.target.style.transform =
                                                "translateY(0)";
                                              e.target.style.boxShadow = "none";
                                            }}
                                          >
                                            {skill.name}
                                          </span>
                                        ))}
                                      {freelancer.skills.length > 5 && (
                                        <span
                                          style={{
                                            background:
                                              "linear-gradient(135deg, rgba(0, 118, 116, 0.1) 0%, rgba(0, 118, 116, 0.05) 100%)",
                                            color: "#007674",
                                            border:
                                              "1px solid rgba(0, 118, 116, 0.2)",
                                            borderRadius: 20,
                                            padding: "6px 12px",
                                            fontSize: "0.85rem",
                                            fontWeight: 600,
                                            transition: "all 0.3s ease",
                                            cursor: "pointer",
                                          }}
                                          onMouseEnter={(e) => {
                                            e.target.style.background =
                                              "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                                            e.target.style.color = "white";
                                            e.target.style.transform =
                                              "translateY(-1px)";
                                            e.target.style.boxShadow =
                                              "0 4px 12px rgba(0, 118, 116, 0.3)";
                                          }}
                                          onMouseLeave={(e) => {
                                            e.target.style.background =
                                              "linear-gradient(135deg, rgba(0, 118, 116, 0.1) 0%, rgba(0, 118, 116, 0.05) 100%)";
                                            e.target.style.color = "#007674";
                                            e.target.style.transform =
                                              "translateY(0)";
                                            e.target.style.boxShadow = "none";
                                          }}
                                        >
                                          +{freelancer.skills.length - 5} more
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </>
            )}

            {/* My Hires Tab */}
            {activeInviteTab === "hires" && (
              <div
                style={{
                  textAlign: "center",
                  padding: "80px 20px",
                  color: "#888",
                  fontSize: 18,
                  background: "#fff",
                  borderRadius: 12,
                  border: "1px solid #eee",
                }}
              >
                {/* Overlapping Profile Cards Graphic */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 40,
                    position: "relative",
                    height: 120,
                  }}
                >
                  {/* Left Card (faded) */}
                  <div
                    style={{
                      position: "absolute",
                      left: "25%",
                      transform: "translateX(-50%)",
                      background: "#f8f9fa",
                      borderRadius: "12px 12px 8px 8px",
                      padding: "16px 12px",
                      width: 80,
                      height: 100,
                      opacity: 0.6,
                      zIndex: 1,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#e9ecef",
                        margin: "0 auto 8px auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          background: "#6c757d",
                          borderRadius: "50%",
                        }}
                      ></div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 1,
                        marginBottom: 6,
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((star, i) => (
                        <div
                          key={i}
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: i < 2 ? "#ffc107" : "#e9ecef",
                          }}
                        ></div>
                      ))}
                    </div>
                    <div
                      style={{
                        height: 4,
                        background: "linear-gradient(90deg, #e91e63, #9c27b0)",
                        borderRadius: 2,
                        marginTop: 4,
                      }}
                    ></div>
                  </div>

                  {/* Center Card (prominent) */}
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#fff",
                      borderRadius: "12px 12px 8px 8px",
                      padding: "20px 16px",
                      width: 90,
                      height: 110,
                      zIndex: 3,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                      border: "1px solid #e9ecef",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "#28a745",
                        margin: "0 auto 10px auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          background: "#fff",
                          borderRadius: "50%",
                        }}
                      ></div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 1,
                        marginBottom: 8,
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((star, i) => (
                        <div
                          key={i}
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: "#ffc107",
                          }}
                        ></div>
                      ))}
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: "linear-gradient(90deg, #e91e63, #9c27b0)",
                        borderRadius: 3,
                        marginTop: 6,
                      }}
                    ></div>
                  </div>

                  {/* Right Card (faded) */}
                  <div
                    style={{
                      position: "absolute",
                      left: "75%",
                      transform: "translateX(-50%)",
                      background: "#f8f9fa",
                      borderRadius: "12px 12px 8px 8px",
                      padding: "16px 12px",
                      width: 80,
                      height: 100,
                      opacity: 0.6,
                      zIndex: 1,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#e9ecef",
                        margin: "0 auto 8px auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          background: "#6c757d",
                          borderRadius: "50%",
                        }}
                      ></div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 1,
                        marginBottom: 6,
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((star, i) => (
                        <div
                          key={i}
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: i < 2 ? "#ffc107" : "#e9ecef",
                          }}
                        ></div>
                      ))}
                    </div>
                    <div
                      style={{
                        height: 4,
                        background: "linear-gradient(90deg, #e91e63, #9c27b0)",
                        borderRadius: 2,
                        marginTop: 4,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Text Content */}
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 600,
                    color: "#495057",
                    marginBottom: 12,
                  }}
                >
                  You haven't hired anyone yet
                </div>
                <div
                  style={{
                    fontSize: 18,
                    color: "#6c757d",
                    marginBottom: 30,
                    textAlign: "center",
                  }}
                >
                  Search for freelancers who can help you get work done.
                </div>

                {/* Search Button */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <button
                    onClick={() => handleInviteTabChange("search")}
                    style={{
                      background:
                        "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 15,
                      padding: "12px 24px",
                      fontSize: "1rem",
                      fontWeight: 600,
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      cursor: "pointer",
                      boxShadow: "0 6px 20px rgba(0, 118, 116, 0.3)",
                    }}
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
                    Search for Freelancers
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div style={{ width: "100%", padding: "0 0px" }}>
            <style>{`
              .skill-tag {
                background: linear-gradient(135deg, rgba(0, 118, 116, 0.1) 0%, rgba(0, 118, 116, 0.05) 100%);
                color: #007674;
                border: 1px solid rgba(0, 118, 116, 0.2);
                border-radius: 20px;
                padding: 6px 12px;
                font-size: 0.85rem;
                font-weight: 600;
                transition: all 0.3s ease;
                cursor: pointer;
                display: inline-block;
              }
              .skill-tag:hover {
                background: linear-gradient(135deg, #007674 0%, #005a58 100%);
                color: white;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 118, 116, 0.3);
              }
            `}</style>
            {/* Tabs */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 36,
                marginBottom: 24,
                marginTop: 10,
                position: "relative",
              }}
            >
              <span
                onClick={() => handleProposalTabChange("all")}
                style={{
                  fontWeight: activeProposalTab === "all" ? 600 : 600,
                  fontSize: activeProposalTab === "all" ? 20 : 20,
                  color: activeProposalTab === "all" ? "#222" : "#888",
                  borderBottom:
                    activeProposalTab === "all"
                      ? "2.5px solid #222"
                      : "2.5px solid transparent",
                  paddingBottom: 6,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  position: "relative",
                }}
              >
                All proposals
              </span>
              <span
                onClick={() => handleProposalTabChange("messaged")}
                style={{
                  fontWeight: activeProposalTab === "messaged" ? 600 : 600,
                  fontSize: activeProposalTab === "messaged" ? 20 : 20,
                  color: activeProposalTab === "messaged" ? "#222" : "#888",
                  borderBottom:
                    activeProposalTab === "messaged"
                      ? "2.5px solid #222"
                      : "2.5px solid transparent",
                  paddingBottom: 6,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  position: "relative",
                }}
              >
                Messaged
              </span>
            </div>

            {/* Tab Content */}
            {activeProposalTab === "all" && (
              <div style={{ width: "100%" }}>
                {proposalsLoading ? (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <div style={{ fontSize: "18px", color: "#666" }}>
                      Loading proposals...
                    </div>
                  </div>
                ) : proposalsError ? (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <div style={{ fontSize: "18px", color: "#dc3545" }}>
                      {proposalsError}
                    </div>
                  </div>
                ) : proposals.length === 0 ? (
                  <div style={{ maxWidth: 400, margin: "0 auto" }}>
                    {/* Briefcase Icon */}
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        margin: "0 auto 32px auto",
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {/* Main briefcase body */}
                      <div
                        style={{
                          width: 60,
                          height: 45,
                          background: "#8B4513",
                          borderRadius: "8px 8px 12px 12px",
                          position: "relative",
                          boxShadow: "0 4px 12px rgba(139, 69, 19, 0.3)",
                        }}
                      >
                        {/* Briefcase handle */}
                        <div
                          style={{
                            position: "absolute",
                            top: -8,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 20,
                            height: 8,
                            background: "#A0522D",
                            borderRadius: "4px 4px 0 0",
                            border: "2px solid #8B4513",
                          }}
                        ></div>

                        {/* Briefcase opening with glow */}
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 8,
                            background:
                              "linear-gradient(90deg, #87CEEB, #98FB98)",
                            borderRadius: "8px 8px 0 0",
                            opacity: 0.8,
                          }}
                        ></div>

                        {/* Small tag on the right */}
                        <div
                          style={{
                            position: "absolute",
                            top: 8,
                            right: -4,
                            width: 8,
                            height: 12,
                            background: "#D2B48C",
                            borderRadius: "2px 0 0 2px",
                            transform: "rotate(15deg)",
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Primary Message */}
                    <div
                      style={{
                        fontSize: 26,
                        fontWeight: 700,
                        color: "#000",
                        textAlign: "center",
                        marginBottom: 16,
                        lineHeight: 1.2,
                      }}
                    >
                      No qualified proposals yet
                    </div>

                    {/* Secondary Call to Action */}
                    <div
                      style={{
                        fontSize: 18,
                        color: "#666",
                        marginBottom: 40,
                        textAlign: "center",
                        lineHeight: 1.5,
                      }}
                    >
                      Feature this job post to get proposals faster and attract
                      top freelancers.
                    </div>

                    {/* Invite Freelancers Button */}
                    <button
                      onClick={() => handleStepClick(1)}
                      style={{
                        background:
                          "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: 15,
                        padding: "14px 32px",
                        fontSize: "1rem",
                        fontWeight: 600,
                        transition: "all 0.3s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        cursor: "pointer",
                        boxShadow: "0 6px 20px rgba(0, 118, 116, 0.3)",
                        margin: "0 auto",
                      }}
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
                      Invite Freelancers
                    </button>
                  </div>
                ) : (
                  // Proposals List with the new layout
                  <div style={{ padding: "20px 0" }}>
                    {proposals.map((proposal, index) => (
                      <div
                        key={proposal.id || index}
                        style={{
                          background: "#ffffff",
                          borderRadius: "12px",
                          padding: "0",
                          marginBottom: "16px",
                          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.06)",
                          border: "1px solid #e0e0e0",
                          overflow: "hidden",
                          cursor: "pointer",
                        }}
                        onClick={() => openProposalModal(proposal)}
                      >
                        {/* Header with Stats, Qualifications, Details */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "2fr 1.5fr 1fr",
                            gap: 0,
                            padding: "12px 20px",
                            background: "#f8f9fa",
                            borderBottom: "1px solid #e0e0e0",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 16,
                              fontWeight: 600,
                              color: "#121212",
                            }}
                          >
                            {" "}
                          </div>
                          <div
                            style={{
                              textAlign: "center",
                              fontSize: 16,
                              fontWeight: 600,
                              color: "#121212",
                            }}
                          >
                            Stats
                          </div>
                          <div
                            style={{
                              textAlign: "center",
                              fontSize: 16,
                              fontWeight: 600,
                              color: "#121212",
                            }}
                          >
                            Details
                          </div>
                        </div>

                        {/* Main Content */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "2fr 1.5fr 1fr",
                            gap: "0",
                            padding: "16px 20px",
                          }}
                        >
                          {/* Left Column - Profile Information & Actions */}
                          <div style={{ paddingRight: "20px" }}>
                            {/* Profile Picture and Info */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                marginBottom: "16px",
                                gap: 20,
                              }}
                            >
                              <div
                                style={{
                                  position: "relative",
                                  marginRight: "12px",
                                }}
                              >
                                <img
                                  src={
                                    proposal.freelancer?.id || proposal.freelancer?._id
                                      ? `${API_URL}/profile-image/${proposal.freelancer.id || proposal.freelancer._id}/`
                                      : `https://via.placeholder.com/60x60/4CAF50/FFFFFF?text=${
                                          proposal.freelancer?.name?.charAt(0) ||
                                          "F"
                                        }`
                                  }
                                  alt={
                                    proposal.freelancer?.name || "Freelancer"
                                  }
                                  style={{
                                    width: "60px",
                                    height: "60px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                  }}
                                  onError={(e) => {
                                    e.target.src = `https://via.placeholder.com/60x60/4CAF50/FFFFFF?text=${
                                      proposal.freelancer?.name?.charAt(0) ||
                                      "F"
                                    }`;
                                  }}
                                />
                                {/* Online Status Dot */}
                                <div
                                  style={{
                                    position: "absolute",
                                    top: "2px",
                                    left: "2px",
                                    width: "12px",
                                    height: "12px",
                                    backgroundColor:
                                      proposal.freelancer?.onlineStatus ===
                                      "online"
                                        ? "#4CAF50"
                                        : "#6c757d",
                                    borderRadius: "50%",
                                    border: "2px solid #ffffff",
                                  }}
                                />
                              </div>

                              <div style={{ flex: 1 }}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    marginBottom: 4,
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: "18px",
                                      fontWeight: 600,
                                      color: "#222",
                                    }}
                                  >
                                    {proposal.freelancer?.name || "User"}
                                  </div>
                                  <span
                                    style={{
                                      display: "inline-block",
                                      background: "#e9f2ff",
                                      color: "#1070ca",
                                      borderRadius: 999,
                                      padding: "4px 10px",
                                      fontSize: 14,
                                      fontWeight: 600,
                                      lineHeight: 1,
                                    }}
                                  >
                                    Best match
                                  </span>
                                </div>
                                <div
                                  style={{
                                    fontSize: "16px",
                                    color: "#666",
                                    marginBottom: "8px",
                                  }}
                                >
                                  {proposal.freelancer?.location || ""}
                                </div>
                                <div
                                  style={{
                                    fontSize: "16px",
                                    color: "#121212",
                                    marginBottom: "8px",
                                    lineHeight: "1.4",
                                  }}
                                >
                                  {proposal.freelancer?.specialization || "-"}
                                </div>
                              </div>
                            </div>
                            {/* NEW badge under avatar (if applicable) */}
                            {proposal.freelancer?.completedJobs === 0 && (
                              <div style={{ marginBottom: 16 }}>
                                <span
                                  style={{
                                    display: "inline-block",
                                    background: "#007bff",
                                    color: "#ffffff",
                                    padding: "6px 12px",
                                    borderRadius: 999,
                                    fontSize: 14,
                                    fontWeight: 600,
                                  }}
                                >
                                  NEW
                                </span>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                flexWrap: "wrap",
                                alignItems: "center",
                              }}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMessageClick(proposal.freelancer);
                                }}
                                style={{
                                  border: "2px solid #007674",
                                  color: "#007674",
                                  background: "#ffffff",
                                  borderRadius: 8,
                                  padding: "10px 20px",
                                  fontWeight: "600",
                                  fontSize: "14px",
                                  cursor: "pointer",
                                  transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.background = "#007674";
                                  e.target.style.color = "#ffffff";
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.background = "#ffffff";
                                  e.target.style.color = "#007674";
                                }}
                              >
                                Message
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(
                                    `/ws/client/offer/job-application/${proposal.freelancer.id}`,
                                    {
                                      state: {
                                        jobId: job?.id,
                                        job: job,
                                      },
                                    }
                                  );
                                }}
                                style={{
                                  border: "none",
                                  color: "#ffffff",
                                  background: "#007674",
                                  borderRadius: 8,
                                  padding: "10px 24px",
                                  fontWeight: "600",
                                  fontSize: "14px",
                                  cursor: "pointer",
                                  transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.background = "#005a58";
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.background = "#007674";
                                }}
                              >
                                Hire
                              </button>
                            </div>
                          </div>

                          {/* Middle Column - Stats & Qualifications */}
                          <div
                            style={{
                              paddingLeft: 20,
                              paddingRight: 20,
                              borderLeft: "1px solid #e0e0e0",
                              borderRight: "1px solid #e0e0e0",
                            }}
                          >
                            {/* Stats */}
                            <div style={{ marginBottom: 12 }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  marginBottom: 8,
                                }}
                              >
                                <BsCreditCard
                                  style={{
                                    marginRight: "8px",
                                    color: "#121212",
                                    fontSize: "16px",
                                  }}
                                />
                                <span
                                  style={{ fontSize: "16px", color: "#121212" }}
                                >
                                  {proposal.freelancer?.completedJobs || 0}{" "}
                                  completed jobs
                                </span>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <span
                                  style={{ fontSize: "16px", color: "#121212" }}
                                >
                                  ₹{" "}
                                  {Number(
                                    proposal.freelancer?.totalEarned || 0
                                  ).toLocaleString()}{" "}
                                  earned
                                </span>
                              </div>
                            </div>

                            {/* Qualifications */}
                            <div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  marginBottom: 12,
                                }}
                              >
                                <BsQuestionCircle
                                  style={{
                                    marginRight: "8px",
                                    color: "#121212",
                                    fontSize: "16px",
                                  }}
                                />
                                <span
                                  style={{ fontSize: "16px", color: "#121212" }}
                                >
                                  {proposal.freelancer?.skills?.length || 0}{" "}
                                  skills on their profile
                                </span>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: "8px",
                                }}
                              >
                                {(proposal.freelancer?.skills || [])
                                  .slice(0, 6)
                                  .map((skill, skillIndex) => (
                                    <span
                                      key={skillIndex}
                                      className="skill-tag"
                                    >
                                      {typeof skill === "string"
                                        ? skill
                                        : skill?.name || skill?.label || ""}
                                    </span>
                                  ))}
                                {(proposal.freelancer?.skills?.length || 0) >
                                  6 && (
                                  <span className="skill-tag">
                                    +
                                    {(proposal.freelancer?.skills?.length ||
                                      0) - 6}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right Column - Details */}
                          <div style={{ paddingLeft: "20px" }}>
                            <div style={{ marginBottom: 12 }}>
                              <div
                                style={{
                                  fontSize: 18,
                                  fontWeight: 700,
                                  color: "#121212",
                                  marginBottom: 4,
                                }}
                              >
                                ₹{" "}
                                {Number(
                                  proposal.freelancer?.hourlyRate ?? 0
                                ).toFixed(2)}
                                <span
                                  style={{
                                    marginLeft: 4,
                                    fontSize: 16,
                                    color: "#121212",
                                    fontWeight: 500,
                                  }}
                                >
                                  /hr
                                </span>
                              </div>
                            </div>
                            <div
                              style={{
                                fontSize: "16px",
                                color: "#121212",
                                lineHeight: "1.4",
                              }}
                            >
                              Cover letter - <br />
                              {proposal.coverLetter ||
                                "No cover letter provided"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <ProposalModal
                  isOpen={isProposalModalOpen}
                  onClose={closeProposalModal}
                  proposal={selectedProposal}
                />
              </div>
            )}

            {activeProposalTab === "messaged" && (
              <div
                style={{ maxWidth: 400, margin: "0 auto", textAlign: "center" }}
              >
                {/* Mailbox Icon */}
                <div
                  style={{
                    width: 80,
                    height: 80,
                    margin: "0 auto 32px auto",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* Mailbox body */}
                  <div
                    style={{
                      width: 50,
                      height: 35,
                      background: "#28a745",
                      borderRadius: "8px 8px 12px 12px",
                      position: "relative",
                      boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)",
                    }}
                  >
                    {/* Mailbox flag */}
                    <div
                      style={{
                        position: "absolute",
                        top: -12,
                        right: -8,
                        width: 6,
                        height: 20,
                        background: "#dc3545",
                        borderRadius: "3px 3px 0 0",
                        transform: "rotate(-15deg)",
                        transformOrigin: "bottom center",
                      }}
                    ></div>

                    {/* Mailbox opening */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 6,
                        background: "linear-gradient(90deg, #87CEEB, #98FB98)",
                        borderRadius: "8px 8px 0 0",
                        opacity: 0.8,
                      }}
                    ></div>

                    {/* Mail slot */}
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 12,
                        height: 2,
                        background: "#000",
                        borderRadius: "1px",
                      }}
                    ></div>
                  </div>
                </div>

                {/* Heading */}
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: "#000",
                    marginBottom: 16,
                    lineHeight: 1.2,
                  }}
                >
                  Keep track of your conversations
                </div>

                {/* Descriptive Text */}
                <div
                  style={{
                    fontSize: 18,
                    color: "#666",
                    marginBottom: 40,
                    textAlign: "center",
                    lineHeight: 1.5,
                  }}
                >
                  When you message freelancers, those conversations will appear
                  here for easy access.
                </div>

                {/* View all proposals Button */}
                <button
                  onClick={() => handleProposalTabChange("all")}
                  style={{
                    background:
                      "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 15,
                    padding: "14px 32px",
                    fontSize: "1rem",
                    fontWeight: 600,
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    cursor: "pointer",
                    boxShadow: "0 6px 20px rgba(0, 118, 116, 0.3)",
                    margin: "0 auto",
                  }}
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
                  View all proposals
                </button>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div style={{ width: "100%", padding: "0 0px" }}>
            {/* Tabs */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 36,
                marginBottom: 24,
                marginTop: 10,
                position: "relative",
              }}
            >
              <span
                onClick={() => handleHireTabChange("offers")}
                style={{
                  fontWeight: activeHireTab === "offers" ? 600 : 600,
                  fontSize: activeHireTab === "offers" ? 20 : 20,
                  color: activeHireTab === "offers" ? "#222" : "#888",
                  borderBottom:
                    activeHireTab === "offers"
                      ? "2.5px solid #222"
                      : "2.5px solid transparent",
                  paddingBottom: 6,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  position: "relative",
                }}
              >
                Offers
              </span>
              <span
                onClick={() => handleHireTabChange("hired")}
                style={{
                  fontWeight: activeHireTab === "hired" ? 600 : 600,
                  fontSize: activeHireTab === "hired" ? 20 : 20,
                  color: activeHireTab === "hired" ? "#222" : "#888",
                  borderBottom:
                    activeHireTab === "hired"
                      ? "2.5px solid #222"
                      : "2.5px solid transparent",
                  paddingBottom: 6,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  position: "relative",
                }}
              >
                Hired
              </span>
            </div>

            {/* Tab Content */}
            {activeHireTab === "offers" && (
              <div
                style={{ maxWidth: 400, margin: "0 auto", textAlign: "center" }}
              >
                {/* Green Folder Icon with Blue Lines */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginBottom: 40,
                    position: "relative",
                  }}
                >
                  {/* Blue Lines Above Folder */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 2,
                      marginBottom: 8,
                      position: "relative",
                      zIndex: 2,
                    }}
                  >
                    <div
                      style={{
                        width: 3,
                        height: 12,
                        background: "#007bff",
                        borderRadius: 1.5,
                      }}
                    ></div>
                    <div
                      style={{
                        width: 3,
                        height: 8,
                        background: "#007bff",
                        borderRadius: 1.5,
                      }}
                    ></div>
                    <div
                      style={{
                        width: 3,
                        height: 16,
                        background: "#007bff",
                        borderRadius: 1.5,
                      }}
                    ></div>
                  </div>

                  {/* Green Folder Icon */}
                  <div
                    style={{
                      width: 80,
                      height: 60,
                      background: "#28a745",
                      borderRadius: "8px 8px 0 0",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)",
                    }}
                  >
                    {/* Folder Tab */}
                    <div
                      style={{
                        position: "absolute",
                        top: -8,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 40,
                        height: 8,
                        background: "#28a745",
                        borderRadius: "4px 4px 0 0",
                        borderTop: "2px solid #fff",
                        borderLeft: "2px solid #fff",
                        borderRight: "2px solid #fff",
                      }}
                    ></div>

                    {/* Folder Content Lines */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                        marginTop: 8,
                      }}
                    >
                      <div
                        style={{
                          width: 50,
                          height: 2,
                          background: "#fff",
                          borderRadius: 1,
                        }}
                      ></div>
                      <div
                        style={{
                          width: 40,
                          height: 2,
                          background: "#fff",
                          borderRadius: 1,
                        }}
                      ></div>
                      <div
                        style={{
                          width: 45,
                          height: 2,
                          background: "#fff",
                          borderRadius: 1,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Heading */}
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#000",
                    marginBottom: 16,
                    lineHeight: 1.2,
                  }}
                >
                  You don't have any offers yet
                </div>

                {/* Descriptive Text */}
                <div
                  style={{
                    fontSize: 18,
                    color: "#666",
                    marginBottom: 40,
                    lineHeight: 1.5,
                  }}
                >
                  Interview promising talent and make them an offer.
                </div>
              </div>
            )}

            {activeHireTab === "hired" && (
              <div
                style={{ maxWidth: 400, margin: "0 auto", textAlign: "center" }}
              >
                {/* Overlapping Profile Cards Graphic */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 40,
                    position: "relative",
                    height: 120,
                  }}
                >
                  {/* Left Card (faded) */}
                  <div
                    style={{
                      position: "absolute",
                      left: "25%",
                      transform: "translateX(-50%)",
                      background: "#f8f9fa",
                      borderRadius: "12px 12px 8px 8px",
                      padding: "16px 12px",
                      width: 80,
                      height: 100,
                      opacity: 0.6,
                      zIndex: 1,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#e9ecef",
                        margin: "0 auto 8px auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          background: "#6c757d",
                          borderRadius: "50%",
                        }}
                      ></div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 1,
                        marginBottom: 6,
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((star, i) => (
                        <div
                          key={i}
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: i < 3 ? "#ffc107" : "#e9ecef",
                          }}
                        ></div>
                      ))}
                    </div>
                    <div
                      style={{
                        height: 4,
                        background: "linear-gradient(90deg, #e91e63, #9c27b0)",
                        borderRadius: 2,
                        marginTop: 4,
                      }}
                    ></div>
                  </div>

                  {/* Center Card (prominent) */}
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#fff",
                      borderRadius: "12px 12px 8px 8px",
                      padding: "20px 16px",
                      width: 90,
                      height: 110,
                      zIndex: 3,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                      border: "1px solid #e9ecef",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "#28a745",
                        margin: "0 auto 10px auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          background: "#fff",
                          borderRadius: "50%",
                        }}
                      ></div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 1,
                        marginBottom: 8,
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((star, i) => (
                        <div
                          key={i}
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: "#ffc107",
                          }}
                        ></div>
                      ))}
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: "linear-gradient(90deg, #e91e63, #9c27b0)",
                        borderRadius: 3,
                        marginTop: 6,
                      }}
                    ></div>
                  </div>

                  {/* Right Card (faded) */}
                  <div
                    style={{
                      position: "absolute",
                      left: "75%",
                      transform: "translateX(-50%)",
                      background: "#f8f9fa",
                      borderRadius: "12px 12px 8px 8px",
                      padding: "16px 12px",
                      width: 80,
                      height: 100,
                      opacity: 0.6,
                      zIndex: 1,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#e9ecef",
                        margin: "0 auto 8px auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          background: "#6c757d",
                          borderRadius: "50%",
                        }}
                      ></div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 1,
                        marginBottom: 6,
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((star, i) => (
                        <div
                          key={i}
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: i < 2 ? "#ffc107" : "#e9ecef",
                          }}
                        ></div>
                      ))}
                    </div>
                    <div
                      style={{
                        height: 4,
                        background: "linear-gradient(90deg, #e91e63, #9c27b0)",
                        borderRadius: 2,
                        marginTop: 4,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Heading */}
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#000",
                    marginBottom: 16,
                    lineHeight: 1.2,
                  }}
                >
                  You don't have any hires yet
                </div>

                {/* Descriptive Text */}
                <div
                  style={{
                    fontSize: 18,
                    color: "#666",
                    marginBottom: 40,
                    lineHeight: 1.5,
                  }}
                >
                  Interview promising talent and make them an offer.
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="section-container"
      style={{ background: "#fff", minHeight: "100vh" }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { 
            opacity: 0; 
            transform: translateY(-20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        ${filterAnimations}
      `}</style>

      {/* Loading Screen */}
      {loading && (
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
              <BsPeople size={40} />
            </div>
            <h3
              className="fw-semibold mb-3"
              style={{ color: "#121212", fontSize: "1.8rem", letterSpacing: '0.3px' }}
            >
              Loading Job Details
            </h3>
            <p className="mb-0" style={{ color: "#121212", fontSize: "1.2rem" }}>
              Preparing your job posting and applicant data...
            </p>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}>
        {/* Job Title at the very top */}
        <div
          style={{
            fontSize: "2.1rem",
            fontWeight: 700,
            marginBottom: 0,
            letterSpacing: "-0.5px",
            marginTop: 40,
            paddingTop: 20,
          }}
        >
          {job.title || "Untitled Job"}
        </div>
        <div
          style={{
            color: "#007476",
            fontWeight: 600,
            fontSize: 18,
            margin: "0 0 24px 0",
          }}
        >
          {job && typeof job.invites === "number" ? job.invites : 30} invites
          left
        </div>
        {/* Meta Row below the title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 36,
            margin: "18px 0 0 0",
            fontSize: 18,
          }}
        >
          <span
            style={{
              color: "#888",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <BsCalendar size={16} />{" "}
            <span style={{ fontWeight: 500 }}>Posted</span>{" "}
            {job.updatedAt ? timeAgo(job.updatedAt) : "1 hour ago"}
          </span>
        </div>
        {/* Step Progress Bar below meta row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            margin: "28px 0 0 0",
            width: "100%",
          }}
        >
          {steps.map((step, idx) => (
            <React.Fragment key={step}>
              <div
                onClick={() => handleStepClick(idx)}
                style={{
                  fontWeight: idx === currentStep ? 700 : 500,
                  color: idx === currentStep ? "#fff" : "#222",
                  fontSize: 15,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: idx === currentStep ? "#007476" : "transparent",
                  borderRadius:
                    idx === currentStep
                      ? "0px"
                      : idx === steps.length - 1
                      ? "0 8px 8px 0"
                      : 0,
                  padding: idx === currentStep ? "14px 38px" : "14px 38px",
                  border: idx === currentStep ? "none" : "1px solid #e5e7eb",
                  minWidth: "25%",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  boxShadow:
                    idx === currentStep
                      ? "0 2px 8px rgba(0,116,118,0.07)"
                      : "none",
                  zIndex: 2,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  if (idx !== currentStep) {
                    e.target.style.background = "#f0f0f0";
                  }
                }}
                onMouseLeave={(e) => {
                  if (idx !== currentStep) {
                    e.target.style.background = "transparent";
                  }
                }}
              >
                {step}
                {idx < steps.length - 1 && (
                  <span
                    style={{
                      margin: "0 12px",
                      color: "#afafaf",
                      fontWeight: 400,
                      scale: 2.0,
                    }}
                  >
                    &#8250;
                  </span>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>
        {/* Main Content Row: left (tab content), right (sidebar) */}
        {currentStep === 0 ? (
          <div style={{ display: "flex", marginTop: 40, gap: 40 }}>
            {/* Left Main Content */}
            <div style={{ flex: 1, minWidth: 0, maxWidth: "100%" }}>
              {renderTabContent()}
            </div>
            {/* Sidebar (Right) */}
            <div
              style={{
                minWidth: 340,
                maxWidth: 360,
                background: "#fff",
                borderLeft: "1px solid #ececec",
                padding: "0 0 0 40px",
                display: "flex",
                flexDirection: "column",
                gap: 32,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginTop: 0,
                }}
              >
                <SidebarAction icon={<BsPencil />} text="Edit posting" />
                <SidebarAction icon={<BsEye />} text="View posting" />
                <SidebarAction icon={<BsX />} text="Remove posting" />
              </div>
              {/* About the client section, no border or background */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0,
                  marginTop: 8,
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 22,
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  About the client{" "}
                  <MdEdit
                    style={{
                      fontSize: 18,
                      color: "#007476",
                      cursor: "pointer",
                    }}
                  />
                </div>
                <div
                  style={{
                    color: paymentVerified ? "#007476" : "#222",
                    fontWeight: paymentVerified ? 500 : 400,
                    fontSize: 18,
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    cursor:
                      !paymentVerified && !loadingPaymentStatus
                        ? "pointer"
                        : "default",
                  }}
                  onClick={() => {
                    if (!paymentVerified && !loadingPaymentStatus) {
                      handleAddBillingMethod();
                    }
                  }}
                >
                  {loadingPaymentStatus ? (
                    <>
                      Checking payment status...{" "}
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid #007476",
                          borderTop: "2px solid transparent",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                    </>
                  ) : (
                    <>
                      Payment method{" "}
                      {paymentVerified ? "verified" : "not verified"}{" "}
                      {paymentVerified ? (
                        <BsCheckCircle
                          style={{ color: "#007476", fontSize: 18 }}
                        />
                      ) : (
                        <BsQuestionCircle
                          style={{
                            fontSize: 15,
                            color: "#bbb",
                            marginLeft: 2,
                            verticalAlign: -2,
                          }}
                        />
                      )}
                    </>
                  )}
                </div>
                <div
                  style={{
                    color: phoneVerified ? "#007476" : "#222",
                    fontWeight: phoneVerified ? 500 : 400,
                    fontSize: 18,
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: !phoneVerified && !loadingPhoneStatus ? "pointer" : "default",
                  }}
                  onClick={() => {
                    if (!phoneVerified && !loadingPhoneStatus) {
                      handlePhoneVerificationClick();
                    }
                  }}
                >
                  {loadingPhoneStatus ? (
                    <>
                      Checking phone status...{" "}
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid #007476",
                          borderTop: "2px solid transparent",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                    </>
                  ) : (
                    <>
                      {phoneVerified ? (
                        <BsCheckCircle style={{ color: "#007476", fontSize: 18 }} />
                      ) : (
                        <BsQuestionCircle
                          style={{
                            fontSize: 15,
                            color: "#bbb",
                            marginLeft: 2,
                            verticalAlign: -2,
                          }}
                        />
                      )}{" "}
                      Phone number {phoneVerified ? "verified" : "not verified"}
                    </>
                  )}
                </div>
                {loadingClientDetails ? (
                  <div
                    style={{
                      color: "#666",
                      fontSize: 16,
                      marginBottom: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    Loading client details...{" "}
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        border: "2px solid #007476",
                        borderTop: "2px solid transparent",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                  </div>
                ) : clientDetails ? (
                  <>
                    {/* Online Status and Time */}
                    <div
                      style={{
                        color: "#121212",
                        fontWeight: 400,
                        fontSize: 18,
                        marginBottom: 10,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <div
                      />
                       {formatTime(clientDetails.lastSeen)}
                    </div>

                    {/* Hiring Rate and Job Statistics */}
                    <div
                      style={{ 
                        color: "#121212", 
                        fontSize: 18, 
                        marginBottom: 10,
                        fontWeight: 500,
                      }}
                    >
                      {clientDetails.hiringRate}% hire rate, {clientDetails.activeJobs} active job{clientDetails.activeJobs !== 1 ? 's' : ''}
                    </div>

                    {/* Company Information */}
                    <div
                      style={{
                        color: "#222",
                        fontWeight: 600,
                        fontSize: 18,
                        marginBottom: 8,
                      }}
                    >
                      {clientDetails.industry}
                    </div>
                    <div
                      style={{ 
                        color: "#121212", 
                        fontSize: 18, 
                        marginBottom: 8,
                      }}
                    >
                      {clientDetails.companySize}
                    </div>

                    {/* Member Since */}
                    <div style={{ color: "#888", fontSize: 16, marginTop: 12 }}>
                      Member since {clientDetails.createdAt}
                    </div>
                  </>
                ) : (
                  <div style={{ color: "#888", fontSize: 16 }}>
                    Unable to load client details
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 40 }}>{renderTabContent()}</div>
        )}
      </div>
      {/* Invite to Job Modal */}
      {inviteModalData && (
        <div
          className="modal-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(8px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            fontFamily: "Urbanist, sans-serif",
          }}
          onClick={() => setInviteModalData(null)}
        >
          <div
            className="modal-content"
            style={{
              width: "100%",
              maxWidth: "800px",
              maxHeight: "90vh",
              backgroundColor: "#fff",
              borderRadius: "22px",
              overflow: "hidden",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(0, 118, 116, 0.1)",
              padding: 0,
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: "22px 30px 18px 30px",
                borderBottom: "1px solid #e3e3e3",
                background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{ fontWeight: 700, fontSize: "1.3rem", color: "#222" }}
              >
                Invite to job
              </div>
              <button
                onClick={() => setInviteModalData(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 28,
                  color: "#888",
                  cursor: "pointer",
                  borderRadius: "50%",
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#f2f7f7")}
                onMouseLeave={(e) => (e.target.style.background = "none")}
                aria-label="Close"
              >
                <BsX />
              </button>
            </div>
            {/* Content */}
            <div style={{ padding: 30, overflowY: "auto", flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  marginBottom: 18,
                }}
              >
                <img
                  src={inviteModalData.avatar}
                  alt={inviteModalData.name}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #e3e3e3",
                  }}
                />
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 20,
                      color: "#007674",
                      marginBottom: 2,
                    }}
                  >
                    <a
                      href="#"
                      style={{ color: "#007674", textDecoration: "underline" }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/ws/freelancers/${inviteModalData.id}`);
                      }}
                    >
                      {inviteModalData.name}
                    </a>
                  </div>
                  <div
                    style={{
                      color: "#222",
                      fontSize: 18,
                      fontWeight: 500,
                      marginBottom: 2,
                    }}
                  >
                    {inviteModalData.title}
                  </div>
                  <div style={{ color: "#121212", fontSize: 16 }}>
                    {inviteModalData.location}
                  </div>
                </div>
              </div>
              <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 8 }}>
                Message
              </div>
              <textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                rows={6}
                style={{
                  width: "100%",
                  border: "1.5px solid #bbb",
                  borderRadius: 8,
                  fontSize: 16,
                  padding: 16,
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </div>
            {/* Footer */}
            <div
              style={{
                padding: "0 30px 24px 30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ color: "#222", fontSize: 16 }}>
                You have{" "}
                {job && typeof job.invites === "number" ? job.invites : 30}{" "}
                invites left.
              </div>
              <button
                style={{
                  background: "#007476",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 18,
                  padding: "10px 32px",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onClick={async () => {
                  if (!inviteModalData) return;
                  try {
                    const res = await axios.post(
                      `${API_URL}/job-invite/`,
                      {
                        jobId: jobid,
                        freelancerId: inviteModalData.id,
                        message: inviteMessage,
                      },
                      { withCredentials: true }
                    );
                    if (res.data && res.data.success) {
                      setInviteModalData(null);
                      setJob((prev) =>
                        prev ? { ...prev, invites: res.data.invites } : prev
                      );
                      setInvitedFreelancerIds((prev) => [
                        ...prev,
                        inviteModalData.id,
                      ]);
                      window.location.reload(); // Refresh the page after successful invite
                    } else {
                      alert(
                        res.data && res.data.message
                          ? res.data.message
                          : "Failed to send invitation"
                      );
                    }
                  } catch (err) {
                    alert("Failed to send invitation");
                  }
                }}
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Billing Method Modal */}
      {showBillingModal && (
        <BillingMethodModal
          isOpen={showBillingModal}
          onClose={closeBillingModal}
          freelancer={selectedFreelancer}
          onAddBilling={handleAddBillingMethod}
        />
      )}

      {/* Toast Notification */}
      {showToast && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "#4CAF50",
            color: "white",
            padding: "12px 24px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 10000,
            fontSize: "14px",
            fontWeight: "600",
            animation: "slideIn 0.3s ease-out",
          }}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
};

function SidebarAction({ icon, text }) {
  return (
    <button style={sidebarBtnStyle}>
      <span
        style={{
          color: "#007476",
          fontSize: 22,
          display: "flex",
          alignItems: "center",
          marginRight: 12,
        }}
      >
        {icon}
      </span>
      <span style={{ color: "#007476", fontWeight: 600, fontSize: 18 }}>
        {text}
      </span>
    </button>
  );
}

const sidebarBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: 0,
  background: "none",
  border: "none",
  color: "#007476",
  fontWeight: 600,
  fontSize: 18,
  padding: "12px 0",
  cursor: "pointer",
  textAlign: "left",
  borderRadius: 6,
  transition: "background 0.2s",
};
const jobDetailColStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 4,
  padding: "24px 32px",
  borderRight: "1px solid #ececec",
  minHeight: 90,
  justifyContent: "center",
};
const jobDetailIconStyle = { fontSize: 26, color: "#007476", marginBottom: 8 };

export default ClientJobDetailedPage;
