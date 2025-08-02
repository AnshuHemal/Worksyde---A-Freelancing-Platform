import React, { useState, useEffect } from "react";
import axios from "axios";
import FreelancersSettingsSidebar from "./FreelancersSettingsSidebar";
import { BsQuestionCircle } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const SIDEBAR_WIDTH = 290;
const API_URL = "http://localhost:5000/api/auth";

const FreelancersProfileSettings = () => {
  const navigate = useNavigate();
  
  // Add CSS animation for loading spinner
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const [visibility, setVisibility] = useState("public");
  const [projectPreference, setProjectPreference] = useState("both");
  const [experienceLevel, setExperienceLevel] = useState("intermediate");
  const [aiPreference, setAiPreference] = useState("depends");
  const [showVisibilityDropdown, setShowVisibilityDropdown] = useState(false);
  const [showProjectPreferenceDropdown, setShowProjectPreferenceDropdown] = useState(false);
  const [showAiPreferenceModal, setShowAiPreferenceModal] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedSpecialities, setSelectedSpecialities] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch current user data
        const userResponse = await axios.get(`${API_URL}/current-user/`, { 
          withCredentials: true 
        });
        
        const currentUser = userResponse.data.user;
        setUserId(currentUser._id);
        setUserData(currentUser);

        // Fetch detailed profile data
        const profileResponse = await axios.get(`${API_URL}/profile/${currentUser._id}/`, {
          withCredentials: true
        });
        
        setProfileData(profileResponse.data);

        // Fetch profile settings
        const settingsResponse = await axios.get(`${API_URL}/profile-settings/`, {
          withCredentials: true
        });
        
        if (settingsResponse.data.success) {
          const settings = settingsResponse.data.profile_settings;
          setVisibility(settings.visibility);
          setProjectPreference(settings.projectPreference);
          setExperienceLevel(settings.experienceLevel);
          setAiPreference(settings.aiPreference);
        }

        // Fetch categories data
        const categoriesResponse = await axios.get(`${API_URL}/categories-with-specialities/`);
        setCategoryData(categoriesResponse.data);
        
        // Set current category and specialities from profile data
        if (profileData?.category) {
          setSelectedCategoryId(profileData.category._id);
          setSelectedSpecialities(profileData.specialities?.map(s => s._id) || []);
        }

      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const visibilityOptions = [
    { value: "public", label: "Public" },
    { value: "private", label: "Private" },
    { value: "freelancers_only", label: "Freelancers only" }
  ];
  
  const projectPreferenceOptions = [
    { value: "short_term_project", label: "Short-Term projects (< 3 months)" },
    { value: "long_term_project", label: "Long-Term projects (3+ months)" },
    { value: "both", label: "Both Short-Term and Long-Term projects" }
  ];
  
  const aiPreferenceOptions = [
    { value: "yes", label: "Yes, use my data for AI training" },
    { value: "no", label: "No, don't use my data for AI training" },
    { value: "depends", label: "Depends on the context" }
  ];

  const handleVisibilityChange = async (option) => {
    const newValue = option.value;
    setVisibility(newValue);
    setShowVisibilityDropdown(false);
    
    // Auto-save to database
    await saveSettingsToDatabase({
      visibility: newValue,
      projectPreference,
      experienceLevel,
      aiPreference
    });
  };

  const handleProjectPreferenceChange = async (option) => {
    const newValue = option.value;
    setProjectPreference(newValue);
    setShowProjectPreferenceDropdown(false);
    
    // Auto-save to database
    await saveSettingsToDatabase({
      visibility,
      projectPreference: newValue,
      experienceLevel,
      aiPreference
    });
  };

  const handleAiPreferenceChange = async (preference) => {
    setAiPreference(preference);
    setShowAiPreferenceModal(false);
    
    // Auto-save to database
    await saveSettingsToDatabase({
      visibility,
      projectPreference,
      experienceLevel,
      aiPreference: preference
    });
  };

  const handleExperienceLevelChange = async (level) => {
    setExperienceLevel(level);
    
    // Auto-save to database
    await saveSettingsToDatabase({
      visibility,
      projectPreference,
      experienceLevel: level,
      aiPreference
    });
  };

  const saveSettingsToDatabase = async (settings) => {
    try {
      setSaving(true);
      setSaveMessage("");

      const response = await axios.put(`${API_URL}/update-profile-settings/`, settings, {
        withCredentials: true
      });

      if (response.data.success) {
        setSaveMessage("Settings saved automatically!");
        setTimeout(() => setSaveMessage(""), 2000);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveMessage("Failed to save settings. Please try again.");
      setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSpecialityToggle = (id) => {
    setSelectedSpecialities(prev => {
      if (prev.includes(id)) {
        return prev.filter(specId => specId !== id);
      } else {
        if (prev.length < 3) {
          return [...prev, id];
        }
        return prev;
      }
    });
  };

  const handleSaveCategories = async () => {
    try {
      setSaving(true);
      setSaveMessage("");

      const response = await axios.post(`${API_URL}/save-specialities/`, {
        userId: userId,
        categoryId: selectedCategoryId,
        specialities: selectedSpecialities
      }, {
        withCredentials: true
      });

      // Close modal immediately on successful response
      setShowCategoriesModal(false);
      
      // Show success message
      setSaveMessage("Categories updated successfully!");
      setTimeout(() => setSaveMessage(""), 2000);
      
      // Refresh profile data
      const profileResponse = await axios.get(`${API_URL}/profile/${userId}/`, {
        withCredentials: true
      });
      setProfileData(profileResponse.data);
      
      // Update the selected category and specialities in the modal state
      setSelectedCategoryId(profileResponse.data.category?._id || null);
      setSelectedSpecialities(profileResponse.data.specialities?.map(s => s._id) || []);
    } catch (error) {
      console.error("Error saving categories:", error);
      setSaveMessage("Failed to save categories. Please try again.");
      setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setSaving(false);
    }
  };

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

  if (loading) {
    return (
      <div
        className="section-container"
        style={{ display: "flex", minHeight: "100vh", background: "#fff" }}
      >
        <FreelancersSettingsSidebar
          activeKey="profile-settings"
          onNavigate={handleSidebarNavigate}
          freelancerId={userId}
        />
        <main
          style={{
            flex: 1,
            marginLeft: SIDEBAR_WIDTH,
            background: "#fff",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Inter, Arial, sans-serif",
          }}
        >
          <div style={{ fontSize: 18, color: "#666", textAlign: "center" }}>Loading...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="section-container"
        style={{ display: "flex", minHeight: "100vh", background: "#fff" }}
      >
        <FreelancersSettingsSidebar
          activeKey="profile-settings"
          onNavigate={handleSidebarNavigate}
          freelancerId={userId}
        />
        <main
          style={{
            flex: 1,
            marginLeft: SIDEBAR_WIDTH,
            background: "#fff",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Inter, Arial, sans-serif",
          }}
        >
          <div style={{ fontSize: 18, color: "#e74c3c", textAlign: "center", maxWidth: "100%" }}>
            {error}
            <br />
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: 16,
                padding: "8px 16px",
                background: "#007476",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className="section-container"
      style={{ display: "flex", minHeight: "100vh", background: "#fff" }}
    >
      <FreelancersSettingsSidebar
        activeKey="profile-settings"
        onNavigate={handleSidebarNavigate}
        freelancerId={userId}
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
            My profile
          </div>

          {/* Profile Visibility Card */}
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
              Profile Visibility
            </div>

            <div style={{ marginBottom: 18, color: "#222" }}>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#222",
                  marginBottom: 8,
                }}
              >
                Visibility
              </div>
              <div style={{ position: "relative" }}>
                <button
                  onClick={() =>
                    setShowVisibilityDropdown(!showVisibilityDropdown)
                  }
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid #e6e6e6",
                    borderRadius: 8,
                    backgroundColor: "#fff",
                    fontSize: 18,
                    color: "#222",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "border-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.target.style.borderColor = "#007476")}
                  onMouseLeave={(e) => (e.target.style.borderColor = "#e6e6e6")}
                >
                  {visibilityOptions.find(opt => opt.value === visibility)?.label || "Select visibility"}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M3 4.5L6 7.5L9 4.5"
                      stroke="#666"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {showVisibilityDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      backgroundColor: "#fff",
                      border: "1px solid #e6e6e6",
                      borderRadius: 8,
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      zIndex: 1000,
                      marginTop: "4px",
                    }}
                  >
                    {visibilityOptions.map((option) => (
                      <div
                        key={option.value}
                        onClick={() => handleVisibilityChange(option)}
                        style={{
                          padding: "12px 16px",
                          cursor: "pointer",
                          borderBottom: "1px solid #f0f0f0",
                          transition: "background-color 0.2s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.backgroundColor = "#f8f9fa")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor = "#fff")
                        }
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 18, color: "#222" }}>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#222",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Project preference
                <BsQuestionCircle
                  size={16}
                  color="#666"
                  style={{ marginLeft: 8, cursor: "pointer" }}
                  title="Choose your preferred project types"
                />
              </div>
              <div style={{ position: "relative" }}>
                <button
                  onClick={() =>
                    setShowProjectPreferenceDropdown(
                      !showProjectPreferenceDropdown
                    )
                  }
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid #e6e6e6",
                    borderRadius: 8,
                    backgroundColor: "#fff",
                    fontSize: 18,
                    color:
                      projectPreference === "Project preference"
                        ? "#6b6b6b"
                        : "#222",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "border-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.target.style.borderColor = "#007476")}
                  onMouseLeave={(e) => (e.target.style.borderColor = "#e6e6e6")}
                >
                  {projectPreferenceOptions.find(opt => opt.value === projectPreference)?.label || "Select project preference"}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M3 4.5L6 7.5L9 4.5"
                      stroke="#666"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {showProjectPreferenceDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      backgroundColor: "#fff",
                      border: "1px solid #e6e6e6",
                      borderRadius: 8,
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      zIndex: 1000,
                      marginTop: "4px",
                    }}
                  >
                    {projectPreferenceOptions.map((option) => (
                      <div
                        key={option.value}
                        onClick={() => handleProjectPreferenceChange(option)}
                        style={{
                          padding: "12px 16px",
                          cursor: "pointer",
                          borderBottom: "1px solid #f0f0f0",
                          transition: "background-color 0.2s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.backgroundColor = "#f8f9fa")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor = "#fff")
                        }
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Experience Level Card */}
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
              Experience level
            </div>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[
                {
                  level: "entry",
                  label: "Entry level",
                  description: "I am relatively new to this field",
                },
                {
                  level: "intermediate",
                  label: "Intermediate",
                  description: "I have substantial experience in this field",
                },
                {
                  level: "expert",
                  label: "Expert",
                  description:
                    "I have comprehensive and deep expertise in this field",
                },
              ].map((option) => (
                <div
                  key={option.level}
                  onClick={() => handleExperienceLevelChange(option.level)}
                  style={{
                    flex: 1,
                    minWidth: 200,
                    padding: "20px",
                    border:
                      experienceLevel === option.level
                        ? "2px solid #000"
                        : "1px solid #e6e6e6",
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    backgroundColor: "#fff",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    if (experienceLevel !== option.level) {
                      e.currentTarget.style.borderColor = "#007476";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (experienceLevel !== option.level) {
                      e.currentTarget.style.borderColor = "#e6e6e6";
                    }
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        border: "2px solid #e6e6e6",
                        marginRight: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {experienceLevel === option.level && (
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor: "#007476",
                          }}
                        />
                      )}
                    </div>
                    <div
                      style={{ fontWeight: 600, fontSize: 18, color: "#222" }}
                    >
                      {option.label}
                    </div>
                  </div>
                  <div
                    style={{ fontSize: 16, color: "#6b6b6b", marginLeft: 28 }}
                  >
                    {option.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Categories Card */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e6e6e6",
              borderRadius: 12,
              padding: 36,
              marginBottom: 20,
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
              Categories
            </div>

            {profileData?.category ? (
              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#222",
                    marginBottom: 12,
                  }}
                >
                  {profileData.category.name}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {profileData.specialities && profileData.specialities.map((speciality) => (
                    <span
                      key={speciality._id}
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(0, 118, 116, 0.1) 0%, rgba(0, 118, 116, 0.05) 100%)",
                        color: "#007674",
                        border: "1px solid rgba(0, 118, 116, 0.2)",
                        borderRadius: 20,
                        padding: "6px 12px",
                        fontSize: "16px",
                        fontWeight: 600,
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background =
                          "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                        e.target.style.color = "white";
                        e.target.style.transform = "translateY(-1px)";
                        e.target.style.boxShadow =
                          "0 4px 12px rgba(0, 118, 116, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background =
                          "linear-gradient(135deg, rgba(0, 118, 116, 0.1) 0%, rgba(0, 118, 116, 0.05) 100%)";
                        e.target.style.color = "#007674";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "none";
                      }}
                    >
                      {speciality.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ 
                fontSize: 16, 
                color: "#6b6b6b", 
                fontStyle: "italic",
                textAlign: "center",
                padding: "20px"
              }}>
                No categories selected yet
              </div>
            )}

            <button
              onClick={() => {
                // Reset modal state to current profile data
                if (profileData?.category) {
                  setSelectedCategoryId(profileData.category._id);
                  setSelectedSpecialities(profileData.specialities?.map(s => s._id) || []);
                }
                setShowCategoriesModal(true);
              }}
              style={{
                position: "absolute",
                top: 28,
                right: 28,
                background: "#fff",
                border: "1px solid #e6e6e6",
                cursor: "pointer",
                padding: 6,
                width: 36,
                height: 36,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s",
                boxShadow: "0 1px 4px 0 rgba(60,72,100,0.04)",
              }}
              title="Edit"
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#e6f4ea")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
            >
              <svg width="18" height="18" fill="#007476" viewBox="0 0 24 24">
                <path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zm17.71-10.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
              </svg>
            </button>
          </div>

          {/* AI Preference Card */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e6e6e6",
              borderRadius: 12,
              padding: 36,
              marginBottom: 40,
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
                marginBottom: 20,
                color: "#111",
              }}
            >
              AI preference
            </div>

            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 18,
                  color: "#666",
                  marginBottom: 16,
                }}
              >
                Choose how your Worksyde data is used for AI training and improvement.
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 24,
                }}
              >
                {aiPreference === "yes" ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M13.5 4.5L6 12L2.5 8.5"
                      stroke="#007476"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : aiPreference === "no" ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M12 4L4 12M4 4L12 12"
                      stroke="#dc2626"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 4V8L10 10"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="8" cy="8" r="6" stroke="#f59e0b" strokeWidth="2" fill="none"/>
                  </svg>
                )}
                <span style={{ 
                  fontSize: 18, 
                  color: aiPreference === "yes" 
                    ? "#222" 
                    : aiPreference === "no" 
                    ? "#dc2626" 
                    : "#f59e0b" 
                }}>
                  {aiPreference === "yes" 
                    ? "Your data is being used to train our AI." 
                    : aiPreference === "no" 
                    ? "Your data is not being used to train our AI."
                    : "Your data usage depends on the context."}
                </span>
              </div>

              <button
                onClick={() => setShowAiPreferenceModal(true)}
                style={{
                  background: "#fff",
                  border: "1px solid #007476",
                  borderRadius: 8,
                  padding: "12px 24px",
                  color: "#007476",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
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
                Change Preference
              </button>
            </div>
          </div>
        </div>

        {/* Auto-save Status */}
        {saveMessage && (
          <div style={{ 
            position: "fixed", 
            bottom: 20, 
            right: 20, 
            zIndex: 1000 
          }}>
            <div style={{
              background: saveMessage.includes("automatically") ? "#fff" : "#fff",
              border: saveMessage.includes("automatically") ? "1px solid #007476" : "1px solid #007476",
              color: saveMessage.includes("automatically") ? "#007476" : "#007476",
              padding: "12px 16px",
              borderRadius: "8px",
              fontSize: "16px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              {saving && (
                <div style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid currentColor",
                  borderTop: "2px solid transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }} />
              )}
              {saveMessage}
            </div>
          </div>
        )}
      </main>

      {/* Click outside to close dropdowns */}
      {(showVisibilityDropdown || showProjectPreferenceDropdown) && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onClick={() => {
            setShowVisibilityDropdown(false);
            setShowProjectPreferenceDropdown(false);
          }}
        />
      )}

      {/* Categories Modal */}
      {showCategoriesModal && (
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
          onClick={() => setShowCategoriesModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, type: "spring", damping: 25 }}
            style={{
              background: "#fff",
              borderRadius: "12px",
              width: "100%",
              // maxWidth: "1200px",
              maxHeight: "90vh",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
              border: "1px solid #e6e6e6",
              overflow: "hidden",
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
                padding: "24px 32px",
                borderBottom: "1px solid #e6e6e6",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "26px",
                  fontWeight: "600",
                  color: "#1a1a1a",
                }}
              >
                Update Your Categories & Specialities
              </h3>
              <motion.button
                onClick={() => setShowCategoriesModal(false)}
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

            {/* Modal Content */}
            <div style={{ display: "flex", height: "calc(90vh - 120px)" }}>
              {/* Left Column - Categories */}
              <div
                style={{
                  flex: "0 0 40%",
                  padding: "32px",
                  borderRight: "1px solid #e6e6e6",
                  background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                }}
              >
                <div style={{ marginBottom: "24px" }}>
                  <h4
                    style={{
                      fontSize: "22px",
                      fontWeight: "600",
                      color: "#1a1a1a",
                      marginBottom: "8px",
                    }}
                  >
                    Choose Your Category
                  </h4>
                  <p
                    style={{
                      fontSize: "16px",
                      color: "#666",
                      margin: 0,
                    }}
                  >
                    Select the main category that best describes your work
                  </p>
                </div>

                <div
                  style={{
                    height: "600px",
                    overflowY: "auto",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  {categoryData.map((item, index) => (
                    <div
                      key={item.category._id}
                      onClick={() => setSelectedCategoryId(item.category._id)}
                      style={{
                        padding: "16px",
                        marginBottom: "12px",
                        borderRadius: "12px",
                        // background: selectedCategoryId === item.category._id
                        //   ? "linear-gradient(135deg, #e8f4f4 0%, #d1e7e7 100%)"
                        //   : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                        border: selectedCategoryId === item.category._id
                          ? "2px solid #007674"
                          : "2px solid transparent",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        boxShadow: selectedCategoryId === item.category._id
                          ? "0 6px 20px rgba(0, 118, 116, 0.15)"
                          : "0 2px 8px rgba(0, 0, 0, 0.05)",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedCategoryId !== item.category._id) {
                          // e.currentTarget.style.background = "linear-gradient(135deg, #e8f4f4 0%, #d1e7e7 100%)";
                          e.currentTarget.style.borderColor = "#007674";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedCategoryId !== item.category._id) {
                          e.currentTarget.style.background = "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)";
                          e.currentTarget.style.borderColor = "transparent";
                        }
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                          <h6
                            style={{
                              fontSize: "18px",
                              fontWeight: "600",
                              color: "#1a1a1a",
                              margin: "0 0 4px 0",
                            }}
                          >
                            {item.category.name}
                          </h6>
                          <small style={{ color: "#666", fontSize: "15px" }}>
                            {item.specialities.length} specialities
                          </small>
                        </div>
                        {selectedCategoryId === item.category._id && (
                          <div style={{ color: "#007674" }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path
                                d="M16.5 5.5L7 15L3.5 11.5"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column - Specialities */}
              <div
                style={{
                  flex: "0 0 60%",
                  padding: "32px",
                  background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                }}
              >
                <div style={{ marginBottom: "24px" }}>
                  <h4
                    style={{
                      fontSize: "26px",
                      fontWeight: "600",
                      color: "#1a1a1a",
                      marginBottom: "8px",
                    }}
                  >
                    Select Your Specialities
                  </h4>
                  <p
                    style={{
                      fontSize: "16px",
                      color: "#666",
                      margin: "0 0 16px 0",
                    }}
                  >
                    Choose up to 3 specialities that best match your expertise
                  </p>
                  <div
                    style={{
                      background: "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                      color: "white",
                      padding: "8px 16px",
                      borderRadius: "20px",
                      fontSize: "16px",
                      fontWeight: "600",
                      display: "inline-block",
                    }}
                  >
                    {selectedSpecialities.length}/3 selected
                  </div>
                </div>

                <div
                  style={{
                    maxHeight: "400px",
                    overflowY: "auto",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  {(() => {
                    const selectedCategory = categoryData.find(
                      (item) => item.category._id === selectedCategoryId
                    );

                    if (!selectedCategory) {
                      return (
                        <div style={{ textAlign: "center", padding: "40px" }}>
                          <div
                            style={{
                              width: "80px",
                              height: "80px",
                              borderRadius: "50%",
                              // background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                              color: "#007674",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              margin: "0 auto 16px",
                            }}
                          >
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          <h5 style={{ color: "#1a1a1a", marginBottom: "8px" }}>
                            Select a Category
                          </h5>
                          <p style={{ color: "#666", margin: 0 }}>
                            Choose a category from the left to see available specialities
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
                        {selectedCategory.specialities.map((spec, index) => (
                          <div
                            key={spec._id}
                            onClick={() => handleSpecialityToggle(spec._id)}
                            style={{
                              padding: "16px",
                              borderRadius: "12px",
                              // background: selectedSpecialities.includes(spec._id)
                              //   ? "linear-gradient(135deg, #e8f4f4 0%, #d1e7e7 100%)"
                              //   : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                              border: selectedSpecialities.includes(spec._id)
                                ? "2px solid #007674"
                                : "1px solid #e3e3e3",
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                              position: "relative",
                              minHeight: "80px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: selectedSpecialities.includes(spec._id)
                                ? "0 6px 20px rgba(0, 118, 116, 0.15)"
                                : "0 2px 8px rgba(0, 0, 0, 0.05)",
                            }}
                            onMouseEnter={(e) => {
                              if (!selectedSpecialities.includes(spec._id)) {
                                e.currentTarget.style.borderColor = "#007674";
                                // e.currentTarget.style.background = "linear-gradient(135deg, #f0f8f8 0%, #e8f4f4 100%)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!selectedSpecialities.includes(spec._id)) {
                                e.currentTarget.style.borderColor = "#e3e3e3";
                                e.currentTarget.style.background = "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)";
                              }
                            }}
                          >
                            {selectedSpecialities.includes(spec._id) && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "8px",
                                  right: "8px",
                                  background: "#007674",
                                  borderRadius: "50%",
                                  width: "24px",
                                  height: "24px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                                  <path
                                    d="M16.5 5.5L7 15L3.5 11.5"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                            )}
                            <h6
                              style={{
                                fontSize: "16px",
                                fontWeight: "600",
                                color: "#1a1a1a",
                                textAlign: "center",
                                margin: 0,
                                lineHeight: "1.3",
                              }}
                            >
                              {spec.name}
                            </h6>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Action Buttons */}
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    justifyContent: "flex-end",
                    marginTop: "32px",
                    paddingTop: "24px",
                    borderTop: "1px solid #e6e6e6",
                  }}
                >
                  <button
                    onClick={() => setShowCategoriesModal(false)}
                    style={{
                      background: "transparent",
                      border: "1px solid #e6e6e6",
                      borderRadius: "8px",
                      padding: "12px 24px",
                      color: "#666",
                      fontSize: "16px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#f8f9fa";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "transparent";
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCategories}
                    disabled={saving || selectedSpecialities.length === 0}
                    style={{
                      background: selectedSpecialities.length > 0
                        ? "linear-gradient(135deg, #007674 0%, #005a58 100%)"
                        : "#cccccc",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px 24px",
                      color: "#fff",
                      fontSize: "16px",
                      fontWeight: "600",
                      cursor: selectedSpecialities.length > 0 ? "pointer" : "not-allowed",
                      transition: "all 0.2s ease",
                      opacity: selectedSpecialities.length > 0 ? 1 : 0.6,
                    }}
                    onMouseEnter={(e) => {
                      if (selectedSpecialities.length > 0) {
                        e.target.style.background = "linear-gradient(135deg, #005a58 0%, #004a48 100%)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedSpecialities.length > 0) {
                        e.target.style.background = "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                      }
                    }}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* AI Preference Modal */}
      {showAiPreferenceModal && (
        <div
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
          onClick={() => setShowAiPreferenceModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "800px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
              border: "1px solid #e6e6e6",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Content */}
            <div style={{ display: "flex", minHeight: "500px" }}>
              {/* Left Panel - Graphic */}
              <div
                style={{
                  flex: "0 0 45%",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "60px 40px",
                }}
              >
                <div
                  style={{
                    width: "200px",
                    height: "200px",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* Spirograph-like pattern */}
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="90" fill="none" stroke="#e0e0e0" strokeWidth="2"/>
                    <circle cx="100" cy="100" r="70" fill="none" stroke="#d0d0d0" strokeWidth="2"/>
                    <circle cx="100" cy="100" r="50" fill="none" stroke="#c0c0c0" strokeWidth="2"/>
                    <circle cx="100" cy="100" r="30" fill="none" stroke="#b0b0b0" strokeWidth="2"/>
                    <circle cx="100" cy="100" r="10" fill="#a0a0a0"/>
                    
                    {/* Additional decorative circles */}
                    <circle cx="60" cy="60" r="15" fill="none" stroke="#e0e0e0" strokeWidth="1"/>
                    <circle cx="140" cy="60" r="12" fill="none" stroke="#d0d0d0" strokeWidth="1"/>
                    <circle cx="140" cy="140" r="18" fill="none" stroke="#c0c0c0" strokeWidth="1"/>
                    <circle cx="60" cy="140" r="10" fill="none" stroke="#b0b0b0" strokeWidth="1"/>
                  </svg>
                </div>
              </div>

              {/* Right Panel - Content */}
              <div
                style={{
                  flex: "0 0 55%",
                  padding: "40px 50px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                }}
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowAiPreferenceModal(false)}
                  style={{
                    position: "absolute",
                    top: "20px",
                    right: "20px",
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
                  onMouseEnter={(e) => {
                    e.target.style.color = "#1a1a1a";
                    e.target.style.background = "#f8f9fa";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = "#666";
                    e.target.style.background = "none";
                  }}
                >
                  ×
                </button>

                <div>
                  {/* Heading */}
                  <h3
                    style={{
                      margin: "0 0 34px 0",
                      fontSize: "24px",
                      fontWeight: "600",
                      color: "#1a1a1a",
                      lineHeight: "1.3",
                    }}
                  >
                    Update your AI preferences
                  </h3>

                  {/* Body Text */}
                  <p
                    style={{
                      fontSize: "18px",
                      color: "#121212",
                      lineHeight: "1.6",
                      marginBottom: "26px",
                    }}
                  >
                    Allow your Worksyde data to be used for AI training and improvement. 
                    Third parties won't be able to use this data to train their own models.
                  </p>
                  <p
                    style={{
                      fontSize: "18px",
                      color: "#121212",
                      lineHeight: "1.6",
                    }}
                  >
                    You can change this any time.{" "}
                    <a
                      href="#"
                      style={{
                        color: "#007476",
                        textDecoration: "underline",
                        fontWeight: "500",
                      }}
                    >
                      Learn more
                    </a>
                  </p>
                </div>

                {/* Action Buttons */}
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    justifyContent: "flex-end",
                    marginTop: "40px",
                  }}
                >
                  <button
                    onClick={() => handleAiPreferenceChange("no")}
                    style={{
                      background: "transparent",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px 24px",
                      color: "#007476",
                      fontSize: "16px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#f8f9fa";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "transparent";
                    }}
                  >
                    Don't allow
                  </button>
                  <button
                    onClick={() => handleAiPreferenceChange("yes")}
                    style={{
                      background: "#007476",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px 24px",
                      color: "#fff",
                      fontSize: "16px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#005a58";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "#007476";
                    }}
                  >
                    Allow
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancersProfileSettings;
