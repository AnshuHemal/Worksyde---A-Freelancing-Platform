import React from "react";
import FreelancersSettingsSidebar from "./FreelancersSettingsSidebar";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import Header2 from "../../components/Header2";

const SIDEBAR_WIDTH = 290;

const FreelancersNotificationPage = () => {
  const { userId } = useUser();
  const navigate = useNavigate();

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
        navigate(`/ws/freelancers/${userId}`);
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
    <div style={{ 
      minHeight: "100vh", 
      background: "#f8f9fa",
      fontFamily: "Inter, Arial, sans-serif"
    }}>
      <Header2 />
      
      <div style={{ 
        display: "flex", 
        paddingTop: "80px" // Account for fixed header
      }}>
        <FreelancersSettingsSidebar
          activeKey="notifications"
          onNavigate={handleSidebarNavigate}
          freelancerId={userId}
        />
        
        <div style={{ 
          flex: 1, 
          marginLeft: SIDEBAR_WIDTH,
          minHeight: "calc(100vh - 80px)"
        }}>
          <div style={{ padding: "32px" }}>
            <h2 style={{ marginBottom: "24px", color: "#222", fontWeight: 600 }}>
              Notification Settings
            </h2>
            <div style={{ 
              background: "#fff", 
              padding: "24px", 
              borderRadius: "8px", 
              border: "1px solid #e6e6e6" 
            }}>
              <p style={{ color: "#666", fontSize: "16px" }}>
                Customize your notification preferences.
              </p>
              <p style={{ color: "#666", fontSize: "14px", marginTop: "16px" }}>
                Coming soon: Email notifications, push notifications, and message alerts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancersNotificationPage; 