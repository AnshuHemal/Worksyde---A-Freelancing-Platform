import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

const sampleData = {
  offers: [],
  featuredInvites: [],
  active: [],
  submitted: [
    {
      id: "1",
      createdAt: "2025-08-07T10:30:00Z",
      job: {
        title: "Freelancing Website Development Project",
        scopeOfWork: "General Profile",
      },
      viewedByClient: true,
    },
    {
      id: "2",
      createdAt: "2025-08-06T14:20:00Z",
      job: {
        title:
          "Create a Detailed 3D Model from My Toy Design (Photoshop Files Provided)",
        scopeOfWork: "General Profile",
      },
      viewedByClient: false,
    },
    {
      id: "3",
      createdAt: "2025-08-06T09:15:00Z",
      job: {
        title: "3D/2D CAD Design for PCB Enclosure with laser Sensor",
        scopeOfWork: "General Profile",
      },
      viewedByClient: false,
    },
    {
      id: "4",
      createdAt: "2025-08-04T16:45:00Z",
      job: {
        title: "Design a Website",
        scopeOfWork: "General Profile",
      },
      viewedByClient: false,
    },
  ],
};

const tabList = ["Active", "Referrals"];

const FreelancersProposals = () => {
  const [activeTab, setActiveTab] = useState("Active");
  const [invitations, setInvitations] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [submittedProposals, setSubmittedProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(true);
  const [proposalsError, setProposalsError] = useState("");

  useEffect(() => {
    // Fetch job invitations for the current freelancer
    const fetchInvitations = async () => {
      setLoadingInvites(true);
      try {
        const res = await axios.get(`${API_URL}/job-invite/freelancer/`, {
          withCredentials: true,
        });
        if (res.data && res.data.invitations) {
          setInvitations(res.data.invitations);
        } else {
          setInvitations([]);
        }
      } catch (err) {
        setInvitations([]);
      } finally {
        setLoadingInvites(false);
      }
    };

    // Fetch submitted proposals for the current freelancer
    const fetchSubmittedProposals = async () => {
      setLoadingProposals(true);
      setProposalsError("");
      try {
        const res = await axios.get(`${API_URL}/jobproposals/freelancer/`, {
          withCredentials: true,
        });
        if (res.data && res.data.success) {
          setSubmittedProposals(res.data.proposals || []);
        } else {
          setSubmittedProposals([]);
        }
      } catch (err) {
        console.error("Error fetching submitted proposals:", err);
        setProposalsError("Failed to load submitted proposals");
        setSubmittedProposals([]);
      } finally {
        setLoadingProposals(false);
      }
    };

    fetchInvitations();
    fetchSubmittedProposals();
  }, []);

  return (
    <div
      className="section-container"
      style={{ maxWidth: 1400, margin: "60px auto 0 auto", padding: 24 }}
    >
      <h1
        style={{
          fontSize: 36,
          fontWeight: 600,
          marginBottom: 30,
          letterSpacing: 0.3,
        }}
      >
        My proposals
      </h1>
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 32,
          borderBottom: "2px solid #eee",
          marginBottom: 32,
        }}
      >
        {tabList.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: "none",
              border: "none",
              borderBottom:
                activeTab === tab ? "3px solid #222" : "3px solid transparent",
              color: activeTab === tab ? "#222" : "#888",
              fontWeight: 600,
              fontSize: 20,
              letterSpacing: 0.3,
              padding: "0 0 12px 0",
              cursor: "pointer",
              outline: "none",
              transition: "color 0.2s, border-bottom 0.2s",
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      {activeTab === "Active" && (
        <>
          {/* Offers */}
          <SectionCard title="Offers" count={0} />

          {/* Invitation to interview */}
          <SectionCard
            title="Invitation to interview"
            count={invitations.length}
          >
            {loadingInvites ? (
              <div style={{ padding: 32, color: "#888" }}>Loading...</div>
            ) : invitations.length > 0 ? (
              invitations.map((invite, idx) => (
                <div
                  key={invite.id || idx}
                  style={{
                    background: "#fff",
                    borderTop: idx === 0 ? "1px solid #eee" : "none",
                    margin: idx === 0 ? "18px 0 0 0" : 0,
                    padding: 32,
                    display: "flex",
                    alignItems: "center",
                    minHeight: 120,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        color: "#121212",
                        fontSize: 18,
                        marginBottom: 2,
                      }}
                    >
                      Received on{" "}
                      {invite.createdAt
                        ? new Date(invite.createdAt).toLocaleDateString(
                            "en-GB",
                            { day: "2-digit", month: "short", year: "numeric" }
                          )
                        : "-"}
                    </div>
                    <div
                      style={{
                        color: "#121212",
                        fontSize: 16,
                        marginBottom: 12,
                      }}
                    >
                      {invite.createdAt ? timeAgo(invite.createdAt) : "-"}
                    </div>
                    <Link
                      to={
                        invite.jobId
                          ? `/ws/proposals/interview/uid/${invite.jobId}`
                          : "#"
                      }
                      style={{
                        color: "#198754",
                        fontWeight: 600,
                        fontSize: 18,
                        textDecoration: "underline",
                        letterSpacing: 0.1,
                      }}
                    >
                      {invite.jobTitle || "Job Invitation"}
                    </Link>
                  </div>
                  <div style={{ minWidth: 220, textAlign: "right" }}>
                    <div
                      style={{
                        color: "#121212",
                        fontSize: 16,
                        marginBottom: 4,
                      }}
                    >
                      About the client
                    </div>
                    <div
                      style={{
                        color: "#121212",
                        fontSize: 16,
                        fontWeight: 500,
                      }}
                    >
                      {invite.clientHires || 0} hires
                    </div>
                    <div style={{ color: "#121212", fontSize: 16 }}>
                      ₹
                      {invite.clientSpent
                        ? parseFloat(invite.clientSpent).toLocaleString(
                            "en-IN",
                            { minimumFractionDigits: 2 }
                          )
                        : "0.00"}{" "}
                      Spents
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: 32, color: "#888" }}>
                No invitations found.
              </div>
            )}
          </SectionCard>

          {/* Invitations from Featured Jobs */}
          <SectionCard
            title="Invitations from Featured Jobs"
            count={sampleData.featuredInvites.length}
          />

          {/* Active proposals */}
          <SectionCard
            title="Active proposals"
            count={sampleData.active.length}
          />

          {/* Submitted proposals */}
          <SectionCard
            title="Submitted proposals"
            count={
              submittedProposals.length > 0
                ? submittedProposals.length
                : sampleData.submitted.length
            }
          >
            {loadingProposals ? (
              <div style={{ padding: 32, color: "#888" }}>
                Loading proposals...
              </div>
            ) : proposalsError ? (
              <div style={{ padding: 32, color: "#dc3545" }}>
                {proposalsError}
              </div>
            ) : submittedProposals.length > 0 ? (
              <div
                style={{
                  background: "#fff",
                  borderTop: "1px solid #eee",
                  margin: "18px 0 0 0",
                  padding: 0,
                }}
              >
                {submittedProposals.map((proposal, idx) => (
                  <div
                    key={proposal.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "18px 24px",
                      borderBottom:
                        idx !== submittedProposals.length - 1
                          ? "1px solid #f0f0f0"
                          : "none",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{ color: "#121212", fontSize: 18, marginBottom: 2 }}
                      >
                        Initiated{" "}
                        {proposal.createdAt
                          ? new Date(proposal.createdAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "Unknown date"}
                      </div>
                      <div
                        style={{ color: "#121212", fontSize: 16, marginBottom: 8 }}
                      >
                        {proposal.createdAt ? timeAgo(proposal.createdAt) : ""}
                      </div>
                      <Link
                        to={`/ws/proposals/${proposal.id}`}
                        style={{
                          color: "#007674",
                          fontWeight: 600,
                          fontSize: 20,
                          textDecoration: "underline",
                        }}
                      >
                        {proposal.job?.title || "Job Title"}
                      </Link>
                      {/* Viewed by client indicator */}
                      {(proposal.viewedByClient || proposal.id === "1") && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            marginTop: "8px",
                            color: "#121212",
                            fontSize: "16px",
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            style={{ color: "#121212" }}
                          >
                            <path
                              d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="3"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                          </svg>
                          Viewed by client
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        color: "#121212",
                        fontSize: 16,
                        minWidth: 120,
                        textAlign: "right",
                      }}
                    >
                      Work Scope: {proposal.job?.scopeOfWork || "General Profile"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: 32, color: "#888" }}>
                No submitted proposals found.
              </div>
            )}
            {/* Show sample data for demonstration when no real proposals */}
            {!loadingProposals &&
              !proposalsError &&
              submittedProposals.length === 0 && (
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    border: "1px solid #eee",
                    margin: "18px 0 0 0",
                    padding: 0,
                  }}
                >
                  {sampleData.submitted.map((proposal, idx) => (
                    <div
                      key={proposal.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "18px 24px",
                        borderBottom:
                          idx !== sampleData.submitted.length - 1
                            ? "1px solid #f0f0f0"
                            : "none",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            color: "#888",
                            fontSize: 15,
                            marginBottom: 2,
                          }}
                        >
                          Initiated{" "}
                          {proposal.createdAt
                            ? new Date(proposal.createdAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "Unknown date"}
                        </div>
                        <div
                          style={{
                            color: "#888",
                            fontSize: 14,
                            marginBottom: 8,
                          }}
                        >
                          {proposal.createdAt
                            ? timeAgo(proposal.createdAt)
                            : ""}
                        </div>
                        <Link
                          to={`/ws/proposals/${proposal.id}`}
                          style={{
                            color: "#198754",
                            fontWeight: 600,
                            fontSize: 17,
                            textDecoration: "underline",
                          }}
                        >
                          {proposal.job?.title || "Job Title"}
                        </Link>
                        {/* Viewed by client indicator */}
                        {proposal.viewedByClient && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              marginTop: "8px",
                              color: "#666",
                              fontSize: "14px",
                            }}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              style={{ color: "#666" }}
                            >
                              <path
                                d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <circle
                                cx="12"
                                cy="12"
                                r="3"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                            </svg>
                            Viewed by client
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          color: "#888",
                          fontSize: 15,
                          minWidth: 120,
                          textAlign: "right",
                        }}
                      >
                        {proposal.job?.scopeOfWork || "General Profile"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </SectionCard>
        </>
      )}
      {/* You can add content for Referrals tab here */}
    </div>
  );
};

function timeAgo(dateString) {
  if (!dateString) return "-";
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

function getStatusDisplay(status) {
  switch (status) {
    case "submitted":
      return "Submitted";
    case "shortlisted":
      return "Shortlisted";
    case "hired":
      return "Hired";
    case "completed":
      return "Completed";
    case "archived":
      return "Archived";
    case "declined":
      return "Declined";
    default:
      return "Submitted";
  }
}

function getStatusColor(status) {
  switch (status) {
    case "submitted":
      return "#6c757d";
    case "shortlisted":
      return "#007bff";
    case "hired":
      return "#28a745";
    case "completed":
      return "#198754";
    case "archived":
      return "#6c757d";
    case "declined":
      return "#dc3545";
    default:
      return "#6c757d";
  }
}

function SectionCard({ title, count, children }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #eee",
        marginBottom: 24,
        padding: 0,
      }}
    >
      <div
        style={{
          fontWeight: 600,
          fontSize: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 24px",
          borderBottom: children ? "1px solid #f0f0f0" : "none",
        }}
      >
        {title}{" "}
        <span style={{ color: "#121212", fontWeight: 500, fontSize: 18 }}>
          ({count})
        </span>
      </div>
      {children}
    </div>
  );
}

export default FreelancersProposals;
