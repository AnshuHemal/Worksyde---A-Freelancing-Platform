import React, { useState, useEffect } from "react";
import axios from "axios";
import ClientSettingsSidebar from "./ClientSettingsSidebar";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";

const SIDEBAR_WIDTH = 290;
const API_URL = "http://localhost:5000/api/auth";

const ClientInfoPage = () => {
  const { userId, userData, loading: userLoading, error: userError, refreshUserData } = useUser();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    streetAddress: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
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
          streetAddress: profileResponse.data.streetAddress || "",
          city: profileResponse.data.city || "",
          state: profileResponse.data.state || "",
          country: profileResponse.data.country || "",
          postalCode: profileResponse.data.postalCode || "",
          phone: profileResponse.data.phone || ""
        });

        setCompanyForm({
          companyName: profileResponse.data.companyName || userData.name,
          website: profileResponse.data.website || "-",
          industry: profileResponse.data.industry || "-",
          size: profileResponse.data.size || "-",
          tagline: profileResponse.data.tagline || "-",
          description: profileResponse.data.description || "-",
          logo: profileResponse.data.logo ? `http://localhost:5000${profileResponse.data.logo}` : "", // Initialize logo with full URL
          logoFile: null // Initialize logoFile
        });

      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Failed to load profile data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, userData]);

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

  // Helper function to format address
  const formatAddress = () => {
    if (!profileData) return "Not provided";
    
    const parts = [];
    if (profileData.streetAddress) parts.push(profileData.streetAddress);
    if (profileData.city) parts.push(profileData.city);
    if (profileData.state) parts.push(profileData.state);
    if (profileData.country) parts.push(profileData.country);
    if (profileData.postalCode) parts.push(profileData.postalCode);
    
    return parts.length > 0 ? parts.join(", ") : "Not provided";
  };

  // Helper function to format phone number
  const formatPhone = () => {
    if (!profileData?.phone) return "Not provided";
    
    const phone = profileData.phone;
    
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Check if it's an Indian number (+91)
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
    
    // Return original if no pattern matches
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
        streetAddress: locationForm.streetAddress,
        city: locationForm.city,
        state: locationForm.state,
        country: locationForm.country,
        postalCode: locationForm.postalCode,
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
        logo: profileResponse.data.logo ? `http://localhost:5000${profileResponse.data.logo}` : "",
        logoFile: null
      }));

      setIsEditingCompany(false);
    } catch (err) {
      console.error("Error updating company:", err);
      alert("Failed to update company information. Please try again.");
    } finally {
      setUpdating(false);
    }
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
      logo: profileData?.logo ? `http://localhost:5000${profileData.logo}` : "", // Reset logo with full URL
      logoFile: null // Reset logoFile
    });
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

  const cancelLocationEdit = () => {
    setLocationForm({
      streetAddress: profileData?.streetAddress || "",
      city: profileData?.city || "",
      state: profileData?.state || "",
      country: profileData?.country || "",
      postalCode: profileData?.postalCode || "",
      phone: profileData?.phone || ""
    });
    setIsEditingLocation(false);
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
                      <img 
                        src={companyForm.logo} 
                        alt="Company Logo" 
                        style={{ 
                          width: "100%", 
                          height: "100%", 
                          borderRadius: "50%",
                          objectFit: "cover"
                        }} 
                      />
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
                           // Store the file object for upload
                           handleCompanyFormChange("logoFile", file);
                           // Also create a preview URL for display
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
                  }}
                >
                  {companyForm.logo ? (
                    <img 
                      src={companyForm.logo} 
                      alt="Company Logo" 
                      style={{ 
                        width: "100%", 
                        height: "100%", 
                        borderRadius: "50%",
                        objectFit: "cover"
                      }} 
                    />
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
              padding: "36px 36px",
              marginBottom: 40,
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
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 18, fontWeight: 500, color: "#222", marginBottom: 8 }}>
                    Street Address
                  </div>
                  <input
                    type="text"
                    value={locationForm.streetAddress}
                    onChange={(e) => handleLocationFormChange("streetAddress", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #e6e6e6",
                      borderRadius: 8,
                      fontSize: 18,
                      outline: "none",
                    }}
                    placeholder="Enter street address"
                  />
                </div>
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
                  gap: 16, 
                  marginBottom: 20 
                }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 500, color: "#222", marginBottom: 8 }}>
                      City
                    </div>
                    <input
                      type="text"
                      value={locationForm.city}
                      onChange={(e) => handleLocationFormChange("city", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        border: "1px solid #e6e6e6",
                        borderRadius: 8,
                        fontSize: 18,
                        outline: "none",
                      }}
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 500, color: "#222", marginBottom: 8 }}>
                      State
                    </div>
                    <input
                      type="text"
                      value={locationForm.state}
                      onChange={(e) => handleLocationFormChange("state", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        border: "1px solid #e6e6e6",
                        borderRadius: 8,
                        fontSize: 18,
                        outline: "none",
                      }}
                      placeholder="Enter state"
                    />
                  </div>
                </div>
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
                  gap: 16, 
                  marginBottom: 20 
                }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 500, color: "#222", marginBottom: 8 }}>
                      Country
                    </div>
                    <input
                      type="text"
                      value={locationForm.country}
                      onChange={(e) => handleLocationFormChange("country", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        border: "1px solid #e6e6e6",
                        borderRadius: 8,
                        fontSize: 18,
                        outline: "none",
                      }}
                      placeholder="Enter country"
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 500, color: "#222", marginBottom: 8 }}>
                      Postal Code
                    </div>
                    <input
                      type="text"
                      value={locationForm.postalCode}
                      onChange={(e) => handleLocationFormChange("postalCode", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        border: "1px solid #e6e6e6",
                        borderRadius: 8,
                        fontSize: 18,
                        outline: "none",
                      }}
                      placeholder="Enter postal code"
                    />
                  </div>
                </div>
                <div style={{ marginBottom: 30 }}>
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
                <div style={{ marginBottom: 20, color: "#222" }}>
                  <div style={{ fontSize: 20, fontWeight: 600, color: "#222" }}>
                    Address
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      color: "#6b6b6b",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {formatAddress()}
                  </div>
                </div>
                <div style={{ color: "#222" }}>
                  <div style={{ fontSize: 20, fontWeight: 600, color: "#222" }}>
                    Phone
                  </div>
                  <div style={{ fontSize: 18, color: "#007476", fontWeight: 600 }}>
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
        </div>
      </main>
    </div>
  );
};

export default ClientInfoPage; 