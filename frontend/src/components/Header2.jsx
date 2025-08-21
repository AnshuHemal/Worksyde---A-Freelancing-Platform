import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/worksyde.png";
import { RiChatSmileAiLine } from "react-icons/ri";
import { BsGlobe, BsBell, BsCircleFill, BsPeople } from "react-icons/bs";
import { TfiHelp } from "react-icons/tfi";
import { LuCircleUser, LuSettings } from "react-icons/lu";
import { MdOutlineLightMode, MdOutlineWorkHistory } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import tarz from "../assets/2.png";
import UserStatusIndicator from "./UserStatusIndicator";
import { useUser } from "../contexts/UserContext";

const Header2 = () => {
  const { userId, logout } = useUser();
  
  // Add CSS animation for spinner
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
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [profileImageLoading, setProfileImageLoading] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const dropdownRef = useRef(null);
  
  // Helper function to get profile image URL
  const getProfileImageUrl = (user) => {
    if (!user) return logo;
    
    // If photograph is true, it means image is stored in database
    if (user.photograph === true) {
      return `${API_URL}/profile-image/${user._id}/`;
    }
    
    // If photograph is a URL string, use it directly
    if (user.photograph && typeof user.photograph === 'string') {
      return user.photograph;
    }
    
    // Fallback to logo
    return logo;
  };

  // Handle profile image loading
  const handleProfileImageLoad = () => {
    setProfileImageLoading(false);
    setProfileImageError(false);
  };

  const handleProfileImageError = () => {
    setProfileImageLoading(false);
    setProfileImageError(true);
  };

  const handleProfileImageLoadStart = () => {
    setProfileImageLoading(true);
    setProfileImageError(false);
  };
  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown((prev) => !prev);
  };

  const closeDropdown = () => {
    setShowDropdown(false);
  };
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = "http://localhost:5000/api/auth";

  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/current-user/", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.user) {
          // If photograph is not included in current-user response, fetch it separately
          if (!data.user.photograph) {
            try {
              // Use the appropriate endpoint based on user type
              const endpoint = data.user.userType === 'client' 
                ? `/api/auth/client/profile-details/${data.user._id}/`
                : `/api/auth/profile/${data.user._id}/`;
              
              const profileResponse = await fetch(
                endpoint,
                {
                  credentials: "include",
                }
              );

              if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                setCurrentUser({
                  ...data.user,
                  photograph: profileData.photograph,
                });
              } else {
                setCurrentUser(data.user);
              }
            } catch (profileError) {
              console.error("Error fetching profile:", profileError);
              setCurrentUser(data.user);
            }
          } else {
            setCurrentUser(data.user);
          }
          
          // Reset profile image loading states
          setProfileImageLoading(false);
          setProfileImageError(false);
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadNotificationCount = async () => {
      if (!userId) return;

      try {
        const response = await axios.get(
          `${API_URL}/notifications/unread-count/`,
          { withCredentials: true }
        );
        if (response.data.success) {
          setUnreadNotificationCount(response.data.unreadCount);
        }
      } catch (error) {
        // Silently ignore notification count errors
      }
    };

    fetchUnreadNotificationCount();

    // Set up interval to refresh notification count every 30 seconds
    const interval = setInterval(fetchUnreadNotificationCount, 30000);

    // Refresh notification count when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchUnreadNotificationCount();
      }
    };

    // Listen for custom events when notifications are marked as read or deleted
    const handleNotificationRead = () => {
      setUnreadNotificationCount((prev) => Math.max(0, prev - 1));
    };

    const handleNotificationDeleted = () => {
      setUnreadNotificationCount((prev) => Math.max(0, prev - 1));
    };

    const handleAllNotificationsRead = () => {
      setUnreadNotificationCount(0);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("notification-read", handleNotificationRead);
    document.addEventListener("notification-deleted", handleNotificationDeleted);
    document.addEventListener(
      "all-notifications-read",
      handleAllNotificationsRead
    );

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("notification-read", handleNotificationRead);
      document.removeEventListener("notification-deleted", handleNotificationDeleted);
      document.removeEventListener(
        "all-notifications-read",
        handleAllNotificationsRead
      );
    };
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is on the profile icon or its children
      const profileIcon = event.target.closest('[data-profile-icon]');
      if (profileIcon) {
        return; // Don't close if clicking on the profile icon
      }
      
      // Close dropdown if clicking outside
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  // Update last seen when user is active
  useEffect(() => {
    if (!currentUser || currentUser.onlineStatus !== "online") return;

    const updateLastSeen = async () => {
      try {
        await axios.post(
          `${API_URL}/update-last-seen/`,
          {},
          { withCredentials: true }
        );
      } catch (error) {
        console.error("Error updating last seen:", error);
      }
    };

    // Update every 2 minutes when user is online
    const interval = setInterval(updateLastSeen, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [currentUser?.onlineStatus, API_URL]);

  const handleLogout = async (e) => {
    e.preventDefault();

    try {
      await logout();
      navigate("/");
      toast.success("Successfully Logged out..");
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleOnlineStatusToggle = async (e) => {
    e.preventDefault();
    if (updatingStatus) return;

    const newStatus = e.target.checked ? "online" : "offline";
    setUpdatingStatus(true);

    try {
      const response = await axios.post(
        `${API_URL}/update-online-status/`,
        { status: newStatus },
        { withCredentials: true }
      );

      if (response?.data?.success) {
        setCurrentUser((prev) => ({
          ...prev,
          onlineStatus: newStatus,
          lastSeen: response.data.user.lastSeen,
        }));
        
        // Dispatch custom event to notify other components about status change
        window.dispatchEvent(new CustomEvent('onlineStatusChanged', {
          detail: { status: newStatus }
        }));
        
        // Also update localStorage for cross-tab communication
        localStorage.setItem('onlineStatus', newStatus);
        
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
      // Revert the checkbox
      e.target.checked = !e.target.checked;
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg fixed-top">
      <div className="container-fluid">
        <Link className="navbar-brand me-auto" to={"/ws/find-work"}>
          <img src={logo} alt="Worksyde Logo" height={40} />
        </Link>

        <div
          className="offcanvas offcanvas-end"
          tabIndex="-1"
          id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
              <img src={logo} alt="Worksyde Logo" height={40} />
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body">
            <ul className="navbar-nav justify-content-center flex-grow-1 pe-3">
              <li className="nav-item">
                <Link
                  className={`nav-link mx-lg-2${
                    location.pathname.startsWith("/ws/find-work")
                      ? " active"
                      : ""
                  }`}
                  to={"/ws/find-work"}
                >
                  Find Work
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link mx-lg-2${
                    location.pathname.startsWith("/ws/messages")
                      ? " active"
                      : ""
                  }`}
                  to={"/ws/messages"}
                >
                  Messages
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link mx-lg-2${
                    location.pathname.startsWith("/ws/ai-tools")
                      ? " active"
                      : ""
                  }`}
                  style={{
                    color: location.pathname.startsWith("/ws/ai-tools")
                      ? "#007476"
                      : undefined,
                  }}
                  to={"/ws/ai-tools"}
                >
                  <RiChatSmileAiLine className="me-1" /> AI Tools
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className=" d-flex align-items-center gap-4 me-3">
          {/* <TfiHelp className="icon-hover" size={20} /> */}
          <div className="position-relative">
            <BsBell 
              className="icon-hover" 
              size={20} 
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/ws/notifications")}
              title="Notifications"
            />
            {/* Red dot notification indicator */}
            {unreadNotificationCount > 0 && (
              <div
                className="position-absolute"
                style={{
                  top: 0,
                  right: -5,
                  width: "10px",
                  height: "10px",
                  backgroundColor: "#dc2626",
                  borderRadius: "50%",
                  border: "2px solid #fff",
                  boxShadow: "0 2px 4px rgba(220, 38, 38, 0.3)",
                  zIndex: 1000,
                }}
              />
            )}
          </div>
          <img
            className="icon-hover"
            src={tarz}
            alt="tarz"
            title="Chat with TARZ"
            style={{
              width: "30px",
              height: "30px",
              objectFit: "contain",
            }}
            onClick={() => window.open("/ws/apps/tarz", "_blank")}
          />

          {/* Profile Image with Online Status */}
          {loading ? (
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                height: 32,
                width: 32,
                backgroundColor: "#f8f9fa",
                cursor: "pointer",
              }}
              data-profile-icon
              onClick={(e) => toggleDropdown(e)}
            >
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div
              className="position-relative"
              style={{ cursor: "pointer" }}
              data-profile-icon
              onClick={(e) => toggleDropdown(e)}
            >
              <div
                className="position-relative"
                style={{
                  height: 32,
                  width: 32,
                  borderRadius: "50%",
                  overflow: "hidden",
                }}
              >
                {/* Loading Spinner */}
                {profileImageLoading && (
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
                        width: "12px",
                        height: "12px",
                        border: "2px solid #f3f3f3",
                        borderTop: "2px solid #007476",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                  </div>
                )}
                
                {/* Error State */}
                {profileImageError && (
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
                    <svg width="16" height="16" fill="#dc3545" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                )}
                
                {/* Image */}
                <img
                  src={getProfileImageUrl(currentUser)}
                  alt="Profile"
                  className="rounded-circle"
                  height={32}
                  width={32}
                  style={{ 
                    objectFit: "cover",
                    opacity: profileImageLoading ? 0.3 : 1,
                    transition: "opacity 0.3s ease",
                  }}
                  onLoad={handleProfileImageLoad}
                  onError={handleProfileImageError}
                  onLoadStart={handleProfileImageLoadStart}
                />
              </div>
              
              {/* Online Status Indicator */}
              <BsCircleFill
                className="position-absolute"
                size={12}
                style={{
                  bottom: 0,
                  right: 0,
                  color:
                    currentUser?.onlineStatus === "online"
                      ? "#28a745"
                      : "#6c757d",
                  backgroundColor: "white",
                  borderRadius: "50%",
                  border: "2px solid white",
                }}
              />
            </div>
          )}
          {/* Dropdown Menu */}
          {showDropdown && (
            <div ref={dropdownRef} className="profile-dropdown shadow-sm">
              <div className="profile-header d-flex align-items-center gap-3">
                <div
                  className="position-relative"
                  style={{
                    height: 40,
                    width: 40,
                    borderRadius: "50%",
                    overflow: "hidden",
                  }}
                >
                  {/* Loading Spinner */}
                  {profileImageLoading && (
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
                          width: "16px",
                          height: "16px",
                          border: "2px solid #f3f3f3",
                          borderTop: "2px solid #007476",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Error State */}
                  {profileImageError && (
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
                      <svg width="20" height="20" fill="#dc3545" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                  )}
                  
                  {/* Image */}
                  <img
                    src={getProfileImageUrl(currentUser)}
                    className="rounded-circle"
                    height={40}
                    width={40}
                    style={{ 
                      objectFit: "cover",
                      opacity: profileImageLoading ? 0.3 : 1,
                      transition: "opacity 0.3s ease",
                    }}
                    onLoad={handleProfileImageLoad}
                    onError={handleProfileImageError}
                    onLoadStart={handleProfileImageLoadStart}
                  />
                </div>
                <div>
                  <div style={{ fontWeight: "600" }}>
                    {loading ? "Loading..." : currentUser?.name || "User"}
                  </div>
                  <div className="text-muted" style={{ fontSize: "14px" }}>
                    {currentUser?.role === "freelancer"
                      ? "Freelancer"
                      : currentUser?.role || "User"}
                  </div>
                </div>
              </div>

              <div className="dropdown-item d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <span>Online for messages</span>
                  {/* <UserStatusIndicator 
                    status={currentUser?.onlineStatus} 
                    size={8} 
                    className="ms-2"
                  /> */}
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={currentUser?.onlineStatus === "online"}
                    onChange={handleOnlineStatusToggle}
                    disabled={updatingStatus}
                  />
                </div>
              </div>
              <div className="dropdown-divider mb-2" />

              <Link to={`/ws/freelancers/${userId}`} className="dropdown-item align-items-center" onClick={closeDropdown}>
                <LuCircleUser
                  style={{ width: "20px", height: "18px" }}
                  className="me-2"
                />{" "}
                Your Profile
              </Link>
              <Link to="/ws/myjobs" className="dropdown-item align-items-center" onClick={closeDropdown}>
                <MdOutlineWorkHistory style={{ width: "20px", height: "18px" }}
                  className="me-2"/>{" "}
                My Jobs
              </Link>
              <Link to="/ws/proposals" className="dropdown-item align-items-center" onClick={closeDropdown}>
                <BsPeople
                  style={{ width: "20px", height: "18px" }}
                  className="me-2"
                />{" "}
                Proposals
              </Link>
              {/* <div className="dropdown-item d-flex justify-content-between align-items-center">
                <div>
                  <MdOutlineLightMode
                    style={{ width: "20px", height: "18px" }}
                    className="me-2"
                  />
                  Theme: Light
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    defaultChecked
                  />
                </div>
              </div> */}
              <Link to="/ws/settings/contact-info" className="dropdown-item" onClick={closeDropdown}>
                <LuSettings
                  style={{ width: "20px", height: "18px" }}
                  className="me-2"
                />
                Account settings
              </Link>

              <div className="dropdown-divider my-2" />
              <a className="dropdown-item text-danger" onClick={(e) => {
                handleLogout(e);
                closeDropdown();
              }}>
                <FiLogOut
                  style={{ width: "20px", height: "18px" }}
                  className="me-2 logout-icon"
                />
                Log out
              </a>
            </div>
          )}
        </div>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasNavbar"
          aria-controls="offcanvasNavbar"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
      </div>
    </nav>
  );
};

export default Header2;
