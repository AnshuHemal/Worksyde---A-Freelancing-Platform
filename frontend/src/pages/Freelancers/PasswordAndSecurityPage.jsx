import React, { useState } from "react";
import FreelancersSettingsSidebar from "./FreelancersSettingsSidebar";
import { useNavigate } from "react-router-dom";
import { BsEye, BsEyeSlash } from "react-icons/bs";

const SIDEBAR_WIDTH = 290;

const PasswordAndSecurityPage = () => {
  const navigate = useNavigate();
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        activeKey="security"
        onNavigate={handleSidebarNavigate}
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
            Password and security
          </div>

          {/* Login Section */}
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
              Login
            </div>

            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: "#222",
                  marginBottom: 8,
                }}
              >
                Worksyde password
              </div>
              <div
                style={{
                  fontSize: 17,
                  color: "#222",
                  marginBottom: 12,
                }}
              >
                You've set an Worksyde password.
              </div>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowChangePasswordModal(true);
                }}
                style={{
                  color: "#007476",
                  textDecoration: "underline",
                  fontSize: 16,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Change password
              </a>
            </div>

            {/* Divider */}
            <div
              style={{
                height: "1px",
                backgroundColor: "#e6e6e6",
                marginBottom: 24,
              }}
            />

            {/* Google Login Section */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 24,
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 600,
                    color: "#222",
                    marginBottom: 8,
                  }}
                >
                  Log in with Google
                </div>
                <div
                  style={{
                    fontSize: 16,
                    color: "#666",
                  }}
                >
                  Not connected. You can choose to log in with Google.
                </div>
              </div>
              <button
                style={{
                  background: "#fff",
                  border: "1px solid #007476",
                  borderRadius: 8,
                  padding: "8px 16px",
                  color: "#007476",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
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
                Connect
              </button>
            </div>

            {/* Divider */}
            <div
              style={{
                height: "1px",
                backgroundColor: "#e6e6e6",
                marginBottom: 24,
              }}
            />

            {/* Apple Login Section */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 600,
                    color: "#222",
                    marginBottom: 8,
                  }}
                >
                  Log in with Apple
                </div>
                <div
                  style={{
                    fontSize: 16,
                    color: "#666",
                  }}
                >
                  Not connected. You can choose to log in with Apple.
                </div>
              </div>
              <button
                style={{
                  background: "#fff",
                  border: "1px solid #007476",
                  borderRadius: 8,
                  padding: "8px 16px",
                  color: "#007476",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
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
                Connect
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div
          className="section-container"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowChangePasswordModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 32,
              width: "90%",
              maxWidth: 480,
              position: "relative",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowChangePasswordModal(false)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "none",
                border: "none",
                fontSize: 24,
                cursor: "pointer",
                color: "#666",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>

            {/* Modal Title */}
            <div
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: "#222",
                marginBottom: 12,
                paddingRight: 40,
              }}
            >
              Change your password
            </div>

            {/* Informational Text */}
            <div
              style={{
                fontSize: 16,
                color: "#666",
                marginBottom: 24,
              }}
            >
              You'll need to log in again after changing your password.
            </div>

            {/* Current Password */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 16,
                  fontWeight: 500,
                  color: "#222",
                  marginBottom: 8,
                }}
              >
                Current password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "1px solid #e6e6e6",
                  borderRadius: 8,
                  fontSize: 16,
                  outline: "none",
                }}
                placeholder="Enter current password"
              />
            </div>

            {/* New Password */}
            <div style={{ marginBottom: 8 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 16,
                  fontWeight: 500,
                  color: "#222",
                  marginBottom: 8,
                }}
              >
                New Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    paddingRight: "48px",
                    border: "1px solid #e6e6e6",
                    borderRadius: 8,
                    fontSize: 16,
                    outline: "none",
                  }}
                  placeholder="Enter new password"
                />
                <button
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#666",
                  }}
                >
                  {showNewPassword ? (
                    <BsEyeSlash size={20} />
                  ) : (
                    <BsEye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirement */}
            <div
              style={{
                fontSize: 14,
                color: "#666",
                marginBottom: 20,
              }}
            >
              Must be at least 8 characters long, including 1 number & 1 symbol.
            </div>

            {/* Re-enter New Password */}
            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 16,
                  fontWeight: 500,
                  color: "#222",
                  marginBottom: 8,
                }}
              >
                Re-enter new password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    paddingRight: "48px",
                    border: "1px solid #e6e6e6",
                    borderRadius: 8,
                    fontSize: 16,
                    outline: "none",
                  }}
                  placeholder="Re-enter new password"
                />
                <button
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#666",
                  }}
                >
                  {showConfirmPassword ? (
                    <BsEyeSlash size={20} />
                  ) : (
                    <BsEye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}
            >
              <button
                onClick={() => setShowChangePasswordModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#666",
                  fontSize: 16,
                  fontWeight: 500,
                  cursor: "pointer",
                  padding: "12px 24px",
                }}
              >
                Cancel
              </button>
              <button
                style={{
                  background: "#e6e6e6",
                  border: "none",
                  color: "#666",
                  fontSize: 16,
                  fontWeight: 500,
                  padding: "12px 24px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
                disabled={!currentPassword || !newPassword || !confirmPassword}
              >
                Confirm and log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordAndSecurityPage;
