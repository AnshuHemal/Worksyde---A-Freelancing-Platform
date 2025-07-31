import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BsEnvelope,
  BsPhone,
  BsCreditCard,
  BsPlus,
  BsThreeDots,
} from "react-icons/bs";
import axios from "axios";
import toast from "react-hot-toast";
import ProposalDetailsModal from "./ProposalDetailsModal";

const API_URL = "http://localhost:5000/api/auth";

const steps = [
  {
    title: "Verify your email",
    desc: "Confirm it's you and establish trust with freelancers.",
    icon: <BsEnvelope size={28} />,
    action: (
      <Link
        to="#"
        style={{
          color: "#007674",
          fontWeight: 600,
          textDecoration: "underline",
        }}
      >
        Verify your email
      </Link>
    ),
    required: "Required to hire",
  },
  {
    title: "Verify your phone number",
    desc: "Confirm it's you, to be able to publish your first job post.",
    icon: <BsPhone size={28} />,
    action: (
      <Link
        to="#"
        style={{
          color: "#007674",
          fontWeight: 600,
          textDecoration: "underline",
        }}
      >
        Verify your phone number
      </Link>
    ),
    required: "Required to publish a job",
  },
  {
    title: "Add a billing method",
    desc: "This can increase your hiring speed by up to 3x. There's no cost until you hire.",
    icon: <BsCreditCard size={28} />,
    action: (
      <Link
        to="#"
        style={{
          color: "#007674",
          fontWeight: 600,
          textDecoration: "underline",
        }}
      >
        Add a billing method
      </Link>
    ),
    required: "Required to hire",
  },
];

