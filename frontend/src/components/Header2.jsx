import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/worksyde.png";
import { RiChatSmileAiLine } from "react-icons/ri";
import { BsGlobe, BsBell, BsCircleFill } from "react-icons/bs";
import { TfiHelp } from "react-icons/tfi";
import { LuCircleUser, LuSettings } from "react-icons/lu";
import { MdOutlineLightMode } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import tarz from "../assets/2.png";
import UserStatusIndicator from "./UserStatusIndicator";
import { useUser } from "../contexts/UserContext";

const Header2 = () => {
  const { userId } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const dropdownRef = useRef(null);
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
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
        toast.error("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

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
      const response = await axios.post(
        `${API_URL}/logout/`,
        {},
        { withCredentials: true }
      );

      if (response?.data?.success) {
        navigate("/");
        toast.success("Successfully Logged out..");
      }
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
          <TfiHelp className="icon-hover" size={20} />
          <BsBell className="icon-hover" size={20} />
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
              <img
                src={currentUser?.photograph || logo}
                alt="Profile"
                className="rounded-circle"
                height={32}
                width={32}
                style={{ objectFit: "cover" }}
              />
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
                <img
                  src={currentUser?.photograph || logo}
                  className="rounded-circle"
                  height={40}
                  width={40}
                  style={{ objectFit: "cover" }}
                />
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
              <div className="dropdown-item d-flex justify-content-between align-items-center">
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
              </div>
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
