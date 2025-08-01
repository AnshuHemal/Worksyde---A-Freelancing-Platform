import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FreelancersSettingsSidebar from "./FreelancersSettingsSidebar";

const SIDEBAR_WIDTH = 290;
const API_URL = "http://localhost:5000/api/auth";

const FreelancersContactInfo = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
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

        // Initialize form data
        const nameParts = currentUser.name ? currentUser.name.split(" ") : ["", ""];
        setAccountForm({
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          email: currentUser.email || ""
        });

        setLocationForm({
          streetAddress: profileResponse.data.streetAddress || "",
          city: profileResponse.data.city || "",
          state: profileResponse.data.state || "",
          country: profileResponse.data.country || "",
          postalCode: profileResponse.data.postalCode || "",
          phone: profileResponse.data.phone || ""
        });

      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

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
        navigate("/ws/freelancers/profile");
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
    
    if (localPart.length <= 2) {
      return email; // Don't mask if too short
    }
    
    const firstChar = localPart[0];
    const lastChar = localPart[localPart.length - 1];
    const maskedPart = '*****'; // Always 5 asterisks
    
    return `${firstChar}${maskedPart}${lastChar}@${domain}`;
  };

  // Helper function to get timezone (you might want to store this in the backend)
  const getTimezone = () => {
    return "UTC+05:30 Mumbai, Kolkata, Chennai, New Delhi"; // This could be fetched from backend
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

      // Refresh user data
      const userResponse = await axios.get(`${API_URL}/current-user/`, { 
        withCredentials: true 
      });
      setUserData(userResponse.data.user);

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
      const profileResponse = await axios.get(`${API_URL}/profile/${userId}/`, {
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

  // Cancel edit functions
  const cancelAccountEdit = () => {
    const nameParts = userData.name ? userData.name.split(" ") : ["", ""];
    setAccountForm({
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      email: userData.email || ""
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

  if (loading) {
    return (
      <div
        className="section-container"
        style={{ display: "flex", minHeight: "100vh", background: "#fff" }}
      >
        <FreelancersSettingsSidebar
          activeKey="contact"
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
            padding: "0 20px",
            boxSizing: "border-box",
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
          activeKey="contact"
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
            padding: "0 20px",
            boxSizing: "border-box",
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
      <FreelancersSettingsSidebar
        activeKey="contact"
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
           padding: "0 20px",
           boxSizing: "border-box",
         }}
       >
         <div style={{ 
           width: "100%", 
          //  maxWidth: 1200, 
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
            Contact info
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
                  <div style={{ fontSize: 18 }}>{userData?._id || "Not available"}</div>
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
        </div>
      </main>
    </div>
  );
};

export default FreelancersContactInfo;
