import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BsPencil,
  BsPalette,
  BsTrash,
  BsDownload,
  BsArrowUp,
  BsArrowLeft,
  BsArrowRight,
  BsSave,
} from "react-icons/bs";
import ResumePreview from "./ResumePreview";

const ResumeBuilderEditor = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: "John",
    designation: "UI Designer",
    summary: "Short Introduction",
    profileImage: null,
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          profileImage: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "Urbanist, sans-serif" }}>
      {/* Header Bar */}
      <div
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        {/* Left: Resume Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#121212",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            UI UX Designer Resume
            <BsPencil size={16} color="#6b7280" style={{ cursor: "pointer" }} />
          </h1>
        </div>

        {/* Right: Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            style={{
              background: "#ffffff",
              border: "1px solid #8b5cf6",
              color: "#8b5cf6",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#ffffff";
            }}
          >
            <BsPalette size={14} />
            Change Theme
          </button>
          <button
            style={{
              background: "#ffffff",
              border: "1px solid #ef4444",
              color: "#ef4444",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#fef2f2";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#ffffff";
            }}
          >
            <BsTrash size={14} />
            Delete
          </button>
          <button
            style={{
              background: "#8b5cf6",
              border: "1px solid #8b5cf6",
              color: "#ffffff",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#7c3aed";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#8b5cf6";
            }}
          >
            <BsDownload size={14} />
            Preview & Download
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "24px", height: "calc(100vh - 140px)" }}>
          {/* Left Panel: Input Form */}
          <div
            style={{
              flex: 1,
              background: "#ffffff",
              borderRadius: "16px",
              padding: "32px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              border: "1px solid #e5e7eb",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#121212",
                margin: "0 0 24px 0",
              }}
            >
              Personal Information
            </h2>

            {/* Profile Picture Upload */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ position: "relative", display: "inline-block" }}>
                <div
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    background: formData.profileImage ? "transparent" : "#f3f4f6",
                    border: "2px dashed #d1d5db",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  onClick={() => document.getElementById("profile-upload").click()}
                >
                  {formData.profileImage ? (
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
                        background: "#8b5cf6",
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
                  
                  {/* Upload Button */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "4px",
                      right: "4px",
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "#8b5cf6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(139, 92, 246, 0.3)",
                    }}
                  >
                    <BsArrowUp size={16} color="#ffffff" />
                  </div>
                </div>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
              </div>
            </div>

            {/* Input Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "500",
                    color: "#374151",
                    fontSize: "14px",
                    marginBottom: "8px",
                  }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "16px",
                    background: "#ffffff",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#8b5cf6";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "500",
                    color: "#374151",
                    fontSize: "14px",
                    marginBottom: "8px",
                  }}
                >
                  Designation
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => handleInputChange("designation", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "16px",
                    background: "#ffffff",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#8b5cf6";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "500",
                    color: "#374151",
                    fontSize: "14px",
                    marginBottom: "8px",
                  }}
                >
                  Summary
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => handleInputChange("summary", e.target.value)}
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "16px",
                    background: "#ffffff",
                    resize: "vertical",
                    fontFamily: "inherit",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#8b5cf6";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                  }}
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "32px",
                paddingTop: "24px",
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <button
                style={{
                  background: "#ffffff",
                  border: "1px solid #8b5cf6",
                  color: "#8b5cf6",
                  borderRadius: "8px",
                  padding: "12px 24px",
                  fontSize: "14px",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#ffffff";
                }}
              >
                <BsArrowLeft size={14} />
                ← Back
              </button>
              <button
                style={{
                  background: "#ffffff",
                  border: "1px solid #8b5cf6",
                  color: "#8b5cf6",
                  borderRadius: "8px",
                  padding: "12px 24px",
                  fontSize: "14px",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#ffffff";
                }}
              >
                <BsSave size={14} />
                Save & Exit
              </button>
              <button
                style={{
                  background: "#8b5cf6",
                  border: "1px solid #8b5cf6",
                  color: "#ffffff",
                  borderRadius: "8px",
                  padding: "12px 24px",
                  fontSize: "14px",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  marginLeft: "auto",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#7c3aed";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#8b5cf6";
                }}
              >
                Next →
                <BsArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Right Panel: Resume Preview */}
          <ResumePreview formData={formData} />
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilderEditor;
