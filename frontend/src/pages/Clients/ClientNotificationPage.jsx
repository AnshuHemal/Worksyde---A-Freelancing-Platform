import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BsBell, BsX, BsExclamationTriangle } from "react-icons/bs";
import { FaInfo, FaRocket, FaUser, FaTimesCircle, FaCheck } from "react-icons/fa";
import { motion } from "framer-motion";
import { useUser } from "../../contexts/UserContext";
import axios from "axios";

const ClientNotificationPage = () => {
  const navigate = useNavigate();
  const { userId, userData } = useUser();
  const [activeTab, setActiveTab] = useState("activity");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = "http://localhost:5000/api/auth";

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) {
        console.log("No userId available, skipping notification fetch");
        return;
      }

      console.log("Fetching notifications for userId:", userId);
      console.log("API URL:", `${API_URL}/notifications/`);

      // First, test if the backend is reachable
      try {
        const testResponse = await axios.get(`${API_URL}/current-user/`, {
          withCredentials: true,
        });
        console.log("Backend connection test successful:", testResponse.data);
      } catch (testError) {
        console.error("Backend connection test failed:", testError);
        setError(
          "Cannot connect to backend server. Please check if the server is running."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/notifications/`, {
          withCredentials: true,
        });

        console.log("Notifications response:", response.data);

        if (response.data.success) {
          setNotifications(response.data.notifications);

          // Mark unread notifications as read when viewed
          const unreadNotifications = response.data.notifications.filter(
            (n) => !n.isRead
          );
          if (unreadNotifications.length > 0) {
            try {
              await axios.put(
                `${API_URL}/notifications/mark-all-read/`,
                {},
                { withCredentials: true }
              );

              // Update local state to mark all as read
              setNotifications((prev) =>
                prev.map((notification) => ({ ...notification, isRead: true }))
              );
            } catch (error) {
              console.error("Error marking notifications as read:", error);
            }
          }
        } else {
          setError("Failed to fetch notifications");
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        console.error("Error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
        });

        // If it's a 404, the endpoint might not exist yet
        if (error.response?.status === 404) {
          setError(
            "Notification endpoints not found. Backend may need to be updated."
          );
        } else {
          setError(
            `Error loading notifications: ${error.response?.status} ${error.response?.statusText}`
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userId]);

  // Format date for display
  const formatNotificationDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    if (diffInMinutes < 2880) return "Yesterday";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "job_offer_declined":
        return <FaTimesCircle style={{ color: "#dc2626" }} />;
      case "job_offer_accepted":
        return <FaCheck style={{ color: "#16a34a" }} />;
      case "proposal_received":
        return <FaInfo style={{ color: "#007674" }} />;
      case "proposal_accepted":
        return <FaRocket style={{ color: "#059669" }} />;
      case "proposal_declined":
        return <BsExclamationTriangle style={{ color: "#f59e0b" }} />;
      case "payment_received":
        return <FaUser style={{ color: "#059669" }} />;
      default:
        return <FaInfo style={{ color: "#6b7280" }} />;
    }
  };

  // Get notification display text based on type
  const getNotificationText = (notification) => {
    switch (notification.notificationType) {
      case "job_offer_declined":
        const freelancerName =
          notification.additionalData?.freelancerName ||
          notification.senderName ||
          "The freelancer";
        return {
          text: `${freelancerName} has declined your job offer for "${
            notification.additionalData?.jobTitle || "the project"
          }"`,
          details: notification.additionalData?.declineReason
            ? `Reason: ${notification.additionalData.declineReason}`
            : null,
          message: notification.additionalData?.declineMessage || null,
        };
      case "proposal_received":
        return {
          text: "You received a new proposal for",
          linkText: notification.additionalData?.jobTitle || "a project",
          linkUrl: `/client/jobs/${notification.jobId || "#"}`,
        };
      case "proposal_accepted":
        return {
          text: "Your proposal was accepted for",
          linkText: notification.additionalData?.jobTitle || "a project",
          linkUrl: `/client/jobs/${notification.jobId || "#"}`,
        };
      case "proposal_declined":
        return {
          text: "Your proposal was declined for",
          linkText: notification.additionalData?.jobTitle || "a project",
          linkUrl: `/client/jobs/${notification.jobId || "#"}`,
        };
      case "job_offer_accepted":
        return {
          text: `${notification.additionalData?.freelancerName || "A freelancer"} has accepted your job offer for`,
          linkText: notification.additionalData?.jobTitle || "a project",
          linkUrl: `/client/jobs/${notification.jobId || "#"}`,
          details: `Expected Start: ${notification.additionalData?.expectedStartDate ? new Date(notification.additionalData.expectedStartDate).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }) : 'Not specified'} | Estimated Completion: ${notification.additionalData?.estimatedCompletionDate ? new Date(notification.additionalData.estimatedCompletionDate).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }) : 'Not specified'}`,
          message: `Project Amount: ${notification.additionalData?.projectAmount || 'Not specified'}`
        };
      default:
        return {
          text: notification.message || "You have a new notification",
        };
    }
  };

  const handleDismiss = async (notificationId) => {
    try {
      // Call API to delete notification from database
      await axios.delete(
        `${API_URL}/notifications/${notificationId}/delete/`,
        { withCredentials: true }
      );

      // Remove from local state
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );
      
      // Dispatch custom event to update header notification count
      document.dispatchEvent(new CustomEvent('notification-deleted'));
    } catch (error) {
      console.error("Error deleting notification:", error);
      // Still remove from local state even if API call fails
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );
      
      // Dispatch custom event to update header notification count
      document.dispatchEvent(new CustomEvent('notification-deleted'));
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div
        className="section-container"
        style={{
          background: "#fff",
          padding: 0,
          minHeight: "100vh",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "40px 50px",
            background: "#fff",
          }}
        >
          {/* Left: Icon and Title */}
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0, 118, 116, 0.2)",
              }}
            >
              <BsBell size={32} color="#fff" />
            </div>

            <div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  marginBottom: "6px",
                  color: "#1a1a1a",
                  letterSpacing: "-0.5px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                Notifications
                {notifications.filter((n) => !n.isRead).length > 0 && (
                  <span
                    style={{
                      background: "#dc2626",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: "600",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      minWidth: "20px",
                      textAlign: "center",
                    }}
                  >
                    {notifications.filter((n) => !n.isRead).length}
                  </span>
                )}
              </div>
              <div
                style={{
                  color: "#121212",
                  fontSize: "18px",
                  fontWeight: "500",
                }}
              >
                Stay updated with your latest activities
              </div>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "12px",
            }}
          >
            {/* Primary Buttons */}
            <div style={{ display: "flex", gap: "12px" }}>
              <motion.button
                onClick={async () => {
                  try {
                    // Mark all notifications as read
                    await axios.put(
                      `${API_URL}/notifications/mark-all-read/`,
                      {},
                      { withCredentials: true }
                    );

                    // Update local state
                    setNotifications((prev) =>
                      prev.map((notification) => ({
                        ...notification,
                        isRead: true,
                      }))
                    );
                    
                    // Dispatch custom event to update header notification count
                    document.dispatchEvent(new CustomEvent('all-notifications-read'));
                  } catch (error) {
                    console.error(
                      "Error marking all notifications as read:",
                      error
                    );
                  }
                }}
                style={{
                  border: "2px solid #007674",
                  background: "#fff",
                  color: "#007674",
                  fontWeight: "600",
                  fontSize: "18px",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  minWidth: "140px",
                }}
                whileHover={{
                  scale: 1.02,
                  background: "#f8f9fa",
                }}
                whileTap={{ scale: 0.98 }}
              >
                Mark all read
              </motion.button>
              <motion.button
                onClick={() => navigate("/client/settings/notifications")}
                style={{
                  background: "#007674",
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: "18px",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  cursor: "pointer",
                  border: "none",
                  transition: "all 0.2s ease",
                  minWidth: "140px",
                  boxShadow: "0 2px 8px rgba(0, 118, 116, 0.2)",
                }}
                whileHover={{
                  scale: 1.02,
                  background: "#005a58",
                  boxShadow: "0 4px 12px rgba(0, 118, 116, 0.3)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                Settings
              </motion.button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            margin: "0px 20px 20px 20px",
            marginBottom: "10px",
            minHeight: 400,
          }}
        >
          {/* Main Content */}
          <div
            style={{
              border: "1px solid #e6e6e6",
              padding: "32px",
              background: "#fff",
              borderRadius: "10px",
              minHeight: 400,
              width: "100%",
            }}
          >
            {/* Tabs */}
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid #e6e6e6",
                marginBottom: "24px",
              }}
            >
              <button
                onClick={() => handleTabChange("activity")}
                style={{
                  background: "none",
                  border: "none",
                  padding: "12px 24px",
                  fontSize: "18px",
                  fontWeight: activeTab === "activity" ? "600" : "400",
                  color: activeTab === "activity" ? "#222" : "#666",
                  borderBottom:
                    activeTab === "activity" ? "2px solid #222" : "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Your Activity & Job Alerts
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  color: "#666",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    border: "4px solid #f3f3f3",
                    borderTop: "4px solid #007674",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 16px auto",
                  }}
                />
                <p style={{ margin: 0, fontSize: "18px" }}>
                  Loading notifications...
                </p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  color: "#dc2626",
                }}
              >
                <BsExclamationTriangle
                  size={48}
                  style={{ marginBottom: "16px", opacity: 0.7 }}
                />
                <h3
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "18px",
                    fontWeight: "500",
                  }}
                >
                  Error loading notifications
                </h3>
                <p style={{ margin: 0, fontSize: "16px" }}>{error}</p>
              </div>
            )}

            {/* Notifications List */}
            {!loading && !error && (
              <div>
                {notifications.map((notification, index) => {
                  const notificationText = getNotificationText(notification);
                  const notificationIcon = getNotificationIcon(
                    notification.notificationType
                  );

                  return (
                    <div key={notification.id}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "16px",
                          padding: "20px 0",
                          position: "relative",
                          opacity: 1,
                        }}
                      >
                        {/* Icon */}
                        <div
                          style={{
                            flexShrink: 0,
                            width: "24px",
                            height: "24px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: "2px",
                          }}
                        >
                          {notificationIcon}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: "18px",
                              color: "#121212",
                              lineHeight: "1.5",
                              marginBottom: "8px",
                            }}
                          >
                            {notificationText.text}
                            {notificationText.linkText && (
                              <span>
                                {" "}
                                <a
                                  href={notificationText.linkUrl}
                                  style={{
                                    color: "#007476",
                                    textDecoration: "underline",
                                    fontWeight: "500",
                                  }}
                                >
                                  {notificationText.linkText}
                                </a>
                              </span>
                            )}
                          </div>

                          {/* Additional details for declined offers */}
                          {notificationText.details && (
                            <div
                              style={{
                                fontSize: "16px",
                                color: "#121212",
                                marginBottom: "6px",
                                fontStyle: "italic",
                              }}
                            >
                              {notificationText.details}
                            </div>
                          )}

                          {/* Optional message for declined offers */}
                          {notificationText.message && (
                            <div
                              style={{
                                fontSize: "16px",
                                color: "#121212",
                                marginBottom: "6px",
                                padding: "8px 12px",
                                background: "#fff",
                                borderRadius: "6px",
                                border: "1px solid #e9ecef",
                              }}
                            >
                              "{notificationText.message}"
                            </div>
                          )}

                          <div
                            style={{
                              fontSize: "16px",
                              color: "#121212",
                              marginTop: "4px",
                            }}
                          >
                            {formatNotificationDate(notification.createdAt)}
                          </div>
                        </div>

                        {/* Dismiss Button */}
                        <button
                          onClick={() => handleDismiss(notification.id)}
                          title="Delete notification permanently"
                          style={{
                            background: "none",
                            border: "none",
                            color: "#007476",
                            cursor: "pointer",
                            padding: "4px",
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background-color 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#f0f0f0";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                          }}
                        >
                          <BsX size={24} />
                        </button>
                      </div>

                      {/* Separator */}
                      {index < notifications.length - 1 && (
                        <div
                          style={{
                            height: "1px",
                            backgroundColor: "#e6e6e6",
                            margin: "0",
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && notifications.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  paddingBottom: "0px",
                  color: "#666",
                }}
              >
                <h2
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "24px",
                    fontWeight: "600",
                    letterSpacing: "0.3px",
                  }}
                >
                  No notifications
                </h2>
                <p style={{ margin: 0, fontSize: "18px", color: "#121212" }}>
                  You're all caught up! Check back later for new updates.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientNotificationPage;
