import React from "react";

const ResumePreview = ({ formData }) => {
  return (
    <div
      style={{
        flex: 1,
        background: "#e0f2fe",
        borderRadius: "16px",
        padding: "32px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        border: "1px solid #e5e7eb",
        position: "relative",
        fontFamily: "Urbanist, sans-serif",
      }}
    >
      {/* Profile Section */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "20px", marginBottom: "24px" }}>
        {/* Profile Picture */}
        <div
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: formData?.profileImage ? "transparent" : "#b3e5fc",
            border: "3px solid #ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {formData?.profileImage ? (
            <img
              src={formData.profileImage}
              alt="Profile"
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "#0288d1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "24px",
              }}
            >
              👤
            </div>
          )}
        </div>

        {/* Contact Icons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: "#0288d1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "12px",
              cursor: "pointer",
            }}
            title="LinkedIn"
          >
            🔗
          </div>
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: "#0288d1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "12px",
              cursor: "pointer",
            }}
            title="Email"
          >
            📧
          </div>
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: "#0288d1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "12px",
              cursor: "pointer",
            }}
            title="Phone"
          >
            📞
          </div>
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: "#0288d1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "12px",
              cursor: "pointer",
            }}
            title="Website"
          >
            📡
          </div>
        </div>

        {/* Resume Sections Navigation */}
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: "14px", fontWeight: "500", color: "#0277bd", marginBottom: "8px" }}>
            Resume Sections
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px" }}>
            <div 
              style={{ 
                color: formData?.summary ? "#0277bd" : "#374151", 
                textDecoration: formData?.summary ? "underline" : "none", 
                cursor: "pointer",
                fontWeight: formData?.summary ? "600" : "400"
              }}
            >
              Professional Summary
            </div>
            <div 
              style={{ 
                color: "#374151", 
                cursor: "pointer",
                fontWeight: "400"
              }}
            >
              Work Experience
            </div>
            <div 
              style={{ 
                color: "#374151", 
                cursor: "pointer",
                fontWeight: "400"
              }}
            >
              Projects
            </div>
            <div 
              style={{ 
                color: "#374151", 
                cursor: "pointer",
                fontWeight: "400"
              }}
            >
              Skills
            </div>
            <div 
              style={{ 
                color: "#374151", 
                cursor: "pointer",
                fontWeight: "400"
              }}
            >
              Certifications
            </div>
            <div 
              style={{ 
                color: "#374151", 
                cursor: "pointer",
                fontWeight: "400"
              }}
            >
              Education
            </div>
            <div 
              style={{ 
                color: "#374151", 
                cursor: "pointer",
                fontWeight: "400"
              }}
            >
              Languages
            </div>
          </div>
        </div>
      </div>

      {/* Resume Content Preview */}
      <div style={{ color: "#374151", fontSize: "14px", lineHeight: "1.6" }}>
        {/* Name and Title */}
        <div style={{ marginBottom: "16px" }}>
          <h3 style={{ 
            color: "#121212", 
            fontSize: "18px", 
            fontWeight: "600", 
            margin: "0 0 8px 0",
            fontFamily: "Urbanist, sans-serif"
          }}>
            {formData?.fullName || "Your Name"}
          </h3>
          <p style={{ 
            color: "#0277bd", 
            fontSize: "16px", 
            fontWeight: "500", 
            margin: "0 0 8px 0",
            fontFamily: "Urbanist, sans-serif"
          }}>
            {formData?.designation || "Your Designation"}
          </p>
        </div>

        {/* Professional Summary */}
        {formData?.summary && (
          <div style={{ marginBottom: "20px" }}>
            <h4 style={{ 
              color: "#121212", 
              fontSize: "14px", 
              fontWeight: "600", 
              margin: "0 0 8px 0",
              fontFamily: "Urbanist, sans-serif"
            }}>
              Professional Summary
            </h4>
            <p style={{ 
              color: "#6b7280", 
              fontSize: "13px", 
              margin: 0,
              lineHeight: "1.5",
              fontFamily: "Urbanist, sans-serif"
            }}>
              {formData.summary}
            </p>
          </div>
        )}

        {/* Work Experience Placeholder */}
        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ 
            color: "#121212", 
            fontSize: "14px", 
            fontWeight: "600", 
            margin: "0 0 8px 0",
            fontFamily: "Urbanist, sans-serif"
          }}>
            Work Experience
          </h4>
          <div style={{ 
            color: "#6b7280", 
            fontSize: "13px",
            fontStyle: "italic",
            fontFamily: "Urbanist, sans-serif"
          }}>
            Work experience details will appear here...
          </div>
        </div>

        {/* Education Placeholder */}
        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ 
            color: "#121212", 
            fontSize: "14px", 
            fontWeight: "600", 
            margin: "0 0 8px 0",
            fontFamily: "Urbanist, sans-serif"
          }}>
            Education
          </h4>
          <div style={{ 
            color: "#6b7280", 
            fontSize: "13px",
            fontStyle: "italic",
            fontFamily: "Urbanist, sans-serif"
          }}>
            Education details will appear here...
          </div>
        </div>

        {/* Skills Placeholder */}
        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ 
            color: "#121212", 
            fontSize: "14px", 
            fontWeight: "600", 
            margin: "0 0 8px 0",
            fontFamily: "Urbanist, sans-serif"
          }}>
            Skills
          </h4>
          <div style={{ 
            color: "#6b7280", 
            fontSize: "13px",
            fontStyle: "italic",
            fontFamily: "Urbanist, sans-serif"
          }}>
            Skills will appear here...
          </div>
        </div>

        {/* Projects Placeholder */}
        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ 
            color: "#121212", 
            fontSize: "14px", 
            fontWeight: "600", 
            margin: "0 0 8px 0",
            fontFamily: "Urbanist, sans-serif"
          }}>
            Projects
          </h4>
          <div style={{ 
            color: "#6b7280", 
            fontSize: "13px",
            fontStyle: "italic",
            fontFamily: "Urbanist, sans-serif"
          }}>
            Project details will appear here...
          </div>
        </div>

        {/* Certifications Placeholder */}
        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ 
            color: "#121212", 
            fontSize: "14px", 
            fontWeight: "600", 
            margin: "0 0 8px 0",
            fontFamily: "Urbanist, sans-serif"
          }}>
            Certifications
          </h4>
          <div style={{ 
            color: "#6b7280", 
            fontSize: "13px",
            fontStyle: "italic",
            fontFamily: "Urbanist, sans-serif"
          }}>
            Certifications will appear here...
          </div>
        </div>

        {/* Languages Placeholder */}
        <div>
          <h4 style={{ 
            color: "#121212", 
            fontSize: "14px", 
            fontWeight: "600", 
            margin: "0 0 8px 0",
            fontFamily: "Urbanist, sans-serif"
          }}>
            Languages
          </h4>
          <div style={{ 
            color: "#6b7280", 
            fontSize: "13px",
            fontStyle: "italic",
            fontFamily: "Urbanist, sans-serif"
          }}>
            Language skills will appear here...
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePreview; 