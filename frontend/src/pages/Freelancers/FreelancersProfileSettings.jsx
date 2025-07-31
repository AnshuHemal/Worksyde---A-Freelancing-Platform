import React, { useState, useEffect } from "react";
import axios from "axios";
import FreelancersSettingsSidebar from "./FreelancersSettingsSidebar";
import { BsQuestionCircle } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

const SIDEBAR_WIDTH = 290;

const FreelancersProfileSettings = () => {
  const navigate = useNavigate();
  const [visibility, setVisibility] = useState("Private");
  const [projectPreference, setProjectPreference] =
    useState("Project preference");
  const [showVisibilityDropdown, setShowVisibilityDropdown] = useState(false);
  const [showProjectPreferenceDropdown, setShowProjectPreferenceDropdown] =
    useState(false);
  const [experienceLevel, setExperienceLevel] = useState("Intermediate");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/auth/current-user/", { withCredentials: true })
      .then(res => setUserId(res.data.user._id))
      .catch(() => setUserId(null));
  }, []);

  const visibilityOptions = ["Private", "Public"];
  const projectPreferenceOptions = [
    "Short-Term projects (< 3 months)",
    "Long Term projects (3+ months)",
    "Both Short-Term and Long-Term projects",
  ];

  const handleVisibilityChange = (option) => {
    setVisibility(option);
    setShowVisibilityDropdown(false);
  };

  const handleProjectPreferenceChange = (option) => {
    setProjectPreference(option);
    setShowProjectPreferenceDropdown(false);
  };

  // Navigation handler for sidebar
  const handleSidebarNavigate = (key) => {
    switch (key) {
      case "billing":
        navigate("/ws/payments/billing-methods");
        break;
      case "contact":
        navigate("/ws/settings/contact-info");
        break;
      case "profile":
        navigate("/ws/settings/profile");
        break;
      case "profile-settings":
        navigate("/ws/settings/profile");
        break;
      case "security":
        navigate("/ws/settings/password-and-security");
        break;
      case "notifications":
        navigate("/ws/settings/notifications");
        break;
      default:
        break;
    }
  };

  return (
    <div
      className="section-container"
      style={{ display: "flex", minHeight: "100vh", background: "#fff" }}
    >
      <FreelancersSettingsSidebar
        activeKey="profile-settings"
        onNavigate={handleSidebarNavigate}
        freelancerId={userId}
      />
      {/* Main Content */}
      <main
        style={{
          flex: 1,
          marginLeft: SIDEBAR_WIDTH,
          background: "#fff",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div style={{ width: "100%", maxWidth: 900, padding: "28px 0 0 0" }}>
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              marginBottom: 32,
              color: "#222",
              textAlign: "left",
            }}
          >
            My profile
          </div>

          {/* Profile Visibility Card */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e6e6e6",
              borderRadius: 12,
              padding: 36,
              marginBottom: 32,
              width: "100%",
              boxShadow: "0 1px 8px 0 rgba(60,72,100,0.04)",
              position: "relative",
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: 26,
                marginBottom: 24,
                color: "#111",
              }}
            >
              Profile Visibility
            </div>

            <div style={{ marginBottom: 18, color: "#222" }}>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  color: "#222",
                  marginBottom: 8,
                }}
              >
                Visibility
              </div>
              <div style={{ position: "relative" }}>
                <button
                  onClick={() =>
                    setShowVisibilityDropdown(!showVisibilityDropdown)
                  }
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid #e6e6e6",
                    borderRadius: 8,
                    backgroundColor: "#fff",
                    fontSize: 16,
                    color: "#222",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "border-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.target.style.borderColor = "#007476")}
                  onMouseLeave={(e) => (e.target.style.borderColor = "#e6e6e6")}
                >
                  {visibility}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M3 4.5L6 7.5L9 4.5"
                      stroke="#666"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {showVisibilityDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      backgroundColor: "#fff",
                      border: "1px solid #e6e6e6",
                      borderRadius: 8,
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      zIndex: 1000,
                      marginTop: "4px",
                    }}
                  >
                    {visibilityOptions.map((option) => (
                      <div
                        key={option}
                        onClick={() => handleVisibilityChange(option)}
                        style={{
                          padding: "12px 16px",
                          cursor: "pointer",
                          borderBottom: "1px solid #f0f0f0",
                          transition: "background-color 0.2s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.backgroundColor = "#f8f9fa")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor = "#fff")
                        }
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 18, color: "#222" }}>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  color: "#222",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Project preference
                <BsQuestionCircle
                  size={16}
                  color="#666"
                  style={{ marginLeft: 8, cursor: "pointer" }}
                  title="Choose your preferred project types"
                />
              </div>
              <div style={{ position: "relative" }}>
                <button
                  onClick={() =>
                    setShowProjectPreferenceDropdown(
                      !showProjectPreferenceDropdown
                    )
                  }
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid #e6e6e6",
                    borderRadius: 8,
                    backgroundColor: "#fff",
                    fontSize: 16,
                    color:
                      projectPreference === "Project preference"
                        ? "#6b6b6b"
                        : "#222",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "border-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.target.style.borderColor = "#007476")}
                  onMouseLeave={(e) => (e.target.style.borderColor = "#e6e6e6")}
                >
                  {projectPreference}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M3 4.5L6 7.5L9 4.5"
                      stroke="#666"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {showProjectPreferenceDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      backgroundColor: "#fff",
                      border: "1px solid #e6e6e6",
                      borderRadius: 8,
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      zIndex: 1000,
                      marginTop: "4px",
                    }}
                  >
                    {projectPreferenceOptions.map((option) => (
                      <div
                        key={option}
                        onClick={() => handleProjectPreferenceChange(option)}
                        style={{
                          padding: "12px 16px",
                          cursor: "pointer",
                          borderBottom: "1px solid #f0f0f0",
                          transition: "background-color 0.2s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.backgroundColor = "#f8f9fa")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor = "#fff")
                        }
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Experience Level Card */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e6e6e6",
              borderRadius: 12,
              padding: 36,
              marginBottom: 32,
              width: "100%",
              boxShadow: "0 1px 8px 0 rgba(60,72,100,0.04)",
              position: "relative",
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: 26,
                marginBottom: 24,
                color: "#111",
              }}
            >
              Experience level
            </div>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[
                {
                  level: "Entry level",
                  description: "I am relatively new to this field",
                },
                {
                  level: "Intermediate",
                  description: "I have substantial experience in this field",
                },
                {
                  level: "Expert",
                  description:
                    "I have comprehensive and deep expertise in this field",
                },
              ].map((option) => (
                <div
                  key={option.level}
                  onClick={() => setExperienceLevel(option.level)}
                  style={{
                    flex: 1,
                    minWidth: 200,
                    padding: "20px",
                    border:
                      experienceLevel === option.level
                        ? "2px solid #000"
                        : "1px solid #e6e6e6",
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    backgroundColor: "#fff",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    if (experienceLevel !== option.level) {
                      e.currentTarget.style.borderColor = "#007476";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (experienceLevel !== option.level) {
                      e.currentTarget.style.borderColor = "#e6e6e6";
                    }
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        border: "2px solid #e6e6e6",
                        marginRight: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {experienceLevel === option.level && (
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor: "#007476",
                          }}
                        />
                      )}
                    </div>
                    <div
                      style={{ fontWeight: 600, fontSize: 17, color: "#222" }}
                    >
                      {option.level}
                    </div>
                  </div>
                  <div
                    style={{ fontSize: 15, color: "#6b6b6b", marginLeft: 28 }}
                  >
                    {option.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Categories Card */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e6e6e6",
              borderRadius: 12,
              padding: 36,
              marginBottom: 20,
              width: "100%",
              boxShadow: "0 1px 8px 0 rgba(60,72,100,0.04)",
              position: "relative",
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: 26,
                marginBottom: 24,
                color: "#111",
              }}
            >
              Categories
            </div>

            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#222",
                  marginBottom: 12,
                }}
              >
                Web, Mobile & Software Dev
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(0, 118, 116, 0.1) 0%, rgba(0, 118, 116, 0.05) 100%)",
                    color: "#007674",
                    border: "1px solid rgba(0, 118, 116, 0.2)",
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
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow =
                      "0 4px 12px rgba(0, 118, 116, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background =
                      "linear-gradient(135deg, rgba(0, 118, 116, 0.1) 0%, rgba(0, 118, 116, 0.05) 100%)";
                    e.target.style.color = "#007674";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  Web Development
                </span>
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(0, 118, 116, 0.1) 0%, rgba(0, 118, 116, 0.05) 100%)",
                    color: "#007674",
                    border: "1px solid rgba(0, 118, 116, 0.2)",
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
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow =
                      "0 4px 12px rgba(0, 118, 116, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background =
                      "linear-gradient(135deg, rgba(0, 118, 116, 0.1) 0%, rgba(0, 118, 116, 0.05) 100%)";
                    e.target.style.color = "#007674";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  Ecommerce Development
                </span>
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#222",
                  marginBottom: 12,
                }}
              >
                Design & Creative
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(0, 118, 116, 0.1) 0%, rgba(0, 118, 116, 0.05) 100%)",
                    color: "#007674",
                    border: "1px solid rgba(0, 118, 116, 0.2)",
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
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow =
                      "0 4px 12px rgba(0, 118, 116, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background =
                      "linear-gradient(135deg, rgba(0, 118, 116, 0.1) 0%, rgba(0, 118, 116, 0.05) 100%)";
                    e.target.style.color = "#007674";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  Product Design
                </span>
              </div>
            </div>

            <button
              style={{
                position: "absolute",
                top: 28,
                right: 28,
                background: "#fff",
                border: "1px solid #e6e6e6",
                cursor: "pointer",
                padding: 6,
                width: 36,
                height: 36,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s",
                boxShadow: "0 1px 4px 0 rgba(60,72,100,0.04)",
              }}
              title="Edit"
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#e6f4ea")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
            >
              <svg width="18" height="18" fill="#007476" viewBox="0 0 24 24">
                <path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zm17.71-10.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
              </svg>
            </button>
          </div>

          {/* AI Preference Card */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e6e6e6",
              borderRadius: 12,
              padding: 36,
              marginBottom: 20,
              width: "100%",
              boxShadow: "0 1px 8px 0 rgba(60,72,100,0.04)",
              position: "relative",
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: 26,
                marginBottom: 24,
                color: "#111",
              }}
            >
              AI preference
            </div>

            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 16,
                  color: "#666",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>
                  Choose how your Worksyde data is used for AI training and
                  improvement.
                </span>
                <a
                  href="#"
                  style={{
                    color: "#007476",
                    textDecoration: "none",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Learn more
                </a>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 24,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M13.5 4.5L6 12L2.5 8.5"
                    stroke="#007476"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span style={{ fontSize: 16, color: "#222" }}>
                  Your data is being used to train our AI.
                </span>
              </div>

              <button
                style={{
                  background: "#fff",
                  border: "1px solid #007476",
                  borderRadius: 8,
                  padding: "12px 24px",
                  color: "#007476",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#007476";
                  e.target.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#fff";
                  e.target.style.color = "#007476";
                }}
              >
                Change preference
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Click outside to close dropdowns */}
      {(showVisibilityDropdown || showProjectPreferenceDropdown) && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onClick={() => {
            setShowVisibilityDropdown(false);
            setShowProjectPreferenceDropdown(false);
          }}
        />
      )}
    </div>
  );
};

export default FreelancersProfileSettings;
