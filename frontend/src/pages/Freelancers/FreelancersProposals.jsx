import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

const tabList = ["Active", "Referrals"];

const FreelancersProposals = () => {
  const [activeTab, setActiveTab] = useState("Active");
  const [invitations, setInvitations] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [submittedProposals, setSubmittedProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(true);
  const [proposalsError, setProposalsError] = useState("");
  const [jobOffers, setJobOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [offersError, setOffersError] = useState("");
  const [acceptedJobOffers, setAcceptedJobOffers] = useState([]);
  const [loadingAcceptedOffers, setLoadingAcceptedOffers] = useState(true);
  const [acceptedOffersError, setAcceptedOffersError] = useState("");

  // Simple cache for accepted job offers
  const [acceptedOffersCache, setAcceptedOffersCache] = useState({});
  const [cacheTimestamp, setCacheTimestamp] = useState(0);

  useEffect(() => {
    // Fetch all data with robust error handling
    const fetchAllData = async () => {
      try {
        // Set all loading states to true at once
        setLoadingInvites(true);
        setLoadingProposals(true);
        setLoadingOffers(true);
        setLoadingAcceptedOffers(true);
        setProposalsError("");
        setOffersError("");
        setAcceptedOffersError("");

        // Get current user first (needed for job offers)
        let userRes;
        try {
          userRes = await axios.get(`${API_URL}/current-user/`, {
            withCredentials: true,
          });
        } catch (error) {
          console.error("Error fetching current user:", error);
          // Set empty arrays if user fetch fails
          setInvitations([]);
          setSubmittedProposals([]);
          setJobOffers([]);
          setAcceptedJobOffers([]);
          setLoadingInvites(false);
          setLoadingProposals(false);
          setLoadingOffers(false);
          setLoadingAcceptedOffers(false);
          return;
        }

        const freelancerId = userRes.data?.user?._id;

        // Make API calls with error handling for each
        let invitationsRes, proposalsRes, offersRes, acceptedOffersRes;

        try {
          // Fetch job invitations
          invitationsRes = await axios.get(
            `${API_URL}/job-invite/freelancer/`,
            {
              withCredentials: true,
            }
          );
        } catch (error) {
          console.error("Error fetching invitations:", error);
          invitationsRes = { data: { invitations: [] } };
        }

        try {
          // Fetch submitted proposals
          proposalsRes = await axios.get(
            `${API_URL}/jobproposals/freelancer/`,
            {
              withCredentials: true,
            }
          );
        } catch (error) {
          console.error("Error fetching proposals:", error);
          proposalsRes = { data: { success: true, proposals: [] } };
        }

        try {
          // Fetch job offers (only if we have freelancer ID)
          if (freelancerId) {
            offersRes = await axios.get(
              `${API_URL}/job-offers/freelancer/${freelancerId}/`,
              {
                withCredentials: true,
              }
            );
          } else {
            offersRes = { data: { success: true, jobOffers: [] } };
          }
        } catch (error) {
          console.error("Error fetching job offers:", error);
          offersRes = { data: { success: true, jobOffers: [] } };
        }

        try {
          // Fetch accepted job offers (only if we have freelancer ID) - OPTIMIZED WITH CACHE
          if (freelancerId) {
            // Check cache first (cache valid for 2 minutes)
            const now = Date.now();
            const cacheKey = `accepted_offers_${freelancerId}`;
            const cacheValid = now - cacheTimestamp < 120000; // 2 minutes

            if (cacheValid && acceptedOffersCache[cacheKey]) {
              console.log("Using cached accepted job offers");
              acceptedOffersRes = {
                data: {
                  success: true,
                  acceptedJobOffers: acceptedOffersCache[cacheKey],
                },
              };
            } else {
              console.log("Fetching fresh accepted job offers");
              acceptedOffersRes = await axios.get(
                `${API_URL}/job-offers/accepted/freelancer/${freelancerId}/?page=1&page_size=10`,
                {
                  withCredentials: true,
                }
              );

              // Cache the result
              if (acceptedOffersRes.data && acceptedOffersRes.data.success) {
                setAcceptedOffersCache((prev) => ({
                  ...prev,
                  [cacheKey]: acceptedOffersRes.data.acceptedJobOffers || [],
                }));
                setCacheTimestamp(now);
              }
            }
          } else {
            acceptedOffersRes = {
              data: { success: true, acceptedJobOffers: [] },
            };
          }
        } catch (error) {
          console.error("Error fetching accepted job offers:", error);
          // Try to use cache on error
          const cacheKey = `accepted_offers_${freelancerId}`;
          if (acceptedOffersCache[cacheKey]) {
            console.log("Using cached data due to error");
            acceptedOffersRes = {
              data: {
                success: true,
                acceptedJobOffers: acceptedOffersCache[cacheKey],
              },
            };
          } else {
            acceptedOffersRes = {
              data: {
                success: true,
                acceptedJobOffers: [],
              },
            };
          }
        }

        // Process invitations
        if (invitationsRes.data && invitationsRes.data.invitations) {
          setInvitations(invitationsRes.data.invitations);
        } else {
          setInvitations([]);
        }

        // Process proposals
        if (proposalsRes.data && proposalsRes.data.success) {
          setSubmittedProposals(proposalsRes.data.proposals || []);
        } else {
          setSubmittedProposals([]);
        }

        // Process offers
        if (offersRes.data && offersRes.data.success) {
          setJobOffers(offersRes.data.jobOffers || []);
        } else {
          setJobOffers([]);
        }

        // Process accepted offers
        if (acceptedOffersRes.data && acceptedOffersRes.data.success) {
          const offers = acceptedOffersRes.data.acceptedJobOffers || [];
          console.log("Fetched accepted job offers:", offers);
          setAcceptedJobOffers(offers);
          if (offers.length === 0) {
            console.log(
              "No accepted job offers found for freelancer:",
              freelancerId
            );
          }
        } else {
          setAcceptedJobOffers([]);
          if (acceptedOffersRes.data && !acceptedOffersRes.data.success) {
            setAcceptedOffersError("Failed to load accepted job offers");
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);

        // Set fallback values on error
        setInvitations([]);
        setSubmittedProposals([]);
        setJobOffers([]);
        setAcceptedJobOffers([]);
        setProposalsError("Failed to load submitted proposals");
        setOffersError("Failed to load job offers");
        setAcceptedOffersError("Failed to load accepted job offers");
      } finally {
        // Set all loading states to false at once
        setLoadingInvites(false);
        setLoadingProposals(false);
        setLoadingOffers(false);
        setLoadingAcceptedOffers(false);
      }
    };

    fetchAllData();
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
          <SectionCard title="Offers" count={jobOffers.length}>
            {loadingOffers ? (
              <div style={{ padding: 32, color: "#888" }}>
                Loading offers...
              </div>
            ) : offersError ? (
              <div style={{ padding: 32, color: "#dc3545" }}>{offersError}</div>
            ) : jobOffers.length > 0 ? (
              <div
                style={{
                  background: "#fff",
                  borderTop: "1px solid #eee",
                  margin: "18px 0 0 0",
                  padding: 0,
                }}
              >
                {jobOffers.map((offer, idx) => (
                  <div
                    key={offer.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "18px 24px",
                      borderBottom:
                        idx !== jobOffers.length - 1
                          ? "1px solid #f0f0f0"
                          : "none",
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
                        Received{" "}
                        {offer.createdAt
                          ? new Date(offer.createdAt).toLocaleDateString(
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
                          color: "#121212",
                          fontSize: 16,
                          marginBottom: 8,
                        }}
                      >
                        {offer.createdAt ? timeAgo(offer.createdAt) : ""}
                      </div>
                      <Link
                        to={`/ws/offers/${offer.id}`}
                        style={{
                          color: "#007674",
                          fontWeight: 600,
                          fontSize: 20,
                          textDecoration: "underline",
                        }}
                      >
                        {offer.jobTitle || offer.contractTitle || "Job Offer"}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <></>
            )}
          </SectionCard>

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
              <></>
            )}
          </SectionCard>

          {/* Active proposals */}
          <SectionCard
            title="Active proposals"
            count={acceptedJobOffers.length}
          >
            {loadingAcceptedOffers ? (
              <div style={{ padding: 32, color: "#888" }}>
                Loading active proposals...
              </div>
            ) : acceptedOffersError ? (
              <div style={{ padding: 32, color: "#dc3545" }}>
                {acceptedOffersError}
              </div>
            ) : acceptedJobOffers.length > 0 ? (
              <div
                style={{
                  background: "#fff",
                  borderTop: "1px solid #eee",
                  margin: "18px 0 0 0",
                  padding: 0,
                }}
              >
                {acceptedJobOffers.map((offer, idx) => (
                  <div
                    key={offer.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "18px 24px",
                      borderBottom:
                        idx !== acceptedJobOffers.length - 1
                          ? "1px solid #f0f0f0"
                          : "none",
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
                        Accepted{" "}
                        {offer.acceptedAt
                          ? new Date(offer.acceptedAt).toLocaleDateString(
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
                          color: "#121212",
                          fontSize: 16,
                          marginBottom: 8,
                        }}
                      >
                        {offer.acceptedAt ? timeAgo(offer.acceptedAt) : ""}
                      </div>
                      <Link
                        to={`/ws/myjobs`}
                        style={{
                          color: "#007674",
                          fontWeight: 600,
                          fontSize: 20,
                          textDecoration: "underline",
                        }}
                      >
                        {offer.contractTitle || offer.jobTitle || "Job Offer"}
                      </Link>
                    </div>
                    <div
                      style={{
                        color: "#121212",
                        fontSize: 16,
                        minWidth: 120,
                        textAlign: "right",
                      }}
                    >
                      Work Scope: {offer.workScope || "General Profile"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: 32, color: "#888", textAlign: "center" }}>
                {acceptedOffersError ? (
                  <div style={{ color: "#dc3545" }}>{acceptedOffersError}</div>
                ) : (
                  <></>
                )}
              </div>
            )}
          </SectionCard>

          {/* Submitted proposals */}
          <SectionCard
            title="Submitted proposals"
            count={
              submittedProposals.length > 0 ? submittedProposals.length : 0
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
                        style={{
                          color: "#121212",
                          fontSize: 18,
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
                          color: "#121212",
                          fontSize: 16,
                          marginBottom: 8,
                        }}
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
                      Work Scope:{" "}
                      {proposal.job?.scopeOfWork || "General Profile"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <></>
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
