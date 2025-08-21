import React, { useEffect, useState } from "react";
import Header2 from "../../components/Header2";
import { HiOutlineDocumentCurrencyRupee } from "react-icons/hi2";
import { IoCalendarOutline, IoDocumentAttach } from "react-icons/io5";
import {
  BsArrowLeft,
  BsCheckCircle,
  BsPencil,
  BsX,
  BsClock,
  BsBriefcase,
  BsPerson,
  BsGeoAlt,
  BsQuestionCircle,
  BsInfoCircle,
  BsCalendar,
  BsCurrencyRupee,
} from "react-icons/bs";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const JobProposalSubmit = () => {
  const location = useLocation();
  const pathParts = location.pathname.split("/");
  const jobProposalId = pathParts[3];
  
  console.log("JobProposalSubmit - URL parts:", pathParts);
  console.log("JobProposalSubmit - Extracted proposal ID:", jobProposalId);

  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [clientDetails, setClientDetails] = useState(null);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [optionalMessage, setOptionalMessage] = useState("");
  
  // Simple notification modal states
  const [showSimpleNotificationModal, setShowSimpleNotificationModal] = useState(false);
  const [recipientUserId, setRecipientUserId] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");

  const withdrawReasons = [
    "Applied by mistake",
    "Rate too low",
    "Scheduling conflict with client",
    "Unresponsive client",
    "Inappropriate client behavior",
    "Other",
  ];

  const API_URL = "http://localhost:5000/api/auth";

  const formatPostDate = (dateString) => {
    if (!dateString) return "N/A";
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

  const formatMemberSince = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const formatLastSeen = (lastSeenDate) => {
    if (!lastSeenDate) return "Recently";
    const lastSeen = new Date(lastSeenDate);
    const now = new Date();
    const diffInMinutes = Math.floor((now - lastSeen) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    if (diffInMinutes < 2880) return "Yesterday";
    return formatPostDate(lastSeenDate);
  };

  // Helper function to safely render values that might be objects
  const safeRender = (value, fallback = "") => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === "object") {
      return value.name || value.title || value.label || fallback;
    }
    return String(value);
  };

  // Resolve project duration field from various possible keys
  const getJobDuration = (jobObj) => {
    if (!jobObj) return "";
    const candidate =
      jobObj.projectDuration ??
      jobObj.duration ??
      jobObj.project_duration ??
      jobObj.hoursPerWeek ??
      jobObj.weeklyHours ??
      jobObj.workload ??
      jobObj.timePerWeek;
    if (!candidate) return "";
    if (typeof candidate === "object") {
      return candidate.name || candidate.label || candidate.title || "";
    }
    return String(candidate);
  };

  // Currency formatting helper (Indian locale)
  const formatCurrency = (value) => {
    const num = Number(value || 0);
    return `₹${num.toLocaleString("en-IN")}`;
  };

  // Milestones parser (handles array or JSON string)
  const parseMilestones = (milestones) => {
    if (!milestones) return [];
    if (Array.isArray(milestones)) return milestones;
    if (typeof milestones === "string") {
      try {
        const parsed = JSON.parse(milestones);
        return Array.isArray(parsed) ? parsed : [];
      } catch (_) {
        return [];
      }
    }
    return [];
  };

  const handleEditProposal = () => {
    if (jobData?.jobId?.id) {
      console.log("Navigating to edit with jobData:", jobData);
      console.log("Proposal ID being passed:", jobData._id);
      console.log("Job ID being passed:", jobData.jobId.id);
      
      // Try to get proposal ID from various sources
      const proposalId = jobData._id || jobData.id || jobProposalId;
      
      if (proposalId) {
        navigate(`/ws/proposals/job/~${jobData.jobId.id}/edit?proposalId=${proposalId}`, {
          state: { jobProposalId: proposalId },
        });
      } else {
        console.error("Cannot navigate: missing proposal ID", { jobData, jobProposalId });
        toast.error("Could not determine proposal ID for editing");
      }
    } else {
      console.error("Cannot navigate: missing jobData or jobId", jobData);
    }
  };

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
        const response = await axios.post(
          `${API_URL}/jobproposalsbyid/fetch/`,
          {
            userId: user.id || user._id,
            jobProposalId: jobProposalId,
          }
        );
        const proposalData = response.data.data;
        setJobData(proposalData);

        // Fetch client details if we have the job data
        if (proposalData?.jobId?.userId) {
          try {
            const clientResponse = await axios.get(
              `${API_URL}/client/profile/${proposalData.jobId.userId}/`
            );
            setClientDetails(clientResponse.data);
          } catch (clientError) {
            console.error("Error fetching client details:", clientError);
          }
        }
      } catch (error) {
        console.error("Error fetching job post:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchJobDetails();
    }
  }, [jobProposalId, user]);

  if (loading || !jobData) {
    return (
      <div
        className="d-flex justify-content-center align-items-center min-vh-100"
        style={{ background: "#fff" }}
      >
        <div
          className="spinner-border"
          style={{ color: "#007674" }}
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Extract job details from the proposal data
  const job = jobData.jobId || {};
  const proposal = jobData;

  // Determine payment verification status
  const hasPaymentMethod = clientDetails
    ? (clientDetails.spent && clientDetails.spent > 0) ||
      (clientDetails.hires && clientDetails.hires > 0) ||
      true // Default to true for now
    : false;

  return (
    <>
      <Header2 />
      <div
        className="section-container"
        style={{
          background: "#fff",
          minHeight: "100vh",
          fontFamily: "Inter, Arial, sans-serif",
          
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "40px 20px",
          }}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              marginBottom: "40px",
            }}
          >
            <h1
              style={{
                letterSpacing: "0.3px",
                fontSize: "32px",
                fontWeight: "600",
                color: "#222",
                margin: "0",
              }}
            >
              Proposal details
            </h1>
          </motion.div>

          <div style={{ display: "flex", gap: "32px" }}>
            {/* Left Column - Main Content */}
            <div style={{ flex: 1 }}>
              {/* Job Details Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                style={{
                  background: "#fff",
                  border: "1px solid #e6e6e6",
                  borderRadius: "12px",
                  padding: "36px",
                  marginBottom: "32px",
                  boxShadow: "0 1px 8px 0 rgba(60,72,100,0.04)",
                }}
              >
                <h2
                  style={{
                    fontWeight: "600",
                    fontSize: "26px",
                    marginBottom: "24px",
                    color: "#111",
                    letterSpacing: "0.3px",
                  }}
                >
                  Job details
                </h2>

                {/* Job Title */}
                <h3
                  style={{
                    fontWeight: "600",
                    fontSize: "24px",
                    marginBottom: "16px",
                    color: "#111",
                    lineHeight: "1.3",
                    letterSpacing: "0.3px",
                  }}
                >
                  {safeRender(job.title, "Job Title Not Available")}
                </h3>

                {/* Tags and Date */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "24px",
                  }}
                >
                  <span
                    style={{
                      background: "#fff",
                      color: "#495057",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "16px",
                      fontWeight: "500",
                      border: "1px solid #e3e3e3",
                    }}
                  >
                    {typeof job.category === "object"
                      ? job.category.name
                      : job.category || "General"}
                  </span>
                  <span style={{ color: "#121212", fontSize: "16px" }}>
                    Posted {formatPostDate(job.createdAt)}
                  </span>
                </div>

                {/* Job Description and Attributes */}
                <div style={{ display: "flex", gap: "32px" }}>
                  {/* Job Description */}
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        color: "#121212",
                        fontSize: "18px",
                        lineHeight: "1.6",
                        marginBottom: "16px",
                      }}
                    >
                      {(() => {
                        const description = safeRender(job.description, "");
                        if (description) {
                          return description.length > 200 ? (
                            <>
                              {description.substring(0, 200)}...{" "}
                              <a
                                href="#"
                                style={{
                                  color: "#007476",
                                  textDecoration: "none",
                                  fontWeight: "600",
                                }}
                              >
                                more
                              </a>
                            </>
                          ) : (
                            description
                          );
                        } else {
                          return "No description available";
                        }
                      })()}
                    </p>

                    <a
                      href="#"
                      style={{
                        color: "#007476",
                        textDecoration: "none",
                        fontWeight: "600",
                        fontSize: "16px",
                      }}
                    >
                      View job posting
                    </a>
                  </div>

                  {/* Job Attributes */}
                  <div style={{ width: "280px" }}>
                    <div style={{ marginBottom: "20px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "4px",
                        }}
                      >
                        <BsBriefcase size={20} style={{ color: "#007476" }} />
                        <span
                          style={{
                            fontWeight: "600",
                            color: "#111",
                            fontSize: "18px",
                          }}
                        >
                          {typeof job.experienceLevel === "object"
                            ? job.experienceLevel.name
                            : job.experienceLevel || "Not specified"}
                        </span>
                      </div>
                      <span style={{ color: "#121212", fontSize: "16px" }}>
                        Experience level
                      </span>
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "4px",
                        }}
                      >
                        <BsCurrencyRupee
                          size={20}
                          style={{ color: "#007476" }}
                        />
                        <span
                          style={{
                            fontWeight: "600",
                            color: "#111",
                            fontSize: "18px",
                          }}
                        >
                          {job.budgetType === "fixed"
                            ? ` ${job.fixedRate || 0}`
                            : `${job.hourlyRateFrom || 0} - ${
                                job.hourlyRateTo || 0
                              }`}
                        </span>
                      </div>
                      <span style={{ color: "#121212", fontSize: "16px" }}>
                        {job.budgetType === "fixed"
                          ? "Fixed Price"
                          : "Hourly Range"}
                      </span>
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "4px",
                        }}
                      >
                        <BsClock size={20} style={{ color: "#007476" }} />
                        <span
                          style={{
                            fontWeight: "600",
                            color: "#111",
                            fontSize: "18px",
                          }}
                        >
                          {getJobDuration(job) || "Not specified"}
                        </span>
                      </div>
                      <span style={{ color: "#121212", fontSize: "16px" }}>
                        {(() => {
                          const duration = getJobDuration(job);
                          // If duration looks like hours per week, label accordingly
                          if (/hour/i.test(duration)) return "Hours per week";
                          return "Project Duration";
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Skills and Expertise Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                style={{
                  background: "#fff",
                  border: "1px solid #e6e6e6",
                  borderRadius: "12px",
                  padding: "36px",
                  marginBottom: "32px",
                  boxShadow: "0 1px 8px 0 rgba(60,72,100,0.04)",
                }}
              >
                <h2
                  style={{
                    fontWeight: "600",
                    fontSize: "26px",
                    marginBottom: "24px",
                    color: "#111",
                    letterSpacing: "0.3px",
                  }}
                >
                  Skills and expertise
                </h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {job.skills && job.skills.length > 0 ? (
                    job.skills.map((skill, index) => (
                      <span
                        key={index}
                        style={{
                          background: "#fff",
                          color: "#121212",
                          padding: "6px 15px",
                          borderRadius: "20px",
                          fontSize: "16px",
                          fontWeight: "500",
                          border: "1px solid #e3e3e3",
                        }}
                      >
                        {typeof skill === "object" ? skill.name : skill}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: "#121212", fontSize: "16px" }}>
                      No skills specified
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Your Proposed Terms Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                style={{
                  background: "#fff",
                  border: "1px solid #e6e6e6",
                  borderRadius: "12px",
                  padding: "36px",
                  marginBottom: "32px",
                  boxShadow: "0 1px 8px 0 rgba(60,72,100,0.04)",
                }}
              >
                <h2
                  style={{
                    fontWeight: "600",
                    fontSize: "26px",
                    marginBottom: "24px",
                    color: "#111",
                    letterSpacing: "0.3px",
                  }}
                >
                  Your proposed terms
                </h2>

                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      fontWeight: "600",
                      fontSize: "20px",
                      color: "#111",
                      marginBottom: "8px",
                      display: "block",
                      letterSpacing: "0.3px",
                    }}
                  >
                    {proposal.budgetType === "fixed"
                      ? proposal.scopeOfWork === "By Milestone"
                        ? "Price by milestone"
                        : "Fixed Price"
                      : "Hourly Rate"}
                  </label>

                  {/* Summary caption */}
                  <p
                    style={{
                      color: "#121212",
                      fontSize: "18px",
                      marginBottom: "16px",
                    }}
                  >
                    {proposal.budgetType === "fixed"
                      ? proposal.scopeOfWork === "By Milestone"
                        ? "Milestone payments as outlined below"
                        : "Total amount the client will see on your proposal"
                      : "Your hourly billing rate for this job"}
                  </p>

                  {/* Amount summary */}
                  <div
                    style={{
                      fontWeight: "500",
                      color: "#111",
                      fontSize: "20px",
                      marginBottom: proposal.budgetType === "fixed" ? "8px" : 0,
                    }}
                  >
                    {proposal.budgetType === "fixed"
                      ? proposal.scopeOfWork === "By Milestone"
                        ? formatCurrency(
                            parseMilestones(proposal.milestones).reduce(
                              (sum, m) => sum + Number(m.amount || 0),
                              0
                            )
                          )
                        : formatCurrency(
                            proposal.bidAmount || proposal.fixedRate
                          )
                      : `${formatCurrency(
                          proposal.hourlyRate || proposal.bidAmount
                        )}/hr`}
                  </div>

                  {/* Fee and receive for fixed price */}
                  {proposal.budgetType === "fixed" && (
                    <div style={{ color: "#121212", fontSize: 16 }}>
                      <span style={{ marginRight: 16 }}>
                        Service fee: {formatCurrency(proposal.serviceFee)}
                      </span>
                      <span>
                        You receive: {formatCurrency(proposal.youReceive)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Milestones breakdown when applicable */}
                {proposal.budgetType === "fixed" &&
                  proposal.scopeOfWork === "By Milestone" && (
                    <div
                      style={{
                        borderTop: "1px solid #e9ecef",
                        paddingTop: 16,
                      }}
                    >
                      {parseMilestones(proposal.milestones).length === 0 ? (
                        <div style={{ color: "#121212" }}>
                          No milestones added
                        </div>
                      ) : (
                        <div>
                          {parseMilestones(proposal.milestones).map((m, i) => (
                            <div
                              key={`${m.title || "milestone"}-${i}`}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "10px 0",
                                borderBottom: "1px dashed #eee",
                              }}
                            >
                              <div>
                                <div style={{ fontWeight: 600, color: "#111" }}>
                                  {m.title || `Milestone ${i + 1}`}
                                </div>
                                {(m.dueDate || m.date) && (
                                  <div
                                    style={{ color: "#121212", fontSize: 16 }}
                                  >
                                    Due{" "}
                                    {new Date(
                                      m.dueDate || m.date
                                    ).toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </div>
                                )}
                              </div>
                              <div style={{ fontWeight: 600, color: "#111" }}>
                                {formatCurrency(m.amount)}
                              </div>
                            </div>
                          ))}

                          {/* Milestones total */}
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              paddingTop: 12,
                            }}
                          >
                            <div style={{ color: "#111", fontWeight: 600 }}>
                              Total
                            </div>
                            <div style={{ fontWeight: 700 }}>
                              {formatCurrency(
                                parseMilestones(proposal.milestones).reduce(
                                  (sum, m) => sum + Number(m.amount || 0),
                                  0
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
              </motion.div>

              {/* Cover Letter Card */}
              {proposal.coverLetter && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  style={{
                    background: "#fff",
                    border: "1px solid #e6e6e6",
                    borderRadius: "12px",
                    padding: "36px",
                    marginBottom: "32px",
                    boxShadow: "0 1px 8px 0 rgba(60,72,100,0.04)",
                  }}
                >
                  <h2
                    style={{
                      fontWeight: "600",
                      fontSize: "26px",
                      marginBottom: "24px",
                      color: "#111",
                      letterSpacing: "0.3px",
                    }}
                  >
                    Cover letter
                  </h2>

                  <p
                    style={{
                      color: "#121212",
                      fontSize: "18px",
                      lineHeight: "1.6",
                      marginBottom: "16px",
                    }}
                  >
                    {(() => {
                      const coverLetter = safeRender(proposal.coverLetter, "");
                      if (coverLetter) {
                        return coverLetter.length > 300 ? (
                          <>
                            {coverLetter.substring(0, 300)}...{" "}
                            <a
                              href="#"
                              style={{
                                color: "#007476",
                                textDecoration: "none",
                                fontWeight: "600",
                              }}
                            >
                              more
                            </a>
                          </>
                        ) : (
                          coverLetter
                        );
                      } else {
                        return "No cover letter available";
                      }
                    })()}
                  </p>

                  {/* Attachment Section */}
                  {proposal.attachments && proposal.attachments.length > 0 && (
                    <div style={{ marginTop: "16px" }}>
                      {proposal.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "8px",
                            cursor: "pointer",
                            padding: "8px",
                            borderRadius: "8px",
                            transition: "background-color 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#f8f9fa";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                          }}
                          onClick={() => {
                            if (attachment.url) {
                              window.open(attachment.url, '_blank');
                            }
                          }}
                        >
                          <IoDocumentAttach
                            size={20}
                            style={{ color: "#007476" }}
                          />
                          <div
                            style={{
                              color: "#007476",
                              fontSize: "18px",
                              fontWeight: "500",
                              cursor: "pointer",
                              textDecoration: "underline",
                            }}
                          >
                            {attachment.name || `Attachment ${index + 1}`}
                          </div>
                          <span
                            style={{
                              color: "#121212",
                              fontSize: "18px",
                              marginLeft: "8px",
                            }}
                          >
                            ({attachment.size || "Unknown size"})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sample Attachment (for demo purposes) */}
                  {(!proposal.attachments ||
                    proposal.attachments.length === 0) && (
                    <div style={{ marginTop: "16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          cursor: "pointer",
                          padding: "8px",
                          borderRadius: "8px",
                          transition: "background-color 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#f8f9fa";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent";
                        }}
                        onClick={() => {
                          // For demo purposes, you can add a sample file URL here
                          // window.open("sample-file-url", '_blank');
                          console.log("Sample attachment clicked");
                        }}
                      >
                        <IoDocumentAttach
                          size={20}
                          style={{ color: "#007476" }}
                        />
                        <div
                          style={{
                            color: "#007476",
                            textDecoration: "underline",
                            fontSize: "16px",
                            fontWeight: "500",
                            cursor: "pointer",
                          }}
                        >
                          Untitled Project (4).jpg
                        </div>
                        <span
                          style={{
                            color: "#121212",
                            fontSize: "16px",
                            marginLeft: "8px",
                          }}
                        >
                          (299 KB)
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div style={{ width: "320px" }}>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                style={{ position: "sticky", top: "100px" }}
              >
                {/* Action Buttons Card */}
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #e3e3e3",
                    borderRadius: "12px",
                    padding: "24px",
                    marginBottom: "24px",
                    boxShadow: "0 1px 8px 0 rgba(60,72,100,0.04)",
                  }}
                >
                  <button
                    style={{
                      width: "100%",
                      background: "#007476",
                      color: "#fff",
                      border: "none",
                      padding: "12px 24px",
                      borderRadius: "8px",
                      fontSize: "16px",
                      fontWeight: "600",
                      cursor: "pointer",
                      marginBottom: "12px",
                      transition: "background-color 0.2s ease",
                    }}
                    onClick={handleEditProposal}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#005a58";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#007476";
                    }}
                  >
                    Edit proposal
                  </button>

                  <button
                    style={{
                      width: "100%",
                      background: "#fff",
                      color: "#007476",
                      border: "2px solid #007476",
                      padding: "12px 24px",
                      borderRadius: "8px",
                      fontSize: "16px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      marginBottom: "12px",
                    }}
                    onClick={() => setShowModal(true)}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#fff";
                    }}
                  >
                    Withdraw proposal
                  </button>
                </div>

                {/* About the Client Card */}
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #e6e6e6",
                    borderRadius: "12px",
                    padding: "24px",
                    boxShadow: "0 1px 8px 0 rgba(60,72,100,0.04)",
                  }}
                >
                  <h3
                    style={{
                      fontWeight: "600",
                      fontSize: "20px",
                      marginBottom: "20px",
                      color: "#111",
                      letterSpacing: "0.3px",
                    }}
                  >
                    About the client
                  </h3>

                  <div style={{ marginBottom: "16px" }}>
                    <span style={{ color: "#111", fontSize: "18px" }}>
                      Payment method{" "}
                      {hasPaymentMethod ? "verified" : "not verified"}
                    </span>
                    {!hasPaymentMethod && (
                      <BsQuestionCircle
                        size={16}
                        style={{ color: "#007476", marginLeft: "4px" }}
                      />
                    )}
                  </div>

                  {/* <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <BsCheckCircle size={16} style={{ color: "#007476" }} />
                    <span style={{ color: "#111", fontSize: "16px" }}>
                      Phone number verified
                    </span>
                  </div> */}

                  <div style={{ marginBottom: "16px" }}>
                    <span style={{ color: "#111", fontSize: "18px" }}>
                      {clientDetails?.country || "India"}, <br />{" "}
                      {clientDetails?.city || ""}{" "}
                      {formatLastSeen(clientDetails?.lastSeen)}
                    </span>
                  </div>

                  {/* <div style={{ marginBottom: "16px" }}>
                    <span style={{ color: "#111", fontSize: "16px" }}>
                      {clientDetails?.jobCount || 0} job posted
                    </span>
                  </div> */}

                  <div style={{ marginBottom: "16px" }}>
                    <span style={{ color: "#111", fontSize: "18px" }}>
                      {clientDetails?.hireRate || 0}% hire rate,{" "}
                      {clientDetails?.openJobs || 0} open job
                    </span>
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <span style={{ color: "#111", fontSize: "18px" }}>
                      Member since {formatMemberSince(clientDetails?.createdAt)}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      {showModal && (
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
          onClick={() => setShowModal(false)}
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
                Withdraw proposal
              </h3>
              <motion.button
                onClick={() => setShowModal(false)}
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
                We will politely notify the client that you are not interested. The client will be able to view the reason you've withdrawn your proposal.
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
                  {withdrawReasons.map((reason) => (
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
                        name="withdrawReason"
                        value={reason}
                        checked={selectedReason === reason}
                        onChange={(e) => setSelectedReason(e.target.value)}
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
                  Add an optional message to share with the client when we notify them that this proposal has been withdrawn.
                </p>
                <textarea
                  value={optionalMessage}
                  onChange={(e) => setOptionalMessage(e.target.value)}
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
                onClick={() => setShowModal(false)}
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
                onClick={async () => {
                  try {
                    // Call the withdraw proposal API with notification
                    const response = await axios.post(
                      `${API_URL}/proposals/withdraw/`,
                      {
                        proposalId: jobProposalId,
                        reason: selectedReason,
                        message: optionalMessage
                      },
                      { withCredentials: true }
                    );

                    if (response.data.success) {
                      // Close modal and reset form
                      setShowModal(false);
                      setSelectedReason("");
                      setOptionalMessage("");
                      
                      // Show success message (you can add a toast notification here)
                      alert("Proposal withdrawn successfully and client notified!");
                      
                      // Optionally redirect to proposals page
                      // navigate("/ws/proposals");
                    } else {
                      alert("Failed to withdraw proposal: " + response.data.message);
                    }
                  } catch (error) {
                    console.error("Error withdrawing proposal:", error);
                    alert("Error withdrawing proposal. Please try again.");
                  }
                }}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  background: !selectedReason ? "#ccc" : "#007674",
                  color: "#fff",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: !selectedReason ? "not-allowed" : "pointer",
                  borderRadius: "6px",
                  transition: "all 0.2s ease",
                }}
                whileHover={selectedReason ? {
                  background: "#005a58",
                } : {}}
                whileTap={selectedReason ? { scale: 0.95 } : {}}
                disabled={!selectedReason}
              >
                Withdraw
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default JobProposalSubmit;
