import React from "react";
import ClientSettingsSidebar from "./ClientSettingsSidebar";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import ClientHeader from "../../components/ClientHeader";

const SIDEBAR_WIDTH = 290;

const ClientBillingPage = () => {
  const { userId } = useUser();
  const navigate = useNavigate();

  // Navigation handler for sidebar
  const handleSidebarNavigate = (key) => {
    switch (key) {
      case "billing":
        navigate("/ws/client/billing");
        break;
      case "info":
        navigate("/ws/client/info");
        break;
      case "security":
        navigate("/ws/client/security");
        break;
      case "notifications":
        navigate("/ws/client/notifications");
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
      <ClientHeader />
      
      <div style={{ 
        display: "flex", 
        paddingTop: "80px" // Account for fixed header
      }}>
        <ClientSettingsSidebar
          activeKey="billing"
          onNavigate={handleSidebarNavigate}
          clientId={userId}
        />
        
        <div style={{ 
          flex: 1, 
          marginLeft: SIDEBAR_WIDTH,
          minHeight: "calc(100vh - 80px)"
        }}>
          <div style={{ padding: "32px" }}>
            <h2 style={{ marginBottom: "24px", color: "#222", fontWeight: 600 }}>
              Billing & Payments
            </h2>
            <div style={{ 
              background: "#fff", 
              padding: "24px", 
              borderRadius: "8px", 
              border: "1px solid #e6e6e6" 
            }}>
              <p style={{ color: "#666", fontSize: "16px" }}>
                Manage your billing methods and payment preferences.
              </p>
              <p style={{ color: "#666", fontSize: "14px", marginTop: "16px" }}>
                Coming soon: Payment methods, billing history, and subscription management.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientBillingPage; 