import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BsX, BsPaperclip, BsCheckCircle } from "react-icons/bs";
import axios from "axios";

function formatName(name) {
  if (!name) return "";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1][0]}.`;
}

const API_URL = "http://localhost:5000/api/auth";

const ProposalDetailsModal = ({
  show,
  onClose,
  proposals,
  jobTitle,
  onHire,
}) => {
  const [freelancerSummaries, setFreelancerSummaries] = useState({});
  const [loadingSummaries, setLoadingSummaries] = useState(false);

  useEffect(() => {
    if (!show || !proposals || proposals.length === 0) return;
    setLoadingSummaries(true);
    const fetchSummaries = async () => {
      const summaryMap = {};
      await Promise.all(
        proposals.map(async (proposal) => {
          const userId = proposal.userId;
          if (!userId) return;
          try {
            const res = await axios.get(
              `${API_URL}/freelancer/summary/${userId}/`
            );
            summaryMap[userId] = res.data;
          } catch (e) {
            summaryMap[userId] = null;
          }
        })
      );
      setFreelancerSummaries(summaryMap);
      setLoadingSummaries(false);
    };
    fetchSummaries();
  }, [show, proposals]);

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
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
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            transition={{ duration: 0.4, type: "spring", damping: 25 }}
            className="modal-content"
            style={{
              width: "100%",
              maxWidth: "900px",
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
                style={{
                  fontWeight: 700,
                  fontSize: "1.2rem",
                  color: "#007674",
                }}
              >
                Proposals for: {jobTitle}
              </div>
              <button
                onClick={onClose}
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
            <div style={{ padding: 0, overflowY: "auto", flex: 1 }}>
              {!proposals || proposals.length === 0 ? (
                <div
                  style={{ padding: 40, textAlign: "center", color: "#888" }}
                >
                  No proposals for this job yet.
                </div>
              ) : loadingSummaries ? (
                <div
                  style={{ padding: 40, textAlign: "center", color: "#888" }}
                >
                  Loading freelancer details...
                </div>
              ) : (
                <div
                  style={{
                    padding: 30,
                    display: "flex",
                    flexDirection: "column",
                    gap: 24,
                  }}
                >
                  {proposals.map((proposal, idx) => {
                    const summary = freelancerSummaries[proposal.userId];
                    return (
                      <React.Fragment key={proposal.id || idx}>
                        <div
                          style={{
                            border: "1.5px solid #e3e3e3",
                            borderRadius: 16,
                            background: "#fff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                            padding: 0,
                            marginBottom: 0,
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "stretch",
                            gap: 0,
                            minHeight: 160,
                            overflow: "hidden",
                          }}
                        >
                          {/* Left: Profile image */}
                          <div
                            style={{
                              background: "#f7f9fa",
                              padding: 28,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              minWidth: 140,
                              borderRight: "1.5px solid #e3e3e3",
                            }}
                          >
                            <img
                              src={
                                summary?.photograph || "/default-profile.png"
                              }
                              alt={summary?.name}
                              style={{
                                width: 96,
                                height: 96,
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: "2px solid #e3e3e3",
                                marginBottom: 10,
                              }}
                            />
                            <div
                              style={{
                                color: "#888",
                                fontSize: "0.98rem",
                                marginTop: 2,
                              }}
                            >
                              {summary?.country || "-"}
                            </div>
                          </div>
                          {/* Middle: Main info */}
                          <div
                            style={{
                              flex: 1,
                              padding: "24px 28px",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                marginBottom: 2,
                              }}
                            >
                              <div
                                style={{
                                  fontWeight: 700,
                                  fontSize: "1.13rem",
                                  color: "#222",
                                }}
                              >
                                {summary?.name || "Freelancer"}
                              </div>
                              {summary?.jobSuccess !== undefined && (
                                <span
                                  style={{
                                    background: "#e6f7f1",
                                    color: "#00b67a",
                                    fontWeight: 600,
                                    fontSize: "0.98rem",
                                    borderRadius: 8,
                                    padding: "3px 10px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                >
                                  <BsCheckCircle
                                    style={{ color: "#00b67a", fontSize: 16 }}
                                  />{" "}
                                  {summary.jobSuccess}% Job Success
                                </span>
                              )}
                              <span
                                style={{
                                  background: "#f3eaff",
                                  color: "#7c3aed",
                                  fontWeight: 600,
                                  fontSize: "0.98rem",
                                  borderRadius: 8,
                                  padding: "3px 10px",
                                  marginLeft: 2,
                                }}
                              >
                                Top Rated Plus
                              </span>
                            </div>
                            <div
                              style={{
                                color: "#666",
                                fontSize: "1.01rem",
                                marginBottom: 2,
                              }}
                            >
                              {summary?.title || "Freelancer"}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 18,
                                margin: "8px 0 8px 0",
                              }}
                            >
                              <span
                                style={{
                                  color: "#007674",
                                  fontWeight: 700,
                                  fontSize: "1.08rem",
                                }}
                              >
                                ₹{summary?.totalEarnings?.toLocaleString() || 0}{" "}
                                earned
                              </span>
                              <span
                                style={{
                                  color: "#007674",
                                  fontWeight: 700,
                                  fontSize: "1.08rem",
                                }}
                              >
                                ₹{summary?.hourlyRate || 0}/hr
                              </span>
                            </div>
                            {/* Cover letter as main text block */}
                            <div
                              style={{
                                color: "#222",
                                fontSize: "1.04rem",
                                margin: "10px 0 8px 0",
                                lineHeight: 1.6,
                              }}
                            >
                              <b>Cover letter - </b>
                              <span style={{ whiteSpace: "pre-line" }}>
                                {proposal.coverLetter}
                              </span>
                            </div>
                            {/* Attachment link below cover letter */}
                            {proposal.attachment &&
                              proposal.attachment !== "null" && (
                                <div style={{ marginBottom: 8 }}>
                                  <b>Attachment:</b>{" "}
                                  <a
                                    href={proposal.attachment}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      color: "#007674",
                                      textDecoration: "underline",
                                      marginLeft: 6,
                                    }}
                                  >
                                    <BsPaperclip /> View
                                  </a>
                                </div>
                              )}
                            {/* Skills as pill badges */}
                            <div
                              style={{
                                marginTop: 8,
                                display: "flex",
                                gap: 8,
                                flexWrap: "wrap",
                              }}
                            >
                              {summary?.skills &&
                                summary.skills.map((skill) => (
                                  <span
                                    key={skill._id}
                                    style={{
                                      background: "#f2f4f7",
                                      color: "#007674",
                                      borderRadius: 8,
                                      padding: "5px 14px",
                                      fontSize: "0.97rem",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {skill.name}
                                  </span>
                                ))}
                            </div>
                            {/* Milestones section inside the middle div */}
                            {proposal.milestones &&
                              proposal.milestones.length > 0 && (
                                <div style={{ marginTop: 14, marginBottom: 2 }}>
                                  <b>Milestones:</b>
                                  <ul
                                    style={{
                                      margin: "8px 0 0 18px",
                                      padding: 0,
                                    }}
                                  >
                                    {proposal.milestones.map((m, i) => (
                                      <li key={i} style={{ marginBottom: 4 }}>
                                        <span
                                          style={{
                                            color: "#007674",
                                            fontWeight: 600,
                                          }}
                                        >
                                          {m.title}
                                        </span>{" "}
                                        -
                                        {m.dueDate && (
                                          <span>
                                            {" "}
                                            Due:{" "}
                                            {new Date(
                                              m.dueDate
                                            ).toLocaleDateString()}
                                          </span>
                                        )}{" "}
                                        -{m.amount && <span> ₹{m.amount}</span>}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            {/* Submitted timestamp above buttons */}
                            <div
                              style={{
                                color: "#888",
                                fontSize: "0.98rem",
                                marginTop: 18,
                                marginBottom: 8,
                              }}
                            >
                              Submitted:{" "}
                              {proposal.createdAt
                                ? new Date(proposal.createdAt).toLocaleString()
                                : "-"}
                            </div>
                            {/* Action buttons at the end */}
                            <div
                              style={{ display: "flex", gap: 12, marginTop: 2 }}
                            >
                              <button
                                style={{
                                  background: "none",
                                  border: "1.5px solid #007674",
                                  color: "#007674",
                                  borderRadius: 12,
                                  fontWeight: 600,
                                  fontSize: "1.01rem",
                                  padding: "8px 22px",
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                }}
                              >
                                Message
                              </button>
                              <button
                                className="job-action-btn"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                                  color: "#fff",
                                  borderRadius: "15px",
                                  fontSize: "1.08rem",
                                  border: "none",
                                  fontWeight: 600,
                                  padding: "10px 22px",
                                  boxShadow:
                                    "0 6px 20px rgba(0, 118, 116, 0.3)",
                                  transition: "all 0.3s ease",
                                }}
                                onClick={() =>
                                  onHire(
                                    summary?.name,
                                    jobTitle,
                                    proposal.userId
                                  )
                                }
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
                                <BsCheckCircle style={{ marginRight: 8 }} />{" "}
                                Hire
                              </button>
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProposalDetailsModal;
