import React, { useState } from "react";
import ClientSettingsSidebar from "./ClientSettingsSidebar";
import { useNavigate } from "react-router-dom";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { motion } from "framer-motion";
import axios from "axios";
import { useUser } from "../../contexts/UserContext";

const SIDEBAR_WIDTH = 290;

const ClientPasswordAndSecurityPage = () => {
  const navigate = useNavigate();
  const { userId, userData, loading: userLoading, error: userError } = useUser();
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Show loading state while user data is being fetched
  if (userLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "#fff",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #007476",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <div style={{ fontSize: 18, color: "#666" }}>Loading...</div>
        </div>
      </div>
    );
  }

  // Show error state if user data failed to load
  if (userError) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "#fff",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "400px", padding: "20px" }}>
          <div style={{ fontSize: 18, color: "#e74c3c", textAlign: "center", maxWidth: "100%" }}>
            {userError}
            <br />
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: "16px",
                padding: "8px 16px",
                background: "#007476",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Navigation handler for sidebar
  const handleSidebarNavigate = (key) => {
    switch (key) {
      case "billing":
        navigate("/ws/client-info/deposit-method");
        break;
      case "my-info":
        navigate("/ws/client-info/my-info");
        break;
      case "security":
        navigate("/ws/client-info/security");
        break;
      case "notifications":
        navigate("/ws/client-info/notifications");
        break;
      default:
        break;
    }
  };

  // Handle change password
  const handleChangePassword = async () => {
    // Reset states
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // Validate form
      if (!currentPassword || !newPassword || !confirmPassword) {
        setError("All fields are required.");
        setIsLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("New password and confirm password do not match.");
        setIsLoading(false);
        return;
      }

      if (newPassword.length < 8) {
        setError("Password must be at least 8 characters long.");
        setIsLoading(false);
        return;
      }

      // Call API
      const response = await axios.post(
        "http://localhost:5000/api/auth/change-password/",
        {
          currentPassword,
          newPassword,
          confirmPassword,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setSuccess("Password changed successfully! You will be logged out.");
        
        // Clear form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        
        // Close modal after a delay
        setTimeout(() => {
          setShowChangePasswordModal(false);
          setSuccess("");
          // Redirect to login page
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.message || "An error occurred while changing password.");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowChangePasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
  };

  return (
    <div
      style={{ display: "flex", minHeight: "100vh", background: "#fff" }}
    >
      {/* Main Content */}
      <main
        style={{
          flex: 1,
          background: "#fff",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div style={{ width: "100%", padding: "36px 20px 0 20px", minWidth: 320 }}>
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              marginBottom: 32,
              marginLeft: 20,
              marginRight: 20,
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
              marginLeft: 20,
              marginRight: 20,
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
                  fontSize: 18,
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
                    fontSize: 18,
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
                  fontSize: 16,
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
                    fontSize: 18,
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
                  fontSize: 16,
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
          onClick={handleCloseModal}
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
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#1a1a1a",
                }}
              >
                Change your password
              </h3>
              <motion.button
                onClick={handleCloseModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  color: "#666",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
                whileHover={{
                  color: "#1a1a1a",
                  background: "#f8f9fa",
                }}
                whileTap={{ scale: 0.95 }}
              >
                ×
              </motion.button>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #fecaca",
                  color: "#dc2626",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  fontSize: "16px",
                }}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #007476",
                  color: "#16a34a",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  fontSize: "16px",
                }}
              >
                {success}
              </div>
            )}

            {/* Modal Body */}
            <div style={{ marginBottom: "24px" }}>
              <p
                style={{
                  margin: "0 0 16px 0",
                  fontSize: "16px",
                  color: "#666",
                  lineHeight: "1.5",
                }}
              >
                You'll need to log in again after changing your password.
              </p>

              {/* Current Password */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1a1a1a",
                    marginBottom: "8px",
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
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "18px",
                    outline: "none",
                    transition: "border-color 0.2s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#007674";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                  }}
                  placeholder="Enter current password"
                  disabled={isLoading}
                />
              </div>

              {/* New Password */}
              <div style={{ marginBottom: "8px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1a1a1a",
                    marginBottom: "8px",
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
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "18px",
                      outline: "none",
                      transition: "border-color 0.2s ease",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#007674";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db";
                    }}
                    placeholder="Enter new password"
                    disabled={isLoading}
                  />
                  <motion.button
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
                      padding: "4px",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                      width: "32px",
                      height: "32px",
                    }}
                    whileHover={{
                      color: "#1a1a1a",
                      background: "#f8f9fa",
                    }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isLoading}
                  >
                    {showNewPassword ? (
                      <BsEyeSlash size={20} />
                    ) : (
                      <BsEye size={20} />
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Password Requirement */}
              <div
                style={{
                  fontSize: "16px",
                  color: "#666",
                  marginBottom: "20px",
                }}
              >
                Must be at least 8 characters long, including 1 number & 1 symbol.
              </div>

              {/* Re-enter New Password */}
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1a1a1a",
                    marginBottom: "8px",
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
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "18px",
                      outline: "none",
                      transition: "border-color 0.2s ease",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#007674";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db";
                    }}
                    placeholder="Re-enter new password"
                    disabled={isLoading}
                  />
                  <motion.button
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
                      padding: "4px",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                      width: "32px",
                      height: "32px",
                    }}
                    whileHover={{
                      color: "#1a1a1a",
                      background: "#f8f9fa",
                    }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <BsEyeSlash size={20} />
                    ) : (
                      <BsEye size={20} />
                    )}
                  </motion.button>
                </div>
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
                onClick={handleCloseModal}
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
                disabled={isLoading}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleChangePassword}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  background: isLoading ? "#ccc" : "#007674",
                  color: "#fff",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  borderRadius: "6px",
                  transition: "all 0.2s ease",
                }}
                whileHover={!isLoading ? {
                  background: "#005a58",
                } : {}}
                whileTap={!isLoading ? { scale: 0.95 } : {}}
                disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
              >
                {isLoading ? "Changing..." : "Confirm and log out"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ClientPasswordAndSecurityPage; 