import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

const FreelancersProposalDetails = () => {
  const { jobid } = useParams();
  const navigate = useNavigate();
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientInfo, setClientInfo] = useState(null);
  const [clientLoading, setClientLoading] = useState(true);
  const [clientError, setClientError] = useState(null);
  const [acceptHover, setAcceptHover] = useState(false);
  const [declineHover, setDeclineHover] = useState(false);
  const [showDeclineSection, setShowDeclineSection] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [declineMessage, setDeclineMessage] = useState("");
  const [blockFuture, setBlockFuture] = useState(false);
  const declineSectionRef = useRef(null);
  const [declineSectionDeclineHover, setDeclineSectionDeclineHover] = useState(false);
  const [declineSectionCancelHover, setDeclineSectionCancelHover] = useState(false);
  const [declineError, setDeclineError] = useState("");

  const handleDecline = async () => {
    setDeclineError("");
    if (!declineReason) {
      setDeclineError("Please select a reason for declining.");
      return;
    }
    try {
      const res = await axios.post(
        `${API_URL}/job-invite/decline/`,
        {
          jobId: invite.jobId,
          clientId: invite.clientId,
          reason: declineReason,
          message: declineMessage,
          blockFuture,
        },
        { withCredentials: true }
      );
      if (res.data && res.data.success) {
        setShowDeclineSection(false);
        navigate(-1);
      } else {
        setDeclineError(res.data.message || "Failed to decline invitation.");
      }
    } catch (err) {
      setDeclineError(
        err.response?.data?.message || "Failed to decline invitation."
      );
    }
  };

  useEffect(() => {
    const fetchInvitation = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all invitations for this freelancer, then filter by jobid
        const res = await axios.get(`${API_URL}/job-invite/freelancer/`, {
          withCredentials: true,
        });
        if (res.data && res.data.invitations) {
          const found = res.data.invitations.find((inv) => inv.jobId === jobid);
          setInvite(found || null);
        } else {
          setInvite(null);
        }
      } catch (err) {
        setError("Failed to fetch invitation details.");
      } finally {
        setLoading(false);
      }
    };
    fetchInvitation();
  }, [jobid]);

  useEffect(() => {
    if (!invite || !invite.clientId) return;
    setClientLoading(true);
    setClientError(null);
    axios
      .get(`${API_URL}/client/profile/${invite.clientId}/`)
      .then((res) => {
        setClientInfo(res.data);
      })
      .catch(() => setClientError("Failed to fetch client info."))
      .finally(() => setClientLoading(false));
  }, [invite]);

  useEffect(() => {
    if (showDeclineSection && declineSectionRef.current) {
      declineSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [showDeclineSection]);

  if (loading)
    return <div style={{ padding: 48, textAlign: "center" }}>Loading...</div>;
  if (error)
    return (
      <div style={{ padding: 48, color: "red", textAlign: "center" }}>
        {error}
      </div>
    );
  if (!invite)
    return (
      <div style={{ padding: 48, color: "#888", textAlign: "center" }}>
        Invitation not found.
      </div>
    );

  // Format date
  const postedDate = invite.createdAt
    ? new Date(invite.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";
  // Format hourly
  const hourly =
    invite.jobHourlyFrom && invite.jobHourlyTo
      ? `₹${parseFloat(invite.jobHourlyFrom).toFixed(2)} - ₹${parseFloat(
          invite.jobHourlyTo
        ).toFixed(2)}`
      : "-";

  return (
    <div style={{ maxWidth: 1400, margin: "60px auto", padding: 24 }}>
      <h1
        style={{
          fontSize: 36,
          fontWeight: 600,
          marginBottom: 32,
          letterSpacing: 0.3,
        }}
      >
        Invitation to interview
      </h1>
      <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
        {/* Main Card (left) */}
        <div
          style={{
            flex: 1,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 8px #0001",
            padding: 32,
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 600, marginBottom: 18 }}>
            Job details
          </div>
          <div style={{ fontSize: 22, fontWeight: 600 }}>{invite.jobTitle}</div>
          <div
            style={{ color: "#121212", fontSize: 16, margin: "26px 0 26px 0" }}
          >
            Posted on {postedDate}
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 12 }}>
                <span
                  style={{
                    display: "inline-block",
                    background: "#f3f3f3",
                    color: "#222",
                    borderRadius: 6,
                    padding: "4px 14px",
                    fontSize: 16,
                    fontWeight: 500,
                    marginRight: 8,
                  }}
                >
                  Full Stack Development
                </span>
              </div>
              <div
                style={{
                  color: "#121212",
                  fontSize: 18,
                  marginTop: 18,
                  marginBottom: 18,
                  minHeight: 60,
                }}
              >
                {invite.jobDescription}
              </div>
            </div>
            <div
              style={{
                minWidth: 260,
                borderLeft: "1px solid #eee",
                paddingLeft: 24,
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 18 }}>
                  {invite.jobExperienceLevel || "-"}
                </div>
                <div style={{ color: "#121212", fontSize: 16 }}>
                  Experience level
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 18 }}>{hourly}</div>
                <div style={{ color: "#121212", fontSize: 16 }}>
                  Hourly range
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 18 }}>
                  {invite.jobDuration || "-"}
                </div>
                <div style={{ color: "#121212", fontSize: 16 }}>
                  Project length
                </div>
              </div>
            </div>
          </div>
          {/* Skills */}
          <div style={{ margin: "32px 0 26px 0" }}>
            <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 10 }}>
              Skills and expertise
            </div>
            <style>
              {`
                .skill-tag {
                  background: linear-gradient(135deg, rgba(0, 118, 116, 0.1) 0%, rgba(0, 118, 116, 0.05) 100%);
                  color: #007674;
                  border: 1px solid rgba(0, 118, 116, 0.2);
                  border-radius: 20px;
                  padding: 6px 15px;
                  font-size: 1rem;
                  font-weight: 600;
                  transition: all 0.3s ease;
                  cursor: pointer;
                }
                
                .skill-tag:hover {
                  background: linear-gradient(135deg, #007674 0%, #005a58 100%);
                  color: white;
                  transform: translateY(-1px);
                  box-shadow: 0 4px 12px rgba(0, 118, 116, 0.3);
                }
              `}
            </style>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {(invite.jobSkills || []).map((skill, idx) => (
                <span
                  key={idx}
                  className="skill-tag"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          {/* Message from client */}
          <div
            style={{
              marginTop: 36,
              background: "#fff",
              borderRadius: 10,
              padding: 24,
              border: "1px solid #eee",
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 18 }}>
              Original message from client
            </div>
            <div
              style={{ color: "#222", fontSize: 18, whiteSpace: "pre-line" }}
            >
              {invite.message}
            </div>
          </div>

          {/* Decline Section at the end of main card */}
          {showDeclineSection && (
            <div
              ref={declineSectionRef}
              style={{
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: 12,
                marginTop: 32,
                padding: 32,
                maxWidth: "100%",
                boxShadow: "0 2px 8px #0001",
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
                Decline Invitation
              </div>
              <div style={{ color: "#222", fontSize: 18, marginBottom: 18 }}>
                We will politely notify the client that you are not interested.
                The client will be able to view the reason you've declined the
                invitation.
              </div>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>
                Let the client know why you’re declining this invite
              </div>
              <select
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: 17,
                  borderRadius: 8,
                  border: "2px solid #ccc",
                  marginBottom: 18,
                  background: "#fafafa",
                }}
              >
                <option value="">Select an option</option>
                <option value="Job is not fit for my skills.">Job is not fit for my skills.</option>
                <option value="Not interested in work described.">Not interested in work described.</option>
                <option value="Too Busy on other projects.">
                  Too Busy on other projects.
                </option>
                <option value="Client has too little Worksyde experience.">Client has too little Worksyde experience.</option>
                <option value="Proposed rate or budget is too low.">Proposed rate or budget is too low.</option>
                <option value="Spam">Spam</option>
                <option value="Client asked for a free work.">Client asked for a free work.</option>
                <option value="Client asked to work outside of Worksyde.">Client asked to work outside of Worksyde.</option>
                <option value="Other">Other</option>
              </select>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>
                Message to client (optional)
              </div>
              <textarea
                value={declineMessage}
                onChange={(e) => setDeclineMessage(e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  fontSize: 18,
                  borderRadius: 8,
                  border: "2px solid #ccc",
                  padding: 12,
                  marginBottom: 18,
                  resize: "vertical",
                }}
                placeholder="Add a message to the client (optional)"
              />
              {declineError && (
                <div style={{ color: "#dc3545", fontWeight: 600, marginBottom: 12 }}>
                  {declineError}
                </div>
              )}
              <div style={{ display: "flex", gap: 18 }}>
                <button
                  style={{
                    background: declineSectionDeclineHover ? "#005e60" : "#007476",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 17,
                    border: 0,
                    borderRadius: 6,
                    padding: "12px 36px",
                    cursor: "pointer",
                    boxShadow: declineSectionDeclineHover ? "0 2px 8px #00747633" : undefined,
                    transition: "background 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={() => setDeclineSectionDeclineHover(true)}
                  onMouseLeave={() => setDeclineSectionDeclineHover(false)}
                  onClick={handleDecline}
                >
                  Decline
                </button>
                <button
                  style={{
                    background: declineSectionCancelHover ? "#f3f3f3" : "#fff",
                    color: declineSectionCancelHover ? "#007476" : "#007476",
                    fontWeight: 600,
                    fontSize: 17,
                    border: 0,
                    borderRadius: 6,
                    padding: "12px 36px",
                    cursor: "pointer",
                    boxShadow: declineSectionCancelHover ? "0 2px 8px #00747633" : undefined,
                    transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={() => setDeclineSectionCancelHover(true)}
                  onMouseLeave={() => setDeclineSectionCancelHover(false)}
                  onClick={() => setShowDeclineSection(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Sidebar (right) - Accept/Decline buttons above About the client */}
        <div style={{ width: 320, minWidth: 260 }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 24,
              marginBottom: 24,
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 18 }}>
              Interested in discussing this job?
            </div>
            <button
              style={{
                width: "100%",
                background: acceptHover ? "#005e60" : "#007476",
                color: "#fff",
                fontWeight: 600,
                fontSize: 17,
                border: 0,
                borderRadius: 6,
                padding: "12px 0",
                marginBottom: 10,
                cursor: "pointer",
                boxShadow: acceptHover ? "0 2px 8px #00747633" : undefined,
                transition: "background 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={() => setAcceptHover(true)}
              onMouseLeave={() => setAcceptHover(false)}
            >
              Accept interview
            </button>
            <button
              style={{
                width: "100%",
                background: declineHover ? "#f3f3f3" : "#fff",
                color: declineHover ? "#007476" : "#007476",
                fontWeight: 600,
                fontSize: 17,
                border: "2px solid #007476",
                borderColor: declineHover ? "#007476" : "#007476",
                borderRadius: 6,
                padding: "12px 0",
                cursor: "pointer",
                boxShadow: declineHover ? "0 2px 8px #dc354533" : undefined,
                transition:
                  "background 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={() => setDeclineHover(true)}
              onMouseLeave={() => setDeclineHover(false)}
              onClick={() => setShowDeclineSection(true)}
            >
              Decline interview
            </button>
            <div style={{ color: "#121212", fontSize: 18, marginTop: 16 }}>
              No Connects are required
            </div>
          </div>
          {/* About the client */}
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              //   boxShadow: "0 2px 8px #0001",
              padding: 24,
              marginBottom: 24,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 14 }}>
              About the client
            </div>
            {clientLoading ? (
              <div style={{ color: "#888", fontSize: 16 }}>Loading...</div>
            ) : clientError ? (
              <div style={{ color: "red", fontSize: 16 }}>{clientError}</div>
            ) : clientInfo ? (
              <>
                <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>
                  Payment method{" "}
                  {clientInfo.paymentMethodVerified
                    ? "verified"
                    : "not verified"}{" "}
                  <span
                    style={{
                      color: clientInfo.paymentMethodVerified
                        ? "#198754"
                        : "#dc3545",
                      marginLeft: 6,
                      fontWeight: 700,
                    }}
                  >
                    {clientInfo.paymentMethodVerified ? "✔" : "?"}
                  </span>
                </div>
                <div
                  style={{
                    color: clientInfo.phoneVerified ? "#198754" : "#dc3545",
                    fontWeight: 600,
                    fontSize: 18,
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 20, marginRight: 6 }}>
                    {clientInfo.phoneVerified ? "✔" : "✗"}
                  </span>{" "}
                  Phone number{" "}
                  {clientInfo.phoneVerified ? "verified" : "not verified"}
                </div>
                <div>
                  <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                    INDIA
                  </p>
                </div>
                {/* Show time: online = current time, offline = last seen */}
                <div
                  style={{
                    color:
                      clientInfo.onlineStatus === "online" ? "#198754" : "#888",
                    fontWeight: 600,
                    fontSize: 18,
                    marginBottom: 8,
                  }}
                >
                  {clientInfo.onlineStatus === "online"
                    ? new Date().toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : clientInfo.lastSeen
                    ? `Last seen at ${new Date(
                        clientInfo.lastSeen
                      ).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}`
                    : null}
                </div>
                {/* Hires and Spent */}
                <div
                  style={{ color: "#121212", fontSize: 18, marginBottom: 2 }}
                >
                  {clientInfo.hires || 0} hires
                </div>
                <div
                  style={{ color: "#121212", fontSize: 18, marginBottom: 2 }}
                >
                  Spent: ₹
                  {clientInfo.spent
                    ? parseFloat(clientInfo.spent).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })
                    : "0.00"}
                </div>
                {/* Account creation date */}
                <div style={{ color: "#888", fontSize: 18, marginTop: 18 }}>
                  Member since{" "}
                  {clientInfo.createdAt
                    ? new Date(clientInfo.createdAt).toLocaleDateString(
                        "en-GB",
                        { day: "2-digit", month: "short", year: "numeric" }
                      )
                    : "-"}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancersProposalDetails;