function formatName(name) {
  if (!name) return "";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1][0]}.`;
}

const ClientOverviewPage = () => {
  const [userId, setUserId] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoadingUser(true);
    axios
      .get(`${API_URL}/current-user/`, { withCredentials: true })
      .then((res) => {
        setUserId(res.data.user._id);
      })
      .catch(() => toast.error("Failed to fetch user info"))
      .finally(() => setLoadingUser(false));
  }, []);

  useEffect(() => {
    if (!userId) return;
    setLoadingJobs(true);
    axios
      .get(`${API_URL}/jobposts/client/${userId}/`)
      .then((res) => {
        setJobs(res.data.data || []);
      })
      .catch(() => toast.error("Failed to fetch jobs"))
      .finally(() => setLoadingJobs(false));
  }, [userId]);

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setShowProposalModal(true);
    setLoadingProposals(true);
    axios
      .get(`${API_URL}/jobproposals/job/${job.id}/`)
      .then((res) => {
        setProposals(res.data.data || []);
      })
      .catch(() => toast.error("Failed to fetch proposals"))
      .finally(() => setLoadingProposals(false));
  };

  const handleHire = async (freelancerName, jobTitle, freelancerId) => {
    try {
      // Get client name (could be from user context or API, here using 'White' as in greeting)
      const clientName = "White";
      const clientId = userId;
      // Call the backend API to send the system message
      await fetch("/api/chats/hire-notify/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          freelancer_id: freelancerId,
          job_title: jobTitle,
          client_name: clientName,
        }),
        credentials: "include",
      });
      toast.success(`${freelancerName} hired for the Post: ${jobTitle}`);
      // Generate room id (sorted)
      const roomId = [clientId, freelancerId].sort().join("_");
      // Navigate to chat window
      navigate(`/ws/messages?room=${roomId}&user=${freelancerId}`);
    } catch (err) {
      toast.error("Failed to send hire notification.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f8fa",
        fontFamily: "Urbanist, sans-serif",
      }}
    >
      <style>{`
        .client-main-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 36px 16px 32px 16px;
        }
        .client-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
        }
        .client-greeting {
          font-size: 1.5rem;
          font-weight: 600;
          color: #222;
        }
        .post-job-btn {
          background: linear-gradient(135deg, #007674 0%, #005a58 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 12px 28px;
          font-size: 1.08rem;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(0, 118, 116, 0.13);
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .post-job-btn:hover {
          background: linear-gradient(135deg, #005a58 0%, #007674 100%);
          transform: translateY(-2px);
        }
        .steps-row {
          display: flex;
          gap: 24px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }
        .step-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          border: 1.5px solid #e3e3e3;
          flex: 1 1 260px;
          min-width: 260px;
          max-width: 340px;
          padding: 24px 22px 20px 22px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .step-card .step-icon {
          color: #007674;
          margin-bottom: 8px;
        }
        .step-required {
          font-size: 0.95rem;
          color: #888;
          font-weight: 500;
        }
        .step-title {
          font-size: 1.08rem;
          font-weight: 600;
          color: #222;
        }
        .step-desc {
          color: #666;
          font-size: 1rem;
          margin-bottom: 2px;
        }
        .overview-section {
          margin-top: 18px;
        }
        .overview-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: #222;
          margin-bottom: 18px;
        }
        .overview-row {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }
        .overview-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          border: 1.5px solid #e3e3e3;
          padding: 28px 24px 22px 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          position: relative;
        }
        .overview-card .job-badge {
          background: linear-gradient(135deg, #e0f7f6 0%, #c2eceb 100%);
          color: #007674;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          padding: 4px 12px;
          display: inline-block;
          margin-bottom: 8px;
        }
        .overview-card .job-title {
          font-size: 1.08rem;
          font-weight: 600;
          color: #222;
        }
        .overview-card .job-desc {
          color: #666;
          font-size: 1rem;
          margin-bottom: 10px;
        }
        .overview-card .job-action-btn {
          background: linear-gradient(135deg, #007674 0%, #005a58 100%);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 10px 22px;
          font-size: 1rem;
          font-weight: 600;
          margin-top: 8px;
          transition: all 0.2s;
        }
        .overview-card .job-action-btn:hover {
          background: linear-gradient(135deg, #005a58 0%, #007674 100%);
        }
        .overview-card .job-menu {
          position: absolute;
          top: 18px;
          right: 18px;
          color: #888;
          cursor: pointer;
        }
        .overview-card .overview-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #888;
          font-size: 1.08rem;
          gap: 10px;
        }
        .overview-card .overview-empty-link {
          color: #007674;
          font-weight: 600;
          text-decoration: underline;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .job-list {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 24px;
        }
        .proposal-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        @media (max-width: 900px) {
          .steps-row, .overview-row { flex-direction: column; gap: 18px; }
        }
        @media (max-width: 1000px) {
          .job-list {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 700px) {
          .job-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div className="client-main-container ">
        {/* Header Row */}
        <div className="client-header-row section-container">
          <div className="client-greeting">Good evening, White</div>
          <Link to="/client/post-job">
            <button
              className="post-job-btn"
              style={{
                background: "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                color: "#fff",
                borderRadius: "15px",
                fontSize: "1.08rem",
                border: "none",
                fontWeight: 600,
                padding: "12px 28px",
                boxShadow: "0 6px 20px rgba(0, 118, 116, 0.3)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background =
                  "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 8px 25px rgba(18, 18, 18, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background =
                  "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 6px 20px rgba(0, 118, 116, 0.3)";
              }}
            >
              <BsPlus size={20} /> Post a job
            </button>
          </Link>
        </div>
        {/* Steps Row */}
        <div className="steps-row">
          {steps.map((step, idx) => (
            <div className="step-card" key={idx}>
              <div className="step-icon">{step.icon}</div>
              <div className="step-required">{step.required}</div>
              <div className="step-title">{step.action}</div>
              <div className="step-desc">{step.desc}</div>
            </div>
          ))}
        </div>
        {/* Overview Section */}
        <div className="overview-section">
          <div className="overview-title">Your Job Posts</div>
          {loadingUser ? (
            <div>Loading user info...</div>
          ) : loadingJobs ? (
            <div>Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div>No job posts found.</div>
          ) : (
            <div className="job-list">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="overview-card"
                  style={{
                    cursor: "pointer",
                    marginBottom: 18,
                    border:
                      selectedJob && selectedJob.id === job.id
                        ? "2px solid #007674"
                        : undefined,
                  }}
                  onClick={() => handleJobClick(job)}
                >
                  <div className="job-title">{job.title}</div>
                  <div
                    style={{
                      color: "#888",
                      fontSize: "0.98rem",
                      marginBottom: 6,
                    }}
                  >
                    Posted: {new Date(job.createdAt).toLocaleString()}
                  </div>
                  <div style={{ color: "#007674", fontWeight: 600 }}>
                    Applicants: {job.applicants || 0}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <ProposalDetailsModal
          show={showProposalModal}
          onClose={() => setShowProposalModal(false)}
          proposals={proposals}
          jobTitle={selectedJob ? selectedJob.title : ""}
          onHire={(freelancerName, jobTitle, freelancerId) =>
            handleHire(freelancerName, jobTitle, freelancerId)
          }
        />
      </div>
    </div>
  );
};

export default ClientOverviewPage;
