import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FreelancersSettingsSidebar from "./FreelancersSettingsSidebar";

const SIDEBAR_WIDTH = 290;

const FreelancersContactInfo = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/auth/current-user/", { withCredentials: true })
      .then(res => setUserId(res.data.user._id))
      .catch(() => setUserId(null));
  }, []);

  // Dummy user data for illustration
  const user = {
    id: "59a0052a",
    name: "White Turtle",
    email: "w******e1@outlook.com",
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
        navigate("/ws/freelancers/profile");
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
        activeKey="contact"
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
            Contact info
          </div>
          {/* Account Card */}
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
              Account
            </div>
            <div style={{ marginBottom: 10, color: "#222" }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#222" }}>
                User ID
              </div>
              <div style={{ fontSize: 16 }}>{user.id}</div>
            </div>
            <div style={{ marginBottom: 10, color: "#222" }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#222" }}>
                Name
              </div>
              <div style={{ fontSize: 16 }}>{user.name}</div>
            </div>
            <div style={{ marginBottom: 10, color: "#222" }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#222" }}>
                Email
              </div>
              <div style={{ fontSize: 16 }}>{user.email}</div>
            </div>
            <div style={{ marginTop: 18 }}>
              <span
                style={{
                  color: "#007476",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 16,
                }}
              >
                Close my account
              </span>
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
          {/* Location Card */}
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
              Location
            </div>
            <div style={{ marginBottom: 18, color: "#222" }}>
              <div style={{ fontSize: 16, fontWeight: 500, color: "#222" }}>
                Time Zone
              </div>
              <div style={{ fontSize: 16, color: "#6b6b6b" }}>
                UTC+05:30 Mumbai, Kolkata, Chennai, New Delhi
              </div>
            </div>
            <div style={{ marginBottom: 18, color: "#222" }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#222" }}>
                Address
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: "#6b6b6b",
                  whiteSpace: "pre-line",
                }}
              >
                Bapunagar
                <br />
                Ahmedabad , GJ
                <br />
                India
              </div>
            </div>
            <div style={{ color: "#222" }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#222" }}>
                Phone
              </div>
              <div style={{ fontSize: 16, color: "#007476" }}>
                +91 7990246779
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
        </div>
      </main>
    </div>
  );
};

export default FreelancersContactInfo;
