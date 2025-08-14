import React, { useState, useEffect } from "react";
import axios from "axios";
import ClientSettingsSidebar from "./ClientSettingsSidebar";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { motion } from "framer-motion";

const SIDEBAR_WIDTH = 290;
const API_URL = "http://localhost:5000/api/auth";

const ClientInfoPage = () => {
  const { userId, userData, loading: userLoading, error: userError, refreshUserData } = useUser();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Edit states
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Form states for Account
  const [accountForm, setAccountForm] = useState({
    firstName: "",
    lastName: "",
    email: ""
  });

  // Form states for Location
  const [locationForm, setLocationForm] = useState({
    phone: ""
  });

  // Form states for Company
  const [companyForm, setCompanyForm] = useState({
    companyName: "",
    website: "",
    industry: "",
    size: "",
    tagline: "",
    description: "",
    logo: "", // Preview URL for display
    logoFile: null // File object for upload
  });

  // Edit states for Company
  const [isEditingCompany, setIsEditingCompany] = useState(false);

  // AI Preference states
  const [aiPreference, setAiPreference] = useState("yes");
  const [showAiPreferenceModal, setShowAiPreferenceModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Image loading states
  const [logoLoading, setLogoLoading] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        setError(null);

        // Fetch detailed profile data for client
        const profileResponse = await axios.get(`${API_URL}/client/profile-details/${userId}/`, {
          withCredentials: true
        });
        
        setProfileData(profileResponse.data);

        // Initialize form data
        const nameParts = userData?.name ? userData.name.split(" ") : ["", ""];
        setAccountForm({
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          email: userData?.email || ""
        });

        setLocationForm({
          phone: profileResponse.data.phone || ""
        });

        setCompanyForm({
          companyName: profileResponse.data.companyName || userData.name,
          website: profileResponse.data.website || "-",
          industry: profileResponse.data.industry || "-",
          size: profileResponse.data.size || "-",
          tagline: profileResponse.data.tagline || "-",
          description: profileResponse.data.description || "-",
          logo: profileResponse.data.logo ? `${API_URL}/company-logo/${userId}/` : "", // Initialize logo with database endpoint
          logoFile: null // Initialize logoFile
        });

        // Fetch profile settings to get AI preference
        try {
          const settingsResponse = await axios.get(`${API_URL}/client-profile-settings/`, {
            withCredentials: true
          });
          
          if (settingsResponse.data.success) {
            const settings = settingsResponse.data.profile_settings;
            if (settings.aiPreference) {
              setAiPreference(settings.aiPreference);
            } else {
              // No AI preference found, set default to "yes" and save to backend
              setAiPreference("yes");
              await saveSettingsToDatabase({
                aiPreference: "yes"
              });
            }
          }
        } catch (settingsError) {
          console.log("No profile settings found, using default AI preference");
          setAiPreference("yes");
          // Save default preference to backend
          await saveSettingsToDatabase({
            aiPreference: "yes"
          });
        }

      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Failed to load profile data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, userData]);

  // Refresh user data when component mounts to ensure we have latest data
  useEffect(() => {
    if (refreshUserData) {
      refreshUserData();
    }
  }, []);

  // Navigation handler for sidebar
  const handleSidebarNavigate = (key) => {
    switch (key) {
      case "billing":
        navigate("/ws/client/deposit-method");
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

  const formatPhone = () => {
    if (!profileData?.phone) return "Not provided";
    
    const phone = profileData.phone;
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    if (cleaned.startsWith('+91') && cleaned.length === 13) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 8)} ${cleaned.slice(8)}`;
    }
    
    // For other international numbers, format as +XX XXX XXX XXXX
    if (cleaned.startsWith('+') && cleaned.length >= 10) {
      const countryCode = cleaned.slice(0, 3);
      const remaining = cleaned.slice(3);
      
      if (remaining.length === 10) {
        return `${countryCode} ${remaining.slice(0, 5)} ${remaining.slice(5)}`;
      } else if (remaining.length === 9) {
        return `${countryCode} ${remaining.slice(0, 4)} ${remaining.slice(4)}`;
      }
    }
    
    // For numbers without country code, format as XXXXX XXXXX
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    
    return phone;
  };

  // Helper function to format email address
  const formatEmail = (email) => {
    if (!email) return "Not provided";
    
    const [localPart, domain] = email.split('@');
    
    if (localPart.length <= 4) {
      return email; // Don't mask if too short
    }
    
    const firstChar = localPart[0];
    const lastThreeChars = localPart.slice(-3); // Get last 3 characters
    const maskedPart = '*****'; // Always 5 asterisks
    
    return `${firstChar}${maskedPart}${lastThreeChars}@${domain}`;
  };

  // Helper function to get timezone (you might want to store this in the backend)
  const getTimezone = () => {
    return "UTC+05:30 Mumbai, Kolkata, Chennai, New Delhi"; // This could be fetched from backend
  };

  // Helper function to encrypt userId to 10-character string
  const encryptUserId = (userId) => {
    if (!userId) return "Not available";
    
    // Create a simple hash from the userId
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert to positive number
    hash = Math.abs(hash);
    
    // Create a string with alphanumeric characters
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    // Generate 10 characters using the hash
    for (let i = 0; i < 10; i++) {
      // Use different parts of the hash for each character
      const index = (hash + i * 31) % chars.length;
      result += chars[index];
    }
    
    return result;
  };

  // Handle account form changes
  const handleAccountFormChange = (field, value) => {
    setAccountForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle location form changes
  const handleLocationFormChange = (field, value) => {
    setLocationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle company form changes
  const handleCompanyFormChange = (field, value) => {
    setCompanyForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle account update
  const handleAccountUpdate = async () => {
    try {
      setUpdating(true);
      
      // Update user name and email
      const fullName = `${accountForm.firstName} ${accountForm.lastName}`.trim();
      
      await axios.put(`${API_URL}/update-user/`, {
        name: fullName,
        email: accountForm.email
      }, { withCredentials: true });

      // Refresh user data in context
      await refreshUserData();

      setIsEditingAccount(false);
      
      // Refresh the page to update Header2 and other components
      window.location.reload();
    } catch (err) {
      console.error("Error updating account:", err);
      alert("Failed to update account information. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  // Handle location update
  const handleLocationUpdate = async () => {
    try {
      setUpdating(true);
      
      // Update location information
      await axios.post(`${API_URL}/add-photo-location-details/`, {
        userId: userId,
        phone: locationForm.phone
      }, { withCredentials: true });

      // Refresh profile data
      const profileResponse = await axios.get(`${API_URL}/client/profile-details/${userId}/`, {
        withCredentials: true
      });
      setProfileData(profileResponse.data);

      setIsEditingLocation(false);
    } catch (err) {
      console.error("Error updating location:", err);
      alert("Failed to update location information. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  // Handle company update
  const handleCompanyUpdate = async () => {
    try {
      setUpdating(true);
      
      // Prepare form data for backend
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("companyName", companyForm.companyName);
      formData.append("website", companyForm.website);
      formData.append("industry", companyForm.industry);
      formData.append("size", companyForm.size);
      formData.append("tagline", companyForm.tagline);
      formData.append("description", companyForm.description);
      
      // Add logo file if selected
      if (companyForm.logoFile) {
        formData.append("logo", companyForm.logoFile);
      }

      await axios.post(`${API_URL}/add-company-details/`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Refresh profile data
      const profileResponse = await axios.get(`${API_URL}/client/profile-details/${userId}/`, {
        withCredentials: true
      });
      setProfileData(profileResponse.data);

      // Update company form with refreshed data including logo URL
      setCompanyForm(prev => ({
        ...prev,
        companyName: profileResponse.data.companyName || userData.name,
        website: profileResponse.data.website || "-",
        industry: profileResponse.data.industry || "-",
        size: profileResponse.data.size || "-",
        tagline: profileResponse.data.tagline || "-",
        description: profileResponse.data.description || "-",
        logo: profileResponse.data.logo ? `${API_URL}/company-logo/${userId}/` : "",
        logoFile: null
      }));

      // Reset loading states
      setLogoLoading(false);
      setLogoError(false);
      setIsEditingCompany(false);
    } catch (err) {
      console.error("Error updating company:", err);
      alert("Failed to update company information. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  // Cancel location edit
  const cancelLocationEdit = () => {
    setLocationForm({
      phone: profileData?.phone || ""
    });
    setIsEditingLocation(false);
  };

  // Cancel company edit
  const cancelCompanyEdit = () => {
    setCompanyForm({
      companyName: profileData?.companyName || userData.name,
      website: profileData?.website || "-",
      industry: profileData?.industry || "-",
      size: profileData?.size || "-",
      tagline: profileData?.tagline || "-",
      description: profileData?.description || "-",
      logo: profileData?.logo ? `${API_URL}/company-logo/${userId}/` : "", // Reset logo with database endpoint
      logoFile: null // Reset logoFile
    });
    // Reset loading states
    setLogoLoading(false);
    setLogoError(false);
    setIsEditingCompany(false);
  };

  // Cancel edit functions
  const cancelAccountEdit = () => {
    const nameParts = userData?.name ? userData.name.split(" ") : ["", ""];
    setAccountForm({
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      email: userData?.email || ""
    });
    setIsEditingAccount(false);
  };

  // Handle image loading
  const handleLogoLoad = () => {
    setLogoLoading(false);
    setLogoError(false);
  };

  const handleLogoError = () => {
    setLogoLoading(false);
    setLogoError(true);
  };

  const handleLogoLoadStart = () => {
    setLogoLoading(true);
    setLogoError(false);
  };

  // Handle AI preference change
  const handleAiPreferenceChange = async (preference) => {
    // If no preference is selected, default to "yes"
    const finalPreference = preference || "yes";
    setAiPreference(finalPreference);
    setShowAiPreferenceModal(false);
    
    // Auto-save to database
    await saveSettingsToDatabase({
      aiPreference: finalPreference
    });
  };

  // Save settings to database
  const saveSettingsToDatabase = async (settings) => {
    try {
      setSaving(true);
      setSaveMessage("");

      const response = await axios.put(`${API_URL}/update-client-profile-settings/`, settings, {
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

  if (userLoading || loading) {
    return (
      <div
        className="section-container"
        style={{ display: "flex", minHeight: "100vh", background: "#fff" }}
      >
        <ClientSettingsSidebar
          activeKey="info"
          onNavigate={handleSidebarNavigate}
          clientId={userId}
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
            padding: "0 20px",
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontSize: 18, color: "#666", textAlign: "center" }}>Loading...</div>
        </main>
      </div>
    );
  }

  if (userError || error) {
    return (
      <div
        className="section-container"
        style={{ display: "flex", minHeight: "100vh", background: "#fff" }}
      >
        <ClientSettingsSidebar
          activeKey="info"
          onNavigate={handleSidebarNavigate}
          clientId={userId}
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
            padding: "0 20px",
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontSize: 18, color: "#e74c3c", textAlign: "center", maxWidth: "100%" }}>
            {userError || error}
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
                fontSize: 14,
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
      <ClientSettingsSidebar
        activeKey="info"
        onNavigate={handleSidebarNavigate}
        clientId={userId}
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
          padding: "0 20px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ 
          width: "100%", 
          padding: "36px 20px 0 20px",
          minWidth: 320
        }}>
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              marginBottom: 32,
              color: "#222",
              textAlign: "left",
            }}
          >
            My Info
          </div>
          
          {/* Account Card */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e6e6e6",
              borderRadius: 12,
              padding: "36px",
              marginBottom: 32,
              width: "100%",
              boxShadow: "0 1px 8px 0 rgba(60,72,100,0.04)",
              position: "relative",
              boxSizing: "border-box",
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
              Account
            </div>

            {isEditingAccount ? (
              // Edit Form
              <div>
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
                  gap: 16, 
                  marginBottom: 16 
                }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 500, color: "#222", marginBottom: 8 }}>
                      First name
                    </div>
                    <input
                      type="text"
                      value={accountForm.firstName}
                      onChange={(e) => handleAccountFormChange("firstName", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        border: "1px solid #e6e6e6",
                        borderRadius: 8,
                        fontSize: 18,
                        outline: "none",
                      }}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 500, color: "#222", marginBottom: 8 }}>
                      Last name
                    </div>
                    <input
                      type="text"
                      value={accountForm.lastName}
                      onChange={(e) => handleAccountFormChange("lastName", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        border: "1px solid #e6e6e6",
                        borderRadius: 8,
                        fontSize: 18,
                        outline: "none",
                      }}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 18, fontWeight: 500, color: "#222", marginBottom: 8 }}>
                    Email
                  </div>
                  <input
                    type="email"
                    value={accountForm.email}
                    onChange={(e) => handleAccountFormChange("email", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #e6e6e6",
                      borderRadius: 8,
                      fontSize: 18,
                      outline: "none",
                    }}
                    placeholder="Enter email address"
                  />
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  <button
                    onClick={handleAccountUpdate}
                    disabled={updating}
                    style={{
                      background: "#007476",
                      color: "white",
                      border: "none",
                      padding: "12px 24px",
                      borderRadius: 8,
                      fontSize: 18,
                      fontWeight: 600,
                      cursor: updating ? "not-allowed" : "pointer",
                      opacity: updating ? 0.7 : 1,
                    }}
                  >
                    {updating ? "Updating..." : "Update"}
                  </button>
                  <button
                    onClick={cancelAccountEdit}
                    disabled={updating}
                    style={{
                      background: "transparent",
                      color: "#007476",
                      border: "none",
                      padding: "12px 24px",
                      fontSize: 18,
                      fontWeight: 600,
                      cursor: updating ? "not-allowed" : "pointer",
                      opacity: updating ? 0.7 : 1,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // Display Mode
              <div>
                <div style={{ marginBottom: 20, color: "#222" }}>
                  <div style={{ fontSize: 20, fontWeight: 600, color: "#222" }}>
                    User ID
                  </div>
                  <div style={{ fontSize: 18 }}>{encryptUserId(userData?._id)}</div>
                </div>
                <div style={{ marginBottom: 20, color: "#222" }}>
                  <div style={{ fontSize: 20, fontWeight: 600, color: "#222" }}>
                    Name
                  </div>
                  <div style={{ fontSize: 18 }}>{userData?.name || "Not provided"}</div>
                </div>
                <div style={{ marginBottom: 20, color: "#222" }}>
                  <div style={{ fontSize: 20, fontWeight: 600, color: "#222" }}>
                    Email
                  </div>
                  <div style={{ fontSize: 18 }}>{formatEmail(userData?.email) || "Not provided"}</div>
                </div>
                <div style={{ marginTop: 25 }}>
                  <span
                    style={{
                      color: "#007476",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: 18,
                    }}
                  >
                    Close my account
                  </span>
                </div>
                <button
                  onClick={() => setIsEditingAccount(true)}
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
            )}
          </div>



          {/* Company Details Card */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e6e6e6",
              borderRadius: 12,
              padding: "36px",
              marginBottom: 32,
              width: "100%",
              boxShadow: "0 1px 8px 0 rgba(60,72,100,0.04)",
              position: "relative",
              boxSizing: "border-box",
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
              Company details
            </div>

            {isEditingCompany ? (
              // Edit Form
              <div>
                {/* Company Logo Upload Section */}
                <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
                  {/* Company Logo Placeholder */}
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      border: "1px solid #e0e0e0",
                      cursor: "pointer",
                      position: "relative",
                    }}
                    onClick={() => document.getElementById('company-logo-input').click()}
                  >
                    {companyForm.logo ? (
                      <>
                        {/* Loading Spinner */}
                        {logoLoading && (
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "rgba(255, 255, 255, 0.9)",
                              zIndex: 2,
                            }}
                          >
                            <div
                              style={{
                                width: "20px",
                                height: "20px",
                                border: "2px solid #f3f3f3",
                                borderTop: "2px solid #007476",
                                borderRadius: "50%",
                                animation: "spin 1s linear infinite",
                              }}
                            />
                          </div>
                        )}
                        
                        {/* Error State */}
                        {logoError && (
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "#f8f9fa",
                              zIndex: 2,
                            }}
                          >
                            <svg width="24" height="24" fill="#dc3545" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                          </div>
                        )}
                        
                        {/* Image */}
                        <img 
                          src={companyForm.logo} 
                          alt="Company Logo" 
                          style={{ 
                            width: "100%", 
                            height: "100%", 
                            borderRadius: "50%",
                            objectFit: "cover",
                            opacity: logoLoading ? 0.3 : 1,
                            transition: "opacity 0.3s ease",
                          }}
                          onLoad={handleLogoLoad}
                          onError={handleLogoError}
                          onLoadStart={handleLogoLoadStart}
                        />
                      </>
                    ) : (
                      <svg width="24" height="24" fill="#999" viewBox="0 0 24 24">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                      </svg>
                    )}
                                         <input
                       id="company-logo-input"
                       type="file"
                       accept="image/*"
                       style={{ display: "none" }}
                       onChange={(e) => {
                         const file = e.target.files[0];
                         if (file) {
                           // Reset loading states
                           setLogoLoading(false);
                           setLogoError(false);
                           
                           // Store the file object for upload
                           handleCompanyFormChange("logoFile", file);
                           // Create a preview URL for display
                           const reader = new FileReader();
                           reader.onload = (e) => {
                             handleCompanyFormChange("logo", e.target.result);
                           };
                           reader.readAsDataURL(file);
                         }
                       }}
                     />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 18, fontWeight: 500, color: "#222", marginBottom: 8 }}>
                        Company Name
                      </div>
                      <div style={{ position: "relative" }}>
                        <input
                          type="text"
                          value={companyForm.companyName}
                          onChange={(e) => handleCompanyFormChange("companyName", e.target.value)}
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            border: "1px solid #e6e6e6",
                            borderRadius: 8,
                            fontSize: 18,
                            outline: "none",
                          }}
                          placeholder="Enter company name"
                        />
                        {companyForm.companyName && (
                          <button
                            onClick={() => handleCompanyFormChange("companyName", "")}
                            style={{
                              position: "absolute",
                              right: 12,
                              top: "50%",
                              transform: "translateY(-50%)",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontSize: 16,
                              color: "#999",
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 18, fontWeight: 500, color: "#222", marginBottom: 8 }}>
                        Website
                      </div>
                      <div style={{ position: "relative" }}>
                        <input
                          type="url"
                          value={companyForm.website}
                          onChange={(e) => handleCompanyFormChange("website", e.target.value)}
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            border: "1px solid #e6e6e6",
                            borderRadius: 8,
                            fontSize: 18,
                            outline: "none",
                          }}
                          placeholder="Enter website URL"
                        />
                        {companyForm.website && (
                          <button
                            onClick={() => handleCompanyFormChange("website", "")}
                            style={{
                              position: "absolute",
                              right: 12,
                              top: "50%",
                              transform: "translateY(-50%)",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontSize: 16,
                              color: "#999",
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 18, fontWeight: 500, color: "#222", marginBottom: 8 }}>
                    Add your industry
                  </div>
                  <select
                    value={companyForm.industry}
                    onChange={(e) => handleCompanyFormChange("industry", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #e6e6e6",
                      borderRadius: 8,
                      fontSize: 18,
                      outline: "none",
                      background: "white",
                      cursor: "pointer",
                    }}
                  >
                    <option value="" disabled>Select industry</option>
                    <option value="Aerospace">Aerospace</option>
                    <option value="Agriculture & Forestry">Agriculture & Forestry</option>
                    <option value="Art & Design">Art & Design</option>
                    <option value="Automotive">Automotive</option>
                    <option value="Aviation">Aviation</option>
                    <option value="Education">Education</option>
                    <option value="Energy & Utilities">Energy & Utilities</option>
                    <option value="Engineering & Architecture">Engineering & Architecture</option>
                    <option value="Fashion & Beauty">Fashion & Beauty</option>
                    <option value="Finance & Accounting">Finance & Accounting</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Government & Public Sector">Government & Public Sector</option>
                    <option value="Health & Fitness">Health & Fitness</option>
                    <option value="HR & Business Services">HR & Business Services</option>
                    <option value="Legal">Legal</option>
                    <option value="Manufacturing & Construction">Manufacturing & Construction</option>
                    <option value="Media & Entertainment">Media & Entertainment</option>
                    <option value="Military & Defense">Military & Defense</option>
                    <option value="Mining">Mining</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Retail & Consumer Goods">Retail & Consumer Goods</option> 
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="Science & Medicine">Science & Medicine</option>
                    <option value="Sports & Recreation">Sports & Recreation</option>
                    <option value="Supply Chain & Logistics">Supply Chain & Logistics</option>
                    <option value="Tech & IT">Tech & IT</option>
                    <option value="Transportation & Warehousing">Transportation & Warehousing</option>
                    <option value="Travel & Hospitality">Travel & Hospitality</option> 
                  </select>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 18, fontWeight: 500, color: "#222", marginBottom: 8 }}>
                    How many people are in your company?
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      "It's just me",
                      "2-9 employees",
                      "10-99 employees",
                      "100-1,000 employees",
                      "More than 1,000 employees"
                    ].map((option) => (
                      <label
                        key={option}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          cursor: "pointer",
                          fontSize: 16,
                        }}
                      >
                        <input
                          type="radio"
                          name="companySize"
                          value={option}
                          checked={companyForm.size === option}
                          onChange={(e) => handleCompanyFormChange("size", e.target.value)}
                          style={{
                            width: 18,
                            height: 18,
                            accentColor: "#007476",
                          }}
                        />
                        <span style={{ color: "#222" }}>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 18, fontWeight: 500, color: "#222", marginBottom: 8 }}>
                    Tagline
                  </div>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      value={companyForm.tagline}
                      onChange={(e) => handleCompanyFormChange("tagline", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        border: "1px solid #e6e6e6",
                        borderRadius: 8,
                        fontSize: 18,
                        outline: "none",
                      }}
                      placeholder="Enter company tagline"
                    />
                    {companyForm.tagline && (
                      <button
                        onClick={() => handleCompanyFormChange("tagline", "")}
                        style={{
                          position: "absolute",
                          right: 12,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 16,
                          color: "#999",
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: 30 }}>
                  <div style={{ fontSize: 18, fontWeight: 500, color: "#222", marginBottom: 8 }}>
                    Description
                  </div>
                  <textarea
                    value={companyForm.description}
                    onChange={(e) => handleCompanyFormChange("description", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #e6e6e6",
                      borderRadius: 8,
                      fontSize: 18,
                      outline: "none",
                      minHeight: "120px",
                      resize: "vertical",
                      fontFamily: "inherit",
                    }}
                    placeholder="Enter company description"
                  />
                </div>

                <div style={{ display: "flex", gap: 16 }}>
                  <button
                    onClick={handleCompanyUpdate}
                    disabled={updating}
                    style={{
                      background: "#007476",
                      color: "white",
                      border: "none",
                      padding: "12px 24px",
                      borderRadius: 8,
                      fontSize: 18,
                      fontWeight: 600,
                      cursor: updating ? "not-allowed" : "pointer",
                      opacity: updating ? 0.7 : 1,
                    }}
                  >
                    {updating ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={cancelCompanyEdit}
                    disabled={updating}
                    style={{
                      background: "transparent",
                      color: "#007476",
                      border: "1px solid #007476",
                      padding: "12px 24px",
                      borderRadius: 8,
                      fontSize: 18,
                      fontWeight: 600,
                      cursor: updating ? "not-allowed" : "pointer",
                      opacity: updating ? 0.7 : 1,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // Display Mode
              <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
                {/* Company Logo Placeholder */}
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "#f5f5f5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    border: "1px solid #e0e0e0",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {companyForm.logo ? (
                    <>
                      {/* Loading Spinner */}
                      {logoLoading && (
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(255, 255, 255, 0.9)",
                            zIndex: 2,
                          }}
                        >
                          <div
                            style={{
                              width: "20px",
                              height: "20px",
                              border: "2px solid #f3f3f3",
                              borderTop: "2px solid #007476",
                              borderRadius: "50%",
                              animation: "spin 1s linear infinite",
                            }}
                          />
                        </div>
                      )}
                      
                      {/* Error State */}
                      {logoError && (
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#f8f9fa",
                            zIndex: 2,
                          }}
                        >
                          <svg width="24" height="24" fill="#dc3545" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </div>
                      )}
                      
                      {/* Image */}
                      <img 
                        src={companyForm.logo} 
                        alt="Company Logo" 
                        style={{ 
                          width: "100%", 
                          height: "100%", 
                          borderRadius: "50%",
                          objectFit: "cover",
                          opacity: logoLoading ? 0.3 : 1,
                          transition: "opacity 0.3s ease",
                        }}
                        onLoad={handleLogoLoad}
                        onError={handleLogoError}
                        onLoadStart={handleLogoLoadStart}
                      />
                    </>
                  ) : (
                    <svg width="24" height="24" fill="#999" viewBox="0 0 24 24">
                      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                    </svg>
                  )}
                </div>

                {/* Company Information */}
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 20, fontWeight: 600, color: "#222", marginBottom: 6 }}>
                      {companyForm.companyName}
                    </div>
                    <div style={{ fontSize: 18, color: "#007476", textDecoration: "underline", marginBottom: 16 }}>
                      <a 
                        href={companyForm.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: "inherit", textDecoration: "inherit" }}
                      >
                        {companyForm.website}
                      </a>
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(2, 1fr)", 
                    gap: 20 
                  }}>
                    <div>
                      <div style={{ fontSize: 17, color: "#666", marginBottom: 6, fontWeight: 500 }}>
                        Industry
                      </div>
                      <div style={{ fontSize: 18, color: "#222" }}>
                        {companyForm.industry}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 17, color: "#666", marginBottom: 6, fontWeight: 500 }}>
                        Size
                      </div>
                      <div style={{ fontSize: 18, color: "#222" }}>
                        {companyForm.size}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 17, color: "#666", marginBottom: 6, fontWeight: 500 }}>
                        Tagline
                      </div>
                      <div style={{ fontSize: 18, color: "#222" }}>
                        {companyForm.tagline}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 17, color: "#666", marginBottom: 6, fontWeight: 500 }}>
                        Description
                      </div>
                      <div style={{ fontSize: 18, color: "#222" }}>
                        {companyForm.description}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => setIsEditingCompany(true)}
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
            )}
          </div>

          {/* Location Card */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e6e6e6",
              borderRadius: 12,
              padding: "36px",
              marginBottom: 32,
              width: "100%",
              boxShadow: "0 1px 8px 0 rgba(60,72,100,0.04)",
              position: "relative",
              boxSizing: "border-box",
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
              Location
            </div>

            {isEditingLocation ? (
              // Edit Form
              <div>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 18, fontWeight: 500, color: "#222", marginBottom: 8 }}>
                    Phone
                  </div>
                  <input
                    type="tel"
                    value={locationForm.phone}
                    onChange={(e) => handleLocationFormChange("phone", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #e6e6e6",
                      borderRadius: 8,
                      fontSize: 18,
                      outline: "none",
                    }}
                    placeholder="Enter phone number"
                  />
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  <button
                    onClick={handleLocationUpdate}
                    disabled={updating}
                    style={{
                      background: "#007476",
                      color: "white",
                      border: "none",
                      padding: "12px 24px",
                      borderRadius: 8,
                      fontSize: 18,
                      fontWeight: 600,
                      cursor: updating ? "not-allowed" : "pointer",
                      opacity: updating ? 0.7 : 1,
                    }}
                  >
                    {updating ? "Updating..." : "Update"}
                  </button>
                  <button
                    onClick={cancelLocationEdit}
                    disabled={updating}
                    style={{
                      background: "transparent",
                      color: "#007476",
                      border: "none",
                      padding: "12px 24px",
                      fontSize: 18,
                      fontWeight: 600,
                      cursor: updating ? "not-allowed" : "pointer",
                      opacity: updating ? 0.7 : 1,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // Display Mode
              <div>
                <div style={{ marginBottom: 20, color: "#222" }}>
                  <div style={{ fontSize: 20, fontWeight: 600, color: "#222" }}>
                    Time Zone
                  </div>
                  <div style={{ fontSize: 18, color: "#6b6b6b" }}>
                    {getTimezone()}
                  </div>
                </div>
                <div style={{ color: "#222" }}>
                  <div style={{ fontSize: 20, fontWeight: 600, color: "#222" }}>
                    Phone
                  </div>
                  <div style={{ fontSize: 18, color: "#007476" }}>
                    {formatPhone()}
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingLocation(true)}
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
            )}
          </div>

          {/* AI Preference Card */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e6e6e6",
              borderRadius: 12,
              padding: "36px",
              marginBottom: 32,
              width: "100%",
              boxShadow: "0 1px 8px 0 rgba(60,72,100,0.04)",
              position: "relative",
              boxSizing: "border-box",
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
      </main>

      {/* AI Preference Modal */}
      {showAiPreferenceModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            margin: 0,
          }}
          onClick={() => setShowAiPreferenceModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, type: "spring", damping: 25 }}
            style={{
              background: "#fff",
              borderRadius: 16,
              maxWidth: 800,
              width: "100%",
              boxShadow: "0 20px 48px 0 rgba(0,0,0,0.18)",
              border: "1px solid #e6e6e6",
              overflow: "hidden",
              position: "relative",
              display: "flex",
              flexDirection: "row",
            }}
            onClick={e => e.stopPropagation()}
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
                <motion.button
                  onClick={() => setShowAiPreferenceModal(false)}
                  style={{
                    position: "absolute",
                    top: 18,
                    right: 18,
                    background: "none",
                    border: "none",
                    fontSize: 28,
                    color: "#888",
                    cursor: "pointer",
                    padding: 4,
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.2s, color 0.2s",
                  }}
                  whileHover={{
                    background: "#f2f2f2",
                    color: "#222",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  ×
                </motion.button>

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
          </motion.div>
        </motion.div>
      )}

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
    </div>
  );
};

export default ClientInfoPage; 