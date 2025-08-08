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
  const [declinedInvitations, setDeclinedInvitations] = useState([]);
  const [declinedInvitationsLoading, setDeclinedInvitationsLoading] =
    useState(false);
  const [proposals, setProposals] = useState([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [proposalsError, setProposalsError] = useState(null);
  const [proposalActions, setProposalActions] = useState({});
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

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
            width: "min(1100px, 95vw)",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            background: "#fff",
            borderRadius: 16,
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
              padding: "16px 20px",
              borderBottom: "1px solid #e0e0e0",
              background: "#f8f9fa",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img
                src={
                  proposal.freelancer?.profilePicture ||
                  `https://via.placeholder.com/40x40/4CAF50/FFFFFF?text=${proposal.freelancer?.name?.charAt(0) || 'F'}`
                }
                alt={proposal.freelancer?.name || 'Freelancer'}
                style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
              />
              <div>
                <div style={{ fontWeight: 700, color: "#121212" }}>{proposal.freelancer?.name || 'User'}</div>
                <div style={{ fontSize: 13, color: "#666" }}>{proposal.freelancer?.location || ''}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={() => handleProposalAction(proposal.id, 'messaged')}
                style={{
                  border: '1.5px solid #007674',
                  color: '#007674',
                  background: '#fff',
                  borderRadius: 10,
                  padding: '8px 16px',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >Message</button>
              <button
                onClick={() => handleProposalAction(proposal.id, 'hired')}
                style={{
                  border: 'none',
                  color: '#fff',
                  background: '#007674',
                  borderRadius: 10,
                  padding: '9px 18px',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >Hire</button>
              <button
                onClick={onClose}
                aria-label="Close"
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: 22,
                  cursor: "pointer",
                  color: "#666",
                  marginLeft: 8
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: 20, overflowY: "auto" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "320px 1fr",
                gap: 20,
              }}
            >
              {/* Left - Applicant card + invite */}
              <div>
                <div
                  style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 12,
                    padding: 16,
                    background: '#fff',
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#121212' }}>Applicant</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <img
                      src={
                        proposal.freelancer?.profilePicture ||
                        `https://via.placeholder.com/56x56/4CAF50/FFFFFF?text=${proposal.freelancer?.name?.charAt(0) || 'F'}`
                      }
                      alt={proposal.freelancer?.name || 'Freelancer'}
                      style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#121212' }}>{proposal.freelancer?.name || 'User'}</div>
                      <div style={{ fontSize: 13, color: '#666' }}>{proposal.freelancer?.location || ''}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, color: '#121212', lineHeight: 1.5 }}>{proposal.freelancer?.specialization || '-'}</div>
                </div>
              </div>

              {/* Right - Proposal details */}
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#121212' }}>Proposal Details</div>
                  <div style={{ fontSize: 18, color: '#121212', textAlign: 'right' }}>
                    ₹ {Number(proposal.freelancer?.hourlyRate ?? 0).toFixed(2)}
                    <span style={{ fontSize: 14, color: '#666' }}>/hr</span>
                    <div style={{ fontSize: 12, color: '#666' }}>Proposed Bid</div>
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 14, color: '#666', marginBottom: 6 }}>Cover letter</div>
                  <div style={{ fontSize: 15, color: '#121212', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {proposal.coverLetter || 'No cover letter provided'}
                  </div>
                </div>
                {proposal.attachment && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 14, color: '#666', marginBottom: 6 }}>Attachments</div>
                    <a
                      href={proposal.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#1070ca', textDecoration: 'underline', fontWeight: 600 }}
                    >
                      View attachment
                    </a>
                  </div>
                )}
              </div>
            </div>
            {/* Profile overview section below Applicant and Proposal Details */}
            <div style={{ marginTop: 12, paddingTop: 16, borderTop: '1px solid #e0e0e0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
                {/* Left sidebar summary */}
                <div>
                  {/* Languages */}
                  {Array.isArray(proposal.freelancer?.languages) && proposal.freelancer.languages.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#121212', marginBottom: 10 }}>Languages</div>
                      <div>
                        {proposal.freelancer.languages.map((lang, idx) => {
                          const rawName = typeof lang === 'string' ? lang : (lang?.name || lang?.language || 'asdas');
                          const rawProf = typeof lang === 'string' ? '' : (lang?.proficiency || '');
                          // If provided as single string like "English - Fluent" or "English: Fluent"
                          let name = rawName;
                          let proficiency = rawProf;
                          if (!proficiency && typeof lang === 'string') {
                            const parts = lang.split(/-|:/);
                            name = (parts[0] || '').trim();
                            proficiency = (parts[1] || '').trim();
                          }
                          return (
                            <div key={idx} style={{ color: '#121212', marginBottom: 8 }}>
                              <span style={{ fontWeight: 700 }}>{name || '-'}</span>
                              {proficiency && <span style={{ color: '#666' }}>: {proficiency}</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {/* Education */}
                  {Array.isArray(proposal.freelancer?.education) && proposal.freelancer.education.length > 0 && (
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#121212', marginBottom: 10 }}>Education</div>
                      <div>
                        {proposal.freelancer.education.map((edu, idx) => {
                          const school = edu?.School || edu?.institution || edu?.university || 'asdas';
                          const degree = edu?.degree || edu?.qualification || '';
                          const field = edu?.fieldOfStudy || edu?.field || '';
                          const startYear = edu?.startYear || edu?.fromYear || '';
                          const endYear = edu?.endYear || edu?.toYear || '';
                          const expected = !!edu?.isExpected;
                          return (
                            <div key={idx} style={{ color: '#121212', marginBottom: 16 }}>
                              <div style={{ fontWeight: 700, fontSize: 18 }}>{school || '-'}</div>
                              {(degree || field) && (
                                <div style={{ color: '#666', fontSize: 15 }}>
                                  {degree}
                                  {degree && field ? ', ' : ''}
                                  {field}
                                </div>
                              )}
                              {(startYear || endYear) && (
                                <div style={{ color: '#666', fontSize: 15 }}>
                                  {startYear || '—'}-{endYear || '—'} {expected ? '(expected)' : ''}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right main profile content */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#121212', lineHeight: 1.2 }}>
                      {proposal.freelancer?.title || proposal.freelancer?.specialization || '—'}
                    </div>
                    <div style={{ fontSize: 18, color: '#121212' }}>
                      ₹ {Number(proposal.freelancer?.hourlyRate ?? 0).toFixed(2)}
                      <span style={{ fontSize: 14, color: '#666' }}>/hr</span>
                    </div>
                  </div>
                  {proposal.freelancer?.bio && (
                    <div style={{ marginTop: 16, color: '#121212', lineHeight: 1.6 }}>
                      {showFullBio
                        ? proposal.freelancer.bio
                        : (proposal.freelancer.bio.length > 260
                            ? proposal.freelancer.bio.slice(0, 260) + '...'
                            : proposal.freelancer.bio)}
                      {proposal.freelancer.bio.length > 260 && (
                        <button
                          onClick={() => setShowFullBio((v) => !v)}
                          style={{
                            marginLeft: 8,
                            color: '#1070ca',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 600,
                          }}
                        >
                          {showFullBio ? 'less' : 'more'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Optional Portfolio heading placeholder */}
                  {(Array.isArray(proposal.freelancer?.portfolio) && proposal.freelancer.portfolio.length > 0) && (
                    <div style={{ marginTop: 24 }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#121212', marginBottom: 8 }}>Portfolio</div>
                      {/* Thumbnails could be rendered here if available */}
                    </div>
                  )}
                </div>
              </div>
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
      case "shortlisted":
        newPath = `/ws/client/applicants/${jobid}/shortlisted`;
        break;
      case "messaged":
        newPath = `/ws/client/applicants/${jobid}/messaged`;
        break;
      case "archived":
        newPath = `/ws/client/applicants/${jobid}/archived`;
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
      path.includes("/shortlisted") ||
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
    if (path.includes("/shortlisted")) {
      setActiveProposalTab("shortlisted");
    } else if (path.includes("/messaged")) {
      setActiveProposalTab("messaged");
    } else if (path.includes("/archived")) {
      setActiveProposalTab("archived");
    } else if (path.includes("/proposals")) {
      setActiveProposalTab("all");
    } else {
      setActiveProposalTab("all");
    }
  }, [location.pathname]);

  const fetchDeclinedInvitations = async () => {
    if (!jobid) return;

    setDeclinedInvitationsLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/client/declined-job-invitations/${jobid}/`,
        {
          withCredentials: true,
        }
      );

      setDeclinedInvitations(response.data.data || []);
    } catch (error) {
      console.error("Error fetching declined invitations:", error);
      setDeclinedInvitations([]);
    } finally {
      setDeclinedInvitationsLoading(false);
    }
  };

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
                      action === "shortlist" ? "shortlisted" : "submitted",
                  }
                : proposal
            )
          );
        }
      } else if (action === "archive") {
        const response = await axios.post(
          `${API_URL}/jobproposals/archive/`,
          {
            proposalId: proposalId,
          },
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          // Remove the proposal from the current list
          setProposals((prev) =>
            prev.filter((proposal) => proposal.id !== proposalId)
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

  // Fetch declined job invitations when archived tab is active
  useEffect(() => {
    if (activeProposalTab === "archived") {
      fetchDeclinedInvitations();
    }
  }, [activeProposalTab, jobid]);

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

  if (loading) return <div style={{ padding: 32 }}>Loading job details...</div>;
  if (error) return <div style={{ padding: 32, color: "red" }}>{error}</div>;
  if (!job) return null;

  // Placeholder client info (replace with real data if available)
  const client = {
    paymentVerified: false,
    phoneVerified: true,
    time: "3:31 PM",
    hireRate: "0% hire rate, 1 open job",
    company: "Mid-sized company (10-99 people)",
    industry: "Engineering & Architecture",
    memberSince: "May 4, 2025",
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
                  {job.hourlyRateFrom && job.hourlyRateTo
                    ? `₹${parseFloat(job.hourlyRateFrom).toFixed(
                        2
                      )} - ₹${parseFloat(job.hourlyRateTo).toFixed(2)}`
                    : "₹15.00 - ₹35.00"}
                </div>
                <div style={{ color: "#888", fontSize: 18 }}>Hourly</div>
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
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <BsPaperclip
                    style={{
                      color: "#007476",
                      fontSize: 22,
                      verticalAlign: -3,
                    }}
                  />
                  <a
                    href={job.attachments}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#007476",
                      fontWeight: 600,
                      textDecoration: "underline",
                      fontSize: 18,
                    }}
                  >
                    PPRC_Price_List.pdf (321 KB)
                  </a>
                </div>
              ) : (
                <div style={{ color: "#888", fontSize: 18 }}>No attachment</div>
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
                          <button
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
                onClick={() => handleProposalTabChange("shortlisted")}
                style={{
                  fontWeight: activeProposalTab === "shortlisted" ? 600 : 600,
                  fontSize: activeProposalTab === "shortlisted" ? 20 : 20,
                  color: activeProposalTab === "shortlisted" ? "#222" : "#888",
                  borderBottom:
                    activeProposalTab === "shortlisted"
                      ? "2.5px solid #222"
                      : "2.5px solid transparent",
                  paddingBottom: 6,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  position: "relative",
                }}
              >
                Shortlisted
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
              <span
                onClick={() => handleProposalTabChange("archived")}
                style={{
                  fontWeight: activeProposalTab === "archived" ? 600 : 600,
                  fontSize: activeProposalTab === "archived" ? 20 : 20,
                  color: activeProposalTab === "archived" ? "#222" : "#888",
                  borderBottom:
                    activeProposalTab === "archived"
                      ? "2.5px solid #222"
                      : "2.5px solid transparent",
                  paddingBottom: 6,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  position: "relative",
                }}
              >
                Archived
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
                                    proposal.freelancer?.profilePicture ||
                                    `https://via.placeholder.com/60x60/4CAF50/FFFFFF?text=${
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
                                  {proposal.freelancer?.specialization ||
                                    "-"}
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
                                  handleProposalAction(proposal.id, "messaged");
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
                                  handleProposalAction(proposal.id, "hired");
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
                                  ₹ {" "}
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
                                    <span key={skillIndex} className="skill-tag">
                                      {typeof skill === "string"
                                        ? skill
                                        : skill?.name || skill?.label || ""}
                                    </span>
                                  ))}
                                {(proposal.freelancer?.skills?.length || 0) > 6 && (
                                  <span className="skill-tag">
                                    +{(proposal.freelancer?.skills?.length || 0) - 6}
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
                                ₹ {" "}
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
                              Cover letter -{" "} <br />
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

            {activeProposalTab === "shortlisted" && (
              <div
                style={{ maxWidth: 400, margin: "0 auto", textAlign: "center" }}
              >
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
                        background: "linear-gradient(90deg, #87CEEB, #98FB98)",
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
                  Narrow down your most promising options
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
                  When you Shortlist proposals, they'll appear here so you can
                  compare and make offers.
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

            {activeProposalTab === "archived" && (
              <div style={{ padding: "20px" }}>
                {declinedInvitationsLoading ? (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <div style={{ fontSize: "18px", color: "#666" }}>
                      Loading archived proposals...
                    </div>
                  </div>
                ) : declinedInvitations.length > 0 ? (
                  // Show declined invitations with the layout from the image
                  declinedInvitations.map((invitation, index) => (
                    <div
                      key={index}
                      style={{
                        background: "#ffffff",
                        borderRadius: "12px",
                        padding: "24px",
                        marginBottom: "20px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      {/* Freelancer Info Section */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          marginBottom: "20px",
                        }}
                      >
                        {/* Profile Picture */}
                        <div
                          style={{ position: "relative", marginRight: "16px" }}
                        >
                          <img
                            src={
                              invitation.freelancer?.profilePicture ||
                              "https://via.placeholder.com/60x60/4CAF50/FFFFFF?text=HK"
                            }
                            alt={invitation.freelancer?.name || "Freelancer"}
                            style={{
                              width: "60px",
                              height: "60px",
                              borderRadius: "50%",
                              objectFit: "cover",
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
                              backgroundColor: "#4CAF50",
                              borderRadius: "50%",
                              border: "2px solid #ffffff",
                            }}
                          />
                        </div>

                        {/* Freelancer Details */}
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: "18px",
                              fontWeight: "600",
                              color: "#333",
                              marginBottom: "4px",
                            }}
                          >
                            {invitation.freelancer?.name || "Hemal K."}
                          </div>
                          <div
                            style={{
                              fontSize: "14px",
                              color: "#666",
                              marginBottom: "8px",
                            }}
                          >
                            {invitation.freelancer?.location || "India"}
                          </div>
                          <div
                            style={{
                              fontSize: "14px",
                              color: "#333",
                              marginBottom: "8px",
                              lineHeight: "1.4",
                            }}
                          >
                            {invitation.freelancer?.specialization ||
                              "Web Developer | Front-End & Back-End Development | Custom Solutions"}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#dc3545",
                              fontStyle: "italic",
                            }}
                          >
                            Proposal withdrawn by freelancer.
                          </div>
                        </div>
                      </div>

                      {/* Three Column Layout */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr",
                          gap: "20px",
                        }}
                      >
                        {/* Stats Column */}
                        <div>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#333",
                              marginBottom: "12px",
                            }}
                          >
                            Stats
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: "8px",
                            }}
                          >
                            <BsCreditCard
                              style={{ marginRight: "8px", color: "#666" }}
                            />
                            <span style={{ fontSize: "14px", color: "#666" }}>
                              {invitation.freelancer?.completedJobs || 0}{" "}
                              completed jobs
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: "8px",
                            }}
                          >
                            <BsClock
                              style={{ marginRight: "8px", color: "#666" }}
                            />
                            <span style={{ fontSize: "14px", color: "#666" }}>
                              {invitation.freelancer?.totalHours || 0} total
                              hours
                            </span>
                          </div>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <span
                              style={{
                                marginRight: "8px",
                                color: "#666",
                                fontSize: "16px",
                              }}
                            >
                              $
                            </span>
                            <span style={{ fontSize: "14px", color: "#666" }}>
                              {invitation.freelancer?.totalEarned || 0} earned
                            </span>
                          </div>
                        </div>

                        {/* Qualifications Column */}
                        <div>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#333",
                              marginBottom: "12px",
                            }}
                          >
                            Qualifications
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: "12px",
                            }}
                          >
                            <BsQuestionCircle
                              style={{ marginRight: "8px", color: "#666" }}
                            />
                            <span style={{ fontSize: "14px", color: "#666" }}>
                              {invitation.freelancer?.skills?.length || 13}{" "}
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
                            {(
                              invitation.freelancer?.skills || [
                                "Ecommerce",
                                "Ecommerce Website",
                                "Web Development",
                                "React",
                                "Node.js",
                                "MongoDB",
                              ]
                            )
                              .slice(0, 6)
                              .map((skill, skillIndex) => (
                                <span key={skillIndex} className="skill-tag">{skill}</span>
                              ))}
                            {(invitation.freelancer?.skills?.length || 13) > 6 && (
                              <span className="skill-tag">+{(invitation.freelancer?.skills?.length || 13) - 6}</span>
                            )}
                          </div>
                        </div>

                        {/* Details Column */}
                        <div>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#333",
                              marginBottom: "12px",
                            }}
                          >
                            Details
                          </div>
                          <div style={{ marginBottom: "12px" }}>
                            <div
                              style={{
                                fontSize: "16px",
                                fontWeight: "600",
                                color: "#333",
                                marginBottom: "4px",
                              }}
                            >
                              ${invitation.freelancer?.hourlyRate || "25.00"}/hr
                            </div>
                            <span
                              style={{
                                background: "#007bff",
                                color: "#ffffff",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: "500",
                              }}
                            >
                              Invited
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: "14px",
                              color: "#666",
                              lineHeight: "1.4",
                            }}
                          >
                            <strong>Cover letter -</strong>{" "}
                            {invitation.coverLetter ||
                              ""}
                          </div>
                        </div>
                      </div>
                    </div>

                  ))
                ) : (
                  // Show empty state when no declined invitations
                  <div
                    style={{
                      maxWidth: 400,
                      margin: "0 auto",
                      textAlign: "center",
                    }}
                  >
                    {/* Archive Icon */}
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
                      {/* Archive box */}
                      <div
                        style={{
                          width: 60,
                          height: 45,
                          background: "#6c757d",
                          borderRadius: "8px 8px 12px 12px",
                          position: "relative",
                          boxShadow: "0 4px 12px rgba(108, 117, 125, 0.3)",
                        }}
                      >
                        {/* Archive lid */}
                        <div
                          style={{
                            position: "absolute",
                            top: -8,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 50,
                            height: 12,
                            background: "#6c757d",
                            borderRadius: "8px 8px 0 0",
                            borderBottom: "2px solid #495057",
                          }}
                        ></div>

                        {/* Archive handle */}
                        <div
                          style={{
                            position: "absolute",
                            top: -4,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 20,
                            height: 6,
                            background: "#495057",
                            borderRadius: "3px",
                          }}
                        ></div>

                        {/* Archive lock */}
                        <div
                          style={{
                            position: "absolute",
                            top: 8,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 8,
                            height: 8,
                            background: "#495057",
                            borderRadius: "50%",
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
                      No archived proposals
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
                      Archived proposals will appear here when you archive them
                      from other tabs.
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
                        top: -8,
                        right: -2,
                        width: 12,
                        height: 20,
                        background: "#28a745",
                        borderRadius: "2px 8px 2px 2px",
                        transform: "rotate(-15deg)",
                        transformOrigin: "bottom left",
                      }}
                    ></div>

                    {/* Mailbox lock/detail */}
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 8,
                        height: 8,
                        background: "#9c27b0",
                        borderRadius: "50%",
                      }}
                    ></div>
                  </div>

                  {/* Mailbox pole */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: -15,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 4,
                      height: 20,
                      background: "#8B4513",
                      borderRadius: "2px",
                    }}
                  ></div>
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
                  No messages yet
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
                  Start the conversation by asking any freelancer a question
                  about their proposal.
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
          <span style={{ color: "#222", fontWeight: 600 }}>Invite-Only</span>
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
            {job.createdAt ? timeAgo(job.createdAt) : "1 hour ago"}
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
                <SidebarAction icon={<BsGlobe />} text="Make public" />
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
                    color: "#222",
                    fontWeight: 400,
                    fontSize: 18,
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  Payment method not verified{" "}
                  <BsQuestionCircle
                    style={{
                      fontSize: 15,
                      color: "#bbb",
                      marginLeft: 2,
                      verticalAlign: -2,
                    }}
                  />
                </div>
                <div
                  style={{
                    color: "#007476",
                    fontWeight: 500,
                    fontSize: 18,
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <BsCheckCircle style={{ color: "#007476", fontSize: 18 }} />{" "}
                  Phone number verified
                </div>
                <div
                  style={{
                    color: "#121212",
                    fontWeight: 400,
                    fontSize: 18,
                    marginBottom: 0,
                  }}
                >
                  {client.time}
                </div>
                <div
                  style={{ color: "#121212", fontSize: 18, margin: "10px 0" }}
                >
                  {client.hireRate}
                </div>
                <div
                  style={{
                    color: "#222",
                    fontWeight: 600,
                    fontSize: 18,
                    marginBottom: 10,
                  }}
                >
                  {client.industry}
                </div>
                <div
                  style={{ color: "#121212", fontSize: 18, marginBottom: 0 }}
                >
                  {client.company}
                </div>
                <div style={{ color: "#888", fontSize: 18, marginTop: 15 }}>
                  Member since {client.memberSince}
                </div>
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
