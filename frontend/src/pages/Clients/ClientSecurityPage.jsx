import React from "react";
import ClientSettingsSidebar from "./ClientSettingsSidebar";
import ClientPasswordAndSecurityPage from "./ClientPasswordAndSecurityPage";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import ClientHeader from "../../components/ClientHeader";

const SIDEBAR_WIDTH = 290;

const ClientSecurityPage = () => {
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
        paddingTop: "80px"
      }}>
        <ClientSettingsSidebar
          activeKey="security"
          onNavigate={handleSidebarNavigate}
          clientId={userId}
        />
        
        <div style={{ 
          flex: 1, 
          marginLeft: SIDEBAR_WIDTH,
          minHeight: "calc(100vh - 80px)"
        }}>
          <ClientPasswordAndSecurityPage />
        </div>
      </div>
    </div>
  );
};

export default ClientSecurityPage; 