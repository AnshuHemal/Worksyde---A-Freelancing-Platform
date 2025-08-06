import React from "react";
import {
  BsPerson,
  BsCreditCard,
  BsEnvelope,
  BsGear,
  BsShieldLock,
  BsBell,
} from "react-icons/bs";
import { useNavigate } from "react-router-dom";

const SIDEBAR_WIDTH = 290;

const sidebarSections = [
  {
    header: "Payment Methods",
    items: [
      {
        label: "Billing & Payments",
        key: "billing",
        icon: <BsCreditCard size={20} />,
      },
    ],
  },
  {
    header: "User Settings",
    items: [
      { label: "My Info", key: "info", icon: <BsPerson size={22} /> },
      {
        label: "Password & Security",
        key: "security",
        icon: <BsShieldLock size={20} />,
      },
      {
        label: "Notification Settings",
        key: "notifications",
        icon: <BsBell size={20} />,
      },
    ],
  },
];

const ClientSettingsSidebar = ({
  activeKey,
  onNavigate,
  clientId,
}) => {
  const navigate = useNavigate();
  // Use the provided clientId or a placeholder
  const profileUrl = `/ws/client-info/${clientId || "~currentUserId"}`;

  const handleClick = (item) => {
    if (item.key === "profile") {
      if (clientId) {
        navigate(`/ws/client/${clientId}`);
      }
      // else: do nothing
    } else if (onNavigate) {
      onNavigate(item.key);
    }
  };

  return (
    <aside className="section-container"
      style={{
        width: SIDEBAR_WIDTH,
        background: "#fff",
        borderRight: "1px solid #e6e6e6",
        padding: "0 0 0 0",
        minHeight: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 10,
        fontFamily: "Inter, Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
      }}
    >
      <div style={{ paddingTop: 48 }}>
        {sidebarSections.map((section) => (
          <div key={section.header} style={{ marginBottom: 32 }}>
            {section.header && (
              <div
                style={{
                  color: "#222",
                  fontWeight: 600,
                  fontSize: 18,
                  paddingLeft: 40,
                  marginBottom: 8,
                }}
              >
                {section.header}
              </div>
            )}
            {section.items.map((item) => {
              const isActive = item.key === activeKey;
              return (
                <div
                  key={item.key}
                  onClick={() => handleClick(item)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor:
                      item.key === "profile" && !clientId
                        ? "not-allowed"
                        : "pointer",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "#007476" : "#444",
                    background: isActive ? "#ffffff" : "none",
                    fontSize: 16,
                    padding: "10px 0 10px 40px",
                    marginBottom: 2,
                    position: "relative",
                    borderLeft: isActive
                      ? "4px solid #007476"
                      : "4px solid transparent",
                    borderRadius: "2px",
                    transition: "background 0.2s, color 0.2s, border 0.2s",
                    gap: 14,
                    opacity: item.key === "profile" && !clientId ? 0.5 : 1,
                  }}
                  onMouseOver={(e) => {
                    if (!isActive && (item.key !== "profile" || clientId)) {
                      e.currentTarget.style.background = "#f7fafd";
                      e.currentTarget.style.color = "#007476";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isActive && (item.key !== "profile" || clientId)) {
                      e.currentTarget.style.background = "none";
                      e.currentTarget.style.color = "#444";
                    }
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default ClientSettingsSidebar; 