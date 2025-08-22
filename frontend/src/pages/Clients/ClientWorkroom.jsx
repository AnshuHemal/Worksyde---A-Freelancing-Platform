import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import {
  BsThreeDotsVertical,
  BsEnvelopePlus,
  BsArrowUp,
  BsArrowDown,
  BsStar,
  BsXCircle,
} from "react-icons/bs";

const API_URL = "http://localhost:5000/api/auth";

const ClientWorkroom = () => {
  const { acceptedJobOfferId } = useParams();
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contractData, setContractData] = useState(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [activeSubmissionId, setActiveSubmissionId] = useState(null);
  const [submittingChanges, setSubmittingChanges] = useState(false);
  const [releasingSubmissionId, setReleasingSubmissionId] = useState(null);
  const [updatingEarnings, setUpdatingEarnings] = useState(false);
  const [highlightEarnings, setHighlightEarnings] = useState(false);
  const earningsRef = useRef(null);

  useEffect(() => {
    const fetchContractData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_URL}/accepted-job-offer/${acceptedJobOfferId}/`,
          {
            withCredentials: true,
          }
        );

        if (response.data && response.data.success) {
          setContractData(response.data.contract);
        } else {
          setError("Failed to load contract data");
        }
      } catch (err) {
        console.error("Error fetching contract data:", err);
        setError("Failed to load contract data");
      } finally {
        setLoading(false);
      }
    };

    if (acceptedJobOfferId) {
      fetchContractData();
    }
  }, [acceptedJobOfferId]);

  const refreshContract = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(
        `${API_URL}/accepted-job-offer/${acceptedJobOfferId}/`,
        { withCredentials: true }
      );
      if (response.data?.success) {
        setContractData(response.data.contract);
      }
    } catch (e) {
      // ignore
    } finally {
      setRefreshing(false);
    }
  };

  const handleOpenFeedback = (submissionId) => {
    setActiveSubmissionId(submissionId);
    setFeedbackText("");
    setShowFeedbackModal(true);
  };

  const handleRequestChanges = async () => {
    if (!activeSubmissionId) return;
    try {
      setSubmittingChanges(true);
      const res = await axios.post(
        `${API_URL}/submissions/${activeSubmissionId}/request-changes/`,
        { comment: feedbackText },
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success("Requested changes sent");
        setShowFeedbackModal(false);
        setActiveSubmissionId(null);
        setFeedbackText("");
        await refreshContract();
      } else {
        toast.error(res.data?.message || "Failed to request changes");
      }
    } catch (e) {
      toast.error("Failed to request changes");
    } finally {
      setSubmittingChanges(false);
    }
  };

  const handleReleasePayment = async (submissionId) => {
    try {
      setReleasingSubmissionId(submissionId);
      setUpdatingEarnings(true);
      const res = await axios.post(
        `${API_URL}/submissions/${submissionId}/release-payment/`,
        {},
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success("Payment released to freelancer");
        await refreshContract();
        if (earningsRef.current) {
          earningsRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
        setHighlightEarnings(true);
        setTimeout(() => setHighlightEarnings(false), 1500);
      } else {
        toast.error(res.data?.message || "Failed to release payment");
      }
    } catch (e) {
      toast.error("Failed to release payment");
    } finally {
      setReleasingSubmissionId(null);
      setUpdatingEarnings(false);
    }
  };

  // Fallback data if API fails
  const fallbackData = {
    projectTitle: "Instagram Ads Creation for T-Shirt Business",
    freelancer: {
      name: "Arnoldo Jacobinez",
      profileImage: "https://via.placeholder.com/50x50/007674/FFFFFF?text=AJ",
      location: "Comoros",
      lastSeen: "Wed 1:11 AM",
      online: true,
    },
    financials: {
      projectPrice: 60.0,
      inEscrow: 35.0,
      milestonesPaid: 25.0,
      milestonesRemaining: 35.0,
      totalEarnings: 25.0,
      paymentType: "Fixed-price",
      milestonesCount: 1,
      remainingMilestonesCount: 1,
    },
  };

  const contract = contractData || fallbackData;

  // Derived financials for timeline/earnings (match FreelancerWorkroom)
  const projectAmount = parseFloat(contract?.financials?.projectPrice || 0);
  const inEscrow = parseFloat(contract?.financials?.inEscrow || 0);
  const milestonesPaid = parseFloat(contract?.financials?.milestonesPaid || 0);
  const releasedByClient = Math.max(0, projectAmount - inEscrow);
  const isFixedPrice = (contract?.financials?.paymentType || "").toLowerCase() === "fixed-price";
  const progressPercentageRaw = projectAmount > 0 ? (releasedByClient / projectAmount) * 100 : 0;
  // For fixed-price: once any amount is released, show full amount paid and 100% progress
  const progressPercentage = isFixedPrice && releasedByClient > 0 ? 100 : progressPercentageRaw;
  const releasedByClientDisplay = isFixedPrice && releasedByClient > 0 ? projectAmount : releasedByClient;
  const freelancerFeePercent = contract?.financials?.freelancerFeePercent ?? 10;
  const freelancerFee =
    contract?.financials?.freelancerFee ??
    projectAmount * (freelancerFeePercent / 100);
  const estimatedFreelancerPayout =
    contract?.financials?.estimatedFreelancerPayout ??
    Math.max(0, projectAmount - freelancerFee);

  const autoEndAt = contract?.autoEndAt || contract?.financials?.autoEndAt;
  const isCompleted =
    (contract?.status || contract?.financials?.status || '').toLowerCase() ===
    'completed';

  // Countdown timer for auto-end
  const [nowTs, setNowTs] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const countdown = React.useMemo(() => {
    let endTs = null;
    if (autoEndAt) {
      endTs = new Date(autoEndAt).getTime();
    } else if (Array.isArray(contract?.recentFiles)) {
      const latestCompleted = contract.recentFiles
        .filter((f) => (f?.status || '').toLowerCase() === 'completed')
        .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))[0];
      if (latestCompleted?.createdAt) {
        endTs = new Date(latestCompleted.createdAt).getTime() + 12 * 60 * 60 * 1000;
      }
    }
    if (!endTs) return { show: false, text: '' };
    const diff = Math.max(0, endTs - nowTs);
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    const pad = (n) => String(n).padStart(2, '0');
    return { show: diff > 0, text: `${pad(hrs)}:${pad(mins)}:${pad(secs)}` };
  }, [autoEndAt, contract?.recentFiles, nowTs]);

  const hasActiveSubmission = Array.isArray(contract?.recentFiles)
    ? contract.recentFiles.some((f) => (f?.status || "Pending") !== "Completed")
    : false;



  if (loading) {
    return <Loader fullscreen message="Loading contract details..." />;
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div style={{ color: "#dc3545" }}>{error}</div>
      </div>
    );
  }

  return (
    <div
      className="section-container"
      style={{ minHeight: "100vh", background: "#fff" }}
    >
      {/* White Header */}
      <div
        style={{
          background: "#fff",
          color: "#333",
          padding: "32px 40px 24px 40px",
        }}
      >
        {/* Project Title and Menu */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "24px",
          }}
        >
          <h1
            style={{
              fontSize: "32px",
              fontWeight: 600,
              margin: 0,
              color: "#121212",
              letterSpacing: "0.3px",
            }}
          >
            {contract.projectTitle}
          </h1>

          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{
                background: "none",
                border: "none",
                color: "#333",
                fontSize: "24px",
                cursor: "pointer",
                padding: "8px",
              }}
            >
              <BsThreeDotsVertical />
            </button>

            {showMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  background: "#fff",
                  borderRadius: "8px",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                  padding: "8px 0",
                  minWidth: "200px",
                  zIndex: 1000,
                }}
              >
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    width: "100%",
                    padding: "12px 16px",
                    background: "none",
                    border: "none",
                    fontSize: "14px",
                    color: "#333",
                    cursor: "pointer",
                  }}
                >
                  <BsEnvelopePlus /> Propose new contract
                </button>
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    width: "100%",
                    padding: "12px 16px",
                    background: "none",
                    border: "none",
                    fontSize: "14px",
                    color: "#333",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <BsArrowUp style={{ fontSize: "10px" }} />
                    <BsArrowDown style={{ fontSize: "10px" }} />
                  </div>
                  Give a refund
                </button>
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    width: "100%",
                    padding: "12px 16px",
                    background: "none",
                    border: "none",
                    fontSize: "14px",
                    color: "#333",
                    cursor: "pointer",
                  }}
                >
                  <BsStar /> Request public feedback
                </button>
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    width: "100%",
                    padding: "12px 16px",
                    background: "none",
                    border: "none",
                    fontSize: "14px",
                    color: "#dc3545",
                    cursor: "pointer",
                  }}
                >
                  <BsXCircle /> End contract
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Freelancer Info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div style={{ position: "relative" }}>
            <img
              src={`${API_URL}/profile-image/${
                contract.freelancer?.id || contract.freelancer?.name
              }/`}
              alt={contract.freelancer?.name || "Freelancer"}
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #fff",
              }}
              onError={(e) => {
                
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
              
            />
            {/* Fallback div */}
            <div
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                backgroundColor: "#007674",
                display: "none",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "18px",
                fontWeight: "600",
                border: "2px solid #fff",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            >
              {(contract.freelancer?.name || "F")[0]}
            </div>

            {/* Online Status Indicator */}
            <div
              style={{
                position: "absolute",
                top: -4,
                left: 0,
                width: 16,
                height: 16,
                backgroundColor:
                  contract.freelancer?.onlineStatus === "online"
                    ? "#28a745"
                    : "#6c757d",
                borderRadius: "50%",
                border: "2px solid #fff",
              }}
            />
          </div>
          <div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 600,
                marginBottom: "4px",
                color: "#121212",
              }}
            >
              {contract.freelancer?.name || "Unknown Freelancer"}
            </div>
            <div style={{ fontSize: "16px", color: "#121212" }}>
              {contract.freelancer?.location || "Location not specified"}
            </div>
          </div>
        </div>

        {/* Navigation Tabs removed */}
      </div>

      {/* White Content Area */}
      <div style={{ padding: "0 40px", background: "#fff", paddingTop: "0px" }}>
        <>
          {/* Timeline & Earnings (two-column) */}
          <div
            style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}
          >
            {/* Timeline - Left */}
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #e0e0e0",
                padding: 24,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              {isCompleted && (
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    color: "#14532d",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 16,
                    fontSize: 16,
                  }}
                >
                  Project completed. You can end the contract from the menu (⋮) in the top-right, or it will end automatically in 12 hours.
                </div>
              )}
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  letterSpacing: 0.3,
                  color: "#121212",
                  margin: "0 0 24px 0",
                }}
              >
                {contract?.financials?.paymentType === "Fixed-price"
                  ? "Fixed Project Timeline"
                  : "Milestone Timeline"}
              </h2>

              {/* Milestone Entry (match FreelancerWorkroom) */}
              <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
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
                    {contract?.financials?.paymentType === "Fixed-price"
                      ? "✓"
                      : contract?.financials?.milestonesCount || 1}
                  </div>
                  <div
                    style={{ width: 2, height: 60, background: "#e5e7eb" }}
                  />
                </div>

                {/* Milestone Content */}
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: 20,
                      fontWeight: 600,
                      color: "#000",
                      letterSpacing: 0.2,
                      margin: "0 0 12px 0",
                    }}
                  >
                    {contract?.financials?.paymentType === "Fixed-price"
                      ? "Project Completion"
                      : contract?.contractDetails?.workDescription
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
                    {contract?.contractDetails?.workDescription ||
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
                        color: "#000",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      ₹{projectAmount.toFixed(2)}
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
                      {contract?.financials?.paymentType === "Fixed-price"
                        ? "Fixed Price Project"
                        : "Active & Funded"}
                    </span>
                  </div>
                  <button
                    style={{
                      background: hasActiveSubmission
                        ? "#cbd5e1"
                        : "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                      color: hasActiveSubmission ? "#475569" : "#fff",
                      borderRadius: 8,
                      fontSize: 16,
                      fontWeight: 600,
                      border: "none",
                      padding: "12px 20px",
                      transition: "all 0.3s ease",
                      boxShadow: hasActiveSubmission
                        ? "none"
                        : "0 4px 12px rgba(0,118,116,0.3)",
                      cursor: hasActiveSubmission ? "not-allowed" : "pointer",
                    }}
                    onMouseEnter={(e) => {
                      if (hasActiveSubmission) return;
                      e.currentTarget.style.background =
                        "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow =
                        "0 6px 16px rgba(18,18,18,0.4)";
                    }}
                    onMouseLeave={(e) => {
                      if (hasActiveSubmission) return;
                      e.currentTarget.style.background =
                        "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(0,118,116,0.3)";
                    }}
                    disabled={hasActiveSubmission}
                  >
                    Request work submission
                  </button>
                </div>
              </div>
            </div>

            {/* Earnings - Right */}
            <div
              ref={earningsRef}
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 24,
                border: "1px solid #e0e0e0",
                // boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                // height: "fit-content",
                // position: "relative",
                // transition: "box-shadow 0.3s ease, border-color 0.3s ease",
                // borderColor: highlightEarnings ? "#007674" : "#e0e0e0",
                boxShadow: highlightEarnings
                  ? "0 0 0 3px rgba(0,118,116,0.15), 0 8px 24px rgba(0,0,0,0.08)"
                  : "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              {updatingEarnings && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(255,255,255,0.65)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    zIndex: 5,
                    borderRadius: 12,
                  }}
                >
                  <div
                    className="spinner-border"
                    role="status"
                    aria-label="Updating earnings"
                    style={{ color: "#007674" }}
                  />
                  <div style={{ marginTop: 8, color: "#121212", fontSize: 16 }}>
                    Updating earnings…
                  </div>
                </div>
              )}
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  letterSpacing: 0.3,
                  color: "#121212",
                  margin: "0 0 16px 0",
                }}
              >
                Earnings
              </h2>

              {isCompleted && countdown.show && (
                <div
                  style={{
                    background: "#fef9c3",
                    border: "1px solid #fde68a",
                    color: "#92400e",
                    borderRadius: 8,
                    padding: 10,
                    marginBottom: 12,
                    fontSize: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>Contract auto-ends in</span>
                  <span style={{ fontWeight: 700 }}>{countdown.text}</span>
                </div>
              )}

              {/* Progress bar */}
              <div
                style={{
                  width: "100%",
                  height: 8,
                  background: "#e5e7eb",
                  borderRadius: 4,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: `${progressPercentage}%`,
                    height: "100%",
                    background: "#007674",
                    borderRadius: 4,
                    transition: "width 0.6s ease",
                  }}
                />
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: "#000",
                    }}
                  />
                  <span style={{ fontSize: 16, color: "#374151" }}>
                    {isFixedPrice && releasedByClient > 0 ? "Total paid" : "Released by you"}
                  </span>
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#000",
                      marginLeft: "auto",
                    }}
                  >
                    ₹{releasedByClientDisplay.toFixed(2)}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: "#007674",
                    }}
                  />
                  <span style={{ fontSize: 16, color: "#374151" }}>
                    Funded (Worksyde Wallet)
                  </span>
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#000",
                      marginLeft: "auto",
                    }}
                  >
                    ₹{inEscrow.toFixed(2)}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: "#6b7280",
                    }}
                  />
                  <span style={{ fontSize: 16, color: "#374151" }}>
                    Project Price (Client Subtotal)
                  </span>
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#000",
                      marginLeft: "auto",
                      border: "2px solid #007674",
                      borderRadius: 4,
                      padding: "2px 8px",
                    }}
                  >
                    ₹{projectAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {isCompleted && countdown.show && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                    {/* Inline circle renderer */}
                    {(() => {
                      const Circle = ({ color, percent, value, label }) => {
                        const track = "#e5e7eb";
                        const size = 96;
                        const inner = 72;
                        const bg = `conic-gradient(${color} ${Math.max(0, Math.min(100, percent))}%, ${track} 0)`;
                        return (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                            <div style={{ width: size, height: size, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <div style={{ width: inner, height: inner, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 0 0 1px #f3f4f6" }}>
                                <div style={{ textAlign: "center" }}>
                                  <div style={{ fontSize: 20, fontWeight: 700, color: "#111827", lineHeight: 1 }}>{value}</div>
                                  <div style={{ fontSize: 12, color: "#6b7280" }}>{label}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      };
                      return (
                        <>
                          <Circle color="#db2777" percent={(countdown.minutes / 60) * 100} value={countdown.hours} label="hours" />
                          <Circle color="#ef4444" percent={(countdown.seconds / 60) * 100} value={countdown.minutes} label="minutes" />
                          <Circle color="#0ea5e9" percent={((countdown.text ? parseInt(countdown.text.split(":")[2] || 0, 10) : 0) / 60) * 100} value={countdown.text ? parseInt(countdown.text.split(":")[2] || 0, 10) : 0} label="seconds" />
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Recent files (match FreelancerWorkroom styling) */}
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 24,
                marginTop: 14,
                border: "1px solid #e0e0e0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                height: "fit-content",
                marginBottom: 24,
                position: "relative",
              }}
            >
              {refreshing && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(255,255,255,0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    zIndex: 10,
                    borderRadius: 12,
                  }}
                >
                  <div
                    className="spinner-border"
                    role="status"
                    aria-label="Refreshing"
                    style={{ color: "#007674" }}
                  />
                  <div style={{ marginTop: 8, color: "#121212", fontSize: 16 }}>
                    Refreshing…
                  </div>
                </div>
              )}
              {/* Header row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <h2
                  style={{
                    fontSize: 24,
                    fontWeight: 600,
                    letterSpacing: 0.2,
                    color: "#121212",
                    margin: 0,
                  }}
                >
                  Recent files
                </h2>
                <button
                  title="Refresh"
                  style={{
                    width: 38,
                    height: 38,
                    border: "2px solid #e5e7eb",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#007674",
                    background: "#fff",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                    cursor: refreshing ? "not-allowed" : "pointer",
                  }}
                  onClick={refreshContract}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <div
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-label="Refreshing"
                    />
                  ) : (
                    <span style={{ transform: "translateY(-1px)" }}>↻</span>
                  )}
                </button>
              </div>

              {contract?.recentFiles?.length ? (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {contract.recentFiles.map((file) => (
                    <div
                      key={file.id}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 10,
                        padding: 14,
                        background: "#fafafa",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            color: "#111827",
                            fontSize: 16,
                          }}
                        >
                          {file.title || "Submission"}
                        </span>
                        <span
                          style={{
                            marginLeft: "auto",
                            fontSize: 16,
                            padding: "2px 8px",
                            borderRadius: 999,
                            background:
                              file.status === "Completed"
                                ? "#d1fae5"
                                : file.status === "Changes Requested"
                                ? "#fee2e2"
                                : "#e5e7eb",
                            color: "#111827",
                          }}
                        >
                          {file.status || "Pending"}
                        </span>
                      </div>
                      {file.description ? (
                        <div
                          style={{
                            color: "#374151",
                            fontSize: 16,
                            marginTop: 6,
                          }}
                        >
                          {file.description}
                        </div>
                      ) : null}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          marginTop: 8,
                          color: "#6b7280",
                          fontSize: 16,
                        }}
                      >
                        <span>
                          {file.createdAt
                            ? new Date(file.createdAt).toLocaleString()
                            : ""}
                        </span>
                        {file.pdfLink ? (
                          <a
                            href={file.pdfLink}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "#007674", textDecoration: "none" }}
                          >
                            View PDF
                          </a>
                        ) : file.hasPdfFile ? (
                          <a
                            href={`${API_URL}/submissions/${file.id}/pdf/`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "#007674", textDecoration: "none" }}
                          >
                            View PDF
                          </a>
                        ) : null}
                      </div>
                      {/* Actions for client */}
                      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                        {file.status === "Pending" && (
                          <>
                            <button
                              onClick={() => handleReleasePayment(file.id)}
                              disabled={releasingSubmissionId === file.id}
                              style={{
                                background: "#059669",
                                color: "#fff",
                                border: "none",
                                borderRadius: 8,
                                padding: "8px 12px",
                                cursor:
                                  releasingSubmissionId === file.id
                                    ? "not-allowed"
                                    : "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              {releasingSubmissionId === file.id ? (
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                  aria-label="Releasing"
                                />
                              ) : null}
                              <span>
                                {releasingSubmissionId === file.id
                                  ? "Releasing…"
                                  : "Release Payment"}
                              </span>
                            </button>
                            <button
                              onClick={() => handleOpenFeedback(file.id)}
                              style={{
                                background: "#ef4444",
                                color: "#fff",
                                border: "none",
                                borderRadius: 8,
                                padding: "8px 12px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <span>Request Changes</span>
                            </button>
                          </>
                        )}
                        {file.status === "Changes Requested" && (
                          <span style={{ fontSize: 16, color: "#6b7280" }}>
                            Waiting for freelancer to resubmit
                          </span>
                        )}
                        {file.status === "Completed" && (
                          <span style={{ fontSize: 16, color: "#059669" }}>
                            Paid
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "24px 0",
                    }}
                  >
                    <div
                      style={{
                        width: 120,
                        height: 80,
                        background: "linear-gradient(0deg,#007674,#005a58)",
                        borderRadius: 8,
                        position: "relative",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: 10,
                          top: -14,
                          width: 86,
                          height: 28,
                          background: "#007674",
                          borderRadius: "6px 6px 0 0",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      color: "#121212",
                      fontSize: 16,
                      textAlign: "center",
                      lineHeight: 1.6,
                    }}
                  >
                    Files shared in messages, work submissions, or as part of
                    the requirements, will be shown here
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      </div>

      {showMenu && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 999,
          }}
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: 20,
          }}
          onClick={() => setShowFeedbackModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 24,
              width: "100%",
              maxWidth: 600,
              border: "1px solid #e5e7eb",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#121212",
                }}
              >
                Request Changes
              </h3>
              <button
                onClick={() => setShowFeedbackModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 22,
                  cursor: "pointer",
                  color: "#6b7280",
                }}
              >
                ×
              </button>
            </div>
            <p style={{ marginTop: 0, marginBottom: 8, color: "#374151" }}>
              Tell the freelancer what needs to be changed.
            </p>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Example: Please update the hero section copy and fix the responsive layout on mobile."
              style={{
                width: "100%",
                minHeight: 120,
                padding: "12px 14px",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 16,
                outline: "none",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 12,
              }}
            >
              <button
                onClick={() => setShowFeedbackModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#007674",
                  fontWeight: 700,
                  padding: "10px 14px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRequestChanges}
                disabled={submittingChanges || !feedbackText.trim()}
                style={{
                  background:
                    submittingChanges || !feedbackText.trim()
                      ? "#cbd5e1"
                      : "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 16px",
                  fontWeight: 700,
                  cursor:
                    submittingChanges || !feedbackText.trim()
                      ? "not-allowed"
                      : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {submittingChanges ? (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-label="Sending"
                  />
                ) : null}
                <span>{submittingChanges ? "Sending..." : "Send request"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientWorkroom;
