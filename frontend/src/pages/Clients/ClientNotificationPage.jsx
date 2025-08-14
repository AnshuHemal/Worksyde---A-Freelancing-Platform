import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsBell, BsX } from "react-icons/bs";
import { FaInfo, FaRocket, FaUser } from "react-icons/fa";
import { motion } from "framer-motion";
import { useUser } from "../../contexts/UserContext";

const ClientNotificationPage = () => {
  const navigate = useNavigate();
  const { userId, userData } = useUser();
  const [activeTab, setActiveTab] = useState("activity");
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "proposal_received",
      icon: <FaInfo />,
      text: "You received a new proposal for",
      linkText: "Freelancing Website Development Project",
      linkUrl: "#",
      date: "Aug 8",
      isRead: false
    },
    {
      id: 2,
      type: "signin",
      icon: <FaInfo />,
      text: "A recent sign-in to your Worksyde account from an unknown device or browser.",
      date: "Aug 7",
      isRead: false
    }
  ]);

  const handleDismiss = (notificationId) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
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
                }}
              >
                Notifications
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
            <div style={{ 
              display: "flex", 
              borderBottom: "1px solid #e6e6e6",
              marginBottom: "24px"
            }}>
              <button
                onClick={() => handleTabChange("activity")}
                style={{
                  background: "none",
                  border: "none",
                  padding: "12px 24px",
                  fontSize: "18px",
                  fontWeight: activeTab === "activity" ? "600" : "400",
                  color: activeTab === "activity" ? "#222" : "#666",
                  borderBottom: activeTab === "activity" ? "2px solid #222" : "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                Your Activity & Job Alerts
              </button>
            </div>

            {/* Notifications List */}
            <div>
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "flex-start", 
                    gap: "16px",
                    padding: "20px 0",
                    position: "relative"
                  }}>
                    {/* Icon */}
                    <div style={{ 
                      flexShrink: 0,
                      width: "24px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#007476",
                      marginTop: "2px"
                    }}>
                      {notification.icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: "18px", 
                        color: "#222",
                        lineHeight: "1.5",
                        marginBottom: "4px"
                      }}>
                        {notification.text}
                        {notification.linkText && (
                          <span>
                            {" "}
                            <a 
                              href={notification.linkUrl}
                              style={{
                                color: "#007476",
                                textDecoration: "underline",
                                fontWeight: "500"
                              }}
                            >
                              {notification.linkText}
                            </a>
                            {" "}was received.
                          </span>
                        )}
                      </div>
                      <div style={{ 
                        fontSize: "17px", 
                        color: "#121212",
                        marginTop: "4px"
                      }}>
                        {notification.date}
                      </div>
                    </div>

                    {/* Dismiss Button */}
                    <button
                      onClick={() => handleDismiss(notification.id)}
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
                        transition: "background-color 0.2s ease"
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
                    <div style={{ 
                      height: "1px", 
                      backgroundColor: "#e6e6e6",
                      margin: "0"
                    }} />
                  )}
                </div>
              ))}
            </div>

            {/* Empty State */}
            {notifications.length === 0 && (
              <div style={{ 
                textAlign: "center", 
                padding: "60px 20px",
                color: "#666"
              }}>
                <BsBell size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
                <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "500" }}>
                  No notifications
                </h3>
                <p style={{ margin: 0, fontSize: "18px" }}>
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